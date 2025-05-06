import { Express, Request, Response } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { processConfigurationMessage } from '../services/equipment-configuration-service';

export function setupEquipmentConfigurationRoutes(app: Express) {
  /**
   * Process a configuration message and update the scratchpad
   * POST /api/equipment/process-configuration
   */
  app.post('/api/equipment/process-configuration', async (req: Request, res: Response) => {
    try {
      const { message, projectId, currentItems } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Process the message using the service
      const result = await processConfigurationMessage(message, projectId, currentItems);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing configuration message:', error);
      return res.status(500).json({ 
        error: 'Failed to process configuration message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Submit the final configuration
   * POST /api/equipment/submit-configuration
   */
  app.post('/api/equipment/submit-configuration', async (req: Request, res: Response) => {
    try {
      const { items, projectId } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Create a session ID for this batch
      const batchId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Process each item and create the appropriate equipment
      const createdEquipment = [];
      
      for (const item of items) {
        let equipmentId;
        
        // Extract field values
        const fieldValues = item.fields.reduce((acc, field) => {
          if (field.value) {
            acc[field.name] = field.value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        // Create the equipment based on type
        switch (item.type) {
          case 'camera':
            // Add camera
            const [camera] = await db.query(
              `INSERT INTO cameras (
                project_id, location, camera_type, notes, 
                mounting_type, resolution, field_of_view, 
                is_indoor, import_to_gateway
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
              ) RETURNING id`,
              [
                projectId,
                fieldValues.location || '',
                fieldValues.camera_type || 'IP',
                fieldValues.notes || null,
                fieldValues.mounting_type || null,
                fieldValues.resolution || null,
                fieldValues.field_of_view || null,
                fieldValues.is_indoor === 'true' || false,
                fieldValues.import_to_gateway === 'true' || false
              ]
            );
            equipmentId = camera.id;
            break;
            
          case 'access_point':
            // Add access point
            const [accessPoint] = await db.query(
              `INSERT INTO access_points (
                project_id, location, quick_config, reader_type, 
                lock_type, monitoring_type, lock_provider,
                takeover, operation_mode, fire_alarm_integration,
                door_position_switch, rex_type, rex_notes,
                hardware_notes, hazardous_area, other_hardware,
                network_drops_needed, notes
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18
              ) RETURNING id`,
              [
                projectId,
                fieldValues.location || '',
                fieldValues.quick_config || null,
                fieldValues.reader_type || 'HID',
                fieldValues.lock_type || null,
                fieldValues.monitoring_type || null,
                fieldValues.lock_provider || null,
                fieldValues.takeover || null,
                fieldValues.operation_mode || null,
                fieldValues.fire_alarm_integration === 'true' || false,
                fieldValues.door_position_switch === 'true' || false,
                fieldValues.rex_type || null,
                fieldValues.rex_notes || null,
                fieldValues.hardware_notes || null,
                fieldValues.hazardous_area === 'true' || false,
                fieldValues.other_hardware || null,
                fieldValues.network_drops_needed || '1',
                fieldValues.notes || null
              ]
            );
            equipmentId = accessPoint.id;
            break;
            
          case 'elevator':
            // Add elevator
            const [elevator] = await db.query(
              `INSERT INTO elevators (
                project_id, address, title, location,
                reader_type, notes
              ) VALUES (
                $1, $2, $3, $4, $5, $6
              ) RETURNING id`,
              [
                projectId,
                fieldValues.address || null,
                fieldValues.title || null,
                fieldValues.location || '',
                fieldValues.reader_type || null,
                fieldValues.notes || null
              ]
            );
            equipmentId = elevator.id;
            break;
            
          case 'intercom':
            // Add intercom
            const [intercom] = await db.query(
              `INSERT INTO intercoms (
                project_id, location, intercom_type, notes
              ) VALUES (
                $1, $2, $3, $4
              ) RETURNING id`,
              [
                projectId,
                fieldValues.location || '',
                fieldValues.intercom_type || 'IP',
                fieldValues.notes || null
              ]
            );
            equipmentId = intercom.id;
            break;
            
          default:
            throw new Error(`Unsupported equipment type: ${item.type}`);
        }
        
        // Handle quantity > 1 by creating multiple copies
        if (item.quantity > 1 && equipmentId) {
          // We've already created one, so create (quantity-1) more
          for (let i = 1; i < item.quantity; i++) {
            // Clone the equipment with a slight location name change
            const locationField = item.fields.find(f => f.name === 'location');
            if (locationField && locationField.value) {
              const newLocation = `${locationField.value} (${i + 1})`;
              
              // Use the same logic as above but with the new location
              // This is simplified - in a real implementation you'd want to reuse the code
              switch (item.type) {
                case 'camera':
                  await db.query(
                    `INSERT INTO cameras (
                      project_id, location, camera_type, notes, 
                      mounting_type, resolution, field_of_view, 
                      is_indoor, import_to_gateway
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6, $7, $8, $9
                    )`,
                    [
                      projectId,
                      newLocation,
                      fieldValues.camera_type || 'IP',
                      fieldValues.notes || null,
                      fieldValues.mounting_type || null,
                      fieldValues.resolution || null,
                      fieldValues.field_of_view || null,
                      fieldValues.is_indoor === 'true' || false,
                      fieldValues.import_to_gateway === 'true' || false
                    ]
                  );
                  break;
                  
                case 'access_point':
                  await db.query(
                    `INSERT INTO access_points (
                      project_id, location, quick_config, reader_type, 
                      lock_type, monitoring_type, lock_provider,
                      takeover, operation_mode, fire_alarm_integration,
                      door_position_switch, rex_type, rex_notes,
                      hardware_notes, hazardous_area, other_hardware,
                      network_drops_needed, notes
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                      $11, $12, $13, $14, $15, $16, $17, $18
                    )`,
                    [
                      projectId,
                      newLocation,
                      fieldValues.quick_config || null,
                      fieldValues.reader_type || 'HID',
                      fieldValues.lock_type || null,
                      fieldValues.monitoring_type || null,
                      fieldValues.lock_provider || null,
                      fieldValues.takeover || null,
                      fieldValues.operation_mode || null,
                      fieldValues.fire_alarm_integration === 'true' || false,
                      fieldValues.door_position_switch === 'true' || false,
                      fieldValues.rex_type || null,
                      fieldValues.rex_notes || null,
                      fieldValues.hardware_notes || null,
                      fieldValues.hazardous_area === 'true' || false,
                      fieldValues.other_hardware || null,
                      fieldValues.network_drops_needed || '1',
                      fieldValues.notes || null
                    ]
                  );
                  break;
                  
                case 'elevator':
                  await db.query(
                    `INSERT INTO elevators (
                      project_id, address, title, location,
                      reader_type, notes
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6
                    )`,
                    [
                      projectId,
                      fieldValues.address || null,
                      fieldValues.title || null,
                      newLocation,
                      fieldValues.reader_type || null,
                      fieldValues.notes || null
                    ]
                  );
                  break;
                  
                case 'intercom':
                  await db.query(
                    `INSERT INTO intercoms (
                      project_id, location, intercom_type, notes
                    ) VALUES (
                      $1, $2, $3, $4
                    )`,
                    [
                      projectId,
                      newLocation,
                      fieldValues.intercom_type || 'IP',
                      fieldValues.notes || null
                    ]
                  );
                  break;
              }
            }
          }
        }
        
        createdEquipment.push({
          type: item.type,
          id: equipmentId,
          name: item.name,
          quantity: item.quantity
        });
      }
      
      // Log the submission for audit purposes
      await db.query(
        `INSERT INTO equipment_batch_submissions (
          batch_id, project_id, items_json, created_at
        ) VALUES ($1, $2, $3, $4)`,
        [batchId, projectId, JSON.stringify(items), timestamp]
      );
      
      return res.status(200).json({ 
        success: true,
        message: 'Configuration submitted successfully',
        batchId,
        createdEquipment
      });
    } catch (error) {
      console.error('Error submitting configuration:', error);
      return res.status(500).json({ 
        error: 'Failed to submit configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}