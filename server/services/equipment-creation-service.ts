import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { equipmentCreationSessions } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Types for equipment creation
 */
export interface EquipmentCreationIntent {
  hasCreationIntent: boolean;
  equipmentType?: 'access_point' | 'camera' | 'intercom' | 'elevator' | string;
  quantity?: number;
  details?: Record<string, string>;
}

export interface EquipmentCreationSession {
  sessionId: string;
  projectId: number;
  equipmentType: string;
  quantity: number;
  currentStep: string;
  responses: Record<string, any>;
  pendingQuestions: string[];
  createdEquipment: any[];
  isComplete: boolean;
}

export interface SessionResponse {
  isComplete: boolean;
  message: string;
  currentStep?: string;
  equipment?: any[];
}

/**
 * Service for handling equipment creation via chatbot
 */
export class EquipmentCreationService {
  /**
   * Detect equipment creation intent from a message
   */
  detectCreationIntent(message: string): EquipmentCreationIntent {
    const lowerMessage = message.toLowerCase();
    
    // Check for add/create intents
    const hasAddIntent = /\b(add|create|install|place|set up|deploy)\b/i.test(lowerMessage);
    
    if (!hasAddIntent) {
      return { hasCreationIntent: false };
    }
    
    // Equipment type detection
    let equipmentType: string | undefined;
    let quantity = 1;
    
    // Check for access points
    const accessPointMatch = lowerMessage.match(/\b(\d+)\s*(access points?|card readers?|doors?|entries?)\b/i);
    if (accessPointMatch) {
      equipmentType = 'access_point';
      quantity = parseInt(accessPointMatch[1]);
    }
    
    // Check for cameras
    const cameraMatch = lowerMessage.match(/\b(\d+)\s*(cameras?|cctv|video cameras?)\b/i);
    if (cameraMatch) {
      equipmentType = 'camera';
      quantity = parseInt(cameraMatch[1]);
    }
    
    // Check for intercoms
    const intercomMatch = lowerMessage.match(/\b(\d+)\s*(intercoms?|intercom stations?)\b/i);
    if (intercomMatch) {
      equipmentType = 'intercom';
      quantity = parseInt(intercomMatch[1]);
    }
    
    // Check for elevators
    const elevatorMatch = lowerMessage.match(/\b(\d+)\s*(elevators?|lifts?)\b/i);
    if (elevatorMatch) {
      equipmentType = 'elevator';
      quantity = parseInt(elevatorMatch[1]);
    }
    
    // If we found an equipment type, we have a creation intent
    if (equipmentType) {
      return {
        hasCreationIntent: true,
        equipmentType,
        quantity,
        details: {}
      };
    }
    
    // No specific equipment found
    return { hasCreationIntent: false };
  }
  
  /**
   * Start a new equipment creation session
   */
  async startSession(projectId: number, type: string, quantity: number): Promise<EquipmentCreationSession> {
    const sessionId = uuidv4();
    const pendingQuestions = this.getQuestionsForEquipmentType(type);
    
    const session: EquipmentCreationSession = {
      sessionId,
      projectId,
      equipmentType: type,
      quantity,
      currentStep: 'location_type',
      responses: {},
      pendingQuestions,
      createdEquipment: [],
      isComplete: false
    };
    
    // Store session in database
    try {
      await db.insert(equipmentCreationSessions).values({
        session_id: sessionId,
        project_id: projectId,
        equipment_type: type,
        quantity,
        current_step: 'location_type',
        responses: {},
        completed: false
      });
    } catch (error) {
      console.error('Error storing equipment creation session:', error);
    }
    
    return session;
  }
  
