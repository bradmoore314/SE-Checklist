import { speechService } from '@/services/speech-service';

// Interface for handling message data
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Interface for chat session state
interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  created: Date;
  updated: Date;
}

// Interface for equipment configuration recommendation
interface EquipmentRecommendation {
  type: 'access_point' | 'camera' | 'elevator' | 'intercom';
  location: string;
  properties: Record<string, any>;
  confidence: number;
  explanation: string;
}

class ChatbotService {
  private apiEndpoint = '/api/gemini/chat';
  private activeSession: ChatSession | null = null;

  // Initialization with system prompt
  constructor() {
    this.resetSession();
  }

  /**
   * Reset the current chat session
   */
  resetSession() {
    this.activeSession = {
      id: this.generateId(),
      messages: [
        {
          id: this.generateId(),
          role: 'system',
          content: `You are an AI-powered Security Equipment Configuration Assistant built into the Site Walk Checklist application. 
          Your role is to help security professionals configure access points, cameras, elevators, and intercoms through natural 
          conversation. Always introduce yourself at the start of a new session. Ask questions one at a time to gather all required 
          configuration information based on the device type. Be friendly, professional, and focused on helping users configure 
          their security equipment efficiently. After collecting all necessary information, provide a summary of the recommended 
          configuration for the user to confirm before submitting.`,
          timestamp: new Date()
        }
      ],
      context: {},
      created: new Date(),
      updated: new Date()
    };
    
    return this.activeSession;
  }

  /**
   * Send a user message to the chatbot and get a response
   * @param message User message text
   * @param voiceEnabled Whether to enable voice response
   * @returns Promise resolving to assistant response
   */
  async sendMessage(message: string, voiceEnabled = false): Promise<ChatMessage> {
    if (!this.activeSession) {
      this.resetSession();
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    this.activeSession!.messages.push(userMessage);
    this.activeSession!.updated = new Date();
    
    try {
      // Clone the messages without the system prompt for the UI
      const uiMessages = [...this.activeSession!.messages];
      
      // Prepare API request with full context including system prompt
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: this.activeSession!.messages,
          context: this.activeSession!.context
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create assistant message from response
      const assistantMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };
      
      // Add to session
      this.activeSession!.messages.push(assistantMessage);
      this.activeSession!.updated = new Date();
      
      // If context was provided in the response, update session context
      if (data.context) {
        this.activeSession!.context = {
          ...this.activeSession!.context,
          ...data.context
        };
      }
      
      // If voice is enabled, speak the response
      if (voiceEnabled && speechService.isSynthesisSupported()) {
        speechService.speak(assistantMessage.content);
      }
      
      return assistantMessage;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Create an error message
      const errorMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      
      // Add to session
      this.activeSession!.messages.push(errorMessage);
      
      return errorMessage;
    }
  }

  /**
   * Get the current chat session
   * @returns Current chat session or null if none exists
   */
  getSession(): ChatSession | null {
    return this.activeSession;
  }

  /**
   * Get messages for UI display (excluding system prompts)
   * @returns Array of chat messages for display
   */
  getMessages(): ChatMessage[] {
    if (!this.activeSession) {
      return [];
    }
    
    // Filter out system messages for UI display
    return this.activeSession.messages.filter(msg => msg.role !== 'system');
  }

  /**
   * Get equipment recommendations based on the conversation
   * @returns Promise resolving to equipment recommendations
   */
  async getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
    if (!this.activeSession) {
      return [];
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: this.activeSession.messages,
          context: this.activeSession.context
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error getting equipment recommendations:', error);
      return [];
    }
  }

  /**
   * Start voice recognition for user input
   * @param onInterimResult Callback for interim results
   * @param onFinalResult Callback for final result
   * @param onError Callback for errors
   */
  startVoiceInput(
    onInterimResult: (text: string) => void,
    onFinalResult: (text: string) => void,
    onError: (error: any) => void
  ): void {
    if (!speechService.isRecognitionSupported()) {
      onError(new Error('Speech recognition is not supported in this browser'));
      return;
    }
    
    speechService.startListening(
      { language: 'en-US', continuous: true, interimResults: true },
      (result) => {
        if (result.isFinal) {
          onFinalResult(result.text);
        } else {
          onInterimResult(result.text);
        }
      },
      onError
    );
  }

  /**
   * Stop voice recognition
   */
  stopVoiceInput(): void {
    speechService.stopListening();
  }

  /**
   * Generate a unique ID for messages and sessions
   * @returns Unique ID string
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export a singleton instance
export const chatbotService = new ChatbotService();