import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { processConfigurationMessage, submitConfiguration } from '../services/equipment-configuration-service';

/**
 * Setup routes for equipment configuration
 */
export function setupEquipmentConfigurationRoutes(app: Express) {
  // Process a configuration message
  app.post('/api/equipment/process-configuration', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        message: z.string().min(1),
        projectId: z.number().int().positive(),
        currentItems: z.array(
          z.object({
            id: z.string(),
            type: z.enum(['camera', 'access_point', 'elevator', 'intercom']),
            name: z.string(),
            fields: z.array(
              z.object({
                name: z.string(),
                value: z.string().nullable(),
                required: z.boolean(),
                type: z.enum(['text', 'number', 'select', 'boolean']),
                options: z.array(z.string()).optional(),
              })
            ),
            isComplete: z.boolean(),
            quantity: z.number().int().positive(),
          })
        ).default([]),
      });

      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid request body',
          details: result.error.format()
        });
      }

      const { message, projectId, currentItems } = result.data;

      // Process the configuration message
      const { response, updatedItems } = await processConfigurationMessage(
        message,
        projectId,
        currentItems
      );

      // Return the response
      res.status(200).json({
        response,
        updatedItems,
      });
    } catch (error) {
      console.error('Error processing configuration message:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error processing configuration message'
      });
    }
  });

  // Submit configuration
  app.post('/api/equipment/submit-configuration', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.string(),
            type: z.enum(['camera', 'access_point', 'elevator', 'intercom']),
            name: z.string(),
            fields: z.array(
              z.object({
                name: z.string(),
                value: z.string().nullable(),
                required: z.boolean(),
                type: z.enum(['text', 'number', 'select', 'boolean']),
                options: z.array(z.string()).optional(),
              })
            ),
            isComplete: z.boolean(),
            quantity: z.number().int().positive(),
          })
        ),
        projectId: z.number().int().positive(),
      });

      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid request body',
          details: result.error.format()
        });
      }

      const { items, projectId } = result.data;

      // Submit the configuration
      const { success, message, savedItems } = await submitConfiguration(
        items,
        projectId
      );

      // Return the response
      res.status(200).json({
        success,
        message,
        savedItems,
      });
    } catch (error) {
      console.error('Error submitting configuration:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error submitting configuration'
      });
    }
  });
}