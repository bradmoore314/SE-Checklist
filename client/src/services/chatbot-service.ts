import speechService from '@/services/speech-service';

/**
 * Interface representing a chat message
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ChatbotService - Service for handling AI chatbot functionality
 * Integrates with the speech service for voice capabilities
 */
class ChatbotService {
  private isListening: boolean = false;
  
  /**
   * Initialize the speech recognition capability
   * @param onTranscript Callback function to receive transcription results
   */
  public initSpeechRecognition(onTranscript: (text: string) => void): void {
    if (!this.isRecognitionSupported()) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
    
    // Initialize listeners for speech recognition
    const onResult = (transcript: string) => {
      onTranscript(transcript);
      this.isListening = false;
    };
  }

  /**
   * Start listening for speech input
   * @param onTranscript Callback function to receive the transcript
   * @returns Boolean indicating if listening started successfully
   */
  public startListening(onTranscript: (text: string) => void): boolean {
    if (!this.isRecognitionSupported()) {
      return false;
    }
    
    const success = speechService.startListening(onTranscript);
    this.isListening = success;
    return success;
  }
  
  /**
   * Stop the speech recognition
   */
  public stopListening(): void {
    if (this.isListening) {
      speechService.stopListening();
      this.isListening = false;
    }
  }
  
  /**
   * Check if browser supports speech recognition
   */
  public isRecognitionSupported(): boolean {
    return speechService.isRecognitionSupported();
  }
  
  /**
   * Check if browser supports speech synthesis
   */
  public isSynthesisSupported(): boolean {
    return speechService.isSynthesisSupported();
  }
  
  /**
   * Speak the given text using the speech synthesis API
   * @param text Text to speak
   * @param voiceIndex Optional index of the voice to use
   * @returns Boolean indicating if speaking started successfully
   */
  public speakResponse(text: string, voiceIndex: number = 0): boolean {
    if (!this.isSynthesisSupported()) {
      return false;
    }
    
    return speechService.speak(text, voiceIndex);
  }
  
  /**
   * Stop any ongoing speech
   */
  public stopSpeaking(): void {
    speechService.stopSpeaking();
  }
  
  /**
   * Process a user message and get an AI response
   * @param userMessage The user's message
   * @param conversationHistory Previous messages for context
   * @returns Promise resolving to the AI's response
   */
  public async processMessage(
    userMessage: string, 
    conversationHistory: ChatMessage[]
  ): Promise<ChatMessage> {
    try {
      // For now, simulate a response
      // In a real implementation, this would call the backend API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            role: 'assistant',
            content: this.generateDemoResponse(userMessage, conversationHistory)
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      };
    }
  }
  
  /**
   * Generate a simple demo response based on the user's message
   * This is just a placeholder until we integrate with a real AI backend
   */
  private generateDemoResponse(message: string, history: ChatMessage[]): string {
    const lowerMessage = message.toLowerCase();
    
    // Equipment configuration patterns
    if (lowerMessage.includes('configure') || lowerMessage.includes('setup') || lowerMessage.includes('install')) {
      if (lowerMessage.includes('camera')) {
        return 'I can help you configure a security camera. Would you like to set up an indoor or outdoor camera?';
      } else if (lowerMessage.includes('door') || lowerMessage.includes('access')) {
        return 'Let\'s configure an access control point. Would you prefer a keypad, card reader, or biometric system?';
      } else if (lowerMessage.includes('elevator')) {
        return 'For elevator security, we should consider which floors need restricted access. How many floors need to be secured?';
      } else if (lowerMessage.includes('intercom')) {
        return 'Intercom systems are great for entrance communication. Do you need video capabilities with your intercom?';
      } else {
        return 'I can help you configure security equipment. What specific type of device are you looking to set up?';
      }
    }
    
    // Location-based patterns
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('place')) {
      return 'The best placement for security equipment depends on the specific requirements. Would you like me to analyze your floorplan to suggest optimal locations?';
    }
    
    // Integration patterns
    if (lowerMessage.includes('integrate') || lowerMessage.includes('connect') || lowerMessage.includes('work with')) {
      return 'Our security systems can integrate with various platforms. Which specific systems do you need to connect with?';
    }
    
    // Help/assistance patterns
    if (lowerMessage.includes('help') || lowerMessage.includes('how do i') || lowerMessage.includes('can you')) {
      return 'I\'m here to help with your security equipment configuration. I can assist with cameras, access control, elevators, and intercoms. What would you like to know more about?';
    }
    
    // Default responses
    const defaultResponses = [
      'I can help you configure security equipment for your project. What type of security system are you interested in?',
      'Would you like me to help you select the appropriate security equipment for your needs?',
      'I can assist with camera placement, access control configuration, and more. What are you working on today?',
      'Tell me more about your security requirements, and I can recommend the best equipment configuration.'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

// Create a singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;