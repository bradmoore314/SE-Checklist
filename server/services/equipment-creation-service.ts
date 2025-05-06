import { db } from '../db';
import { 
  equipmentCreationSessions,
  EquipmentCreationSession,
  InsertEquipmentCreationSession
} from '@shared/schema-equipment-creation';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { GenericEquipmentType } from '@shared/schema-equipment';

// Equipment types that can be created by the AI chatbot
export const EQUIPMENT_TYPES = {
  ACCESS_POINT: 'access_point',
  CAMERA: 'camera',
  ELEVATOR: 'elevator',
  INTERCOM: 'intercom'
};

// Steps in the equipment creation process
export const CREATION_STEPS = {
  LOCATION: 'location',
  INSTALLATION_TYPE: 'installation_type',
  HARDWARE: 'hardware',
  READER_TYPE: 'reader_type',
  CAMERA_TYPE: 'camera_type',
  RESOLUTION: 'resolution',
  NOTES: 'notes',
  COMPLETE: 'complete'
};

// Intent detection response
interface CreationIntent {
  isCreationIntent: boolean;
  equipmentType?: string;
  quantity?: number;
}

// Session response
interface SessionResponse {
  sessionId: string;
  nextQuestion: string;
  currentStep: string;
  isComplete: boolean;
  equipmentCreated?: GenericEquipmentType[];
}

/**
 * Service for handling equipment creation via the AI chatbot
 */
