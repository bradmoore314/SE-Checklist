import { Request, Response } from "express";
import fetch from "isomorphic-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Proxy function to test the Gemini API with a simple prompt
 */
export async function proxyTestGemini(req: Request, res: Response) {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not configured. Please set the GEMINI_API_KEY environment variable."
    });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      success: false,
      message: "Prompt is required and must be a string."
    });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(response.status).json({
        success: false,
        message: `Gemini API returned status ${response.status}: ${JSON.stringify(data)}`,
        error: data
      });
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

    return res.status(200).json({
      success: true,
      content
    });
  } catch (error) {
    console.error("Error proxying Gemini request:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}

/**
 * Generate a site walk analysis for a specific project
 */
export async function generateSiteWalkAnalysis(projectId: number, projectData: any) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.");
  }

  // Create a detailed prompt for the Gemini model
  const prompt = `
    You are a security systems expert assisting with a site walk analysis. Please provide a detailed analysis based on the following project data:
    
    Project Information:
    ${JSON.stringify(projectData, null, 2)}
    
    Please provide a comprehensive analysis with the following sections:
    
    1. Executive Summary: A high-level overview of the security system setup and key observations.
    
    2. Technical Analysis: Detailed assessment of the technical aspects of the security system, including any potential integration challenges or technical considerations.
    
    3. Recommendations: List specific recommendations for improvements or optimizations to the security system setup.
    
    4. Risk Assessment: Identify potential security risks or vulnerabilities in the current setup.
    
    5. Implementation Timeline: Suggest a realistic timeline for implementing the security system.
    
    Format your response as a JSON object with the following structure:
    {
      "summary": "Executive summary text...",
      "technicalAnalysis": "Technical analysis text...",
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "risks": ["Risk 1", "Risk 2", ...],
      "timeline": "Implementation timeline text..."
    }
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error(`Gemini API returned status ${response.status}: ${JSON.stringify(data)}`);
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Try to parse the JSON response
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      const jsonContent = content.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      throw new Error("Failed to parse Gemini response as JSON. The model may not have returned valid JSON.");
    }
  } catch (error) {
    console.error("Error generating site walk analysis:", error);
    throw error;
  }
}