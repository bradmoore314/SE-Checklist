// Define common types used across components

export interface StreamImage {
  id: number;
  imageData: string; // base64 data
  filename: string;
}

export interface Stream {
  id: number;
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