// Define common types used across components

export interface StreamImage {
  id: number;
  imageData: string; // base64 data
  filename: string;
}

export interface Stream {
  id: number;
  // Camera Video Stream Details
  location: string;
  fovAccessibility: string; // Yes/No
  cameraAccessibility: string; // Yes/No
  cameraType: string;
  environment: string;
  
  // Unique Use Case Problem
  useCaseProblem: string;
  
  // Speaker Video Stream Association
  speakerAssociation: string; // Which cameras this speaker is associated with
  audioTalkDown: string; // Yes/No
  
  // Event Monitoring Details
  eventMonitoring: string; // Yes/No
  monitoringStartTime: string;
  monitoringEndTime: string;
  
  // Patrol Group Details
  patrolGroups: string; // Yes/No
  patrolStartTime: string;
  patrolEndTime: string;
  
  // Legacy fields maintained for compatibility
  quantity: number;
  description: string;
  monitoredArea: string;
  accessibility: string;
  useCase: string;
  analyticRule1: string;
  dwellTime1: number;
  analyticRule2: string;
  dwellTime2: number;
  daysOfWeek: string[];
  schedule: string;
  eventVolume: number;
  patrolType: string;
  patrolsPerWeek: number;
  images: StreamImage[];
}