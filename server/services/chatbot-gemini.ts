import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AccessPoint, Camera, Elevator, Intercom } from "@shared/schema";
import { projectQuestions } from "./project-questions-analysis";

// Set up the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Use the newest Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Message structure for chat
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Interface for chat context
interface ChatContext {
  equipmentType?: 'access_point' | 'camera' | 'elevator' | 'intercom';
  projectId?: number;
  configStage?: 'initial' | 'collecting' | 'confirming' | 'complete';
  collectedProperties?: Record<string, any>;
  remainingQuestions?: string[];
  confidence?: number;
}

// Interface for Recommendation
interface EquipmentRecommendation {
  type: string;
  location: string;
  properties: Record<string, any>;
  confidence: number;
  explanation: string;
}

/**
 * Process a chat message and get a response from the Gemini API
 */
export async function processChatMessage(
  messages: ChatMessage[],
  context: ChatContext = {}
): Promise<{ content: string; context: ChatContext }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    // Prepare chat history for Gemini API
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Get response from Gemini
    const result = await model.generateContent({
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
      },
    });

    const response = result.response;
    const responseText = response.text();

    // Analyze the response to update context
    const updatedContext = analyzeResponseForContext(responseText, context, messages);

    return {
      content: responseText,
      context: updatedContext
    };
  } catch (error) {
    console.error("Error processing chat message with Gemini:", error);
    return {
      content: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
      context
    };
  }
}

/**
 * Analyze the assistant's response to update the context
 */
function analyzeResponseForContext(
  response: string,
  currentContext: ChatContext,
  messages: ChatMessage[]
): ChatContext {
  const newContext: ChatContext = { ...currentContext };

  // Determine equipment type if not already set
  if (!newContext.equipmentType) {
    if (response.toLowerCase().includes("access point") || 
        response.toLowerCase().includes("door") || 
        response.toLowerCase().includes("reader") || 
        response.toLowerCase().includes("lock")) {
      newContext.equipmentType = 'access_point';
    } else if (response.toLowerCase().includes("camera") || 
               response.toLowerCase().includes("video") || 
               response.toLowerCase().includes("surveillance")) {
      newContext.equipmentType = 'camera';
    } else if (response.toLowerCase().includes("elevator") || 
               response.toLowerCase().includes("lift")) {
      newContext.equipmentType = 'elevator';
    } else if (response.toLowerCase().includes("intercom") || 
               response.toLowerCase().includes("communication")) {
      newContext.equipmentType = 'intercom';
    }
  }

  // Determine configuration stage
  if (!newContext.configStage || newContext.configStage === 'initial') {
    if (messages.length <= 3) {
      newContext.configStage = 'initial';
    } else {
      newContext.configStage = 'collecting';
    }
  }

  // Extract properties from the conversation
  if (newContext.equipmentType && (newContext.configStage === 'collecting' || newContext.configStage === 'confirming')) {
    newContext.collectedProperties = newContext.collectedProperties || {};
    
    // Look for location information
    const locationMatch = response.match(/location[:\s]+([^\n.,?!]+)/i) || 
                          messages[messages.length - 2]?.content.match(/location[:\s]+([^\n.,?!]+)/i);
    if (locationMatch && locationMatch[1].trim()) {
      newContext.collectedProperties.location = locationMatch[1].trim();
    }
    
    // Extract properties based on equipment type
    switch (newContext.equipmentType) {
      case 'access_point':
        extractAccessPointProperties(response, messages, newContext);
        break;
      case 'camera':
        extractCameraProperties(response, messages, newContext);
        break;
      case 'elevator':
        extractElevatorProperties(response, messages, newContext);
        break;
      case 'intercom':
        extractIntercomProperties(response, messages, newContext);
        break;
    }
  }

  // Check if we're in confirmation stage
  if (newContext.configStage === 'collecting' && 
      (response.toLowerCase().includes("here's a summary") || 
       response.toLowerCase().includes("to confirm") || 
       response.toLowerCase().includes("is this correct"))) {
    newContext.configStage = 'confirming';
  }

  // Check if configuration is complete
  if (newContext.configStage === 'confirming' && 
      (messages[messages.length - 2]?.content.toLowerCase().includes("yes") || 
       messages[messages.length - 2]?.content.toLowerCase().includes("confirm") || 
       messages[messages.length - 2]?.content.toLowerCase().includes("looks good"))) {
    newContext.configStage = 'complete';
  }

  // Calculate confidence based on completion of required fields
  newContext.confidence = calculateConfidence(newContext);

  return newContext;
}

