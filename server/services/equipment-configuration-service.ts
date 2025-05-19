import { getAzureOpenAIClient } from '../utils/azure-openai';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Process a configuration message with the Gemini model and update equipment items
 */
export async function processConfigurationMessage(
  message: string,
  projectId: number,
  currentItems: EquipmentItem[]
): Promise<{ response: string; updatedItems: EquipmentItem[] }> {
  try {
    // Initialize Azure OpenAI client
    const openai = getAzureOpenAIClient();
    
    // Get project details
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Create a prompt with the current context
    const prompt = createSystemPrompt(project, currentItems);

    // Process with Azure OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a security equipment specialist AI assistant." },
        { role: "user", content: prompt },
        { role: "assistant", content: 'I understand. I will help configure security equipment for the project.' },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      max_tokens: 1024
    });

    const responseText = response.choices[0].message.content || "";
    console.log('Azure OpenAI response:', responseText);

    // Parse the response to extract any equipment modifications
    const updatedItems = processAzureOpenAIResponse(responseText, currentItems);

    return {
      response,
      updatedItems,
    };
  } catch (error) {
    console.error('Error processing configuration with Gemini:', error);
    throw error;
  }
}

/**
 * Create a system prompt for Gemini with current context
 */
function createSystemPrompt(project: any, currentItems: EquipmentItem[]): string {
  const itemSummary = currentItems.length > 0
    ? `Current equipment (${currentItems.length} items):\n${currentItems.map(item => 
      `- ${item.name} (${item.type.replace('_', ' ')})${item.isComplete ? ' [Complete]' : ' [Incomplete]'}`
    ).join('\n')}`
    : 'No equipment items configured yet.';

  return `
You are an AI assistant helping to configure security equipment for a building security project.

Project: ${project.name}
Location: ${project.address || 'Unknown'}
Client: ${project.client || 'Unknown'}

${itemSummary}

Your task is to help the user configure security equipment by:
1. Understanding their natural language requests about adding, modifying, or removing security equipment
2. Providing helpful explanations about security equipment types and configurations
3. Answering questions about best practices for security equipment placement

If the user asks to add new equipment, create a new entry with appropriate fields.
If they want to modify existing equipment, update the relevant fields.
If they ask to remove equipment, confirm before removing.

Respond conversationally and provide specific equipment configuration suggestions.
`;
}

/**
 * Process Gemini's response to extract equipment modifications
 * In a real implementation, this would use more sophisticated NLP
 * to understand Gemini's response and apply changes to equipment items
 */
function processGeminiResponse(response: string, currentItems: EquipmentItem[]): EquipmentItem[] {
  // For now, this is a simple implementation that returns the original items
  // In a real implementation, we would extract equipment modifications from the response
  return [...currentItems];
}

/**
 * Submit and save equipment configuration to the database
 */
export async function submitConfiguration(
  items: EquipmentItem[],
  projectId: number
): Promise<{ success: boolean; message: string; savedItems: any[] }> {
  try {
    // Get project details
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Validate all items are complete
    const incompleteItems = items.filter(item => !item.isComplete);
    if (incompleteItems.length > 0) {
      throw new Error(`${incompleteItems.length} items have missing required fields`);
    }

    // Save each item to the appropriate database table
    const savedItems = [];

    for (const item of items) {
      let savedItem;
      
      switch (item.type) {
        case 'camera':
          savedItem = await saveCamera(item, projectId);
          break;
        case 'access_point':
          savedItem = await saveAccessPoint(item, projectId);
          break;
        case 'elevator':
          savedItem = await saveElevator(item, projectId);
          break;
        case 'intercom':
          savedItem = await saveIntercom(item, projectId);
          break;
      }

      if (savedItem) {
        savedItems.push(savedItem);
      }
    }

    return {
      success: true,
      message: `Successfully saved ${savedItems.length} equipment items to project ${project.name}`,
      savedItems,
    };
  } catch (error) {
    console.error('Error saving equipment configuration:', error);
    throw error;
  }
}

