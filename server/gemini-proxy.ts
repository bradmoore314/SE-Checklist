import { Request, Response } from 'express';
import fetch from 'node-fetch';

// The Gemini API endpoint
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware to handle proxying requests to the Gemini API
export async function proxyGeminiRequest(req: Request, res: Response) {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  try {
    const model = req.params.model || 'gemini-2.0-flash';
    const endpoint = req.params.endpoint || 'generateContent';
    
    // Construct the URL for the Gemini API
    const url = `${GEMINI_BASE_URL}/models/${model}:${endpoint}?key=${GEMINI_API_KEY}`;
    
    console.log(`Proxying request to Gemini API: ${model}:${endpoint}`);
    
    // Forward the request to Gemini API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    // Get the response data
    const data = await response.json() as Record<string, unknown>;
    
    // If the response is not OK, return an error
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        error: 'Error from Gemini API',
        details: data
      });
    }
    
    console.log('Successfully received response from Gemini API');
    
    // Return the response from Gemini
    return res.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error proxying request to Gemini:', errorMessage);
    return res.status(500).json({ 
      error: 'Failed to proxy request to Gemini API',
      message: errorMessage
    });
  }
}