  /**
   * Get an existing session by ID
   */
  async getSession(sessionId: string): Promise<EquipmentCreationSession | null> {
    try {
      const [session] = await db.select().from(equipmentCreationSessions).where(eq(equipmentCreationSessions.session_id, sessionId));
      
      if (!session) {
        return null;
      }
      
      return {
        sessionId: session.session_id,
        projectId: session.project_id,
        equipmentType: session.equipment_type,
        quantity: session.quantity,
        currentStep: session.current_step,
        responses: session.responses,
        pendingQuestions: this.getQuestionsForEquipmentType(session.equipment_type),
        createdEquipment: [],
        isComplete: session.completed
      };
    } catch (error) {
      console.error('Error retrieving equipment creation session:', error);
      return null;
    }
  }
  
  /**
   * Process a user response in an equipment creation session
   */
  async processResponse(sessionId: string, userResponse: string): Promise<SessionResponse> {
    // Get current session
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return {
        isComplete: false,
        message: "Sorry, I couldn't find your equipment creation session. Let's start over. What equipment would you like to add?"
      };
    }
    
    // Update session with user response
    session.responses[session.currentStep] = userResponse;
    
    // Get next step
    const nextStep = this.getNextStep(session);
    
    // Update session in database
    try {
      await db.update(equipmentCreationSessions)
        .set({
          responses: session.responses,
          current_step: nextStep,
          updated_at: new Date()
        })
        .where(eq(equipmentCreationSessions.session_id, sessionId));
    } catch (error) {
      console.error('Error updating equipment creation session:', error);
    }
    
    // Check if we're finished with questions
    if (nextStep === 'complete') {
      // Create equipment
      const createdEquipment = await this.createEquipment(session);
      
      // Mark session as complete
      try {
        await db.update(equipmentCreationSessions)
          .set({
            completed: true,
            updated_at: new Date()
          })
          .where(eq(equipmentCreationSessions.session_id, sessionId));
      } catch (error) {
        console.error('Error marking session as complete:', error);
      }
      
      return {
        isComplete: true,
        message: `Great! I've added ${session.quantity} ${session.equipmentType}(s) to your project.`,
        equipment: createdEquipment
      };
    }
    
    // Return next question
    session.currentStep = nextStep;
    const questionIndex = this.getStepIndex(nextStep);
    const nextQuestion = session.pendingQuestions[questionIndex];
    
