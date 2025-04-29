/**
 * Service for interacting with the Gemini AI API
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
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
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
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