import { Express, Request, Response } from 'express';
import equipmentCreationGeminiService from '../services/equipment-creation-gemini';

/**
 * Register equipment creation API routes
 */
export function setupEquipmentCreationRoutes(app: Express) {
  /**
   * Detect creation intent from a message
   * POST /api/equipment/detect-intent
   */
  app.post('/api/equipment/detect-intent', (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message string is required' });
      }
      
      const intent = equipmentCreationService.detectCreationIntent(message);
      res.json(intent);
    } catch (error) {
      console.error('Error detecting equipment creation intent:', error);
      res.status(500).json({ error: 'Failed to detect intent' });
    }
  });

  /**
   * Start equipment creation session
   * POST /api/equipment/sessions
   */
  app.post('/api/equipment/sessions', async (req: Request, res: Response) => {
    try {
      const { project_id, equipment_type, quantity } = req.body;
      
      if (!project_id || !equipment_type || !quantity) {
        return res.status(400).json({ 
          error: 'Project ID, equipment type, and quantity are required' 
        });
      }
      
      const session = await equipmentCreationService.startSession(
        project_id, 
        equipment_type, 
        quantity
      );
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error starting equipment creation session:', error);
      res.status(500).json({ error: 'Failed to start session' });
    }
  });

  /**
   * Process response in equipment creation session
   * POST /api/equipment/sessions/:sessionId/response
   */
  app.post('/api/equipment/sessions/:sessionId/response', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { response } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }
      
      if (!response || typeof response !== 'string') {
        return res.status(400).json({ error: 'Response string is required' });
      }
      
      const result = await equipmentCreationService.processResponse(sessionId, response);
      res.json(result);
    } catch (error) {
      console.error('Error processing equipment creation response:', error);
      res.status(500).json({ error: 'Failed to process response' });
    }
  });

  /**
   * Get session details
   * GET /api/equipment/sessions/:sessionId
   */
  app.get('/api/equipment/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }
      
      const session = await equipmentCreationService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error getting equipment creation session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  });
}