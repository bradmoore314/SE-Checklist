/**
 * Speech Service - Provides browser-based speech recognition and synthesis
 * Uses the Web Speech API which is supported in most modern browsers
 * Now with continuous mode similar to Grok's Voice Mode
 */
class SpeechService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private continuousMode: boolean = false;
  private onTranscriptCallback: ((text: string) => void) | null = null;
  private autoRestartTimeout: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize speech recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true; // Enable interim results for more responsive feedback
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
   * Start speech recognition in one-time mode
   * @param onTranscript Callback function to receive transcription results
   * @returns Boolean indicating if started successfully
   */
  public startListening(onTranscript: (text: string) => void): boolean {
    if (!this.isRecognitionSupported() || this.isListening) {
      return false;
    }
    
    this.onTranscriptCallback = onTranscript;
    this.continuousMode = false;
    
    return this.initializeRecognition();
  }
  
  /**
   * Start speech recognition in continuous mode (similar to Grok's Voice Mode)
   * @param onTranscript Callback function to receive transcription results
   * @returns Boolean indicating if started successfully
   */
  public startContinuousListening(onTranscript: (text: string) => void): boolean {
    if (!this.isRecognitionSupported() || this.isListening) {
      return false;
    }
    
    this.onTranscriptCallback = onTranscript;
    this.continuousMode = true;
    
    return this.initializeRecognition();
  }
  
  /**
   * Initialize the speech recognition with appropriate event handlers
   * @returns Boolean indicating if started successfully
   */
  private initializeRecognition(): boolean {
    if (!this.recognition) return false;
    
    let finalTranscript = '';
    
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      // Build interim and final transcripts
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Only send final results if we have some content
      if (finalTranscript && this.onTranscriptCallback) {
        this.onTranscriptCallback(finalTranscript);
        finalTranscript = '';
        
        // If not in continuous mode, stop after getting a result
        if (!this.continuousMode) {
          this.stopListening();
        }
      }
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      
      // If it's a non-fatal error in continuous mode, attempt to restart
      if (this.continuousMode && event.error !== 'aborted' && event.error !== 'not-allowed') {
        this.restartRecognitionAfterDelay();
      } else {
        this.isListening = false;
      }
    };
    
    this.recognition.onend = () => {
      // In continuous mode, automatically restart recognition
      if (this.continuousMode && this.isListening) {
        this.restartRecognitionAfterDelay();
      } else {
        this.isListening = false;
      }
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
   * Restart recognition after a short delay (for continuous mode)
   */
  private restartRecognitionAfterDelay(): void {
    if (this.autoRestartTimeout) {
      clearTimeout(this.autoRestartTimeout);
    }
    
    this.autoRestartTimeout = setTimeout(() => {
      if (this.isListening && this.continuousMode) {
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Failed to restart speech recognition', error);
          this.isListening = false;
        }
      }
    }, 300); // Short delay to prevent rapid restarts
  }
  
  /**
   * Stop speech recognition
   */
  public stopListening(): void {
    if (this.autoRestartTimeout) {
      clearTimeout(this.autoRestartTimeout);
      this.autoRestartTimeout = null;
    }
    
    if (this.isRecognitionSupported() && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition', error);
      }
      this.isListening = false;
      this.continuousMode = false;
    }
  }
  
  /**
   * Check if continuous mode is active
   */
  public isContinuousMode(): boolean {
    return this.continuousMode;
  }
  
  /**
   * Speak text using speech synthesis
   * @param text Text to speak
   * @param voiceIndex Optional index of the voice to use
   * @param onComplete Optional callback when speech is complete
   * @returns Boolean indicating if started successfully
   */
  public speak(text: string, voiceIndex: number = 0, onComplete?: () => void): boolean {
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
        
        // Temporarily pause speech recognition while speaking
        // to prevent the AI from hearing itself
        if (this.isListening) {
          try {
            this.recognition.stop();
          } catch (error) {
            // Ignore errors when stopping recognition
          }
        }
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        
        // Restart speech recognition if it was active in continuous mode
        if (this.continuousMode && this.isListening) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart speech recognition after speaking', error);
          }
        }
        
        if (onComplete) {
          onComplete();
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error', event);
        this.isSpeaking = false;
        
        // Restart speech recognition if it was active in continuous mode
        if (this.continuousMode && this.isListening) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart speech recognition after speaking error', error);
          }
        }
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