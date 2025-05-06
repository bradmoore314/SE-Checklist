/**
 * Speech Service - Provides browser-based speech recognition and synthesis
 * Uses the Web Speech API which is supported in most modern browsers
 */
class SpeechService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  
  constructor() {
    // Initialize SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    } else {
      this.recognition = null;
    }
    
    // Initialize Speech Synthesis
    this.synthesis = window.speechSynthesis;
  }
  
  /**
   * Check if the browser supports speech recognition
   */
  public isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }
  
  /**
   * Check if the browser supports speech synthesis
   */
  public isSynthesisSupported(): boolean {
    return !!this.synthesis;
  }
  
  /**
   * Start speech recognition
   * @param onTranscript Callback function to receive transcription results
   * @returns Boolean indicating if started successfully
   */
  public startListening(onTranscript: (text: string) => void): boolean {
    if (!this.isRecognitionSupported()) {
      console.warn('Speech recognition is not supported by this browser');
      return false;
    }
    
    if (this.isListening) {
      this.stopListening();
    }
    
    try {
      // Set up speech recognition handlers
      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        console.log('Speech recognition result:', result);
        onTranscript(result);
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
      
      // Start listening
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.isListening = false;
      return false;
    }
  }
  
  /**
   * Stop speech recognition
   */
  public stopListening(): void {
    if (this.isRecognitionSupported() && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      this.isListening = false;
    }
  }
  
  /**
   * Speak text using speech synthesis
   * @param text Text to speak
   * @param voiceIndex Optional index of the voice to use
   * @returns Boolean indicating if started successfully
   */
  public speak(text: string, voiceIndex: number = 0): boolean {
    if (!this.isSynthesisSupported()) {
      console.warn('Speech synthesis is not supported by this browser');
      return false;
    }
    
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and select one
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        // Use a valid voice index
        const validIndex = Math.min(voiceIndex, voices.length - 1);
        utterance.voice = voices[validIndex];
      }
      
      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.isSpeaking = false;
      };
      
      // Start speaking
      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      return false;
    }
  }
  
  /**
   * Stop speech synthesis
   */
  public stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
  
  /**
   * Get available speech synthesis voices
   * @returns Array of available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    if (this.isSynthesisSupported()) {
      return this.synthesis.getVoices();
    }
    return [];
  }
}

// Create a singleton instance
const speechService = new SpeechService();
export default speechService;