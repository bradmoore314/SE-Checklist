import type { Express, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import { 
  floorplanMarkers, 
  markerComments,
  InsertFloorplanMarker,
  insertFloorplanMarkerSchema,
} from '@shared/schema';

/**
 * Register enhanced marker API routes for Bluebeam-like functionality
 * 
 * These routes handle PDF coordinate-based markers with:
 * - Version tracking
 * - Layer organization
 * - Enhanced styling properties
 */
export function registerEnhancedMarkerAPI(app: Express, isAuthenticated: any) {
  
  // Get all markers for a floorplan with optional filtering
  app.get('/api/enhanced-floorplan/:floorplanId/markers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const layerId = req.query.layer_id ? parseInt(req.query.layer_id as string) : undefined;
      const markerType = req.query.marker_type as string | undefined;
      
      // Build conditions for the query
      let conditions = [eq(floorplanMarkers.floorplan_id, floorplanId)];
      
      if (page !== undefined) {
        conditions.push(eq(floorplanMarkers.page, page));
      }
      
      if (layerId !== undefined) {
        conditions.push(eq(floorplanMarkers.layer_id, layerId));
      }
      
      if (markerType) {
        conditions.push(eq(floorplanMarkers.marker_type, markerType));
      }
      
      // Execute the query with all conditions
      const markers = await db.select().from(floorplanMarkers)
        .where(and(...conditions));
      res.json(markers);
    } catch (error) {
      console.error('Error fetching enhanced markers:', error);
      res.status(500).json({ message: 'Error fetching enhanced markers' });
    }
  });
  
  // Create a new enhanced marker
  app.post('/api/enhanced-floorplan/:floorplanId/markers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      
      // Get user information for the marker
      const authorId = req.user?.id;
      const authorName = req.user?.fullName || req.user?.username || 'Anonymous';
      
      // Validate marker data with Zod schema
      const result = insertFloorplanMarkerSchema.safeParse({
        ...req.body,
        floorplan_id: floorplanId,
        author_id: authorId,
        author_name: authorName
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid marker data', 
          errors: result.error.errors
        });
      }
      
      // Insert the new marker
      const [newMarker] = await db.insert(floorplanMarkers)
        .values(result.data as InsertFloorplanMarker)
        .returning();
      
      res.status(201).json(newMarker);
    } catch (error) {
      console.error('Error creating enhanced marker:', error);
      res.status(500).json({ message: 'Error creating enhanced marker' });
    }
  });
  
  // Get a specific marker with its comments
  app.get('/api/enhanced-markers/:markerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      // Get marker data
      const [marker] = await db.select().from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, markerId));
      
      if (!marker) {
        return res.status(404).json({ message: 'Marker not found' });
      }
      
      // Get associated comments
      const comments = await db.select().from(markerComments)
        .where(eq(markerComments.marker_id, markerId))
        .orderBy(desc(markerComments.created_at));
      
      // Return combined data
      res.json({
        marker,
        comments
      });
    } catch (error) {
      console.error('Error fetching enhanced marker:', error);
      res.status(500).json({ message: 'Error fetching enhanced marker' });
    }
  });
  
  // Update an existing marker (creates a new version)
  app.patch('/api/enhanced-markers/:markerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      // Get the current marker data
      const [currentMarker] = await db.select().from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, markerId));
      
      if (!currentMarker) {
        return res.status(404).json({ message: 'Marker not found' });
      }
      
      // Get user information for versioning
      const authorId = req.user?.id;
      const authorName = req.user?.fullName || req.user?.username || 'Anonymous';
      
      // Create an updated version of the marker
      // Note: We're creating a new version rather than modifying in place
      // This implements Bluebeam-like versioning for change tracking
      const newVersion = {
        ...currentMarker,
        ...req.body,
        id: undefined, // Let the database assign a new ID
        unique_id: currentMarker.unique_id, // Keep the same unique ID for version tracking
        version: (currentMarker.version || 1) + 1,
        parent_id: currentMarker.id, // Reference the previous version
        author_id: authorId,
        author_name: authorName,
        updated_at: new Date()
      };
      
      // Validate the new version data
      const result = insertFloorplanMarkerSchema.safeParse(newVersion);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid marker data for update', 
          errors: result.error.errors
        });
      }
      
      // Insert the new version
      const [updatedMarker] = await db.insert(floorplanMarkers)
        .values(result.data as InsertFloorplanMarker)
        .returning();
      
      res.json(updatedMarker);
    } catch (error) {
      console.error('Error updating enhanced marker:', error);
      res.status(500).json({ message: 'Error updating enhanced marker' });
    }
  });
  
  // Delete a marker
  app.delete('/api/enhanced-markers/:markerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      // Get the marker to be deleted
      const [marker] = await db.select().from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, markerId));
      
      if (!marker) {
        return res.status(404).json({ message: 'Marker not found' });
      }
      
      // Check permissions (optional - depending on your requirements)
      // For example, only marker creator or admin can delete
      if (req.user?.id !== marker.author_id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Delete the marker
      const [deletedMarker] = await db.delete(floorplanMarkers)
        .where(eq(floorplanMarkers.id, markerId))
        .returning();
      
      // Also delete any comments associated with this marker
      await db.delete(markerComments)
        .where(eq(markerComments.marker_id, markerId));
      
      res.json({ message: 'Marker deleted', marker: deletedMarker });
    } catch (error) {
      console.error('Error deleting enhanced marker:', error);
      res.status(500).json({ message: 'Error deleting enhanced marker' });
    }
  });
  
  // Get marker version history
  app.get('/api/enhanced-markers/:markerId/history', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      // Get the current marker
      const [marker] = await db.select().from(floorplanMarkers)
        .where(eq(floorplanMarkers.id, markerId));
      
      if (!marker) {
        return res.status(404).json({ message: 'Marker not found' });
      }
      
      // Find all versions with the same unique_id
      const versionHistory = await db.select().from(floorplanMarkers)
        .where(eq(floorplanMarkers.unique_id, marker.unique_id))
        .orderBy(desc(floorplanMarkers.version));
      
      res.json(versionHistory);
    } catch (error) {
      console.error('Error fetching marker version history:', error);
      res.status(500).json({ message: 'Error fetching marker version history' });
    }
  });
}