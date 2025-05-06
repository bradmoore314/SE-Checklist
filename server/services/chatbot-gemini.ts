import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini API with API key from environment
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

// Define security settings for content safety
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Define generation configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Define message history types
export interface ChatMessage {
  role: 'user' | 'assistant';
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
}

/**
 * ChatbotGeminiService - Provides AI functionality using Google's Gemini model
 */
export class ChatbotGeminiService {
  private model: GenerativeModel;
  private systemPrompt: string;
  
  constructor() {
    // Initialize Gemini model
    this.model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      safetySettings,
      generationConfig,
    });
    
    // System prompt to set the assistant's behavior
    this.systemPrompt = `You are a knowledgeable Security Equipment Assistant developed for a Site Walk Checklist application. Your job is to help security professionals configure and place security equipment during site assessments.

## Your Capabilities:
- Answer questions about security equipment (access points, cameras, elevators, intercoms)
- Provide recommendations for equipment placement
- Help users understand the best security solutions for different environments
- Guide users through site assessment processes

## Your Knowledge Areas:
- Access control systems (card readers, keypads, biometric, etc.)
- Video surveillance (IP cameras, PTZ, fixed, analytics)
- Intrusion detection systems
- Intercom and communication systems
- Door hardware (electric strikes, magnetic locks, etc.)
- Security industry best practices
- Compliance requirements (fire codes, ADA, etc.)

## Guidelines:
1. Be concise but thorough in your responses.
2. Ask clarifying questions when needed.
3. Provide specific, actionable recommendations.
4. When discussing equipment placement, consider factors like coverage areas, lighting conditions, and environmental factors.
5. Always maintain a professional, helpful tone.
6. If asked about specific brands or models, provide general information but avoid explicit endorsements.
7. If you don't know something, admit it rather than making up information.
8. Remember you are integrated with a Site Walk Checklist application that allows marking equipment locations on floorplans.

## Special Instructions:
- When suggesting equipment quantities or placements, explain your reasoning.
- Prefer industry standard terminology.
- Follow security industry best practices in your recommendations.
- If the user describes their site, remember these details for future recommendations.
- Help identify access points, cameras, and other equipment that should be marked on the floorplan.`;
  }
  
  /**
   * Process a chat message and return a response
   * 
   * @param messages Chat history
   * @param context Optional context with information about the site
   * @returns Response from the AI
   */
  async processMessage(messages: ChatMessage[], context?: ChatContext): Promise<string> {
    try {
      // Create a chat session
      const chat = this.model.startChat({
        history: [],
        systemInstruction: this.systemPrompt,
      });
      
      // Format context as a system message if provided
      let formattedMessages = [...messages];
      if (context) {
        const contextMessage = this.formatContextAsMessage(context);
        formattedMessages = [contextMessage, ...formattedMessages];
      }
      
      // Send formatted messages to model
      const result = await chat.sendMessageStream(this.formatMessagesForGemini(formattedMessages));
      
      // Process the response
      let responseText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        responseText += chunkText;
      }
      
      return responseText;
    } catch (error) {
      console.error('Error processing message with Gemini:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again in a moment.";
    }
  }
  
  /**
   * Format messages in the expected structure for Gemini
   */
  private formatMessagesForGemini(messages: ChatMessage[]): string {
    // Convert message array to a single string with role prefixes
    // This is one approach that works well with Gemini
    return messages.map(msg => {
      const prefix = msg.role === 'user' ? 'User: ' : 'Assistant: ';
      return `${prefix}${msg.content}`;
    }).join('\n\n');
  }
  
  /**
   * Format context data as a system message
   */
  private formatContextAsMessage(context: ChatContext): ChatMessage {
    let contextText = 'Context information about the site:\n\n';
    
    if (context.buildingType) {
      contextText += `Building type: ${context.buildingType}\n`;
    }
    
    if (context.buildingSize) {
      contextText += `Building size: ${context.buildingSize.floors} floors`;
      if (context.buildingSize.squareFootage) {
        contextText += `, ${context.buildingSize.squareFootage} square feet`;
      }
      contextText += '\n';
    }
    
    if (context.specialRequirements && context.specialRequirements.length > 0) {
      contextText += `Special requirements: ${context.specialRequirements.join(', ')}\n`;
    }
    
    if (context.securityEquipment && context.securityEquipment.length > 0) {
      contextText += '\nExisting security equipment:\n';
      context.securityEquipment.forEach(item => {
        contextText += `- ${item.count} ${item.type}`;
        if (item.location) {
          contextText += ` (${item.location})`;
        }
        if (item.details) {
          contextText += `: ${item.details}`;
        }
        contextText += '\n';
      });
    }
    
    return {
      role: 'user',
      content: contextText,
    };
  }
  
  /**
   * Extract equipment recommendations from AI message
   * 
   * @param message AI message to analyze
   * @returns Array of security equipment objects extracted from the message
   */
  async extractEquipmentRecommendations(message: string): Promise<ChatContext['securityEquipment']> {
    try {
      // Create a new chat instance for the analysis
      const analyzeChat = this.model.startChat({
        history: [],
        systemInstruction: `You are a parser that extracts security equipment recommendations from text. 
        Extract and structure the information about security equipment mentioned in the given text.
        Output ONLY a JSON array of objects with these properties:
        - type: the type of security equipment (e.g., "camera", "access point", "intercom", "elevator", etc.)
        - count: the number of equipment items recommended (integer)
        - location: where the equipment should be placed (optional)
        - details: any additional specification about the equipment (optional)
        - confidence: a number between 0 and 1 indicating your confidence in this extraction (required)
        
        Only extract equipment that has specific recommendations for installation or placement.
        If no security equipment recommendations are present, return an empty array.
        Your output should be valid JSON and nothing else.`,
      });
      
      // Send the message for analysis
      const analysisResult = await analyzeChat.sendMessage(`Extract security equipment recommendations from this text:\n\n${message}`);
      const analysisText = analysisResult.response.text();
      
      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (it might be wrapped in code blocks)
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/) || 
                          analysisText.match(/```\n([\s\S]*)\n```/) || 
                          [null, analysisText];
        
        const jsonString = jsonMatch[1].trim();
        const equipment = JSON.parse(jsonString);
        
        // Validate and clean up the extracted data
        if (Array.isArray(equipment)) {
          return equipment.map(item => ({
            type: item.type || "unknown",
            count: typeof item.count === 'number' ? item.count : 1,
            location: item.location || undefined,
            details: item.details || undefined,
            confidence: item.confidence || 0.5
          }));
        }
        return [];
      } catch (parseError) {
        console.error('Error parsing equipment JSON:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error extracting equipment recommendations:', error);
      return [];
    }
  }
  
  /**
   * Analyze user query to understand equipment requirements
   * 
   * @param userQuery The user's query about security equipment
   * @returns Context object with extracted information
   */
  async analyzeQuery(userQuery: string): Promise<ChatContext> {
    try {
      // Create a chat instance for analysis
      const analyzeChat = this.model.startChat({
        history: [],
        systemInstruction: `You are an AI that analyzes queries about security equipment and building security.
        Extract information about:
        1. Building type and characteristics
        2. Building size (floors, square footage)
        3. Special security requirements
        
        Output ONLY a JSON object with these properties:
        - buildingType: string (or null if not mentioned)
        - buildingSize: object with properties:
          - floors: number (or null if not mentioned)
          - squareFootage: number (or null if not mentioned)
        - specialRequirements: array of strings (or empty array if none mentioned)
        
        Your output should be valid JSON and nothing else.`,
      });
      
      // Send the query for analysis
      const analysisResult = await analyzeChat.sendMessage(`Analyze this query about security equipment: "${userQuery}"`);
      const analysisText = analysisResult.response.text();
      
      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (it might be wrapped in code blocks)
        const jsonMatch = analysisText.match(/```json\n([\s\S]*)\n```/) || 
                          analysisText.match(/```\n([\s\S]*)\n```/) || 
                          [null, analysisText];
        
        const jsonString = jsonMatch[1].trim();
        const analysis = JSON.parse(jsonString);
        
        // Create context object from analysis
        return {
          buildingType: analysis.buildingType || undefined,
          buildingSize: analysis.buildingSize && (analysis.buildingSize.floors || analysis.buildingSize.squareFootage) ? {
            floors: analysis.buildingSize.floors || 1,
            squareFootage: analysis.buildingSize.squareFootage || undefined
          } : undefined,
          specialRequirements: Array.isArray(analysis.specialRequirements) ? analysis.specialRequirements : [],
        };
      } catch (parseError) {
        console.error('Error parsing analysis JSON:', parseError);
        return {};
      }
    } catch (error) {
      console.error('Error analyzing query:', error);
      return {};
    }
  }
}

// Create singleton instance
const chatbotGeminiService = new ChatbotGeminiService();
export default chatbotGeminiService;