/**
 * Extract access point specific properties from the conversation
 */
function extractAccessPointProperties(
  response: string, 
  messages: ChatMessage[], 
  context: ChatContext
) {
  const props = context.collectedProperties || {};
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  
  // Reader type
  const readerMatch = response.match(/reader type[:\s]+([^\n.,?!]+)/i) || 
                      lastUserMessage.match(/reader[:\s]+([^\n.,?!]+)/i);
  if (readerMatch && readerMatch[1].trim()) {
    props.reader_type = readerMatch[1].trim();
  }
  
  // Lock type
  const lockMatch = response.match(/lock type[:\s]+([^\n.,?!]+)/i) || 
                    lastUserMessage.match(/lock[:\s]+([^\n.,?!]+)/i);
  if (lockMatch && lockMatch[1].trim()) {
    props.lock_type = lockMatch[1].trim();
  }
  
  // Monitoring type
  const monitoringMatch = response.match(/monitoring[:\s]+([^\n.,?!]+)/i) || 
                          lastUserMessage.match(/monitoring[:\s]+([^\n.,?!]+)/i);
  if (monitoringMatch && monitoringMatch[1].trim()) {
    props.monitoring_type = monitoringMatch[1].trim();
  }
  
  // Interior/Perimeter
  if (lastUserMessage.includes("interior") || response.toLowerCase().includes("interior")) {
    props.interior_perimeter = "Interior";
  } else if (lastUserMessage.includes("perimeter") || response.toLowerCase().includes("perimeter")) {
    props.interior_perimeter = "Perimeter";
  }
  
  // Lock provider
  const providerMatch = response.match(/provider[:\s]+([^\n.,?!]+)/i) || 
                        lastUserMessage.match(/provider[:\s]+([^\n.,?!]+)/i);
  if (providerMatch && providerMatch[1].trim()) {
    props.lock_provider = providerMatch[1].trim();
  }
  
  // Crash bars
  if (lastUserMessage.includes("crash bar") || response.toLowerCase().includes("crash bar")) {
    props.crashbars = "Yes";
  }
  
  // Notes
  const notesMatch = response.match(/notes?[:\s]+([^\n]+)/i) || 
                     lastUserMessage.match(/notes?[:\s]+([^\n]+)/i);
  if (notesMatch && notesMatch[1].trim()) {
    props.notes = notesMatch[1].trim();
  }

  context.collectedProperties = props;
}

/**
 * Extract camera specific properties from the conversation
 */
function extractCameraProperties(
  response: string, 
  messages: ChatMessage[], 
  context: ChatContext
) {
  const props = context.collectedProperties || {};
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  
  // Camera type
  const typeMatch = response.match(/camera type[:\s]+([^\n.,?!]+)/i) || 
                   lastUserMessage.match(/camera[:\s]+([^\n.,?!]+)/i);
  if (typeMatch && typeMatch[1].trim()) {
    props.camera_type = typeMatch[1].trim();
  }
  
  // Resolution
  const resolutionMatch = response.match(/resolution[:\s]+([^\n.,?!]+)/i) || 
                          lastUserMessage.match(/resolution[:\s]+([^\n.,?!]+)/i);
  if (resolutionMatch && resolutionMatch[1].trim()) {
    props.resolution = resolutionMatch[1].trim();
  }
  
  // Mounting type
  const mountingMatch = response.match(/mounting[:\s]+([^\n.,?!]+)/i) || 
                        lastUserMessage.match(/mounting[:\s]+([^\n.,?!]+)/i);
  if (mountingMatch && mountingMatch[1].trim()) {
    props.mounting_type = mountingMatch[1].trim();
  }
  
  // Field of view
  const fovMatch = response.match(/field of view[:\s]+([^\n.,?!]+)/i) || 
                  lastUserMessage.match(/field of view[:\s]+([^\n.,?!]+)/i);
  if (fovMatch && fovMatch[1].trim()) {
    props.field_of_view = fovMatch[1].trim();
  }
  
  // Indoor/Outdoor
  if (lastUserMessage.includes("indoor") || response.toLowerCase().includes("indoor")) {
    props.is_indoor = true;
  } else if (lastUserMessage.includes("outdoor") || response.toLowerCase().includes("outdoor")) {
    props.is_indoor = false;
  }
  
  // Notes
  const notesMatch = response.match(/notes?[:\s]+([^\n]+)/i) || 
                     lastUserMessage.match(/notes?[:\s]+([^\n]+)/i);
  if (notesMatch && notesMatch[1].trim()) {
    props.notes = notesMatch[1].trim();
  }

  context.collectedProperties = props;
}

