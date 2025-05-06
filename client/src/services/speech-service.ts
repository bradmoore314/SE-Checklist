// SpeechRecognitionService - speech to text functionality in the browser
export class SpeechRecognitionService {
  recognition: SpeechRecognition | null = null;
  isListening: boolean = false;
  onResultCallback: ((text: string) => void) | null = null;
  onEndCallback: (() => void) | null = null;
  onErrorCallback: ((error: any) => void) | null = null;
  isSupported: boolean = false;
  
  // Methods for compatibility with use-chatbot.tsx
  isRecognitionSupported(): boolean {
    return this.isSupported;
  }
  
  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }
  
  startListening(callback: (text: string) => void): boolean {
    this.onResult(callback);
    this.start();
    return this.isListening;
  }
  
  startContinuousListening(callback: (text: string) => void): boolean {
    this.onResult(callback);
    if (this.recognition) {
      this.recognition.continuous = true;
    }
    this.start();
    return this.isListening;
  }
  
  stopListening(): void {
    this.stop();
  }
  
  speak(text: string): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
  
  constructor() {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.setupEventListeners();
      } else {
        console.warn('Speech recognition is not supported in this browser.');
      }
    }
  }
  
  private setupEventListeners() {
    if (!this.recognition) return;
    
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
    
    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }
  
  // Start listening for speech
  start() {
    if (!this.isSupported || !this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition is not supported in this browser.');
      }
      return;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }
  
  // Stop listening for speech
  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }
  
  // Set callback for when speech is recognized
  onResult(callback: (text: string) => void) {
    this.onResultCallback = callback;
  }
  
  // Set callback for when speech recognition ends
  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }
  
  // Set callback for when an error occurs
  onError(callback: (error: any) => void) {
    this.onErrorCallback = callback;
  }
}

// Add typings for the Web Speech API
interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

// Synthesis service - text to speech functionality
export class SpeechSynthesisService {
  isSupported: boolean = false;
  synthesis: SpeechSynthesis | null = null;
  voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.isSupported = true;
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
      }
    } else {
      console.warn('Speech synthesis is not supported in this browser.');
    }
  }
  
  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }
  
  // Speak a message with the specified voice and options
  speak(text: string, options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) {
    if (!this.isSupported) {
      console.warn('Speech synthesis is not supported.');
      return;
    }
    
    // Cancel any ongoing speech
    if (this.synthesis) {
      this.synthesis.cancel();
    } else {
      return;
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (if specified and available)
    if (options.voice && this.voices.length > 0) {
      const voice = this.voices.find(v => v.name === options.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set other options if specified
    if (options.rate !== undefined) utterance.rate = options.rate;
    if (options.pitch !== undefined) utterance.pitch = options.pitch;
    if (options.volume !== undefined) utterance.volume = options.volume;
    
    // Speak the utterance
    if (this.synthesis) {
      this.synthesis.speak(utterance);
    }
  }
  
  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  
  // Stop all speaking
  stop() {
    if (this.isSupported && this.synthesis) {
      this.synthesis.cancel();
    }
  }
}