class EquipmentCreationService {
  /**
   * Detect if a message contains an intent to create equipment
   */
  detectCreationIntent(message: string): CreationIntent {
    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check for common patterns indicating creation intent
    const addPattern = /\b(add|create|install|put|place|include)\b/i;
    
    // Check for equipment types
    const accessPointPatterns = /\b(access\s*points?|doors?|card\s*readers?|keypads?|entries?|exits?)\b/i;
    const cameraPatterns = /\b(cameras?|cctv|video\s*cameras?|surveillance\s*cameras?)\b/i;
    const elevatorPatterns = /\b(elevators?|lifts?|elevator\s*control)\b/i;
    const intercomPatterns = /\b(intercoms?|entry\s*phones?|door\s*phones?|buzzers?)\b/i;
    
    // Check for quantity patterns
    const quantityPattern = /\b(\d+)\b/;
    
    // Determine if this is a creation intent
    const hasAddVerb = addPattern.test(lowerMessage);
    const hasAccessPoint = accessPointPatterns.test(lowerMessage);
    const hasCamera = cameraPatterns.test(lowerMessage);
    const hasElevator = elevatorPatterns.test(lowerMessage);
    const hasIntercom = intercomPatterns.test(lowerMessage);
    
    // Determine equipment type
    let equipmentType = null;
    if (hasAccessPoint) equipmentType = EQUIPMENT_TYPES.ACCESS_POINT;
    else if (hasCamera) equipmentType = EQUIPMENT_TYPES.CAMERA;
    else if (hasElevator) equipmentType = EQUIPMENT_TYPES.ELEVATOR;
    else if (hasIntercom) equipmentType = EQUIPMENT_TYPES.INTERCOM;
    
    // Extract quantity if present
    let quantity = 1;
    const quantityMatch = lowerMessage.match(quantityPattern);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1], 10);
    }
    
    // Determine if this is a creation intent
    const isCreationIntent = hasAddVerb && (
      hasAccessPoint || hasCamera || hasElevator || hasIntercom
    );
    
    return {
      isCreationIntent,
      equipmentType: isCreationIntent ? equipmentType : undefined,
      quantity: isCreationIntent ? quantity : undefined
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
    try {
      // Generate a unique session ID
      const sessionId = uuidv4();
      
      // Determine the first step based on equipment type
      let firstStep = CREATION_STEPS.LOCATION;
      
      // Create the session in the database
      const sessionData: InsertEquipmentCreationSession = {
        session_id: sessionId,
        project_id: projectId,
        equipment_type: equipmentType,
        quantity: quantity,
        current_step: firstStep,
        responses: {},
        completed: false
      };
      
      await db.insert(equipmentCreationSessions).values(sessionData);
      
      // Get the first question to ask
      const nextQuestion = this.getQuestionForStep(firstStep, equipmentType);
      
      return {
        sessionId,
        nextQuestion,
        currentStep: firstStep,
        isComplete: false
      };
    } catch (error) {
      console.error('Error starting equipment creation session:', error);
      throw error;
    }
  }
  
  /**
   * Process a user response for a session
   */
  async processResponse(
    sessionId: string, 
    response: string
  ): Promise<SessionResponse> {
    try {
      // Get the current session
      const [session] = await db
        .select()
        .from(equipmentCreationSessions)
        .where(eq(equipmentCreationSessions.session_id, sessionId));
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Store the response
      const currentStep = session.current_step;
      const responses = { ...session.responses, [currentStep]: response };
      
      // Determine the next step
      const nextStep = this.getNextStep(currentStep, session.equipment_type);
      
      // If we're at the final step, create the equipment
      let equipmentCreated = [];
      let isComplete = false;
      
      if (nextStep === CREATION_STEPS.COMPLETE) {
        isComplete = true;
        equipmentCreated = await this.createEquipment(session, responses);
      }
      
      // Update the session
      await db
        .update(equipmentCreationSessions)
        .set({ 
          current_step: nextStep,
          responses: responses,
          completed: isComplete
        })
        .where(eq(equipmentCreationSessions.session_id, sessionId));
      
      // Get the next question to ask
      const nextQuestion = this.getQuestionForStep(nextStep, session.equipment_type);
      
      return {
        sessionId,
        nextQuestion,
        currentStep: nextStep,
        isComplete,
        equipmentCreated: isComplete ? equipmentCreated : undefined
      };
    } catch (error) {
      console.error('Error processing response:', error);
      throw error;
    }
  }
  
  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<EquipmentCreationSession | null> {
    try {
      const [session] = await db
        .select()
        .from(equipmentCreationSessions)
        .where(eq(equipmentCreationSessions.session_id, sessionId));
      
      return session || null;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }
  
  /**
   * Determine the next step in the equipment creation process
   */
  private getNextStep(currentStep: string, equipmentType: string): string {
    switch (currentStep) {
      case CREATION_STEPS.LOCATION:
        return CREATION_STEPS.INSTALLATION_TYPE;
        
      case CREATION_STEPS.INSTALLATION_TYPE:
        if (equipmentType === EQUIPMENT_TYPES.ACCESS_POINT) {
          return CREATION_STEPS.READER_TYPE;
        } else if (equipmentType === EQUIPMENT_TYPES.CAMERA) {
          return CREATION_STEPS.CAMERA_TYPE;
        } else {
          return CREATION_STEPS.HARDWARE;
        }
        
      case CREATION_STEPS.READER_TYPE:
        return CREATION_STEPS.HARDWARE;
        
      case CREATION_STEPS.CAMERA_TYPE:
        return CREATION_STEPS.RESOLUTION;
        
      case CREATION_STEPS.HARDWARE:
      case CREATION_STEPS.RESOLUTION:
        return CREATION_STEPS.NOTES;
        
      case CREATION_STEPS.NOTES:
        return CREATION_STEPS.COMPLETE;
        
      default:
        return CREATION_STEPS.LOCATION;
    }
  }
  
  /**
   * Get the question to ask for a specific step
   */
  private getQuestionForStep(step: string, equipmentType: string): string {
    switch (step) {
      case CREATION_STEPS.LOCATION:
        return `Where will this ${this.getEquipmentTypeLabel(equipmentType)} be located? (e.g., "Main entrance", "Lobby", "East corridor")`;
        
      case CREATION_STEPS.INSTALLATION_TYPE:
        return `What type of installation will this be? (e.g., "New", "Retrofit", "Replacement")`;
        
      case CREATION_STEPS.READER_TYPE:
        return `What type of reader will be used? (e.g., "Mullion", "Standard", "Keypad", "Biometric")`;
        
      case CREATION_STEPS.CAMERA_TYPE:
        return `What type of camera will this be? (e.g., "Dome", "Bullet", "PTZ", "Fisheye")`;
        
      case CREATION_STEPS.HARDWARE:
        return `Do you have any specific hardware requirements? (e.g., "HID RP40", "Von Duprin", or "No preference")`;
        
      case CREATION_STEPS.RESOLUTION:
        return `What resolution is needed for this camera? (e.g., "4K", "1080p", "720p")`;
        
      case CREATION_STEPS.NOTES:
        return `Any additional notes or requirements?`;
        
      case CREATION_STEPS.COMPLETE:
        return `Great! I've added the ${this.getEquipmentTypeLabel(equipmentType)} to your project.`;
        
      default:
        return `What would you like to specify for this ${this.getEquipmentTypeLabel(equipmentType)}?`;
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
    
    // Handle creation for each equipment type
    switch (session.equipment_type) {
      case EQUIPMENT_TYPES.ACCESS_POINT:
        for (let i = 0; i < session.quantity; i++) {
          const accessPoint = await storage.createAccessPoint({
            project_id: session.project_id,
            location: responses[CREATION_STEPS.LOCATION] || 'Unknown location',
            installation_type: responses[CREATION_STEPS.INSTALLATION_TYPE] || 'New',
            door_type: 'Standard', // Default
            reader_type: responses[CREATION_STEPS.READER_TYPE] || 'Standard',
            hardware: responses[CREATION_STEPS.HARDWARE] || '',
            notes: responses[CREATION_STEPS.NOTES] || '',
            status: 'Active'
          });
          createdEquipment.push(accessPoint);
        }
        break;
        
      case EQUIPMENT_TYPES.CAMERA:
        for (let i = 0; i < session.quantity; i++) {
          const camera = await storage.createCamera({
            project_id: session.project_id,
            location: responses[CREATION_STEPS.LOCATION] || 'Unknown location',
            installation_type: responses[CREATION_STEPS.INSTALLATION_TYPE] || 'New',
            camera_type: responses[CREATION_STEPS.CAMERA_TYPE] || 'Dome',
            resolution: responses[CREATION_STEPS.RESOLUTION] || '1080p',
            notes: responses[CREATION_STEPS.NOTES] || '',
            status: 'Active'
          });
          createdEquipment.push(camera);
        }
        break;
        
      case EQUIPMENT_TYPES.ELEVATOR:
        for (let i = 0; i < session.quantity; i++) {
          const elevator = await storage.createElevator({
            project_id: session.project_id,
            location: responses[CREATION_STEPS.LOCATION] || 'Unknown location',
            installation_type: responses[CREATION_STEPS.INSTALLATION_TYPE] || 'New',
            controller_type: 'Standard', // Default
            floors_served: 'All', // Default
            hardware: responses[CREATION_STEPS.HARDWARE] || '',
            notes: responses[CREATION_STEPS.NOTES] || '',
            status: 'Active'
          });
          createdEquipment.push(elevator);
        }
        break;
        
      case EQUIPMENT_TYPES.INTERCOM:
        for (let i = 0; i < session.quantity; i++) {
          const intercom = await storage.createIntercom({
            project_id: session.project_id,
            location: responses[CREATION_STEPS.LOCATION] || 'Unknown location',
            installation_type: responses[CREATION_STEPS.INSTALLATION_TYPE] || 'New',
            intercom_type: 'Standard', // Default
            hardware: responses[CREATION_STEPS.HARDWARE] || '',
            notes: responses[CREATION_STEPS.NOTES] || '',
            status: 'Active'
          });
          createdEquipment.push(intercom);
        }
        break;
    }
    
    return createdEquipment;
  }
}

export default new EquipmentCreationService();