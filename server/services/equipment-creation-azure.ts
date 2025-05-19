import { v4 as uuidv4 } from 'uuid';
import { getAzureOpenAIClient } from '../utils/azure-openai';

// Equipment Creation Intent Types
export enum EquipmentIntentType {
  ACCESS_POINT = 'access_point',
  CAMERA = 'camera',
  ELEVATOR = 'elevator',
  INTERCOM = 'intercom',
  NONE = 'none'
}

// Equipment Creation Session State
export interface EquipmentCreationSession {
  id: string;
  projectId: number;
  equipmentType: string;
  quantity: number;
  createdAt: Date;
  messages: Array<{ role: string; content: string }>;
  status: 'active' | 'completed' | 'failed';
  currentStep: string;
  equipmentItems: any[];
}

// In-memory storage for sessions (would be persisted to database in production)
const sessions: Record<string, EquipmentCreationSession> = {};

/**
 * Service for creating equipment using Azure OpenAI for natural language processing
 * This service uses Azure OpenAI to detect intent, extract details, and guide equipment creation
 * All processing is done securely within Kastle's Azure environment
 */
const equipmentCreationAzureService = {
  /**
   * Detect equipment creation intent from a natural language message
   */
  async detectCreationIntent(message: string): Promise<{ 
    intent: EquipmentIntentType; 
    confidence: number;
    details?: Record<string, any>; 
  }> {
    try {
      console.log("Detecting equipment creation intent using Azure OpenAI");
      
      // Create Azure OpenAI client
      const openai = getAzureOpenAIClient();
      
      // Format the prompt for intent detection
      const prompt = `
        You are an AI assistant specialized in security equipment. Analyze the following message and detect if the user is trying to add:
        1. Access point/door (return "access_point")
        2. Camera (return "camera")
        3. Elevator or turnstile (return "elevator")
        4. Intercom (return "intercom")
        5. None of the above (return "none")
        
        Also determine a confidence score (0-1) for your assessment.
        
        Return your analysis as a JSON object with properties:
        - intent: The detected intent type (one of: "access_point", "camera", "elevator", "intercom", "none")
        - confidence: A number from 0 to 1 indicating confidence level
        - details: Any detected specifications (optional)
        
        User message: "${message}"
      `;
      
      // Call Azure OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a security equipment specialist AI assistant." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000
      });
      
      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Ensure valid response
      if (!result.intent || !Object.values(EquipmentIntentType).includes(result.intent)) {
        return { 
          intent: EquipmentIntentType.NONE, 
          confidence: 0,
          details: { error: "Failed to detect valid intent" }
        };
      }
      
      return {
        intent: result.intent as EquipmentIntentType,
        confidence: Math.min(Math.max(result.confidence || 0, 0), 1), // Ensure between 0-1
        details: result.details || {}
      };
    } catch (error) {
      console.error("Error detecting equipment creation intent with Azure OpenAI:", error);
      // Fallback to no intent with error details
      return {
        intent: EquipmentIntentType.NONE,
        confidence: 0,
        details: { error: "Failed to process intent detection" }
      };
    }
  },
  
  /**
   * Start a new equipment creation session
   */
  async startSession(
    projectId: number, 
    equipmentType: string, 
    quantity: number
  ): Promise<EquipmentCreationSession> {
    // Create a new session
    const sessionId = uuidv4();
    const session: EquipmentCreationSession = {
      id: sessionId,
      projectId,
      equipmentType,
      quantity,
      createdAt: new Date(),
      messages: [],
      status: 'active',
      currentStep: 'initial',
      equipmentItems: []
    };
    
    sessions[sessionId] = session;
    
    try {
      // Initialize the conversation with Azure OpenAI
      const openai = getAzureOpenAIClient();
      
      const systemMessage = `
        You are a security equipment specialist helping to create ${quantity} new ${equipmentType}(s).
        Guide the user through the process step by step, asking for necessary details.
        Keep your responses concise and focused on collecting the required information.
      `;
      
      // Initialize with Azure OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `I'd like to add ${quantity} ${equipmentType}(s) to my project. Please guide me through the process.` }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      // Save the initial conversation
      session.messages.push({ role: "system", content: systemMessage });
      session.messages.push({ role: "user", content: `I'd like to add ${quantity} ${equipmentType}(s) to my project.` });
      session.messages.push({ role: "assistant", content: response.choices[0].message.content || "Let's configure your equipment. What details can you provide?" });
      
      return session;
    } catch (error) {
      console.error("Error starting equipment creation session with Azure OpenAI:", error);
      session.status = 'failed';
      return session;
    }
  },
  
  /**
   * Process a user response in an equipment creation session
   */
  async processResponse(sessionId: string, userResponse: string): Promise<{
    reply: string;
    equipmentItems?: any[];
    status: 'active' | 'completed' | 'failed';
  }> {
    // Get the session
    const session = sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Add user response to messages
    session.messages.push({ role: "user", content: userResponse });
    
    try {
      // Process with Azure OpenAI
      const openai = getAzureOpenAIClient();
      
      // Convert session messages to the format expected by Azure OpenAI
      const messages = session.messages.map(msg => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content
      }));
      
      // Add analysis instruction
      messages.push({
        role: "system",
        content: `
          Based on the conversation so far, determine if you have enough information to create ${session.quantity} ${session.equipmentType}(s).
          If you do, include a JSON snippet in your response with the extracted equipment details, formatted as:
          \`\`\`json
          {"equipment": [{...details for item 1}, {...details for item 2}, ...]}
          \`\`\`
          If you don't have enough information yet, continue the conversation to gather more details.
        `
      });
      
      // Get Azure OpenAI response
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const replyContent = response.choices[0].message.content || "";
      
      // Add assistant response to messages
      session.messages.push({ role: "assistant", content: replyContent });
      
      // Check if equipment details are included
      const jsonMatch = replyContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          if (extractedJson.equipment && Array.isArray(extractedJson.equipment)) {
            session.equipmentItems = extractedJson.equipment;
            session.status = 'completed';
            session.currentStep = 'completed';
            
            return {
              reply: replyContent.replace(/```json\s*[\s\S]*?\s*```/, ""),
              equipmentItems: session.equipmentItems,
              status: 'completed'
            };
          }
        } catch (parseError) {
          console.error("Error parsing equipment JSON from Azure OpenAI response:", parseError);
        }
      }
      
      // Continue the conversation
      return {
        reply: replyContent,
        status: 'active'
      };
    } catch (error) {
      console.error("Error processing equipment creation response with Azure OpenAI:", error);
      session.status = 'failed';
      return {
        reply: "Sorry, I encountered an error processing your response. Please try again later.",
        status: 'failed'
      };
    }
  },
  
  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<EquipmentCreationSession | null> {
    return sessions[sessionId] || null;
  }
};

export default equipmentCreationAzureService;