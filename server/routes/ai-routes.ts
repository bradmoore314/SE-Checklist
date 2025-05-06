import { Express, Request, Response } from 'express';
import chatbotGeminiService, { ChatMessage, ChatContext } from '../services/chatbot-gemini-direct';

/**
 * Register AI chatbot API routes
 */
export function setupAIRoutes(app: Express) {
  /**
   * Process a chat message and get a response
   * POST /api/ai/chat
   */
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      
      // Validate input
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }
      
      // Process the messages
      const response = await chatbotGeminiService.processMessage(messages, context);
      
      // Extract equipment recommendations if the message is from the assistant
      let recommendations: any[] = [];
      if (messages[messages.length - 1].role === 'user') {
        const extractedRecommendations = await chatbotGeminiService.extractEquipmentRecommendations(response);
        recommendations = extractedRecommendations || [];
      }
      
      // Return the response
      res.json({
        message: response,
        recommendations
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  /**
   * Analyze a query to extract context information
   * POST /api/ai/analyze
   */
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      // Validate input
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string is required' });
      }
      
      // Analyze the query
      const context = await chatbotGeminiService.analyzeQuery(query);
      
      // Return the context
      res.json({ context });
    } catch (error) {
      console.error('Error analyzing query:', error);
      res.status(500).json({ error: 'Failed to analyze query' });
    }
  });

  /**
   * Extract equipment recommendations from text
   * POST /api/ai/extract-equipment
   */
  app.post('/api/ai/extract-equipment', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      // Validate input
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
      }
      
      // Extract equipment recommendations
      const extractedRecommendations = await chatbotGeminiService.extractEquipmentRecommendations(text);
      
      // Return the recommendations
      res.json({ recommendations: extractedRecommendations || [] });
    } catch (error) {
      console.error('Error extracting equipment recommendations:', error);
      res.status(500).json({ error: 'Failed to extract equipment recommendations' });
    }
  });

  /**
   * Get speech-to-text capabilities status
   * GET /api/ai/speech-status
   */
  app.get('/api/ai/speech-status', (req: Request, res: Response) => {
    // This is a simple endpoint to let the client know
    // about speech recognition capabilities of the server
    res.json({
      // Currently we're using browser-based speech recognition
      // so the server capability is not relevant
      speechToText: false,
      textToSpeech: false,
      // Let the client know to use browser capabilities
      useBrowserCapabilities: true,
    });
  });
}