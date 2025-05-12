import { Request, Response } from 'express';
import { testAzureOpenAI } from './utils/azure-openai';

/**
 * Proxy function to test Azure OpenAI
 */
export async function proxyTestAzureOpenAI(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid prompt. Please provide a valid string prompt.'
      });
    }

    // Call the test function
    const result = await testAzureOpenAI(prompt);
    
    return res.json({
      result,
      model: 'azure-openai'
    });
  } catch (error) {
    console.error('Error in Azure OpenAI proxy:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}