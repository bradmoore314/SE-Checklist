import express, { Request, Response } from 'express';
import { z } from 'zod';
import { equipmentConfigurationService } from '../services/equipment-configuration-service';

// Define validation schemas
const EquipmentFieldSchema = z.object({
  name: z.string(),
  value: z.string().nullable(),
  required: z.boolean(),
  type: z.enum(['text', 'number', 'select', 'boolean']),
  options: z.array(z.string()).optional()
});

const EquipmentItemSchema = z.object({
  id: z.string(),
  type: z.enum(['camera', 'access_point', 'elevator', 'intercom']),
  name: z.string(),
  fields: z.array(EquipmentFieldSchema),
  isComplete: z.boolean(),
  quantity: z.number()
});

const ProcessConfigurationRequestSchema = z.object({
  message: z.string(),
  projectId: z.number().optional(),
  currentItems: z.array(EquipmentItemSchema)
});

const SubmitConfigurationRequestSchema = z.object({
  items: z.array(EquipmentItemSchema),
  projectId: z.number().optional()
});

export function setupEquipmentConfigurationRoutes(app: express.Express) {
  /**
   * Process a natural language request to configure equipment
   * 
   * @route POST /api/equipment/process-configuration
   * @param {string} message - The user's message
   * @param {number} [projectId] - Optional project ID
   * @param {EquipmentItem[]} currentItems - Current equipment items
   * @returns {ProcessConfigurationResponse} Response containing natural language response and updated items
   */
  app.post('/api/equipment/process-configuration', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parseResult = ProcessConfigurationRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.error('Validation error:', parseResult.error);
        return res.status(400).json({
          error: 'Invalid request data',
          details: parseResult.error.errors
        });
      }
      
      // Process the request
      const result = await equipmentConfigurationService.processConfigurationMessage(parseResult.data);
      
      // Return the response
      res.json(result);
    } catch (error) {
      console.error('Error processing equipment configuration:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Submit the finalized equipment configuration to be saved in the database
   * 
   * @route POST /api/equipment/submit-configuration
   * @param {EquipmentItem[]} items - Equipment items to save
   * @param {number} [projectId] - Optional project ID (required for saving)
   * @returns {SubmitConfigurationResponse} Response containing success status and count of created items
   */
  app.post('/api/equipment/submit-configuration', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parseResult = SubmitConfigurationRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.error('Validation error:', parseResult.error);
        return res.status(400).json({
          error: 'Invalid request data',
          details: parseResult.error.errors
        });
      }
      
      // Submit the configuration
      const result = await equipmentConfigurationService.submitConfiguration(parseResult.data);
      
      // Return the response
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error submitting equipment configuration:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}