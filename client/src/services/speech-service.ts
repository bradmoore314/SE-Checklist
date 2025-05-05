/**
 * Speech Service
 * 
 * Provides functionality for speech-to-text (STT) and text-to-speech (TTS)
 * using Web Speech API for browser-native capabilities and Google Cloud
 * Speech API for more advanced capabilities.
 */

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechSynthesisOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

// Interface used for handling recognition results
interface RecognitionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private recognizing: boolean = false;
  private locale: string = 'en-US';
  
  constructor() {
    // Initialize Web Speech API if available
    if (typeof window !== 'undefined') {
      // Type definitions for Web Speech API
      const SpeechRecognition = window.SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.locale;
      }
      
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  /**
   * Start speech recognition
   * @param options Options for speech recognition
   * @param onResult Callback function for handling recognition results
   * @param onError Callback function for handling errors
   */
  startListening(
    options: SpeechRecognitionOptions = {},
    onResult: (result: RecognitionResult) => void,
    onError: (error: any) => void
  ): void {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser'));
      return;
    }

    if (this.recognizing) {
      this.stopListening();
    }

    // Apply options
    this.recognition.lang = options.language || this.locale;
    this.recognition.continuous = options.continuous !== undefined ? options.continuous : true;
    this.recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;

    // Set up event handlers
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let highestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
        }
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // If we have final results, send those, otherwise send interim
      if (finalTranscript) {
        onResult({
          text: finalTranscript,
          isFinal: true,
          confidence: highestConfidence
        });
      } else if (interimTranscript) {
        onResult({
          text: interimTranscript,
          isFinal: false,
          confidence: highestConfidence
        });
      }
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.recognizing = false;
    };

    // Start recognition
    try {
      this.recognition.start();
      this.recognizing = true;
    } catch (error) {
      onError(error);
    }
  }

  /**
   * Stop speech recognition
   */
  stopListening(): void {
    if (this.recognition && this.recognizing) {
      this.recognition.stop();
      this.recognizing = false;
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Check if speech synthesis is supported
   */
  isSynthesisSupported(): boolean {
    return !!this.synthesis;
  }

  /**
   * Get available voices for speech synthesis
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  /**
   * Speak text using speech synthesis
   * @param text Text to speak
   * @param options Options for speech synthesis
   * @param onStart Callback function when speech starts
   * @param onEnd Callback function when speech ends
   */
  speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    if (options.voice) {
      const voices = this.getVoices();
      const voice = voices.find(v => v.name === options.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    utterance.pitch = options.pitch || 1;
    utterance.rate = options.rate || 1;
    utterance.volume = options.volume || 1;
    
    // Set event handlers
    if (onStart) {
      utterance.onstart = onStart;
    }
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    // Start speaking
    this.synthesis.speak(utterance);
  }

  /**
   * Cancel any ongoing speech synthesis
   */
  cancelSpeech(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Use Google Cloud Speech API for advanced speech recognition
   * @param audioBlob Audio data as a Blob
   */
  async recognizeWithGoogleCloud(audioBlob: Blob): Promise<string> {
    try {
      // Convert the blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Send to server for processing with Google Cloud Speech API
      const response = await fetch('/api/speech/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          language: this.locale,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.transcript || '';
    } catch (error) {
      console.error('Error recognizing speech with Google Cloud:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const speechService = new SpeechService();