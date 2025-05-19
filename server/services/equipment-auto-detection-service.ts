import { getAzureOpenAIClient, createChatMessage } from "../utils/azure-openai";
import { db } from "../db";
import { accessPoints, cameras, elevators, intercoms, floorplanMarkers } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Service for automatically detecting and suggesting equipment placement 
 * on floorplans using Azure OpenAI's secure environment
 * 
 * This service uses Kastle's secure Azure OpenAI deployment, ensuring:
 * - All image processing occurs within Kastle's protected infrastructure
 * - Enhanced security and compliance with enterprise requirements
 * - Secure handling of sensitive floorplan data
 */
export class EquipmentAutoDetectionService {
  
  /**
   * Analyze a floorplan image and suggest equipment placements
   * @param projectId Project ID
   * @param floorplanId Floorplan ID
   * @param imageBase64 Base64 encoded image data
   * @param page Page number of the floorplan
   */
  async analyzeFloorplan(
    projectId: number,
    floorplanId: number,
    imageBase64: string,
    page: number
  ): Promise<EquipmentSuggestionResult> {
    try {
      // Get the Azure OpenAI client
      const openai = getAzureOpenAIClient();

      // Create the prompt with detailed instructions
      const prompt = `
      You are a security system design expert tasked with analyzing a building floor plan.
      
      Analyze this floor plan image and identify optimal locations for the following security equipment:
      1. Access Control/Door Access Points: Look for main entrances, emergency exits, and secure areas.
      2. Security Cameras: Look for corners with good coverage, entrances, hallways, stairwells.
      3. Intercoms: Look for main entrances and reception areas.
      4. Elevators: Identify elevator shafts or areas in the plan.
      
      For each piece of equipment you identify, provide:
      - Equipment type (access_point, camera, intercom, elevator)
      - X,Y coordinates as percentages of the image width and height (0-100)
      - Confidence level (0.1-1.0)
      - Brief justification for the placement
      
      Focus only on the security equipment types listed above. Do not suggest other equipment.
      Limit your suggestions to what you can clearly identify from the floor plan.
      Format your response as a structured JSON object like this:
      {
        "suggestions": [
          {
            "type": "camera",
            "position_x": 75.5,
            "position_y": 32.1,
            "confidence": 0.85,
            "notes": "Northeast corner with view of main hallway and entrance"
          },
          ...
        ]
      }
      `;

      // Process the image with the prompt using Azure OpenAI through Kastle's secure environment
      // Note: For Azure OpenAI, we need to encode the image as base64 in a specific format
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      });
      
      const text = response.choices[0].message.content || "";
      
