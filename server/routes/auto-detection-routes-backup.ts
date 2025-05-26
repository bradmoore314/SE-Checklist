import { Router } from 'express';
import { EquipmentAutoDetectionService } from '../services/equipment-auto-detection-service';
import { db } from '../db';
// Floorplan functionality removed
import { eq } from 'drizzle-orm';
import PDFDocument from 'pdf-lib';
import fetch from 'node-fetch';

export const autoDetectionRoutes = Router();
const autoDetectionService = new EquipmentAutoDetectionService();

/**
 * Analyze a floorplan for potential equipment placement
 */
autoDetectionRoutes.post('/projects/:projectId/floorplans/:floorplanId/analyze', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const floorplanId = parseInt(req.params.floorplanId);
    const { page, imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required for analysis' });
    }
    
    const result = await autoDetectionService.analyzeFloorplan(
      projectId,
      floorplanId,
      imageBase64,
      page || 1
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing floorplan:', error);
    res.status(500).json({ error: 'Failed to analyze floorplan' });
  }
});

/**
 * Create equipment based on suggestions
 */
autoDetectionRoutes.post('/projects/:projectId/floorplans/:floorplanId/create-from-suggestions', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const floorplanId = parseInt(req.params.floorplanId);
    const { page, suggestions, autoPlace } = req.body;
    
    if (!suggestions || !Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Valid suggestions are required' });
    }
    
    const equipment = await autoDetectionService.createEquipmentFromSuggestions(
      projectId,
      floorplanId,
      page || 1,
      suggestions,
      autoPlace || false
    );
    
    res.json({ 
      success: true, 
      message: `Created ${equipment.length} equipment items`,
      equipment 
    });
  } catch (error) {
    console.error('Error creating equipment from suggestions:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

/**
 * Get recommendations for equipment on a floorplan
 */
autoDetectionRoutes.get('/projects/:projectId/floorplans/:floorplanId/recommendations', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const floorplanId = parseInt(req.params.floorplanId);
    
    const recommendations = await autoDetectionService.getEquipmentRecommendations(
      projectId,
      floorplanId
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting equipment recommendations:', error);
    res.status(500).json({ error: 'Failed to get equipment recommendations' });
  }
});

/**
 * Auto-detect and create equipment for a floorplan in one step
 */
autoDetectionRoutes.post('/projects/:projectId/floorplans/:floorplanId/auto-detect', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const floorplanId = parseInt(req.params.floorplanId);
    const { page, autoPlace } = req.body;
    
    // Note: Floorplan functionality has been removed
    return res.status(404).json({ error: 'Floorplan functionality has been removed' });
    
    // 2. Convert PDF page to image
    let imageBase64;
    try {
      // Convert Base64 PDF data to a PDF document
      const pdfData = Buffer.from(floorplan.pdf_data, 'base64');
      const pdfDoc = await PDFDocument.PDFDocument.load(pdfData);
      
      // Determine page number (use requested page or default to 1)
      const pageToUse = page || 1;
      if (pageToUse > pdfDoc.getPageCount()) {
        return res.status(400).json({ error: 'Invalid page number' });
      }
      
      // Render PDF page to PNG (simplified - in a real implementation would use PDF.js or similar)
      // For this example, we're using a placeholder image
      imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      
      // In a real implementation, this would be:
      // 1. Render the PDF to a canvas
      // 2. Get the base64 data from the canvas
    } catch (pdfError) {
      console.error('Error converting PDF to image:', pdfError);
      return res.status(500).json({ error: 'Failed to process PDF floorplan' });
    }
    
    // 3. Analyze the image to detect potential equipment
    const analysisResult = await autoDetectionService.analyzeFloorplan(
      projectId,
      floorplanId,
      imageBase64,
      page || 1
    );
    
    // 4. Create the suggested equipment
    const equipment = await autoDetectionService.createEquipmentFromSuggestions(
      projectId,
      floorplanId,
      page || 1,
      analysisResult.suggestions,
      autoPlace || false
    );
    
    res.json({
      success: true,
      message: `Created ${equipment.length} equipment items`,
      analysis: analysisResult,
      equipment
    });
  } catch (error) {
    console.error('Error in auto-detection process:', error);
    res.status(500).json({ error: 'Failed to auto-detect equipment' });
  }
});