/**
 * Save a camera item to the database
 */
async function saveCamera(item: EquipmentItem, projectId: number) {
  // Extract field values
  const locationField = item.fields.find(f => f.name === 'location');
  const cameraTypeField = item.fields.find(f => f.name === 'camera_type');
  const resolutionField = item.fields.find(f => f.name === 'resolution');
  const mountingTypeField = item.fields.find(f => f.name === 'mounting_type');
  const fieldOfViewField = item.fields.find(f => f.name === 'field_of_view');
  const isIndoorField = item.fields.find(f => f.name === 'is_indoor');
  const importToGatewayField = item.fields.find(f => f.name === 'import_to_gateway');
  const notesField = item.fields.find(f => f.name === 'notes');

  // Create camera object
  const camera = {
    project_id: projectId,
    location: locationField?.value || '',
    camera_type: cameraTypeField?.value || '',
    resolution: resolutionField?.value,
    mounting_type: mountingTypeField?.value,
    field_of_view: fieldOfViewField?.value,
    is_indoor: isIndoorField?.value === 'true',
    import_to_gateway: importToGatewayField?.value === 'true',
    notes: notesField?.value,
  };

  // Save to database
  return await storage.createCamera(camera);
}

/**
 * Save an access point item to the database
 */
async function saveAccessPoint(item: EquipmentItem, projectId: number) {
  // Extract field values
  const locationField = item.fields.find(f => f.name === 'location');
  const readerTypeField = item.fields.find(f => f.name === 'reader_type');
  const lockTypeField = item.fields.find(f => f.name === 'lock_type');
  const monitoringTypeField = item.fields.find(f => f.name === 'monitoring_type');
  const quickConfigField = item.fields.find(f => f.name === 'quick_config');
  const takeoverField = item.fields.find(f => f.name === 'takeover');
  const lockProviderField = item.fields.find(f => f.name === 'lock_provider');
  const notesField = item.fields.find(f => f.name === 'notes');

  // Create access point object
  const accessPoint = {
    project_id: projectId,
    location: locationField?.value || '',
    reader_type: readerTypeField?.value || '',
    lock_type: lockTypeField?.value || '',
    monitoring_type: monitoringTypeField?.value || '',
    quick_config: quickConfigField?.value || 'Standard',
    takeover: takeoverField?.value,
    lock_provider: lockProviderField?.value,
    notes: notesField?.value,
  };

  // Save to database
  return await storage.createAccessPoint(accessPoint);
}

/**
 * Save an elevator item to the database
 */
async function saveElevator(item: EquipmentItem, projectId: number) {
  // Extract field values
  const locationField = item.fields.find(f => f.name === 'location');
  const elevatorTypeField = item.fields.find(f => f.name === 'elevator_type');
  const readerTypeField = item.fields.find(f => f.name === 'reader_type');
  const floorCountField = item.fields.find(f => f.name === 'floor_count');
  const notesField = item.fields.find(f => f.name === 'notes');

  // Create elevator object
  const elevator = {
    project_id: projectId,
    location: locationField?.value,
    elevator_type: elevatorTypeField?.value,
    reader_type: readerTypeField?.value,
    floor_count: floorCountField?.value ? parseInt(floorCountField.value) : null,
    notes: notesField?.value,
  };

  // Save to database
  return await storage.createElevator(elevator);
}

/**
 * Save an intercom item to the database
 */
async function saveIntercom(item: EquipmentItem, projectId: number) {
  // Extract field values
  const locationField = item.fields.find(f => f.name === 'location');
  const intercomTypeField = item.fields.find(f => f.name === 'intercom_type');
  const notesField = item.fields.find(f => f.name === 'notes');

  // Create intercom object
  const intercom = {
    project_id: projectId,
    location: locationField?.value || '',
    intercom_type: intercomTypeField?.value || '',
    notes: notesField?.value,
  };

  // Save to database
  return await storage.createIntercom(intercom);
}