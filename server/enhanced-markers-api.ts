import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { floorplanMarkers } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Register enhanced marker API
 * Additional specialized endpoints for marker manipulation
 */
export function registerEnhancedMarkerAPI(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Get markers by equipment type and ID
  app.get('/api/enhanced-floorplan/markers/equipment/:type/:id', async (req: Request, res: Response) => {
    try {
      const { type, id } = req.params;
      
      const markers = await db
        .select()
        .from(floorplanMarkers)
        .where(
          and(
            eq(floorplanMarkers.marker_type, type),
            eq(floorplanMarkers.equipment_id, parseInt(id))
          )
        );
      
      res.status(200).json(markers);
    } catch (error) {
      console.error('Error fetching markers by equipment:', error);
      res.status(500).json({ error: 'Failed to fetch markers by equipment' });
    }
  });
  
  // Get markers by layer
  app.get('/api/enhanced-floorplan/markers/layer/:layerId', async (req: Request, res: Response) => {
    try {
      const { layerId } = req.params;
      
      const markers = await db
        .select()
        .from(floorplanMarkers)
        .where(eq(floorplanMarkers.layer_id, parseInt(layerId)));
      
      res.status(200).json(markers);
    } catch (error) {
      console.error('Error fetching markers by layer:', error);
      res.status(500).json({ error: 'Failed to fetch markers by layer' });
    }
  });
  
  // Duplicate a marker
  app.post('/api/enhanced-floorplan/markers/:markerId/duplicate', async (req: Request, res: Response) => {
    try {
      const { markerId } = req.params;
      
      // Get the marker to duplicate
      const [markerToDuplicate] = await db
        .select()
        .from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, parseInt(markerId)));
      
      if (!markerToDuplicate) {
        return res.status(404).json({ error: 'Marker not found' });
      }
      
      // Create a duplicate with slight position offset and new unique ID
      const duplicateData = {
        ...markerToDuplicate,
        id: undefined, // Let the database assign a new ID
        position_x: markerToDuplicate.position_x + 10, // Offset slightly
        position_y: markerToDuplicate.position_y + 10,
        unique_id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: 1,
        parent_id: markerToDuplicate.id // Set the original as parent
      };
      
      // Insert the duplicate
      const [newMarker] = await db
        .insert(floorplanMarkers)
        .values(duplicateData)
        .returning();
      
      res.status(201).json(newMarker);
    } catch (error) {
      console.error('Error duplicating marker:', error);
      res.status(500).json({ error: 'Failed to duplicate marker' });
    }
  });
  
  // Update marker position
  app.patch('/api/enhanced-floorplan/markers/:markerId/position', async (req: Request, res: Response) => {
    try {
      const { markerId } = req.params;
      const { position_x, position_y, end_x, end_y } = req.body;
      
      // Get the current marker to increment version
      const [currentMarker] = await db
        .select()
        .from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, parseInt(markerId)));
      
      if (!currentMarker) {
        return res.status(404).json({ error: 'Marker not found' });
      }
      
      // Prepare update data
      const updateData: any = {
        position_x,
        position_y,
        version: (currentMarker.version || 1) + 1
      };
      
      // Include end coordinates if provided
      if (end_x !== undefined) {
        updateData.end_x = end_x;
      }
      if (end_y !== undefined) {
        updateData.end_y = end_y;
      }
      
      // Update the marker position
      const [updatedMarker] = await db
        .update(floorplanMarkers)
        .set(updateData)
        .where(eq(floorplanMarkers.id, parseInt(markerId)))
        .returning();
      
      res.status(200).json(updatedMarker);
    } catch (error) {
      console.error('Error updating marker position:', error);
      res.status(500).json({ error: 'Failed to update marker position' });
    }
  });
  
  // Batch update multiple markers
  app.post('/api/enhanced-floorplan/markers/batch-update', async (req: Request, res: Response) => {
    try {
      const { markers } = req.body;
      
      if (!Array.isArray(markers) || markers.length === 0) {
        return res.status(400).json({ error: 'No markers provided for batch update' });
      }
      
      // Process each marker update sequentially
      const results = [];
      for (const marker of markers) {
        // Get current marker for version increment
        const [currentMarker] = await db
          .select()
          .from(floorplanMarkers)
          .where(eq(floorplanMarkers.id, marker.id));
        
        if (!currentMarker) {
          results.push({ id: marker.id, status: 'error', message: 'Marker not found' });
          continue;
        }
        
        // Update the marker
        const updateData = {
          ...marker,
          version: (currentMarker.version || 1) + 1
        };
        
        const [updatedMarker] = await db
          .update(floorplanMarkers)
          .set(updateData)
          .where(eq(floorplanMarkers.id, marker.id))
          .returning();
        
        results.push({ id: marker.id, status: 'success', data: updatedMarker });
      }
      
      res.status(200).json({ results });
    } catch (error) {
      console.error('Error performing batch update of markers:', error);
      res.status(500).json({ error: 'Failed to perform batch update of markers' });
    }
  });
  
  // Delete markers by layer
  app.delete('/api/enhanced-floorplan/markers/layer/:layerId', async (req: Request, res: Response) => {
    try {
      const { layerId } = req.params;
      
      await db
        .delete(floorplanMarkers)
        .where(eq(floorplanMarkers.layer_id, parseInt(layerId)));
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting markers by layer:', error);
      res.status(500).json({ error: 'Failed to delete markers by layer' });
    }
  });
}