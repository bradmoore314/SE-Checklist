import { Request, Response } from "express";

// Google Cloud Speech API
const GOOGLE_CLOUD_SPEECH_API_KEY = process.env.GOOGLE_CLOUD_SPEECH_API_KEY;
const SPEECH_API_URL = "https://speech.googleapis.com/v1/speech:recognize";

/**
 * Process speech recognition request using Google Cloud Speech API
 */
export async function recognizeSpeech(req: Request, res: Response) {
  if (!GOOGLE_CLOUD_SPEECH_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Google Cloud Speech API key not configured. Please set the GOOGLE_CLOUD_SPEECH_API_KEY environment variable."
    });
  }

  const { audio, language = "en-US", config = {} } = req.body;

  if (!audio) {
    return res.status(400).json({
      success: false,
      message: "Audio data is required."
    });
  }

  try {
    // Set up configuration for Google Cloud Speech API
    const requestBody = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: language,
        model: "command_and_search",
        speechContexts: [
          {
            phrases: ["access point", "camera", "elevator", "intercom", "door", "lock", "reader", "monitoring", "card", "credential", "security", "building", "floor"]
          }
        ],
        ...config
      },
      audio: {
        content: audio // Base64-encoded audio data
      }
    };

    // Make API request to Google Cloud Speech
    const response = await fetch(`${SPEECH_API_URL}?key=${GOOGLE_CLOUD_SPEECH_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Cloud Speech API error:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Google Cloud Speech API returned status ${response.status}`,
        error: errorData
      });
    }

    const data = await response.json();
    
    // Extract the transcript from the response
    let transcript = "";
    if (data.results && data.results.length > 0) {
      transcript = data.results[0].alternatives[0].transcript;
    }

    return res.json({
      success: true,
      transcript,
      data  // Include full data for debugging
    });
  } catch (error) {
    console.error("Error processing speech recognition:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing speech recognition",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Process text-to-speech request using Google Cloud Text-to-Speech API
 */
export async function textToSpeech(req: Request, res: Response) {
  if (!GOOGLE_CLOUD_SPEECH_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Google Cloud API key not configured. Please set the GOOGLE_CLOUD_SPEECH_API_KEY environment variable."
    });
  }

  const { text, language = "en-US", voice = "en-US-Standard-B" } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Text is required."
    });
  }

  try {
    // Set up configuration for Google Cloud Text-to-Speech API
    const requestBody = {
      input: {
        text
      },
      voice: {
        languageCode: language,
        name: voice
      },
      audioConfig: {
        audioEncoding: "MP3"
      }
    };

    // Make API request to Google Cloud Text-to-Speech
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_SPEECH_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Cloud Text-to-Speech API error:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Google Cloud Text-to-Speech API returned status ${response.status}`,
        error: errorData
      });
    }

    const data = await response.json();

    return res.json({
      success: true,
      audioContent: data.audioContent
    });
  } catch (error) {
    console.error("Error processing text-to-speech:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing text-to-speech",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}