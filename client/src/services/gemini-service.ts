/**
 * Service for interacting with the Gemini AI API through our server proxy
 */

export interface GeminiRequestContent {
  parts: Array<{
    text?: string;
    image?: {
      data: string;
      mimeType: string;
    };
  }>;
}

export interface GeminiRequest {
  contents: GeminiRequestContent[];
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

/**
 * Check if the Gemini API is configured
 * @returns True if the API is configured, false otherwise
 */
export async function isGeminiConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/gemini/status');
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.configured === true;
  } catch (error) {
    console.error('Error checking Gemini API status:', error);
    return false;
  }
}

/**
 * Generate content using the Gemini API
 * @param prompt The text prompt to send to Gemini
 * @param options Additional options for the request
 * @returns The generated response as a string
 */
export async function generateContent(
  prompt: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  try {
    // First check if API is configured
    const isConfigured = await isGeminiConfigured();
    if (!isConfigured) {
      throw new Error('Gemini API is not configured');
    }
    
    // Use our server proxy instead of calling the API directly
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini AI');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}

/**
 * Generate content with an image using the Gemini API
 * @param prompt The text prompt
 * @param imageBase64 The base64 encoded image data
 * @param mimeType The mime type of the image
 * @param options Additional options
 * @returns The generated response
 */
export async function generateContentWithImage(
  prompt: string,
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  try {
    // First check if API is configured
    const isConfigured = await isGeminiConfigured();
    if (!isConfigured) {
      throw new Error('Gemini API is not configured');
    }
    
    // Use our server proxy
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                image: {
                  data: imageBase64,
                  mimeType,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini AI');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating content with image using Gemini:', error);
    throw error;
  }
}