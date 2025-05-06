import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { getGeminiProModel } from '../utils/gemini';

// Define types
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

interface ProcessResult {
  response: string;
  updatedItems: EquipmentItem[];
}

// Field definitions for each equipment type
const equipmentFieldDefinitions: Record<string, EquipmentField[]> = {
  camera: [
    { name: 'location', value: null, required: true, type: 'text' },
    { name: 'camera_type', value: null, required: true, type: 'select', options: ['IP', 'Analog', 'Thermal', 'PTZ'] },
    { name: 'mounting_type', value: null, required: false, type: 'select', options: ['Wall', 'Ceiling', 'Pole', 'Corner'] },
    { name: 'resolution', value: null, required: false, type: 'select', options: ['1080p', '4K', '5MP', '8MP'] },
    { name: 'field_of_view', value: null, required: false, type: 'text' },
    { name: 'is_indoor', value: null, required: true, type: 'boolean' },
    { name: 'import_to_gateway', value: null, required: false, type: 'boolean' },
    { name: 'notes', value: null, required: false, type: 'text' }
  ],
  access_point: [
    { name: 'location', value: null, required: true, type: 'text' },
    { name: 'reader_type', value: null, required: true, type: 'select', options: ['HID', 'BLE', 'Biometric', 'Keypad'] },
    { name: 'lock_type', value: null, required: true, type: 'select', options: ['Magnetic', 'Electric Strike', 'Deadbolt', 'Smart Lock'] },
    { name: 'monitoring_type', value: null, required: true, type: 'select', options: ['24/7', 'Business Hours', 'None'] },
    { name: 'operation_mode', value: null, required: false, type: 'select', options: ['Card Only', 'Card+PIN', 'Mobile', 'Multi-factor'] },
    { name: 'lock_provider', value: null, required: false, type: 'text' },
    { name: 'takeover', value: null, required: false, type: 'boolean' },
    { name: 'fire_alarm_integration', value: null, required: false, type: 'boolean' },
    { name: 'door_position_switch', value: null, required: false, type: 'boolean' },
    { name: 'rex_type', value: null, required: false, type: 'select', options: ['Motion', 'Push Button', 'Touch Bar'] },
    { name: 'quick_config', value: null, required: false, type: 'text' },
    { name: 'notes', value: null, required: false, type: 'text' }
  ],
  elevator: [
    { name: 'location', value: null, required: true, type: 'text' },
    { name: 'title', value: null, required: false, type: 'text' },
    { name: 'address', value: null, required: false, type: 'text' },
    { name: 'reader_type', value: null, required: false, type: 'select', options: ['HID', 'BLE', 'Biometric', 'Keypad'] },
    { name: 'notes', value: null, required: false, type: 'text' }
  ],
  intercom: [
    { name: 'location', value: null, required: true, type: 'text' },
    { name: 'intercom_type', value: null, required: true, type: 'select', options: ['IP', 'Analog', 'Wireless', 'Video'] },
    { name: 'notes', value: null, required: false, type: 'text' }
  ]
};

/**
 * Process a configuration message and update the scratchpad items accordingly
 */
