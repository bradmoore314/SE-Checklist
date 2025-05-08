import { apiRequest, queryClient } from "./queryClient";

// Define types for marker stats and equipment lists
export interface MarkerStats {
  total: number;
  types: {
    access_point: { 
      total: number; 
      interior: number; 
      perimeter: number;
      unspecified: number;
    };
    camera: { 
      total: number; 
      indoor: number; 
      outdoor: number;
      unspecified: number;
    };
    elevator: { total: number; };
    intercom: { total: number; };
  };
}

/**
 * Check consistency between marker stats and equipment counts
 * 
 * @param projectId - The project ID to check consistency for
 * @returns Promise that resolves when consistency check is complete
 */
export async function checkEquipmentConsistency(projectId: number): Promise<void> {
  try {
    // Fetch marker stats
    const markerStatsResponse = await apiRequest('GET', `/api/projects/${projectId}/marker-stats`);
    const markerStats: MarkerStats = await markerStatsResponse.json();
    
    // Fetch equipment counts
    const accessPointsResponse = await apiRequest('GET', `/api/projects/${projectId}/access-points`);
    const accessPoints = await accessPointsResponse.json();
    
    const camerasResponse = await apiRequest('GET', `/api/projects/${projectId}/cameras`);
    const cameras = await camerasResponse.json();
    
    const elevatorsResponse = await apiRequest('GET', `/api/projects/${projectId}/elevators`);
    const elevators = await elevatorsResponse.json();
    
    const intercomsResponse = await apiRequest('GET', `/api/projects/${projectId}/intercoms`);
    const intercoms = await intercomsResponse.json();
    
    // Compare marker stats with equipment counts
    const accessPointDiff = Math.abs(markerStats.types.access_point.total - accessPoints.length);
    const cameraDiff = Math.abs(markerStats.types.camera.total - cameras.length);
    const elevatorDiff = Math.abs(markerStats.types.elevator.total - elevators.length);
    const intercomDiff = Math.abs(markerStats.types.intercom.total - intercoms.length);
    
    // Log any inconsistencies
    if (accessPointDiff > 0) {
      console.error(`Consistency error: Access point count mismatch. Marker stats: ${markerStats.types.access_point.total}, Equipment list: ${accessPoints.length}`);
    }
    
    if (cameraDiff > 0) {
      console.error(`Consistency error: Camera count mismatch. Marker stats: ${markerStats.types.camera.total}, Equipment list: ${cameras.length}`);
    }
    
    if (elevatorDiff > 0) {
      console.error(`Consistency error: Elevator count mismatch. Marker stats: ${markerStats.types.elevator.total}, Equipment list: ${elevators.length}`);
    }
    
    if (intercomDiff > 0) {
      console.error(`Consistency error: Intercom count mismatch. Marker stats: ${markerStats.types.intercom.total}, Equipment list: ${intercoms.length}`);
    }
    
    // Return the total difference to help identify severity
    const totalDiff = accessPointDiff + cameraDiff + elevatorDiff + intercomDiff;
    if (totalDiff > 0) {
      console.error(`Total equipment count inconsistencies: ${totalDiff}`);
      console.error(`Marker stats:`, markerStats);
      console.error(`Equipment counts:`, {
        accessPoints: accessPoints.length,
        cameras: cameras.length,
        elevators: elevators.length,
        intercoms: intercoms.length
      });
    }
  } catch (error) {
    console.error("Error checking equipment consistency:", error);
  }
}

/**
 * Trigger consistency check and invalidate relevant queries if needed
 *
 * @param projectId - The project ID to check consistency for
 * @param forceRefresh - Whether to force refresh queries regardless of consistency
 */
export async function validateAndRefreshData(projectId: number, forceRefresh: boolean = false): Promise<void> {
  await checkEquipmentConsistency(projectId);
  
  if (forceRefresh) {
    // Invalidate queries to force refresh
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/marker-stats`] });
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/access-points`] });
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/cameras`] });
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/elevators`] });
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/intercoms`] });
  }
}