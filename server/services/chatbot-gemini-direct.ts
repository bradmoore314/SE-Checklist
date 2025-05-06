import fetch from 'node-fetch';

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
 * ChatbotGeminiService - Provides AI functionality using Google's Gemini model via direct API calls
 * 
 * IMPORTANT NOTE: Always use the specific Gemini API endpoint:
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY
 */
export class ChatbotGeminiService {
  private apiKey: string | undefined;
  private apiEndpoint: string;
  private systemPrompt: string;
  
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment. Gemini AI services will not function correctly.');
    }

    // Set the specific API endpoint as requested by the user
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    
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
   * Process a chat message by making a direct API call to Gemini
   * 
   * @param messages Chat history
   * @param context Optional context with information about the site
   * @returns Response from the AI
   */
  async processMessage(messages: ChatMessage[], context?: ChatContext): Promise<string> {
    try {
      // If we're in local fallback mode due to API issues
      if (!this.apiKey || messages.length === 0) {
        return this.generateLocalResponse(messages, context);
      }
      
      // Format messages for the Gemini API
      const formattedMessages = this.formatMessagesForGemini(messages, context);
      
      // Call the Gemini API directly
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      // Handle API response
      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} ${response.statusText}`);
        return this.generateLocalResponse(messages, context);
      }
      
      const data = await response.json();
      
      // Extract text from the response
      if (data && 
          data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected response format from Gemini API:', JSON.stringify(data));
        return this.generateLocalResponse(messages, context);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.generateLocalResponse(messages, context);
    }
  }
  
  /**
   * Format messages for the Gemini API
   */
  private formatMessagesForGemini(messages: ChatMessage[], context?: ChatContext): any[] {
    const formattedMessages = [];
    
    // Add system message with context if available
    formattedMessages.push({
      role: "user",
      parts: [{ text: this.systemPrompt + (context ? `\n\nAdditional context: ${JSON.stringify(context)}` : '') }]
    });
    
    formattedMessages.push({
      role: "model",
      parts: [{ text: "I'll help you with security equipment recommendations for your site assessment." }]
    });
    
    // Add conversation history
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      formattedMessages.push({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }]
      });
    }
    
    return formattedMessages;
  }
  
  /**
   * Generate a local response when API is unavailable
   */
  private generateLocalResponse(messages: ChatMessage[], context?: ChatContext): string {
    // Fall back to the local logic if API is unavailable
    try {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role !== 'user') {
        return "I can only respond to user messages.";
      }
      
      const userMessage = lastMessage.content.toLowerCase();
      
      // Extract key details from the message to help with response generation
      const equipment = this.extractEquipmentMentions(userMessage);
      const buildingInfo = this.extractBuildingInfo(userMessage);
      
      // Smart response templates based on the message content
      if (userMessage.includes('recommend') || userMessage.includes('suggest') || userMessage.includes('what') || userMessage.includes('how many')) {
        return this.generateRecommendationResponse(userMessage, equipment, buildingInfo);
      } else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey') || userMessage.length < 10) {
        return "Hello! I'm here to help with your security equipment planning. Feel free to ask about camera placement, access control systems, or any other security equipment needs you have.";
      } else if (userMessage.includes('thank') || userMessage.includes('thanks')) {
        return "You're welcome! If you have any other questions about security equipment or need further assistance with your site assessment, please let me know.";
      } else if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
        return "Goodbye! If you need assistance with security equipment planning in the future, don't hesitate to reach out.";
      } else {
        // Generate a thoughtful response for other types of messages
        return this.generateDefaultResponse(userMessage, equipment, buildingInfo);
      }
    } catch (error) {
      console.error('Error generating local response:', error);
      return "I'm here to help with your security equipment needs. Could you please provide more specific details about what you're looking for?";
    }
  }
  
  /**
   * Extract mentions of equipment from user message
   */
  private extractEquipmentMentions(message: string): { type: string, count?: number }[] {
    const equipment: { type: string, count?: number }[] = [];
    
    // Check for camera mentions
    if (message.includes('camera')) {
      const cameraMatch = message.match(/(\d+)\s*cameras?/i);
      equipment.push({
        type: 'camera',
        count: cameraMatch ? parseInt(cameraMatch[1]) : undefined
      });
    }
    
    // Check for access point mentions
    if (message.includes('access point') || message.includes('card reader') || message.includes('door')) {
      const apMatch = message.match(/(\d+)\s*(access points?|card readers?|doors?)/i);
      equipment.push({
        type: 'access_point',
        count: apMatch ? parseInt(apMatch[1]) : undefined
      });
    }
    
    // Check for intercom mentions
    if (message.includes('intercom')) {
      const intercomMatch = message.match(/(\d+)\s*intercoms?/i);
      equipment.push({
        type: 'intercom',
        count: intercomMatch ? parseInt(intercomMatch[1]) : undefined
      });
    }
    
    // Check for elevator mentions
    if (message.includes('elevator')) {
      const elevatorMatch = message.match(/(\d+)\s*elevators?/i);
      equipment.push({
        type: 'elevator',
        count: elevatorMatch ? parseInt(elevatorMatch[1]) : undefined
      });
    }
    
    return equipment;
  }
  
  /**
   * Extract building information from user message
   */
  private extractBuildingInfo(message: string): { buildingType?: string, floors?: number } {
    const buildingInfo: { buildingType?: string, floors?: number } = {};
    
    // Check for building type mentions
    const buildingTypePatterns = [
      /(?:in|for|at)\s+(?:a|the)\s+([\w\s-]+building|[\w\s-]+facility|[\w\s-]+complex|[\w\s-]+office|[\w\s-]+warehouse|[\w\s-]+mall|[\w\s-]+store|[\w\s-]+school|[\w\s-]+hospital|[\w\s-]+hotel)/i,
      /(?:the|a|my|our)\s+([\w\s-]+building|[\w\s-]+facility|[\w\s-]+complex|[\w\s-]+office|[\w\s-]+warehouse|[\w\s-]+mall|[\w\s-]+store|[\w\s-]+school|[\w\s-]+hospital|[\w\s-]+hotel)/i,
    ];
    
    for (const pattern of buildingTypePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        buildingInfo.buildingType = match[1].trim();
        break;
      }
    }
    
    // Check for location mentions
    if (message.includes('frisco') || message.includes('texas')) {
      if (!buildingInfo.buildingType) {
        buildingInfo.buildingType = 'building in Frisco, Texas';
      }
    }
    
    // Check for floor mentions
    const floorMatch = message.match(/(\d+)\s*floors?/i);
    if (floorMatch && floorMatch[1]) {
      buildingInfo.floors = parseInt(floorMatch[1]);
    }
    
    return buildingInfo;
  }
  
  /**
   * Generate a recommendation response based on the user message
   */
  private generateRecommendationResponse(message: string, equipment: { type: string, count?: number }[], buildingInfo: { buildingType?: string, floors?: number }): string {
    const buildingType = buildingInfo.buildingType || 'your building';
    const floors = buildingInfo.floors || 1;
    
    if (message.includes('camera') || equipment.some(e => e.type === 'camera')) {
      return `For ${buildingType}, I recommend installing security cameras at key entry points, high-traffic areas, and valuables storage areas. For a ${floors}-floor building, you'll typically need 3-4 cameras per floor, positioned to cover main entrances, hallways, and any sensitive areas. Consider using a mix of fixed cameras for specific areas and PTZ (pan-tilt-zoom) cameras for larger spaces that need monitoring from multiple angles.`;
    }
    
    if (message.includes('access point') || message.includes('card reader') || message.includes('door') || equipment.some(e => e.type === 'access_point')) {
      return `For access control in ${buildingType}, I recommend placing card readers at all exterior doors and sensitive interior areas. For a ${floors}-floor building, you'll need readers at the main entrance, emergency exits, stairwell doors, and any restricted areas. Consider using multi-factor authentication (card + PIN or biometric) for areas requiring higher security. You should also integrate your access control system with your alarm system for comprehensive security.`;
    }
    
    if (message.includes('intercom') || equipment.some(e => e.type === 'intercom')) {
      return `For ${buildingType}, intercom systems are essential at main entry points. I recommend installing a video intercom at the main entrance and any delivery or service entrances. This allows staff to visually verify visitors before granting access. Modern systems can also integrate with your access control system and can be accessed via mobile devices, allowing remote communication with visitors.`;
    }
    
    if (message.includes('elevator') || equipment.some(e => e.type === 'elevator')) {
      return `For elevator security in ${buildingType}, I recommend integrating card readers to control floor access. For a ${floors}-floor building, you should restrict access to sensitive floors through elevator authentication. Consider also installing cameras in each elevator cab for monitoring. Modern elevator security solutions can be programmed to allow different access levels based on time of day or user credentials.`;
    }
    
    if (message.includes('retail')) {
      return `For a retail store with ${floors} floors, I recommend a comprehensive security system including:\n\n1. 6-8 security cameras covering entrances, sales floors, checkout areas, and stockrooms\n2. Access control systems for employee-only areas and after-hours entry\n3. Electronic article surveillance (EAS) gates at exits to prevent theft\n4. Intercom system at service entrances for deliveries\n5. Integration with point-of-sale systems for transaction monitoring\n\nThis layered approach provides robust security while maintaining a welcoming environment for customers.`;
    }
    
    if (message.includes('office')) {
      return `For an office building with ${floors} floors, I recommend:\n\n1. Access control at all exterior doors and sensitive interior areas (server rooms, executive offices)\n2. 3-4 cameras per floor focusing on entry points, reception areas, and hallways\n3. Visitor management system at the main entrance\n4. Intercom systems for after-hours access\n5. Consider floor-specific access restrictions via elevator control\n\nThis configuration balances security needs with convenience for daily operations.`;
    }
    
    // Default recommendation if no specific equipment was mentioned
    return `For ${buildingType} with ${floors} ${floors > 1 ? 'floors' : 'floor'}, I recommend a comprehensive security approach including:\n\n1. Perimeter security with cameras at all entry points\n2. Access control systems for main entrances and restricted areas\n3. Intrusion detection with door/window sensors and motion detectors\n4. Intercom system for visitor verification\n5. Emergency notification systems\n\nThe exact quantities should be determined based on your floor plan and specific security requirements. Would you like more detailed recommendations for any specific type of equipment?`;
  }
  
  /**
   * Generate a default response for general questions
   */
  private generateDefaultResponse(message: string, equipment: { type: string, count?: number }[], buildingInfo: { buildingType?: string, floors?: number }): string {
    if (message.includes('cost') || message.includes('price') || message.includes('expensive')) {
      return "Security system costs vary widely based on equipment quality, installation complexity, and monitoring needs. For an accurate quote, I'd recommend consulting with security vendors who can assess your specific requirements. Generally, a basic system starts around $1,000-3,000, while comprehensive enterprise systems can range from $10,000 to $50,000+ depending on the size and complexity of your facility.";
    }
    
    if (message.includes('install') || message.includes('setup') || message.includes('configuration')) {
      return "Installation of security equipment should be handled by certified professionals to ensure proper functionality and compliance with regulations. Most systems require careful placement of devices, proper wiring, configuration of software, and testing. Professional installation also typically includes training for your staff on how to use the system effectively.";
    }
    
    if (message.includes('best') || message.includes('better')) {
      return "The best security equipment depends on your specific needs, but generally look for systems with high reliability, good warranty coverage, technical support, and the ability to integrate with other security components. Leading manufacturers include Axis, Bosch, Honeywell, and HID for various security equipment categories. Consider equipment that allows for future expansion and updates.";
    }
    
    if (message.includes('wireless') || message.includes('wired')) {
      return "Both wired and wireless security systems have advantages. Wired systems typically offer more reliability and aren't subject to interference, but installation is more invasive. Wireless systems are easier to install and relocate, but may require battery maintenance and can be susceptible to signal interference. Many modern installations use a hybrid approach, selecting the best technology for each component.";
    }
    
    if (message.includes('monitor') || message.includes('monitoring')) {
      return "Security monitoring can be handled in-house with trained staff or outsourced to professional monitoring services. Professional monitoring typically costs $30-50 per month and provides 24/7 oversight with emergency dispatch services. Self-monitoring through mobile apps is more affordable but places responsibility on you or your team to respond to alerts.";
    }
    
    // Default response for other types of questions
    return "I understand you're interested in security equipment for your facility. To provide the most helpful recommendations, could you share more details about your specific security concerns, the type of facility, and any particular areas you want to protect? This will help me tailor my suggestions to your needs.";
  }
  
  /**
   * Extract equipment recommendations from AI message
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
      
      // Check for Frisco, Texas specifically
      if (userQuery.toLowerCase().includes('frisco') || userQuery.toLowerCase().includes('texas')) {
        if (!context.buildingType) {
          context.buildingType = 'building in Frisco, Texas';
        } else if (!context.specialRequirements) {
          context.specialRequirements = ['Located in Frisco, Texas'];
        } else {
          context.specialRequirements.push('Located in Frisco, Texas');
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