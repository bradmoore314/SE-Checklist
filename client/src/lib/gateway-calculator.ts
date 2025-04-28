import { StreamCamera, Calculations, BITRATE_TABLE } from '@shared/schema';

// Calculate the throughput and storage requirements for all cameras
export function calculateRequirements(cameras: StreamCamera[]): Calculations {
  let totalStreams = 0;
  let totalThroughput = 0;
  let totalStorage = 0;
  
  cameras.forEach(camera => {
    const streamsPerCamera = camera.lensCount;
    totalStreams += streamsPerCamera;
    
    const mpPerSecondPerStream = camera.streamingResolution * camera.frameRate;
    totalThroughput += mpPerSecondPerStream * streamsPerCamera;
    
    const bitrate = BITRATE_TABLE[camera.recordingResolution as keyof typeof BITRATE_TABLE];
    const storagePerStream = (86400 * camera.storageDays * bitrate) / 8000000;
    totalStorage += storagePerStream * streamsPerCamera;
  });
  
  return {
    totalStreams,
    totalThroughput,
    totalStorage
  };
}

// Calculate how many 16-channel gateways are needed
export function calculateGatewaysNeeded(totalStreams: number, totalThroughput: number, totalStorage: number): number {
  const maxStreamsPerGateway = 16;
  const maxThroughputPerGateway = 640;
  const maxStoragePerGateway = 12;
  
  return Math.max(
    Math.ceil(totalStreams / maxStreamsPerGateway),
    Math.ceil(totalThroughput / maxThroughputPerGateway),
    Math.ceil(totalStorage / maxStoragePerGateway)
  );
}

// Calculate throughput for a single camera
export function calculateCameraThroughput(camera: StreamCamera): number {
  return camera.streamingResolution * camera.frameRate * camera.lensCount;
}

// Calculate storage requirements for a single camera
export function calculateCameraStorage(camera: StreamCamera): number {
  const bitrate = BITRATE_TABLE[camera.recordingResolution as keyof typeof BITRATE_TABLE];
  return (86400 * camera.storageDays * bitrate * camera.lensCount) / 8000000;
}

// Get lens type text description based on lens count
export function getLensTypeText(lensCount: number): string {
  switch(lensCount) {
    case 1: return 'Single Lens';
    case 2: return 'Dual Lens';
    case 3: return 'Triple Lens';
    case 4: return 'Quad Lens';
    default: return 'Custom Lens';
  }
}

// Get a human-readable format for storage (GB or TB)
export function formatStorage(storage: number): string {
  if (storage < 1000) {
    return `${Math.round(storage * 10) / 10} GB`;
  } else {
    return `${Math.round(storage / 100) / 10} TB`;
  }
}

// Get a human-readable format for throughput (MP/s)
export function formatThroughput(throughput: number): string {
  return `${Math.round(throughput)} MP/s`;
}