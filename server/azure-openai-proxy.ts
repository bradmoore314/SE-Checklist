import { Request, Response } from "express";
import { testAzureOpenAI } from "./utils/azure-openai";

/**
 * Proxy function to test Azure OpenAI
 */
export async function proxyTestAzureOpenAI(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Missing required prompt parameter" });
    }
    
    console.log("Testing Azure OpenAI with prompt:", prompt);
    
    // Send the prompt to Azure OpenAI API
    const response = await testAzureOpenAI(prompt);
    
    console.log("Azure OpenAI response:", response);
    
    // Return the response to the client
    res.json({ response });
  } catch (error) {
    console.error("Error calling Azure OpenAI API:", error);
    
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
}