    return {
      isComplete: false,
      message: nextQuestion,
      currentStep: nextStep
    };
  }
  
  /**
   * Create equipment based on session data
   */
  private async createEquipment(session: EquipmentCreationSession): Promise<any[]> {
    const createdEquipment = [];
    
    try {
      // For each piece of equipment to create
      for (let i = 0; i < session.quantity; i++) {
        // Format equipment data based on type
        const equipmentData = this.formatEquipmentData(session, i);
        
        // Call the appropriate API endpoint based on equipment type
        let endpoint = `/api/projects/${session.projectId}`;
        
        switch (session.equipmentType) {
          case 'access_point':
            endpoint += '/access-points';
            break;
          case 'camera':
            endpoint += '/cameras';
            break;
          case 'intercom':
            endpoint += '/intercoms';
            break;
          case 'elevator':
            endpoint += '/elevators';
            break;
          default:
            endpoint += `/${session.equipmentType}s`;
        }
        
        // Make API request to create equipment
        // This is a simplified approach - in a real implementation,
        // we would directly call the appropriate database methods instead
        const equipment = await this.callCreateEquipmentAPI(endpoint, equipmentData);
        createdEquipment.push(equipment);
      }
    } catch (error) {
      console.error('Error creating equipment:', error);
    }
    
    return createdEquipment;
  }
  
  /**
   * Format equipment data for creation
   */
  private formatEquipmentData(session: EquipmentCreationSession, index: number): any {
    const { equipmentType, responses, projectId } = session;
    const locationType = responses.location_type || 'Unknown';
    const locationName = responses.location || `Location ${index + 1}`;
    
    // Basic equipment data common to all types
    const equipmentData = {
      project_id: projectId,
      name: `${locationType} ${equipmentType} ${index + 1}`,
      location: locationName,
      notes: `Created via chatbot. Wiring installed by: ${responses.wiring_installer || 'TBD'}`,
    };
    
    // Add type-specific data
    switch (equipmentType) {
      case 'access_point':
        return {
          ...equipmentData,
          reader_type: responses.reader_technology || 'Card',
          is_perimeter: responses.location_type === 'perimeter',
        };
      case 'camera':
        return {
          ...equipmentData,
          camera_type: responses.camera_type || 'Fixed',
          resolution: responses.resolution || '1080p',
        };
      case 'intercom':
        return {
          ...equipmentData,
          intercom_type: responses.intercom_type || 'Audio/Video',
        };
      case 'elevator':
        return {
          ...equipmentData,
          floor_count: responses.floor_count || 1,
        };
      default:
        return equipmentData;
    }
  }
  
  /**
   * Make API request to create equipment
   * This is a simplified version - in production, we would directly call the database
   */
  private async callCreateEquipmentAPI(endpoint: string, data: any): Promise<any> {
    // Here we would make a direct API call or database call
    // For now, we'll simulate a successful creation with dummy data
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      created_at: new Date().toISOString(),
    };
  }
  
  /**
   * Get questions to ask based on equipment type
   */
  private getQuestionsForEquipmentType(type: string): string[] {
    const commonQuestions = [
      'Is this an interior or perimeter installation?',
      'What specific location will these be installed?',
      'Who will be installing the wiring?'
    ];
    
    // Add type-specific questions
    switch (type) {
      case 'access_point':
        return [
          ...commonQuestions,
          'What reader technology will be used? (Card, Keypad, Biometric, etc.)',
          'Will this control any additional hardware like electric strikes?'
        ];
      case 'camera':
        return [
          ...commonQuestions,
          'What type of camera is needed? (Fixed, PTZ, Dome, etc.)',
          'What resolution is required?',
          'Is there sufficient lighting in the area?'
        ];
      case 'intercom':
        return [
          ...commonQuestions,
          'Is this an audio-only or audio/video intercom?',
          'Will this be integrated with the access control system?'
        ];
      case 'elevator':
        return [
          ...commonQuestions,
          'How many floors need to be controlled?',
          'Will this use card readers or a keypad?'
        ];
      default:
        return commonQuestions;
    }
  }
  
  /**
   * Get the next step in the equipment creation process
   */
  private getNextStep(session: EquipmentCreationSession): string {
    const currentStepIndex = this.getStepIndex(session.currentStep);
    const steps = this.getStepsForEquipmentType(session.equipmentType);
    
    // If we're at the last step, mark as complete
    if (currentStepIndex >= steps.length - 1) {
      return 'complete';
    }
    
    // Otherwise, move to the next step
    return steps[currentStepIndex + 1];
  }
  
  /**
   * Get all steps for a specific equipment type
   */
  private getStepsForEquipmentType(type: string): string[] {
    const commonSteps = ['location_type', 'location', 'wiring_installer'];
    
    switch (type) {
      case 'access_point':
        return [...commonSteps, 'reader_technology', 'additional_hardware'];
      case 'camera':
        return [...commonSteps, 'camera_type', 'resolution', 'lighting'];
      case 'intercom':
        return [...commonSteps, 'intercom_type', 'integration'];
      case 'elevator':
        return [...commonSteps, 'floor_count', 'control_type'];
      default:
        return commonSteps;
    }
  }
  
  /**
   * Get the index of a step in the steps array
   */
  private getStepIndex(step: string): number {
    const allPossibleSteps = [
      'location_type',
      'location',
      'wiring_installer',
      'reader_technology',
      'additional_hardware',
      'camera_type',
      'resolution',
      'lighting',
      'intercom_type',
      'integration',
      'floor_count',
      'control_type'
    ];
    
    return allPossibleSteps.indexOf(step);
  }
}

// Create singleton instance
const equipmentCreationService = new EquipmentCreationService();
export default equipmentCreationService;