      // Parse JSON response
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in response");
        }
        
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        // Process suggestions and return results
        return this.processSuggestions(projectId, floorplanId, page, parsedResponse.suggestions);
      } catch (jsonError) {
        console.error("Error parsing AI response:", jsonError);
        throw new Error("Failed to parse equipment suggestions from AI response");
      }
    } catch (error) {
      console.error("Error in AI equipment detection:", error);
      throw new Error("Failed to analyze floorplan for automated equipment placement");
    }
  }

  /**
   * Process equipment suggestions and prepare for database
   */
  private async processSuggestions(
    projectId: number, 
    floorplanId: number, 
    page: number,
    suggestions: EquipmentSuggestion[]
  ): Promise<EquipmentSuggestionResult> {
    // Group suggestions by equipment type
    const groupedSuggestions: Record<string, EquipmentSuggestion[]> = {
      access_point: [],
      camera: [],
      intercom: [],
      elevator: []
    };

    // Filter and group valid suggestions
    const validSuggestions = suggestions.filter(s => 
      ['access_point', 'camera', 'intercom', 'elevator'].includes(s.type) &&
      s.position_x >= 0 && s.position_x <= 100 &&
      s.position_y >= 0 && s.position_y <= 100 &&
      s.confidence > 0
    );

    // Group by type
    validSuggestions.forEach(s => {
      if (groupedSuggestions[s.type]) {
        groupedSuggestions[s.type].push(s);
      }
    });

    // Build result with equipment counts
    const result: EquipmentSuggestionResult = {
      total: validSuggestions.length,
      suggestions: validSuggestions,
      summary: {
        access_points: groupedSuggestions.access_point.length,
        cameras: groupedSuggestions.camera.length,
        intercoms: groupedSuggestions.intercom.length,
        elevators: groupedSuggestions.elevator.length
      }
    };

    return result;
  }

  /**
   * Create equipment from suggestions and add to database
   */
  async createEquipmentFromSuggestions(
    projectId: number,
    floorplanId: number,
    page: number,
    suggestions: EquipmentSuggestion[],
    autoPlace: boolean = false
  ): Promise<CreatedEquipment[]> {
    const createdEquipment: CreatedEquipment[] = [];

    for (const suggestion of suggestions) {
      let equipmentId: number | null = null;
      let label = '';

      try {
        // Create the appropriate equipment type
        switch (suggestion.type) {
          case 'access_point':
            const defaultReader = 'card_reader';
            label = `Access Point ${suggestion.notes ? `(${suggestion.notes})` : ''}`;
            const [accessPoint] = await db.insert(accessPoints).values({
              project_id: projectId,
              location: suggestion.notes || 'AI Suggested Location',
              quick_config: 'Standard Door',
              reader_type: defaultReader,
              lock_type: 'magnetic',
              monitoring_type: 'standard',
            }).returning();
            equipmentId = accessPoint.id;
            break;

          case 'camera':
            label = `Camera ${suggestion.notes ? `(${suggestion.notes})` : ''}`;
            const [camera] = await db.insert(cameras).values({
              project_id: projectId,
              location: suggestion.notes || 'AI Suggested Location',
              camera_type: 'fixed',
            }).returning();
            equipmentId = camera.id;
            break;

          case 'elevator':
            label = `Elevator ${suggestion.notes ? `(${suggestion.notes})` : ''}`;
            const [elevator] = await db.insert(elevators).values({
              project_id: projectId,
              location: suggestion.notes || 'AI Suggested Location',
            }).returning();
            equipmentId = elevator.id;
            break;

          case 'intercom':
            label = `Intercom ${suggestion.notes ? `(${suggestion.notes})` : ''}`;
            const [intercom] = await db.insert(intercoms).values({
              project_id: projectId,
              location: suggestion.notes || 'AI Suggested Location',
              intercom_type: 'standard',
            }).returning();
            equipmentId = intercom.id;
            break;
        }

        // If equipment was created and auto-place is enabled, create a marker
        if (equipmentId && autoPlace) {
          const [marker] = await db.insert(floorplanMarkers).values({
            floorplan_id: floorplanId,
            page: page,
            marker_type: suggestion.type,
            equipment_id: equipmentId,
            position_x: suggestion.position_x,
            position_y: suggestion.position_y,
            label: label,
          }).returning();

          createdEquipment.push({
            id: equipmentId,
            type: suggestion.type,
            label: label,
            marker_id: marker.id,
            position_x: suggestion.position_x,
            position_y: suggestion.position_y,
            notes: suggestion.notes || null
          });
        } else if (equipmentId) {
          // Equipment created but not placed on floorplan
          createdEquipment.push({
            id: equipmentId,
            type: suggestion.type,
            label: label,
            marker_id: null,
            position_x: null,
            position_y: null,
            notes: suggestion.notes || null
          });
        }
      } catch (error) {
        console.error(`Error creating ${suggestion.type}:`, error);
      }
    }

    return createdEquipment;
  }

  /**
   * Get equipment recommendations for a floorplan
   * This is used to provide suggestions without actually creating equipment
   */
  async getEquipmentRecommendations(
    projectId: number,
    floorplanId: number
  ): Promise<EquipmentRecommendation[]> {
    // In a real implementation, this would analyze historical data
    // For this example, we'll return some static recommendations
    const recommendations: EquipmentRecommendation[] = [
      { type: 'camera', count: 4, confidence: 0.8 },
      { type: 'access_point', count: 2, confidence: 0.7 },
      { type: 'intercom', count: 1, confidence: 0.6 }
    ];
    
    return recommendations;
  }
}

// Types for the service
export interface EquipmentSuggestion {
  type: 'access_point' | 'camera' | 'intercom' | 'elevator';
  position_x: number;
  position_y: number;
  confidence: number;
  notes?: string;
}

export interface EquipmentSuggestionResult {
  total: number;
  suggestions: EquipmentSuggestion[];
  summary: {
    access_points: number;
    cameras: number;
    intercoms: number;
    elevators: number;
  };
}

export interface CreatedEquipment {
  id: number;
  type: string;
  label: string;
  marker_id: number | null;
  position_x: number | null;
  position_y: number | null;
  notes: string | null;
}

export interface EquipmentRecommendation {
  type: string;
  count: number;
  confidence: number;
}