import { getAzureOpenAIClient, createChatMessage } from '../utils/azure-openai';

// Define message history types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  securityEquipment?: {
    type: string;
    count: number;
    location?: string;
    details?: string;
    confidence?: number;
  }[];
  buildingType?: string;
  buildingSize?: {
    floors: number;
    squareFootage?: number;
  };
  specialRequirements?: string[];
  projectId?: number;
  equipmentCreationSessionId?: string;
}

/**
 * ChatbotAzureService - Provides AI functionality using Microsoft Azure OpenAI
 * 
 * This implementation uses Azure OpenAI in Kastle's secure environment for enhanced security:
 * - All data processing occurs within Kastle's protected infrastructure
 * - Communications use secure, authenticated channels
 * - All operations comply with enterprise security requirements
 */
export class ChatbotAzureService {
  private apiKey: string | undefined;
  private systemPrompt: string;
  
  constructor() {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('AZURE_OPENAI_API_KEY not found in environment. Azure OpenAI services will not function correctly.');
    }
    
    // System prompt to set the assistant's behavior
    this.systemPrompt = `You are a knowledgeable Security Equipment Assistant developed for a Site Walk Checklist application. Your job is to help security professionals configure and place security equipment during site assessments.

## Your Capabilities:
- Answer questions about security equipment (access points, cameras, elevators, intercoms)
- Provide recommendations for equipment placement
- Help users understand the best security solutions for different environments
- Guide users through site assessment processes

## Security Equipment Types:
1. Access Points - Card readers, keypads, and other access control devices
2. Cameras - Surveillance cameras with different capabilities (PTZ, fixed, etc.)
3. Elevators - Elevator control and integration with access control
4. Intercoms - Communication devices for visitor management

## When making recommendations:
- Consider the specific building type and security needs
- Balance security requirements with budget constraints
- Follow industry best practices for equipment placement
- Consider integration between different security systems

Be professional, concise, and focused on helping security professionals make informed decisions.`;
  }
  
  /**
   * Process a chat message and return a response
   * 
   * This method securely processes messages through Kastle's Azure OpenAI deployment,
   * ensuring all conversational data remains within Kastle's protected environment.
   * 
   * @param messages Array of chat messages representing the conversation history
   * @param context Optional context information about the security installation
   * @returns AI-generated response based on the conversation and context
   */
  async processMessage(messages: ChatMessage[], context?: ChatContext): Promise<string> {
    try {
      const openai = getAzureOpenAIClient();
      
      // Build the message array for the API
      const apiMessages = [
        // Always start with the system prompt
        createChatMessage('system', this.systemPrompt)
      ];
      
      // Add context information if available
      if (context) {
        let contextDescription = "Here is additional context information about the security project:\n\n";
        
        if (context.securityEquipment?.length) {
          contextDescription += "Security Equipment:\n";
          context.securityEquipment.forEach(equipment => {
            contextDescription += `- ${equipment.count}x ${equipment.type}`;
            if (equipment.location) contextDescription += ` in ${equipment.location}`;
            if (equipment.details) contextDescription += ` (${equipment.details})`;
            contextDescription += "\n";
          });
        }
        
        if (context.buildingType) {
          contextDescription += `\nBuilding Type: ${context.buildingType}\n`;
        }
        
        if (context.buildingSize) {
          contextDescription += `\nBuilding Size: ${context.buildingSize.floors} floors`;
          if (context.buildingSize.squareFootage) {
            contextDescription += `, approximately ${context.buildingSize.squareFootage} square feet`;
          }
          contextDescription += "\n";
        }
        
        if (context.specialRequirements?.length) {
          contextDescription += "\nSpecial Requirements:\n";
          context.specialRequirements.forEach(req => {
            contextDescription += `- ${req}\n`;
          });
        }
        
        if (contextDescription.length > 0) {
          apiMessages.push(createChatMessage('system', contextDescription));
        }
      }
      
      // Add the conversation history
      messages.forEach(msg => {
        apiMessages.push(createChatMessage(
          msg.role as 'user' | 'assistant', // Type assertion to match the expected types
          msg.content
        ));
      });
      
      // Make the API request to Azure OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024
      });
      
      // Return the generated text
      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error in Azure OpenAI chat completion:", error);
      throw new Error(`Failed to process message with Azure OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Analyze a user query to extract context information
   * 
   * This method uses Kastle's secure Azure OpenAI to analyze user input and extract
   * structured information about security equipment needs and building characteristics.
   * 
   * @param query User's query text to analyze
   * @returns Extracted context information
   */
  async analyzeQuery(query: string): Promise<ChatContext> {
    try {
      const openai = getAzureOpenAIClient();
      
      const prompt = `Analyze the following query to extract information about security equipment needs, building type, and special requirements. Format your response as a valid JSON object with the following structure:
{
  "securityEquipment": [
    { "type": "string", "count": number, "location": "string", "details": "string", "confidence": number }
  ],
  "buildingType": "string", 
  "buildingSize": { "floors": number, "squareFootage": number },
  "specialRequirements": ["string"]
}

Only include fields in the response if they can be inferred from the query. The confidence should be a number between 0 and 1.

Query: ${query}`;
      
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: [createChatMessage('user', prompt)],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });
      
      // Get and parse the JSON response
      const jsonResponse = response.choices[0].message.content;
      if (!jsonResponse) {
        return {}; // Return empty context if no response
      }
      
      try {
        return JSON.parse(jsonResponse) as ChatContext;
      } catch (parseError) {
        console.error("Failed to parse JSON response from Azure OpenAI:", parseError);
        return {}; // Return empty context on parse error
      }
    } catch (error) {
      console.error("Error analyzing query with Azure OpenAI:", error);
      throw new Error(`Failed to analyze query with Azure OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract equipment recommendations from text
   * 
   * This method analyzes text through Kastle's secure Azure OpenAI service to identify
   * and extract equipment recommendations, with all processing occurring within
   * Kastle's protected environment.
   * 
   * @param text Text to analyze for equipment recommendations
   * @returns Array of extracted equipment recommendations
   */
  async extractEquipmentRecommendations(text: string): Promise<any[]> {
    try {
      const openai = getAzureOpenAIClient();
      
      const prompt = `Analyze the following text and extract any security equipment recommendations. Format your response as a JSON array of objects, where each object represents a recommended piece of equipment with the following properties:
- type: The type of equipment (e.g., "camera", "access point", "intercom", "elevator")
- subType: The specific subtype of equipment (e.g., "PTZ camera", "biometric reader")
- location: The recommended location for installation
- purpose: The purpose or reasoning for this recommendation
- priority: A number from 1-5 indicating the importance (1 being highest priority)

Only extract equipment that is explicitly or implicitly recommended in the text. If no recommendations are found, return an empty array.

Text to analyze:
${text}`;
      
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: [createChatMessage('user', prompt)],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });
      
      // Get and parse the JSON response
      const jsonResponse = response.choices[0].message.content;
      if (!jsonResponse) {
        return []; // Return empty array if no response
      }
      
      try {
        return JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response from Azure OpenAI:", parseError);
        return []; // Return empty array on parse error
      }
    } catch (error) {
      console.error("Error extracting equipment recommendations with Azure OpenAI:", error);
      throw new Error(`Failed to extract equipment recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create and export a singleton instance
const chatbotAzureService = new ChatbotAzureService();
export default chatbotAzureService;