import { getGeminiProModel } from '../utils/gemini';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { 
  accessPoints, 
  cameras, 
  elevators, 
  intercoms 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

interface EquipmentField {
  name: string;
  value: string | null;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

interface EquipmentItem {
  id: string;
  type: 'camera' | 'access_point' | 'elevator' | 'intercom';
  name: string;
  fields: EquipmentField[];
  isComplete: boolean;
  quantity: number;
}

interface ProcessConfigurationRequest {
  message: string;
  projectId?: number;
  currentItems: EquipmentItem[];
}

interface ProcessConfigurationResponse {
  response: string;
  updatedItems: EquipmentItem[];
}

interface SubmitConfigurationRequest {
  items: EquipmentItem[];
  projectId?: number;
}

interface SubmitConfigurationResponse {
  success: boolean;
  message: string;
  createdEquipment: {
    cameras: number;
    accessPoints: number;
    elevators: number;
    intercoms: number;
  };
}

class EquipmentConfigurationService {
  /**
   * Process a natural language request to update the equipment configuration
   */
  async processConfigurationMessage(
    request: ProcessConfigurationRequest
  ): Promise<ProcessConfigurationResponse> {
    try {
      const { message, currentItems, projectId } = request;
      
      // Use a GEMINI_API_KEY to use Gemini for processing natural language
      const model = getGeminiProModel();
      
      // Prepare a context for the model with information about the current items
      const context = {
        currentItems: JSON.stringify(currentItems),
        projectId: projectId || null
      };
      
      // Create a prompt for the model
      const prompt = `
      You are an expert security equipment configuration assistant.
      
      User message: "${message}"
      
      Current equipment items: ${JSON.stringify(currentItems, null, 2)}
      
      Your task is to:
      1. Understand what the user wants to do with their security equipment configuration.
      2. Update the existing items or create new items based on the user's request.
      3. Return a natural language response to the user explaining what you did.
      
      When creating new items:
      - Generate a unique ID for each new item using UUID format.
      - Set appropriate default values for required fields.
      - Set isComplete to true/false based on whether all required fields are filled.
      
      For cameras:
      - Required fields: location, camera_type
      - Optional fields: resolution, mounting_type, field_of_view, is_indoor, import_to_gateway, notes
      
      For access points:
      - Required fields: location, reader_type, lock_type, monitoring_type, quick_config
      - Optional fields: takeover, lock_provider, interior_perimeter, exst_panel_location, exst_panel_type, installation_requirements, credential_type, strike_type, em_release, current_reader_model, current_panel_model, hinge_side, push_side, finish, mortise_type, cylinder_type, real_lock_type, notes
      
      For elevators:
      - Required fields: elevator_type
      - Optional fields: location, reader_type, floor_count, main_floor, shaft_count, shaft_speed, elevator_cab_model, notes
      
      For intercoms:
      - Required fields: location, intercom_type
      - Optional fields: notes
      
      Respond with a JSON object with:
      1. "response": A human-friendly message explaining what changes you made.
      2. "updatedItems": The updated array of equipment items.
      
      Format your response as valid JSON.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse the JSON response from the model
      try {
        const parsedResponse = JSON.parse(response);
        return {
          response: parsedResponse.response,
          updatedItems: parsedResponse.updatedItems
        };
      } catch (error) {
        console.error('Error parsing model response:', error);
        // Fallback response
        return {
          response: "I'm sorry, I encountered an error processing your request. Please try again with a more specific instruction.",
          updatedItems: currentItems
        };
      }
    } catch (error) {
      console.error('Error in equipment configuration process:', error);
      return {
        response: "I'm sorry, I encountered an error processing your request. Please try again later.",
        updatedItems: request.currentItems
      };
    }
  }

  /**
   * Submit the final equipment configuration to be saved in the database
   */
  async submitConfiguration(
    request: SubmitConfigurationRequest
  ): Promise<SubmitConfigurationResponse> {
    try {
      const { items, projectId } = request;
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      // Track created equipment
      const createdEquipment = {
        cameras: 0,
        accessPoints: 0,
        elevators: 0,
        intercoms: 0
      };
      
      // Process each item and insert into the appropriate database table
      const createPromises = items.map(async (item) => {
        // Common fields for all equipment types
        const commonFields = {
          project_id: projectId,
          notes: item.fields.find(f => f.name === 'notes')?.value || null
        };
        
        try {
          switch (item.type) {
            case 'camera': {
              // Extract camera-specific fields
              const cameraData = {
                ...commonFields,
                location: item.fields.find(f => f.name === 'location')?.value || '',
                camera_type: item.fields.find(f => f.name === 'camera_type')?.value || '',
                resolution: item.fields.find(f => f.name === 'resolution')?.value || null,
                mounting_type: item.fields.find(f => f.name === 'mounting_type')?.value || null,
                field_of_view: item.fields.find(f => f.name === 'field_of_view')?.value || null,
                is_indoor: item.fields.find(f => f.name === 'is_indoor')?.value === 'true' || null,
                import_to_gateway: item.fields.find(f => f.name === 'import_to_gateway')?.value === 'true' || null
              };
              
              const result = await db.insert(cameras).values(cameraData).returning();
              createdEquipment.cameras++;
              return result[0];
            }
            
            case 'access_point': {
              // Extract access point-specific fields
              const accessPointData = {
                ...commonFields,
                location: item.fields.find(f => f.name === 'location')?.value || '',
                reader_type: item.fields.find(f => f.name === 'reader_type')?.value || '',
                lock_type: item.fields.find(f => f.name === 'lock_type')?.value || '',
                monitoring_type: item.fields.find(f => f.name === 'monitoring_type')?.value || '',
                quick_config: item.fields.find(f => f.name === 'quick_config')?.value || 'Standard',
                takeover: item.fields.find(f => f.name === 'takeover')?.value || null,
                lock_provider: item.fields.find(f => f.name === 'lock_provider')?.value || null,
                interior_perimeter: item.fields.find(f => f.name === 'interior_perimeter')?.value || null,
                exst_panel_location: item.fields.find(f => f.name === 'exst_panel_location')?.value || null,
                exst_panel_type: item.fields.find(f => f.name === 'exst_panel_type')?.value || null,
                installation_requirements: item.fields.find(f => f.name === 'installation_requirements')?.value || null,
                credential_type: item.fields.find(f => f.name === 'credential_type')?.value || null,
                strike_type: item.fields.find(f => f.name === 'strike_type')?.value || null,
                em_release: item.fields.find(f => f.name === 'em_release')?.value || null,
                current_reader_model: item.fields.find(f => f.name === 'current_reader_model')?.value || null,
                current_panel_model: item.fields.find(f => f.name === 'current_panel_model')?.value || null,
                hinge_side: item.fields.find(f => f.name === 'hinge_side')?.value || null,
                push_side: item.fields.find(f => f.name === 'push_side')?.value || null,
                finish: item.fields.find(f => f.name === 'finish')?.value || null,
                mortise_type: item.fields.find(f => f.name === 'mortise_type')?.value || null,
                cylinder_type: item.fields.find(f => f.name === 'cylinder_type')?.value || null,
                real_lock_type: item.fields.find(f => f.name === 'real_lock_type')?.value || null
              };
              
              const result = await db.insert(accessPoints).values(accessPointData).returning();
              createdEquipment.accessPoints++;
              return result[0];
            }
            
            case 'elevator': {
              // Extract elevator-specific fields
              const elevatorData = {
                ...commonFields,
                location: item.fields.find(f => f.name === 'location')?.value || null,
                reader_type: item.fields.find(f => f.name === 'reader_type')?.value || null,
                elevator_type: item.fields.find(f => f.name === 'elevator_type')?.value || null,
                floor_count: parseInt(item.fields.find(f => f.name === 'floor_count')?.value || '0') || null,
                main_floor: parseInt(item.fields.find(f => f.name === 'main_floor')?.value || '1') || null,
                shaft_count: parseInt(item.fields.find(f => f.name === 'shaft_count')?.value || '0') || null,
                shaft_speed: item.fields.find(f => f.name === 'shaft_speed')?.value || null,
                elevator_cab_model: item.fields.find(f => f.name === 'elevator_cab_model')?.value || null
              };
              
              const result = await db.insert(elevators).values(elevatorData).returning();
              createdEquipment.elevators++;
              return result[0];
            }
            
            case 'intercom': {
              // Extract intercom-specific fields
              const intercomData = {
                ...commonFields,
                location: item.fields.find(f => f.name === 'location')?.value || '',
                intercom_type: item.fields.find(f => f.name === 'intercom_type')?.value || '',
              };
              
              const result = await db.insert(intercoms).values(intercomData).returning();
              createdEquipment.intercoms++;
              return result[0];
            }
            
            default:
              throw new Error(`Unknown equipment type: ${item.type}`);
          }
        } catch (error) {
          console.error(`Error creating ${item.type}:`, error);
          throw error;
        }
      });
      
      // Wait for all equipment to be created
      await Promise.all(createPromises);
      
      return {
        success: true,
        message: `Successfully created ${createdEquipment.cameras} cameras, ${createdEquipment.accessPoints} access points, ${createdEquipment.elevators} elevators, and ${createdEquipment.intercoms} intercoms.`,
        createdEquipment
      };
    } catch (error) {
      console.error('Error in equipment configuration submission:', error);
      return {
        success: false,
        message: `Error submitting equipment configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdEquipment: {
          cameras: 0,
          accessPoints: 0,
          elevators: 0,
          intercoms: 0
        }
      };
    }
  }
}

export const equipmentConfigurationService = new EquipmentConfigurationService();