/**
 * Extract elevator specific properties from the conversation
 */
function extractElevatorProperties(
  response: string, 
  messages: ChatMessage[], 
  context: ChatContext
) {
  const props = context.collectedProperties || {};
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  
  // Elevator type
  const typeMatch = response.match(/elevator type[:\s]+([^\n.,?!]+)/i) || 
                    lastUserMessage.match(/elevator[:\s]+([^\n.,?!]+)/i);
  if (typeMatch && typeMatch[1].trim()) {
    props.elevator_type = typeMatch[1].trim();
  }
  
  // Floor count
  const floorMatch = response.match(/floors?[:\s]+(\d+)/i) || 
                     lastUserMessage.match(/floors?[:\s]+(\d+)/i);
  if (floorMatch && floorMatch[1].trim()) {
    props.floor_count = parseInt(floorMatch[1].trim());
  }
  
  // Bank name
  const bankMatch = response.match(/bank[:\s]+([^\n.,?!]+)/i) || 
                    lastUserMessage.match(/bank[:\s]+([^\n.,?!]+)/i);
  if (bankMatch && bankMatch[1].trim()) {
    props.bank_name = bankMatch[1].trim();
  }
  
  // Notes
  const notesMatch = response.match(/notes?[:\s]+([^\n]+)/i) || 
                     lastUserMessage.match(/notes?[:\s]+([^\n]+)/i);
  if (notesMatch && notesMatch[1].trim()) {
    props.notes = notesMatch[1].trim();
  }

  context.collectedProperties = props;
}

/**
 * Extract intercom specific properties from the conversation
 */
function extractIntercomProperties(
  response: string, 
  messages: ChatMessage[], 
  context: ChatContext
) {
  const props = context.collectedProperties || {};
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  
  // Intercom type
  const typeMatch = response.match(/intercom type[:\s]+([^\n.,?!]+)/i) || 
                    lastUserMessage.match(/intercom[:\s]+([^\n.,?!]+)/i);
  if (typeMatch && typeMatch[1].trim()) {
    props.intercom_type = typeMatch[1].trim();
  }
  
  // Notes
  const notesMatch = response.match(/notes?[:\s]+([^\n]+)/i) || 
                     lastUserMessage.match(/notes?[:\s]+([^\n]+)/i);
  if (notesMatch && notesMatch[1].trim()) {
    props.notes = notesMatch[1].trim();
  }

  context.collectedProperties = props;
}

/**
 * Calculate confidence score based on completion of required fields
 */
function calculateConfidence(context: ChatContext): number {
  if (!context.equipmentType || !context.collectedProperties) {
    return 0;
  }
  
  const props = context.collectedProperties;
  let requiredFields: string[] = ['location'];
  let completedFields = 0;
  
  // Add required fields based on equipment type
  switch (context.equipmentType) {
    case 'access_point':
      requiredFields = [...requiredFields, 'reader_type', 'lock_type', 'monitoring_type'];
      break;
    case 'camera':
      requiredFields = [...requiredFields, 'camera_type'];
      break;
    case 'elevator':
      requiredFields = [...requiredFields, 'elevator_type'];
      break;
    case 'intercom':
      requiredFields = [...requiredFields, 'intercom_type'];
      break;
  }
  
  // Count completed required fields
  for (const field of requiredFields) {
    if (props[field]) {
      completedFields++;
    }
  }
  
  return completedFields / requiredFields.length;
}

/**
 * Generate equipment recommendations based on the chat context
 */
export async function generateEquipmentRecommendations(
  messages: ChatMessage[],
  context: ChatContext
): Promise<EquipmentRecommendation[]> {
  if (!context.equipmentType || !context.collectedProperties || context.confidence < 0.5) {
    return [];
  }
  
  // Create a recommendation based on the collected information
  const recommendation: EquipmentRecommendation = {
    type: context.equipmentType,
    location: context.collectedProperties.location || 'Unknown Location',
    properties: { ...context.collectedProperties },
    confidence: context.confidence,
    explanation: "Generated based on your conversation with the AI assistant."
  };
  
  return [recommendation];
}