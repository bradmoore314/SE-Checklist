import { storage } from '../storage';
import { 
  equipmentCreationSessions,
  EquipmentCreationSession,
  InsertEquipmentCreationSession
} from '@shared/schema-equipment-creation';
import { GenericEquipmentType } from '@shared/schema-equipment';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import fetch from 'node-fetch';

// Use the environment variable for Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Equipment types that can be created
export const EQUIPMENT_TYPES = {
  ACCESS_POINT: 'access_point',
  CAMERA: 'camera',
  ELEVATOR: 'elevator',
  INTERCOM: 'intercom'
};

// Required fields for each equipment type - simplified for better UX
export const EQUIPMENT_REQUIRED_FIELDS = {
  [EQUIPMENT_TYPES.ACCESS_POINT]: ['location'],
  [EQUIPMENT_TYPES.CAMERA]: ['location', 'camera_type'],
  [EQUIPMENT_TYPES.ELEVATOR]: ['location'],
  [EQUIPMENT_TYPES.INTERCOM]: ['location']
};

// Session response interface
interface SessionResponse {
  sessionId: string;
  nextQuestion: string;
  currentStep: string;
  isComplete: boolean;
  equipmentCreated?: GenericEquipmentType[];
}

/**
 * Equipment Creation Service using Gemini AI
 * Provides a simplified conversation flow for adding security equipment
 */
