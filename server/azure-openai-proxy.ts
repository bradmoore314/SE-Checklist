import { Request, Response } from "express";
import { getAzureOpenAIClient } from "./utils/azure-openai";

/**
 * Proxy function to test the Azure OpenAI API with a simple prompt
 * 
 * This function provides secure access to Azure OpenAI's capabilities,
 * ensuring all data processing occurs within Kastle's protected environment.
 */
export async function proxyTestAzureOpenAI(req: Request, res: Response) {
  if (!process.env.AZURE_OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Azure OpenAI API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable."
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
    const openai = getAzureOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = response.choices[0].message.content || "No response from Azure OpenAI";

    return res.status(200).json({
      success: true,
      content,
      secureAI: true,
      provider: "Azure OpenAI in Kastle's secure environment"
    });
  } catch (error) {
    console.error("Error proxying Azure OpenAI request:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}

/**
 * Generate a site walk analysis for a specific project
 * 
 * This function uses Azure OpenAI in Kastle's secure environment to analyze project data
 * and generate comprehensive security system analysis with enhanced security.
 */
export async function generateSiteWalkAnalysis(projectId: number, projectData: any) {
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error("Azure OpenAI API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable.");
  }

  try {
    const openai = getAzureOpenAIClient();
    
    // Create a detailed prompt
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

    // Process through Azure OpenAI's secure environment
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "";
    
    if (!content) {
      throw new Error("No content in Azure OpenAI response");
    }
    
    // Parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing Azure OpenAI response as JSON:", parseError);
      throw new Error("Failed to parse Azure OpenAI response as JSON.");
    }
  } catch (error) {
    console.error("Error generating site walk analysis:", error);
    throw error;
  }
}