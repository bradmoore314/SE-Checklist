import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { floorplanMarkers, floorplanLayers, floorplanCalibrations, insertFloorplanMarkerSchema, insertFloorplanLayerSchema, insertFloorplanCalibrationSchema, floorplans, accessPoints, cameras, elevators, intercoms } from '@shared/schema';
import { eq, and, inArray, not, isNull } from 'drizzle-orm';

/**
 * Register enhanced floorplan routes
 * These routes handle the professional PDF annotation features
 */
export function registerEnhancedFloorplanRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  // Get all markers for a floorplan page
  app.get('/api/enhanced-floorplan/:floorplanId/markers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId } = req.params;
      const { page } = req.query;
      
      // Parse page number
      const pageNumber = page ? parseInt(page as string) : 1;
      
      // Query all markers for the specified floorplan and page
      const markers = await db
        .select()
        .from(floorplanMarkers)
        .where(
          and(
            eq(floorplanMarkers.floorplan_id, parseInt(floorplanId)),
            eq(floorplanMarkers.page, pageNumber)
          )
        );
      
      res.status(200).json(markers);
    } catch (error) {
      console.error('Error fetching floorplan markers:', error);
      res.status(500).json({ error: 'Failed to fetch floorplan markers' });
    }
  });
  
  // Create a new marker
  app.post('/api/enhanced-floorplan/:floorplanId/markers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId } = req.params;
      
      // Ensure all coordinate values are properly formatted as numbers
      const processedData = {
        ...req.body,
        floorplan_id: parseInt(floorplanId),
        version: 1,
        unique_id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position_x: parseFloat(req.body.position_x),
        position_y: parseFloat(req.body.position_y)
      };
      
      // Add optional coordinates if present
      if (req.body.end_x !== undefined) processedData.end_x = parseFloat(req.body.end_x);
      if (req.body.end_y !== undefined) processedData.end_y = parseFloat(req.body.end_y);
      if (req.body.width !== undefined) processedData.width = parseFloat(req.body.width);
      if (req.body.height !== undefined) processedData.height = parseFloat(req.body.height);
      if (req.body.rotation !== undefined) processedData.rotation = parseFloat(req.body.rotation);
      
      // For marker types that are equipment, set a default equipment_id of 0
      // This is a temporary solution until we properly integrate with equipment management
      if (['access_point', 'camera', 'intercom', 'elevator'].includes(processedData.marker_type) && 
          !processedData.equipment_id) {
        processedData.equipment_id = 0; // Use dummy ID to satisfy not-null constraint
      }
      
      // Add a default color per marker type if not specified
      if (!processedData.color) {
        const colorMap: Record<string, string> = {
          'access_point': '#ef4444', // red for Card Access
          'camera': '#3b82f6',      // blue for Cameras
          'intercom': '#eab308',    // yellow for Intercoms
          'elevator': '#10b981',    // green for Elevators
          'rectangle': '#64748b',   // slate
          'circle': '#64748b',      // slate
          'line': '#64748b',        // slate
          'text': '#000000',        // black
          'measure': '#6366f1',     // indigo
        };
        processedData.color = colorMap[processedData.marker_type as string] || '#64748b';
      }
      
      // Validate the marker data
      const validatedData = insertFloorplanMarkerSchema.parse(processedData);
      
      // Insert the marker
      const [marker] = await db
        .insert(floorplanMarkers)
        .values(validatedData)
        .returning();
      
      res.status(201).json(marker);
    } catch (error) {
      console.error('Error creating floorplan marker:', error);
      res.status(500).json({ error: 'Failed to create floorplan marker' });
    }
  });
  
  // Update a marker
  app.put('/api/enhanced-floorplan/markers/:markerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { markerId } = req.params;
      
      // Get the current marker to increment version
      const [currentMarker] = await db
        .select()
        .from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, parseInt(markerId)));
      
      if (!currentMarker) {
        return res.status(404).json({ error: 'Marker not found' });
      }
      
      // Update the marker with incremented version
      const [updatedMarker] = await db
        .update(floorplanMarkers)
        .set({
          ...req.body,
          version: (currentMarker.version || 1) + 1
        })
        .where(eq(floorplanMarkers.id, parseInt(markerId)))
        .returning();
      
      res.status(200).json(updatedMarker);
    } catch (error) {
      console.error('Error updating floorplan marker:', error);
      res.status(500).json({ error: 'Failed to update floorplan marker' });
    }
  });
  
  // Update just a marker's position (for dragging operations)
  app.patch('/api/enhanced-floorplan/markers/:markerId/position', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { markerId } = req.params;
      const { position_x, position_y } = req.body;
      
      // Validate input
      if (position_x === undefined || position_y === undefined) {
        return res.status(400).json({ error: 'Position coordinates required' });
      }
      
      // Get the current marker to increment version
      const [currentMarker] = await db
        .select()
        .from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, parseInt(markerId)));
      
      if (!currentMarker) {
        return res.status(404).json({ error: 'Marker not found' });
      }
      
      // Parse coordinates as floats to ensure proper data type
      const parsedX = parseFloat(position_x as any);
      const parsedY = parseFloat(position_y as any);
      
      // Update only the marker position and version
      const [updatedMarker] = await db
        .update(floorplanMarkers)
        .set({
          position_x: parsedX,
          position_y: parsedY,
          version: (currentMarker.version || 1) + 1
        })
        .where(eq(floorplanMarkers.id, parseInt(markerId)))
        .returning();
      
      res.status(200).json(updatedMarker);
    } catch (error) {
      console.error('Error updating floorplan marker position:', error);
      res.status(500).json({ error: 'Failed to update marker position' });
    }
  });
  
  // Delete a marker
  app.delete('/api/enhanced-floorplan/markers/:markerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { markerId } = req.params;
      
      await db
        .delete(floorplanMarkers)
        .where(eq(floorplanMarkers.id, parseInt(markerId)));
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting floorplan marker:', error);
      res.status(500).json({ error: 'Failed to delete floorplan marker' });
    }
  });
  
  // Get all markers for a project with counts by type and placement categories
  app.get('/api/projects/:projectId/marker-stats', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const numericProjectId = parseInt(projectId);
      
      // First fetch all floorplans for this project
      const projectFloorplans = await db
        .select()
        .from(floorplans)
        .where(eq(floorplans.project_id, numericProjectId));
      
      // If no floorplans found, return empty stats
      if (!projectFloorplans.length) {
        return res.status(200).json({
          total: 0,
          types: {
            access_point: { total: 0, interior: 0, perimeter: 0 },
            camera: { total: 0, indoor: 0, outdoor: 0 },
            elevator: { total: 0 },
            intercom: { total: 0 }
          }
        });
      }
      
      // Get all floorplan IDs for this project
      const floorplanIds = projectFloorplans.map(fp => fp.id);
      
      // Fetch all markers across all floorplans for this project
      const markers = await db
        .select()
        .from(floorplanMarkers)
        .where(inArray(floorplanMarkers.floorplan_id, floorplanIds));
      
      // Count markers by type
      const accessPointMarkers = markers.filter(m => m.marker_type === 'access_point');
      const cameraMarkers = markers.filter(m => m.marker_type === 'camera');
      const elevatorMarkers = markers.filter(m => m.marker_type === 'elevator');
      const intercomMarkers = markers.filter(m => m.marker_type === 'intercom');
      
      // Fetch equipment details where available to count interior/perimeter access points
      // and indoor/outdoor cameras
      const accessPointIds = accessPointMarkers
        .filter(m => m.equipment_id && m.equipment_id > 0)
        .map(m => m.equipment_id);
        
      const cameraIds = cameraMarkers
        .filter(m => m.equipment_id && m.equipment_id > 0)
        .map(m => m.equipment_id);
        
      // Fetch access points to count interior/perimeter
      let accessPointDetails = [];
      if (accessPointIds.length > 0) {
        accessPointDetails = await db
          .select()
          .from(accessPoints)
          .where(inArray(accessPoints.id, accessPointIds as number[]));
      }
      
      // Fetch cameras to count indoor/outdoor
      let cameraDetails = [];
      if (cameraIds.length > 0) {
        cameraDetails = await db
          .select()
          .from(cameras)
          .where(inArray(cameras.id, cameraIds as number[]));
      }
      
      // Count interior/perimeter access points - case insensitive comparison 
      const interiorAccessPoints = accessPointDetails.filter(ap => 
        ap.interior_perimeter?.toLowerCase() === 'interior').length;
      const perimeterAccessPoints = accessPointDetails.filter(ap => 
        ap.interior_perimeter?.toLowerCase() === 'perimeter').length;
        
      // Count indoor/outdoor cameras - case insensitive comparison
      const indoorCameras = cameraDetails.filter(cam => 
        cam.indoor_outdoor?.toLowerCase() === 'indoor').length;
      const outdoorCameras = cameraDetails.filter(cam => 
        cam.indoor_outdoor?.toLowerCase() === 'outdoor').length;
      
      // Compile stats
      const stats = {
        total: markers.length,
        types: {
          access_point: {
            total: accessPointMarkers.length,
            interior: interiorAccessPoints,
            perimeter: perimeterAccessPoints,
            unspecified: accessPointMarkers.length - interiorAccessPoints - perimeterAccessPoints
          },
          camera: {
            total: cameraMarkers.length,
            indoor: indoorCameras,
            outdoor: outdoorCameras,
            unspecified: cameraMarkers.length - indoorCameras - outdoorCameras
          },
          elevator: {
            total: elevatorMarkers.length
          },
          intercom: {
            total: intercomMarkers.length
          }
        }
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching project marker statistics:', error);
      res.status(500).json({ error: 'Failed to fetch marker statistics' });
    }
  });
  
  // Get all layers for a floorplan
  app.get('/api/enhanced-floorplan/:floorplanId/layers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId } = req.params;
      
      const layers = await db
        .select()
        .from(floorplanLayers)
        .where(eq(floorplanLayers.floorplan_id, parseInt(floorplanId)));
      
      res.status(200).json(layers);
    } catch (error) {
      console.error('Error fetching floorplan layers:', error);
      res.status(500).json({ error: 'Failed to fetch floorplan layers' });
    }
  });
  
  // Create a new layer
  app.post('/api/enhanced-floorplan/:floorplanId/layers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId } = req.params;
      const layerData = {
        ...req.body,
        floorplan_id: parseInt(floorplanId)
      };
      
      // Validate the layer data
      const validatedData = insertFloorplanLayerSchema.parse(layerData);
      
      // Insert the layer
      const [layer] = await db
        .insert(floorplanLayers)
        .values(validatedData)
        .returning();
      
      res.status(201).json(layer);
    } catch (error) {
      console.error('Error creating floorplan layer:', error);
      res.status(500).json({ error: 'Failed to create floorplan layer' });
    }
  });
  
  // Update a layer
  app.put('/api/enhanced-floorplan/layers/:layerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { layerId } = req.params;
      
      const [updatedLayer] = await db
        .update(floorplanLayers)
        .set(req.body)
        .where(eq(floorplanLayers.id, parseInt(layerId)))
        .returning();
      
      res.status(200).json(updatedLayer);
    } catch (error) {
      console.error('Error updating floorplan layer:', error);
      res.status(500).json({ error: 'Failed to update floorplan layer' });
    }
  });
  
  // Delete a layer
  app.delete('/api/enhanced-floorplan/layers/:layerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { layerId } = req.params;
      
      await db
        .delete(floorplanLayers)
        .where(eq(floorplanLayers.id, parseInt(layerId)));
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting floorplan layer:', error);
      res.status(500).json({ error: 'Failed to delete floorplan layer' });
    }
  });
  
  // Get calibration for a floorplan page
  app.get('/api/floorplans/:floorplanId/calibrations/:page', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId, page } = req.params;
      
      const [calibration] = await db
        .select()
        .from(floorplanCalibrations)
        .where(
          and(
            eq(floorplanCalibrations.floorplan_id, parseInt(floorplanId)),
            eq(floorplanCalibrations.page, parseInt(page))
          )
        );
      
      if (!calibration) {
        return res.status(404).json({ error: 'Calibration not found' });
      }
      
      res.status(200).json(calibration);
    } catch (error) {
      console.error('Error fetching floorplan calibration:', error);
      res.status(500).json({ error: 'Failed to fetch floorplan calibration' });
    }
  });
  
  // Create/update calibration for a floorplan page
  app.post('/api/floorplans/:floorplanId/calibrations/:page', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { floorplanId, page } = req.params;
      const calibrationData = {
        ...req.body,
        floorplan_id: parseInt(floorplanId),
        page: parseInt(page)
      };
      
      // Validate the calibration data
      const validatedData = insertFloorplanCalibrationSchema.parse(calibrationData);
      
      // Check if calibration exists
      const [existingCalibration] = await db
        .select()
        .from(floorplanCalibrations)
        .where(
          and(
            eq(floorplanCalibrations.floorplan_id, parseInt(floorplanId)),
            eq(floorplanCalibrations.page, parseInt(page))
          )
        );
      
      let calibration;
      
      if (existingCalibration) {
        // Update existing calibration
        [calibration] = await db
          .update(floorplanCalibrations)
          .set(validatedData)
          .where(eq(floorplanCalibrations.id, existingCalibration.id))
          .returning();
      } else {
        // Insert new calibration
        [calibration] = await db
          .insert(floorplanCalibrations)
          .values(validatedData)
          .returning();
      }
      
      res.status(201).json(calibration);
    } catch (error) {
      console.error('Error creating/updating floorplan calibration:', error);
      res.status(500).json({ error: 'Failed to create/update floorplan calibration' });
    }
  });
}