export async function processConfigurationMessage(
  message: string, 
  projectId?: number,
  currentItems: EquipmentItem[] = []
): Promise<ProcessResult> {
  try {
    // Get project information if projectId is provided
    let projectInfo = null;
    if (projectId) {
      const [project] = await db.query(
        'SELECT name, client FROM projects WHERE id = $1',
        [projectId]
      );
      if (project) {
        projectInfo = {
          id: projectId,
          name: project.name,
          client: project.client
        };
      }
    }

    const model = getGeminiProModel();
    
    // Construct a helpful context message
    const contextMessage = [
      `You are a Security Equipment Configuration Assistant. You are helping configure security equipment for ${projectInfo ? `the "${projectInfo.name}" project for client "${projectInfo.client}"` : 'a project'}.`,
      'The user is using an interactive tool that has a chat on the left and a scratchpad on the right.',
      'Your job is to understand what the user wants to add, modify, or remove from their equipment configuration.',
      'Each equipment item needs specific information to be completed.',
      '',
      'Current scratchpad items:',
      currentItems.length > 0 
        ? JSON.stringify(currentItems, null, 2) 
        : 'No items yet',
      '',
      'Available equipment types:',
      '- camera',
      '- access_point',
      '- elevator',
      '- intercom',
      '',
      'Required fields for each type:',
      JSON.stringify(
        Object.entries(equipmentFieldDefinitions).reduce((acc, [type, fields]) => {
          acc[type] = fields.filter(f => f.required).map(f => f.name);
          return acc;
        }, {} as Record<string, string[]>),
        null, 2
      ),
      '',
      'User message:',
      message
    ].join('\n');

    // Define the prompt based on the operation we need
    const promptForOperation = `
Based on the user's message and current items, determine what operation(s) I need to perform:
1. Add new equipment item(s)
2. Edit existing item(s)
3. Delete item(s)
4. Fill in missing field values
5. Answer a question about equipment configuration

Return your analysis as a JSON object with the following structure:
{
  "operations": [
    {
      "type": "add"|"edit"|"delete"|"fill"|"answer",
      "details": {
        // For "add":
        "equipmentType": "camera"|"access_point"|"elevator"|"intercom",
        "quantity": number,
        "name": string,
        "fieldsToFill": [{"name": string, "value": string}]
        
        // For "edit":
        "itemId": string,
        "fieldsToUpdate": [{"name": string, "value": string}]
        
        // For "delete":
        "itemId": string
        
        // For "fill":
        "itemId": string,
        "fieldsToFill": [{"name": string, "value": string}]
        
        // For "answer":
        "question": string,
        "answer": string
      }
    }
  ]
}
`;

    // Call the model to determine the operation
    const operationResponse = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextMessage + '\n\n' + promptForOperation }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    });

    const operationText = operationResponse.response.text();
    let operations = [];
    
    // Extract the JSON from the response
    try {
      // Find JSON block in response
      const jsonMatch = operationText.match(/```json\n([\s\S]*?)\n```/) || 
                         operationText.match(/({[\s\S]*})/);
                         
      if (jsonMatch && jsonMatch[1]) {
        const jsonStr = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        operations = parsed.operations || [];
      } else {
        // Fallback if no JSON block found
        const parsed = JSON.parse(operationText);
        operations = parsed.operations || [];
      }
    } catch (error) {
      console.error('Failed to parse operations response:', error);
      console.log('Raw response:', operationText);
      operations = [];
    }

    // Clone the current items to avoid mutations
    let updatedItems = [...currentItems];
    let responseMessage = '';

    // Process each operation
    for (const operation of operations) {
      switch (operation.type) {
        case 'add':
          // Create a new item
          const { equipmentType, quantity, name, fieldsToFill } = operation.details;
          
          if (!equipmentFieldDefinitions[equipmentType]) {
            responseMessage += `I don't recognize the equipment type "${equipmentType}". `;
            continue;
          }
          
          // Create the new item with default fields
          const newItem: EquipmentItem = {
            id: uuidv4(),
            type: equipmentType as any,
            name: name || `New ${equipmentType}`,
            fields: [...equipmentFieldDefinitions[equipmentType]], // Clone the fields
            isComplete: false,
            quantity: quantity || 1
          };
          
          // Fill in any provided field values
          if (fieldsToFill && Array.isArray(fieldsToFill)) {
            for (const { name, value } of fieldsToFill) {
              const fieldIndex = newItem.fields.findIndex(f => f.name === name);
              if (fieldIndex >= 0 && value) {
                newItem.fields[fieldIndex].value = value;
              }
            }
          }
          
          // Add to the updated items
          updatedItems.push(newItem);
          responseMessage += `I've added ${quantity > 1 ? `${quantity} ` : ''}${name || `new ${equipmentType}`} to your configuration. `;
          break;
          
        case 'edit':
          // Update an existing item
          const { itemId: editItemId, fieldsToUpdate } = operation.details;
          const itemIndex = updatedItems.findIndex(item => item.id === editItemId);
          
          if (itemIndex < 0) {
            responseMessage += `I couldn't find that item to edit. `;
            continue;
          }
          
          // Update the specified fields
          if (fieldsToUpdate && Array.isArray(fieldsToUpdate)) {
            for (const { name, value } of fieldsToUpdate) {
              const fieldIndex = updatedItems[itemIndex].fields.findIndex(f => f.name === name);
              if (fieldIndex >= 0) {
                updatedItems[itemIndex].fields[fieldIndex].value = value;
              }
            }
          }
          
          responseMessage += `I've updated the ${updatedItems[itemIndex].name}. `;
          break;
          
        case 'delete':
          // Remove an item
          const { itemId: deleteItemId } = operation.details;
          const deleteIndex = updatedItems.findIndex(item => item.id === deleteItemId);
          
          if (deleteIndex < 0) {
            responseMessage += `I couldn't find that item to delete. `;
            continue;
          }
          
          const deletedName = updatedItems[deleteIndex].name;
          updatedItems = updatedItems.filter(item => item.id !== deleteItemId);
          responseMessage += `I've removed ${deletedName} from your configuration. `;
          break;
          
        case 'fill':
          // Fill in missing fields for an item
          const { itemId: fillItemId, fieldsToFill: fillFields } = operation.details;
          const fillIndex = updatedItems.findIndex(item => item.id === fillItemId);
          
          if (fillIndex < 0) {
            responseMessage += `I couldn't find that item to update. `;
            continue;
          }
          
          // Update the specified fields
          if (fillFields && Array.isArray(fillFields)) {
            for (const { name, value } of fillFields) {
              const fieldIndex = updatedItems[fillIndex].fields.findIndex(f => f.name === name);
              if (fieldIndex >= 0) {
                updatedItems[fillIndex].fields[fieldIndex].value = value;
              }
            }
          }
          
          responseMessage += `I've updated the information for ${updatedItems[fillIndex].name}. `;
          break;
          
        case 'answer':
          // Just answer a question without changing anything
          const { answer } = operation.details;
          responseMessage += answer;
          break;
      }
    }

    // If no operations were performed, provide a helpful response
    if (!responseMessage) {
      if (updatedItems.length === 0) {
        responseMessage = "I'm ready to help you configure your security equipment. You can add equipment by saying something like 'Add 2 cameras to the main entrance' or 'I need an access point at the lobby door'.";
      } else {
        // Check for missing required fields and suggest
        const incompleteItems = updatedItems.filter(item => {
          return item.fields.some(field => field.required && !field.value);
        });
        
        if (incompleteItems.length > 0) {
          const item = incompleteItems[0]; // Focus on one item at a time
          const missingFields = item.fields
            .filter(field => field.required && !field.value)
            .map(field => field.name.replace('_', ' '));
          
          responseMessage = `Your ${item.name} needs more information. Please provide the ${missingFields.join(', ')}.`;
        } else {
          responseMessage = "Your configuration looks good! Is there anything specific you'd like to add or modify?";
        }
      }
    }

    return {
      response: responseMessage,
      updatedItems
    };
  } catch (error) {
    console.error('Error processing configuration message:', error);
    throw error;
  }
}