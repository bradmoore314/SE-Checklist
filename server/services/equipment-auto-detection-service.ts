import { getAzureOpenAIClient, createChatMessage } from "../utils/azure-openai";
import { db } from "../db";
import { accessPoints, cameras, elevators, intercoms } from "@shared/schema";

/**
 * Service for equipment auto-detection and recommendations
 * Note: Floorplan functionality has been removed to simplify the application
 */

export interface EquipmentSuggestion {
  type: 'access_point' | 'camera' | 'elevator' | 'intercom';
  location: string;
  notes?: string;
  confidence: number;
}

export interface CreatedEquipment {
  id: number;
  type: string;
  label: string;
  notes: string | null;
}

export class EquipmentAutoDetectionService {
  
  /**
   * Create equipment items based on suggestions
   */
  async createEquipmentFromSuggestions(
    projectId: number,
    suggestions: EquipmentSuggestion[]
  ): Promise<CreatedEquipment[]> {
    const createdEquipment: CreatedEquipment[] = [];

    for (const suggestion of suggestions) {
      let equipmentId: number | null = null;
      let label = suggestion.location;

      try {
        // Create equipment based on type
        switch (suggestion.type) {
          case 'access_point':
            const [accessPoint] = await db.insert(accessPoints).values({
              project_id: projectId,
              location: suggestion.location,
              quick_config: 'Standard',
              reader_type: 'Standard Reader',
              lock_type: 'Electric Strike',
              monitoring_type: 'Door Position Switch',
              notes: suggestion.notes || 'Auto-detected equipment'
            }).returning();
            equipmentId = accessPoint.id;
            break;

          case 'camera':
            const [camera] = await db.insert(cameras).values({
              project_id: projectId,
              location: suggestion.location,
              camera_type: 'IP Camera',
              mounting_type: 'Wall Mount',
              resolution: '1080p',
              notes: suggestion.notes || 'Auto-detected equipment'
            }).returning();
            equipmentId = camera.id;
            break;

          case 'elevator':
            const [elevator] = await db.insert(elevators).values({
              project_id: projectId,
              location: suggestion.location,
              elevator_type: 'Passenger',
              notes: suggestion.notes || 'Auto-detected equipment'
            }).returning();
            equipmentId = elevator.id;
            break;

          case 'intercom':
            const [intercom] = await db.insert(intercoms).values({
              project_id: projectId,
              location: suggestion.location,
              intercom_type: 'Audio/Video',
              notes: suggestion.notes || 'Auto-detected equipment'
            }).returning();
            equipmentId = intercom.id;
            break;
        }

        if (equipmentId) {
          createdEquipment.push({
            id: equipmentId,
            type: suggestion.type,
            label: label,
            notes: suggestion.notes || null
          });
        }

      } catch (error) {
        console.error(`Error creating ${suggestion.type} equipment:`, error);
      }
    }

    return createdEquipment;
  }

  /**
   * Generate equipment recommendations for a project
   */
  async generateEquipmentRecommendations(
    projectId: number,
    buildingInfo?: string
  ): Promise<EquipmentSuggestion[]> {
    try {
      // Basic equipment suggestions based on common building requirements
      const suggestions: EquipmentSuggestion[] = [
        {
          type: 'access_point',
          location: 'Main Entrance',
          notes: 'Primary building access control',
          confidence: 0.9
        },
        {
          type: 'camera',
          location: 'Lobby Area',
          notes: 'Surveillance for main lobby',
          confidence: 0.85
        }
      ];

      return suggestions;
    } catch (error) {
      console.error('Error generating equipment recommendations:', error);
      return [];
    }
  }
}