/**
 * Speech service for handling speech-to-text and text-to-speech functionality
 * This service provides a wrapper around the Web Speech API
 */

class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  
  constructor() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }
  
  private initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't have types for webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
            
          if (event.results[0].isFinal && this.onResultCallback) {
            this.onResultCallback(transcript);
          }
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          this.isListening = false;
        };
        
        this.recognition.onend = () => {
          this.isListening = false;
        };
      }
    }
  }
  
  private initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }
  
  public isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }
  
  public isSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }
  
  public startListening(onResult: (transcript: string) => void): boolean {
    if (!this.recognition) return false;
    
    this.onResultCallback = onResult;
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition', error);
      this.isListening = false;
      return false;
    }
  }
  
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition', error);
      }
      this.isListening = false;
    }
  }
  
  public speak(text: string, voiceIndex: number = 0): boolean {
    if (!this.synthesis) return false;
    
    // Stop any current speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synthesis.getVoices();
    
    if (voices.length > 0) {
      // Try to find a good voice, defaulting to the first one
      utterance.voice = voices[voiceIndex] || voices[0];
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    this.synthesis.speak(utterance);
    return true;
  }
  
  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Create a singleton instance
const speechService = new SpeechService();
export default speechService;