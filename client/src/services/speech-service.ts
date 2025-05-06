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
    // Initialize speech recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
      
      // Initialize speech synthesis if available
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }
  
  /**
   * Check if the browser supports speech recognition
   */
  public isRecognitionSupported(): boolean {
    return !!this.recognition;
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
    if (!this.isRecognitionSupported() || this.isListening) {
      return false;
    }
    
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      this.isListening = false;
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
    };
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition', error);
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
        console.error('Failed to stop speech recognition', error);
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
    if (!this.isSynthesisSupported() || this.isSpeaking) {
      return false;
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if available
      const voices = this.getVoices();
      if (voices.length > 0) {
        // Use a more natural sounding voice if available
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Daniel') || 
          voice.name.includes('Samantha')
        );
        
        utterance.voice = preferredVoices.length > 0 
          ? preferredVoices[0] 
          : (voiceIndex < voices.length ? voices[voiceIndex] : voices[0]);
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error', event);
        this.isSpeaking = false;
      };
      
      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Failed to start speech synthesis', error);
      return false;
    }
  }
  
  /**
   * Stop speech synthesis
   */
  public stopSpeaking(): void {
    if (this.isSynthesisSupported() && this.isSpeaking) {
      try {
        this.synthesis.cancel();
      } catch (error) {
        console.error('Failed to stop speech synthesis', error);
      }
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

// Declare the global interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export { SpeechService };