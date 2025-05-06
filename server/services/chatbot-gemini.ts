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
    // Simple regex-based extraction to avoid API limitations
    try {
      // We'll use a simpler approach that doesn't require a second API call
      // This helps avoid API rate limits and potential errors
      const equipment: ChatContext['securityEquipment'] = [];
      
      // Look for mentions of cameras
      const cameraMatches = message.match(/(\d+)\s+(?:camera|cameras)/gi);
      if (cameraMatches && cameraMatches.length > 0) {
        const match = cameraMatches[0].match(/(\d+)/);
        const count = match ? parseInt(match[1]) : 1;
        equipment.push({
          type: 'camera',
          count: count,
          confidence: 0.8
        });
      } else if (message.toLowerCase().includes('camera')) {
        equipment.push({
          type: 'camera',
          count: 1,
          confidence: 0.6
        });
      }
      
      // Look for mentions of access points
      const accessPointMatches = message.match(/(\d+)\s+(?:access point|access points|card reader|card readers)/gi);
      if (accessPointMatches && accessPointMatches.length > 0) {
        const match = accessPointMatches[0].match(/(\d+)/);
        const count = match ? parseInt(match[1]) : 1;
        equipment.push({
          type: 'access_point',
          count: count,
          confidence: 0.8
        });
      } else if (message.toLowerCase().includes('access point') || message.toLowerCase().includes('card reader')) {
        equipment.push({
          type: 'access_point',
          count: 1,
          confidence: 0.6
        });
      }
      
      // Look for mentions of intercoms
      const intercomMatches = message.match(/(\d+)\s+(?:intercom|intercoms)/gi);
      if (intercomMatches && intercomMatches.length > 0) {
        const match = intercomMatches[0].match(/(\d+)/);
        const count = match ? parseInt(match[1]) : 1;
        equipment.push({
          type: 'intercom',
          count: count,
          confidence: 0.8
        });
      } else if (message.toLowerCase().includes('intercom')) {
        equipment.push({
          type: 'intercom',
          count: 1,
          confidence: 0.6
        });
      }
      
      // Look for mentions of elevators
      const elevatorMatches = message.match(/(\d+)\s+(?:elevator|elevators)/gi);
      if (elevatorMatches && elevatorMatches.length > 0) {
        const match = elevatorMatches[0].match(/(\d+)/);
        const count = match ? parseInt(match[1]) : 1;
        equipment.push({
          type: 'elevator',
          count: count,
          confidence: 0.8
        });
      } else if (message.toLowerCase().includes('elevator')) {
        equipment.push({
          type: 'elevator',
          count: 1,
          confidence: 0.6
        });
      }
      
      // Also look for mentions of specific locations
      for (const item of equipment) {
        // Look for common location patterns
        const locationPatterns = [
          new RegExp(`${item.type}\\s+(?:at|in|on|for)\\s+the\\s+([\\w\\s]+)`, 'i'),
          new RegExp(`place\\s+(?:a|the|\\d+)\\s+${item.type}\\s+(?:at|in|on)\\s+the\\s+([\\w\\s]+)`, 'i'),
          new RegExp(`install\\s+(?:a|the|\\d+)\\s+${item.type}\\s+(?:at|in|on)\\s+the\\s+([\\w\\s]+)`, 'i')
        ];
        
        for (const pattern of locationPatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            item.location = match[1].trim();
            break;
          }
        }
      }
      
      return equipment;
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
      // Use regex patterns to extract key information from the query
      // This approach avoids making a second API call
      const context: ChatContext = {};
      
      // Extract building type
      const buildingTypePatterns = [
        /(?:in|for|at)\s+(?:a|the)\s+([\w\s-]+building|[\w\s-]+facility|[\w\s-]+complex|[\w\s-]+office|[\w\s-]+warehouse|[\w\s-]+mall|[\w\s-]+store|[\w\s-]+school|[\w\s-]+hospital|[\w\s-]+hotel)/i,
        /(?:the|a|my|our)\s+([\w\s-]+building|[\w\s-]+facility|[\w\s-]+complex|[\w\s-]+office|[\w\s-]+warehouse|[\w\s-]+mall|[\w\s-]+store|[\w\s-]+school|[\w\s-]+hospital|[\w\s-]+hotel)/i,
      ];
      
      for (const pattern of buildingTypePatterns) {
        const match = userQuery.match(pattern);
        if (match && match[1]) {
          context.buildingType = match[1].trim();
          break;
        }
      }
      
      // Extract location information
      const locationPatterns = [
        /(?:in|at|near|around)\s+([\w\s,-]+),\s*(\w{2})/i,  // "in Austin, TX"
        /(?:in|at|near|around)\s+([\w\s,-]+)/i,  // "in Downtown Seattle"
      ];
      
      for (const pattern of locationPatterns) {
        const match = userQuery.match(pattern);
        if (match && match[1]) {
          if (!context.buildingType) {
            context.buildingType = match[1].trim();
          } else {
            // If we already have a building type, consider this as special requirement
            if (!context.specialRequirements) {
              context.specialRequirements = [];
            }
            context.specialRequirements.push(`Located in ${match[1].trim()}`);
          }
          break;
        }
      }
      
      // Extract floor information
      const floorPattern = /(\d+)[\s-]*(?:floor|story|floors|stories)/i;
      const floorMatch = userQuery.match(floorPattern);
      
      if (floorMatch && floorMatch[1]) {
        const floors = parseInt(floorMatch[1]);
        if (!context.buildingSize) {
          context.buildingSize = { floors };
        } else {
          context.buildingSize.floors = floors;
        }
      }
      
      // Extract square footage
      const sqftPatterns = [
        /(\d+)[,\s]*(?:sq\.?\s*ft\.?|square\s*feet|square\s*foot)/i,
        /(\d+)[,\s]*(?:sqft|sf)/i,
      ];
      
      for (const pattern of sqftPatterns) {
        const match = userQuery.match(pattern);
        if (match && match[1]) {
          const squareFootage = parseInt(match[1].replace(/,/g, ''));
          if (!context.buildingSize) {
            context.buildingSize = { floors: 1, squareFootage };
          } else {
            context.buildingSize.squareFootage = squareFootage;
          }
          break;
        }
      }
      
      // Extract special requirements
      const specialReqPatterns = [
        /need(?:s|ed)?\s+to\s+be\s+([\w\s]+)/i,
        /require(?:s|d)?\s+([\w\s]+)/i,
        /(?:high|enhanced)\s+security\s+(?:area|zone|for)\s+([\w\s]+)/i,
        /compliance\s+with\s+([\w\s]+)/i,
      ];
      
      if (!context.specialRequirements) {
        context.specialRequirements = [];
      }
      
      for (const pattern of specialReqPatterns) {
        const match = userQuery.match(pattern);
        if (match && match[1]) {
          context.specialRequirements.push(match[1].trim());
        }
      }
      
      return context;
    } catch (error) {
      console.error('Error analyzing query:', error);
      return {};
    }
  }
}

// Create singleton instance
const chatbotGeminiService = new ChatbotGeminiService();
export default chatbotGeminiService;