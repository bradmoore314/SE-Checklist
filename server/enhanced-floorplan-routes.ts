import type { Express, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { 
  floorplanLayers,
  floorplanCalibrations,
  markerComments,
  InsertFloorplanLayer,
  InsertFloorplanCalibration,
  InsertMarkerComment,
  insertFloorplanLayerSchema,
  insertFloorplanCalibrationSchema,
  insertMarkerCommentSchema
} from '@shared/schema';

/**
 * Register enhanced floorplan routes for Bluebeam-like functionality
 * 
 * These routes handle advanced PDF coordinate system features:
 * - Layers for organizing markers by type
 * - Calibration data for scale measurements
 * - Comments for marker collaboration
 */
export function registerEnhancedFloorplanRoutes(app: Express, isAuthenticated: any) {
  
  /**
   * Layers API Endpoints
   */
  
  // Get all layers for a floorplan
  app.get('/api/floorplans/:floorplanId/layers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      const layers = await db.select().from(floorplanLayers).where(eq(floorplanLayers.floorplan_id, floorplanId));
      
      res.json(layers);
    } catch (error) {
      console.error('Error fetching floorplan layers:', error);
      res.status(500).json({ message: 'Error fetching floorplan layers' });
    }
  });
  
  // Create a new layer for a floorplan
  app.post('/api/floorplans/:floorplanId/layers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      
      // Validate layer data
      const result = insertFloorplanLayerSchema.safeParse({
        ...req.body,
        floorplan_id: floorplanId
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid layer data', 
          errors: result.error.errors
        });
      }
      
      // Insert layer
      const [newLayer] = await db.insert(floorplanLayers)
        .values(result.data as InsertFloorplanLayer)
        .returning();
      
      res.status(201).json(newLayer);
    } catch (error) {
      console.error('Error creating floorplan layer:', error);
      res.status(500).json({ message: 'Error creating floorplan layer' });
    }
  });
  
  // Update layer properties (visibility, color, name)
  app.patch('/api/floorplan-layers/:layerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const layerId = parseInt(req.params.layerId);
      
      // Get current layer data
      const [currentLayer] = await db.select().from(floorplanLayers).where(eq(floorplanLayers.id, layerId));
      
      if (!currentLayer) {
        return res.status(404).json({ message: 'Layer not found' });
      }
      
      // Update only provided fields
      const updatedData = {
        ...currentLayer,
        ...req.body,
        updated_at: new Date()
      };
      
      const [updatedLayer] = await db.update(floorplanLayers)
        .set(updatedData)
        .where(eq(floorplanLayers.id, layerId))
        .returning();
      
      res.json(updatedLayer);
    } catch (error) {
      console.error('Error updating floorplan layer:', error);
      res.status(500).json({ message: 'Error updating floorplan layer' });
    }
  });
  
  // Delete a layer
  app.delete('/api/floorplan-layers/:layerId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const layerId = parseInt(req.params.layerId);
      
      const [deletedLayer] = await db.delete(floorplanLayers)
        .where(eq(floorplanLayers.id, layerId))
        .returning();
      
      if (!deletedLayer) {
        return res.status(404).json({ message: 'Layer not found' });
      }
      
      res.json({ message: 'Layer deleted', layer: deletedLayer });
    } catch (error) {
      console.error('Error deleting floorplan layer:', error);
      res.status(500).json({ message: 'Error deleting floorplan layer' });
    }
  });
  
  /**
   * Calibration API Endpoints
   */
  
  // Get calibration for a floorplan page
  app.get('/api/floorplans/:floorplanId/calibrations/:page', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      const page = parseInt(req.params.page);
      
      const [calibration] = await db.select().from(floorplanCalibrations)
        .where(and(
          eq(floorplanCalibrations.floorplan_id, floorplanId),
          eq(floorplanCalibrations.page, page)
        ));
      
      if (!calibration) {
        return res.status(404).json({ message: 'Calibration not found' });
      }
      
      res.json(calibration);
    } catch (error) {
      console.error('Error fetching calibration:', error);
      res.status(500).json({ message: 'Error fetching calibration' });
    }
  });
  
  // Create or update calibration for a floorplan page
  app.post('/api/floorplans/:floorplanId/calibrations/:page', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.floorplanId);
      const page = parseInt(req.params.page);
      
      // Validate calibration data
      const result = insertFloorplanCalibrationSchema.safeParse({
        ...req.body,
        floorplan_id: floorplanId,
        page
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid calibration data', 
          errors: result.error.errors
        });
      }
      
      // Check if calibration exists for this page
      const [existingCalibration] = await db.select().from(floorplanCalibrations)
        .where(and(
          eq(floorplanCalibrations.floorplan_id, floorplanId),
          eq(floorplanCalibrations.page, page)
        ));
      
      if (existingCalibration) {
        // Update existing calibration
        const [updatedCalibration] = await db.update(floorplanCalibrations)
          .set({
            ...result.data as InsertFloorplanCalibration,
            updated_at: new Date()
          })
          .where(eq(floorplanCalibrations.id, existingCalibration.id))
          .returning();
        
        return res.json(updatedCalibration);
      }
      
      // Insert new calibration
      const [newCalibration] = await db.insert(floorplanCalibrations)
        .values(result.data as InsertFloorplanCalibration)
        .returning();
      
      res.status(201).json(newCalibration);
    } catch (error) {
      console.error('Error setting calibration:', error);
      res.status(500).json({ message: 'Error setting calibration' });
    }
  });
  
  /**
   * Marker Comments API Endpoints
   */
  
  // Get comments for a marker
  app.get('/api/markers/:markerId/comments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      const comments = await db.select().from(markerComments)
        .where(eq(markerComments.marker_id, markerId));
      
      res.json(comments);
    } catch (error) {
      console.error('Error fetching marker comments:', error);
      res.status(500).json({ message: 'Error fetching marker comments' });
    }
  });
  
  // Add a comment to a marker
  app.post('/api/markers/:markerId/comments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const markerId = parseInt(req.params.markerId);
      
      // Get user information for the comment
      const authorId = req.user?.id;
      const authorName = req.user?.fullName || req.user?.username || 'Anonymous';
      
      // Validate comment data
      const result = insertMarkerCommentSchema.safeParse({
        ...req.body,
        marker_id: markerId,
        author_id: authorId,
        author_name: authorName
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid comment data', 
          errors: result.error.errors
        });
      }
      
      // Insert comment
      const [newComment] = await db.insert(markerComments)
        .values(result.data as InsertMarkerComment)
        .returning();
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error adding marker comment:', error);
      res.status(500).json({ message: 'Error adding marker comment' });
    }
  });
  
  // Delete a comment
  app.delete('/api/marker-comments/:commentId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);
      
      // Check if user has permission to delete the comment
      const [comment] = await db.select().from(markerComments)
        .where(eq(markerComments.id, commentId));
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      // Allow comment deletion if user is the author or has admin role
      if (req.user?.id !== comment.author_id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      const [deletedComment] = await db.delete(markerComments)
        .where(eq(markerComments.id, commentId))
        .returning();
      
      res.json({ message: 'Comment deleted', comment: deletedComment });
    } catch (error) {
      console.error('Error deleting marker comment:', error);
      res.status(500).json({ message: 'Error deleting marker comment' });
    }
  });
}