class EquipmentCreationGeminiService {
  /**
   * Detect if a message contains an intent to create equipment
   * @param message User message
   * @returns Detection result with equipment type and quantity
   */
  async detectCreationIntent(message: string): Promise<{
    isCreationIntent: boolean;
    equipmentType?: string;
    quantity?: number;
  }> {
    if (!GEMINI_API_KEY) {
      return this.localIntentDetection(message);
    }

    try {
      // Call Gemini API for intent detection
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `
                Detect if this message contains an intent to create or add security equipment. 
                Response format must be JSON with exactly these fields:
                {
                  "isCreationIntent": boolean,
                  "equipmentType": string or null,
                  "quantity": number or null
                }
                
                Equipment types can only be one of: "access_point", "camera", "elevator", "intercom"
                
                Just analyze the intent, don't actually create anything. 
                
                User message: "${message}"
                `
              }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} ${response.statusText}`);
        return this.localIntentDetection(message);
      }

      const data = await response.json();
      
      if (data && 
          data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        
        try {
          // Extract JSON from the response
          const responseText = data.candidates[0].content.parts[0].text;
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          const result = JSON.parse(jsonString);
          
          return {
            isCreationIntent: result.isCreationIntent === true,
            equipmentType: result.equipmentType || undefined,
            quantity: result.quantity || 1
          };
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          return this.localIntentDetection(message);
        }
      }
      
      return this.localIntentDetection(message);
    } catch (error) {
      console.error('Error calling Gemini API for intent detection:', error);
      return this.localIntentDetection(message);
    }
  }

  /**
   * Local fallback for intent detection when API fails
   */
  private localIntentDetection(message: string): {
    isCreationIntent: boolean;
    equipmentType?: string;
    quantity?: number;
  } {
    const lowercaseMessage = message.toLowerCase();
    
    // Check for creation intent keywords
    const hasCreationIntent = /add|create|install|place|configure|setup|set up|put/i.test(lowercaseMessage);
    
    if (!hasCreationIntent) {
      return { isCreationIntent: false };
    }
    
    // Extract equipment type
    let equipmentType: string | undefined;
    let quantity = 1;
    
    // Extract quantity if mentioned
    const quantityMatch = lowercaseMessage.match(/(\d+)\s*(cameras?|access points?|readers?|elevators?|intercoms?)/i);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
    }
    
    // Determine equipment type
    if (/cameras?/i.test(lowercaseMessage)) {
      equipmentType = EQUIPMENT_TYPES.CAMERA;
    } else if (/access points?|card readers?|readers?|doors?/i.test(lowercaseMessage)) {
      equipmentType = EQUIPMENT_TYPES.ACCESS_POINT;
    } else if (/elevators?/i.test(lowercaseMessage)) {
      equipmentType = EQUIPMENT_TYPES.ELEVATOR;
    } else if (/intercoms?/i.test(lowercaseMessage)) {
      equipmentType = EQUIPMENT_TYPES.INTERCOM;
    }
    
    return {
      isCreationIntent: hasCreationIntent && !!equipmentType,
      equipmentType,
      quantity
    };
  }

  /**
   * Start a new equipment creation session
   */
  async startSession(
    projectId: number,
    equipmentType: string,
    quantity: number
  ): Promise<SessionResponse> {
    // Create a new session
    const sessionId = uuidv4();
    
    const sessionData: InsertEquipmentCreationSession = {
      id: sessionId,
      project_id: projectId,
      equipment_type: equipmentType,
      quantity: quantity,
      responses: {},
      completed: false,
      created_at: new Date().toISOString()
    };
    
    // Insert the session into the database
    await db.insert(equipmentCreationSessions).values(sessionData);
    
    // Define the first step
    const currentStep = 'location';
    
    return {
      sessionId,
      currentStep,
      nextQuestion: await this.getQuestionForStep(currentStep, equipmentType, quantity),
      isComplete: false
    };
  }

  /**
   * Process a user response for a session
   */
  async processResponse(
    sessionId: string,
    userResponse: string
  ): Promise<SessionResponse> {
    // Get the session
    const session = await this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (session.completed) {
      throw new Error('Session already completed');
    }
    
    // Get the current step
    const currentStep = Object.keys(session.responses).length > 0
      ? await this.determineNextStep(session)
      : 'location';
    
    // Update the session with the user's response
    const responses = { ...session.responses, [currentStep]: userResponse };
    
    await db
      .update(equipmentCreationSessions)
      .set({ responses })
      .where(eq(equipmentCreationSessions.id, sessionId));
    
    // Determine the next step
    const nextStep = await this.determineNextStep({ ...session, responses });
    
    // If there are no more steps, create the equipment
    if (nextStep === 'complete') {
      // Create the equipment
      const equipment = await this.createEquipment(session, responses);
      
      // Mark the session as completed
      await db
        .update(equipmentCreationSessions)
        .set({ completed: true })
        .where(eq(equipmentCreationSessions.id, sessionId));
      
      return {
        sessionId,
        currentStep: 'complete',
        nextQuestion: `Great! I've added ${session.quantity} ${this.getEquipmentTypeLabel(session.equipment_type)}${session.quantity > 1 ? 's' : ''} to your project.`,
        isComplete: true,
        equipmentCreated: equipment
      };
    }
    
    // Otherwise, return the next question
    return {
      sessionId,
      currentStep: nextStep,
      nextQuestion: await this.getQuestionForStep(nextStep, session.equipment_type, session.quantity),
      isComplete: false
    };
  }

  /**
   * Determine the next step in the conversation flow using Gemini if available
   */
  private async determineNextStep(session: EquipmentCreationSession): Promise<string> {
    // Get required fields for this equipment type
    const requiredFields = EQUIPMENT_REQUIRED_FIELDS[session.equipment_type as keyof typeof EQUIPMENT_REQUIRED_FIELDS] || ['location'];
    
    // Check if we've collected all required fields
    for (const field of requiredFields) {
      if (!session.responses[field]) {
        return field;
      }
    }
    
    // If we have all required fields, check if user wants to add notes
    if (!session.responses['notes']) {
      return 'notes';
    }
    
    // If we have everything, we're done
    return 'complete';
  }

  /**
   * Get the question to ask for a specific step
   */
  private async getQuestionForStep(step: string, equipmentType: string, quantity: number): Promise<string> {
    if (GEMINI_API_KEY) {
      try {
        // Call Gemini API for natural language question generation
        const response = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ 
                  text: `
                  Generate a friendly, conversational question to ask the user for the following information:
                  
                  Equipment type: ${equipmentType.replace('_', ' ')}
                  Quantity: ${quantity}
                  Information needed: ${step}
                  
                  The question should be short, natural, and focused only on getting this specific piece of information.
                  Don't mention that this is part of a form or process.
                  `
                }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 256,
            }
          })
        });
  
        if (response.ok) {
          const data = await response.json();
          
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (error) {
        console.error('Error calling Gemini API for question generation:', error);
      }
    }
    
    // Fallback to predefined questions
    switch (step) {
      case 'location':
        return `Where ${quantity > 1 ? 'are these' : 'is this'} ${this.getEquipmentTypeLabel(equipmentType)}${quantity > 1 ? 's' : ''} going to be located?`;
      
      case 'camera_type':
        return `What type of camera${quantity > 1 ? 's' : ''} would you like to use? (e.g., Dome, Bullet, PTZ)`;
      
      case 'reader_type':
        return `What type of reader${quantity > 1 ? 's' : ''} will be used? (e.g., Mullion, Standard, Keypad)`;
      
      case 'notes':
        return `Any additional notes or requirements for ${quantity > 1 ? 'these' : 'this'} ${this.getEquipmentTypeLabel(equipmentType)}${quantity > 1 ? 's' : ''}?`;
      
      case 'complete':
        return `Great! I've added ${quantity} ${this.getEquipmentTypeLabel(equipmentType)}${quantity > 1 ? 's' : ''} to your project.`;
      
      default:
        return `Please provide details about the ${step} for ${quantity > 1 ? 'these' : 'this'} ${this.getEquipmentTypeLabel(equipmentType)}${quantity > 1 ? 's' : ''}.`;
    }
  }

  /**
   * Get a human-readable label for an equipment type
   */
  private getEquipmentTypeLabel(equipmentType: string): string {
    switch (equipmentType) {
      case EQUIPMENT_TYPES.ACCESS_POINT:
        return 'access point';
      case EQUIPMENT_TYPES.CAMERA:
        return 'camera';
      case EQUIPMENT_TYPES.ELEVATOR:
        return 'elevator';
      case EQUIPMENT_TYPES.INTERCOM:
        return 'intercom';
      default:
        return 'equipment';
    }
  }

  /**
   * Create equipment based on session responses
   */
  private async createEquipment(
    session: EquipmentCreationSession,
    responses: Record<string, string>
  ): Promise<GenericEquipmentType[]> {
    const createdEquipment = [];
    
    // Create equipment based on type
    switch (session.equipment_type) {
      case EQUIPMENT_TYPES.ACCESS_POINT:
        for (let i = 0; i < session.quantity; i++) {
          const accessPoint = await storage.createAccessPoint({
            project_id: session.project_id,
            location: responses.location || 'Unknown location',
            reader_type: responses.reader_type || 'Standard',
            quick_config: 'Standard',
            lock_type: 'Electric Strike',
            monitoring_type: 'Standard',
            notes: responses.notes || null,
            status: 'Active'
          });
          createdEquipment.push(accessPoint);
        }
        break;
        
      case EQUIPMENT_TYPES.CAMERA:
        for (let i = 0; i < session.quantity; i++) {
          const camera = await storage.createCamera({
            project_id: session.project_id,
            location: responses.location || 'Unknown location',
            camera_type: responses.camera_type || 'Dome',
            notes: responses.notes || null,
            status: 'Active'
          });
          createdEquipment.push(camera);
        }
        break;
        
      case EQUIPMENT_TYPES.ELEVATOR:
        for (let i = 0; i < session.quantity; i++) {
          const elevator = await storage.createElevator({
            project_id: session.project_id,
            location: responses.location || 'Unknown location',
            notes: responses.notes || null,
            status: 'Active'
          });
          createdEquipment.push(elevator);
        }
        break;
        
      case EQUIPMENT_TYPES.INTERCOM:
        for (let i = 0; i < session.quantity; i++) {
          const intercom = await storage.createIntercom({
            project_id: session.project_id,
            location: responses.location || 'Unknown location',
            intercom_type: 'Standard',
            notes: responses.notes || null,
            status: 'Active'
          });
          createdEquipment.push(intercom);
        }
        break;
    }
    
    return createdEquipment;
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<EquipmentCreationSession | null> {
    const [session] = await db
      .select()
      .from(equipmentCreationSessions)
      .where(eq(equipmentCreationSessions.id, sessionId));
    
    return session || null;
  }
}

export const equipmentCreationGeminiService = new EquipmentCreationGeminiService();
export default equipmentCreationGeminiService;