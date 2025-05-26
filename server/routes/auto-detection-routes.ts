import { Router } from 'express';
import { EquipmentAutoDetectionService } from '../services/equipment-auto-detection-service';

export const autoDetectionRoutes = Router();
const autoDetectionService = new EquipmentAutoDetectionService();

// Get equipment recommendations for a project
autoDetectionRoutes.get('/equipment-recommendations/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const recommendations = await autoDetectionService.generateEquipmentRecommendations(projectId);
    
    res.json({
      success: true,
      recommendations,
      message: 'Equipment recommendations generated successfully'
    });
  } catch (error) {
    console.error('Error getting equipment recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate equipment recommendations'
    });
  }
});

// Create equipment from suggestions
autoDetectionRoutes.post('/equipment-suggestions/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { suggestions } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    if (!suggestions || !Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Invalid suggestions data' });
    }

    const createdEquipment = await autoDetectionService.createEquipmentFromSuggestions(
      projectId, 
      suggestions
    );
    
    res.json({
      success: true,
      createdEquipment,
      message: `Successfully created ${createdEquipment.length} equipment items`
    });
  } catch (error) {
    console.error('Error creating equipment from suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create equipment from suggestions'
    });
  }
});