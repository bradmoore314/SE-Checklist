import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

// Define interfaces for the marker stats response
interface MarkerStats {
  total: number;
  types: {
    access_point: { 
      total: number; 
      interior: number; 
      perimeter: number; 
      unspecified: number;
      equipment_count: number;
    };
    camera: { 
      total: number; 
      indoor: number; 
      outdoor: number; 
      unspecified: number;
      equipment_count: number;
    };
    elevator: { 
      total: number;
      equipment_count: number;
    };
    intercom: { 
      total: number;
      equipment_count: number;
    };
  };
}

interface EquipmentConsistencyCheckProps {
  projectId: number;
}

/**
 * Component that verifies consistency between floorplan markers and equipment lists
 * This helps ensure that the counts match between different views of the same data
 */
export function EquipmentConsistencyCheck({ projectId }: EquipmentConsistencyCheckProps) {
  const { toast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const [issuesFound, setIssuesFound] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [consistencyDetails, setConsistencyDetails] = useState<{
    accessPoints: { markers: number; equipment: number; difference: number };
    cameras: { markers: number; equipment: number; difference: number };
    elevators: { markers: number; equipment: number; difference: number };
    intercoms: { markers: number; equipment: number; difference: number };
  }>({
    accessPoints: { markers: 0, equipment: 0, difference: 0 },
    cameras: { markers: 0, equipment: 0, difference: 0 },
    elevators: { markers: 0, equipment: 0, difference: 0 },
    intercoms: { markers: 0, equipment: 0, difference: 0 },
  });

  // Get marker statistics from the floorplan
  const { data: markerStats, refetch: refetchMarkerStats } = useQuery<MarkerStats>({
    queryKey: [`/api/projects/${projectId}/marker-stats`],
    enabled: !!projectId,
  });

  // Get equipment counts from their respective endpoints
  const { data: accessPoints, refetch: refetchAccessPoints } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/access-points`],
    enabled: !!projectId,
  });

  const { data: cameras, refetch: refetchCameras } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/cameras`],
    enabled: !!projectId,
  });

  const { data: elevators, refetch: refetchElevators } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/elevators`],
    enabled: !!projectId,
  });

  const { data: intercoms, refetch: refetchIntercoms } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/intercoms`],
    enabled: !!projectId,
  });

  // Function to perform the consistency check
  const checkConsistency = async () => {
    setIsChecking(true);
    
    // Refresh all the data first
    await Promise.all([
      refetchMarkerStats(),
      refetchAccessPoints(),
      refetchCameras(),
      refetchElevators(),
      refetchIntercoms()
    ]);
    
    // Get counts from markers - need to handle potential undefined types safely
    const stats = markerStats || { 
      total: 0, 
      types: {
        access_point: { 
          total: 0, 
          interior: 0, 
          perimeter: 0,
          unspecified: 0,
          equipment_count: 0
        },
        camera: { 
          total: 0, 
          indoor: 0, 
          outdoor: 0,
          unspecified: 0,
          equipment_count: 0
        },
        elevator: { 
          total: 0,
          equipment_count: 0
        },
        intercom: { 
          total: 0,
          equipment_count: 0
        }
      }
    };
    
    // Using the stats directly from the API which now includes equipment counts
    const markerAccessPoints = stats.types.access_point.total;
    const markerCameras = stats.types.camera.total;
    const markerElevators = stats.types.elevator.total;
    const markerIntercoms = stats.types.intercom.total;
    
    // Get equipment counts directly from the API
    const equipmentAccessPoints = stats.types.access_point.equipment_count;
    const equipmentCameras = stats.types.camera.equipment_count;
    const equipmentElevators = stats.types.elevator.equipment_count;
    const equipmentIntercoms = stats.types.intercom.equipment_count;
    
    // For logging purposes, also get the equipment lists
    const apList = accessPoints || [];
    const camList = cameras || [];
    const elevList = elevators || [];
    const interList = intercoms || [];
    
    // Verify the counts match what we expect
    console.log('API equipment counts:', {
      accessPoints: equipmentAccessPoints,
      cameras: equipmentCameras,
      elevators: equipmentElevators,
      intercoms: equipmentIntercoms
    });
    
    console.log('Actual equipment counts:', {
      accessPoints: apList.length,
      cameras: camList.length,
      elevators: elevList.length,
      intercoms: interList.length
    });
    
    // Calculate differences
    const apDiff = Math.abs(markerAccessPoints - equipmentAccessPoints);
    const camDiff = Math.abs(markerCameras - equipmentCameras);
    const elevDiff = Math.abs(markerElevators - equipmentElevators);
    const interDiff = Math.abs(markerIntercoms - equipmentIntercoms);
    
    // Update state with the results
    setConsistencyDetails({
      accessPoints: { 
        markers: markerAccessPoints, 
        equipment: equipmentAccessPoints, 
        difference: apDiff 
      },
      cameras: { 
        markers: markerCameras, 
        equipment: equipmentCameras, 
        difference: camDiff 
      },
      elevators: { 
        markers: markerElevators, 
        equipment: equipmentElevators, 
        difference: elevDiff 
      },
      intercoms: { 
        markers: markerIntercoms, 
        equipment: equipmentIntercoms, 
        difference: interDiff 
      },
    });
    
    // Check if any issues were found
    const hasIssues = apDiff > 0 || camDiff > 0 || elevDiff > 0 || interDiff > 0;
    setIssuesFound(hasIssues);
    setShowAlert(hasIssues);
    
    setIsChecking(false);
    
    // Show toast notification with result
    if (!hasIssues) {
      toast({
        title: "Consistency Check Passed",
        description: "All equipment counts match between floorplan markers and equipment lists.",
        variant: "default",
      });
    }
  };

  // Auto-check on component mount
  useEffect(() => {
    checkConsistency();
    // Run check every 60 seconds
    const interval = setInterval(checkConsistency, 60000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Don't render anything if there are no issues
  if (!showAlert) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={checkConsistency}
        disabled={isChecking}
      >
        {isChecking ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
        <span className="text-xs">Verify Equipment</span>
      </Button>
    );
  }

  return (
    <div className="py-2">
      <Alert variant={issuesFound ? "destructive" : "default"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Equipment Count Mismatch</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>There are inconsistencies between floorplan markers and equipment lists:</p>
          <ul className="text-sm space-y-1 pl-4">
            {consistencyDetails.accessPoints.difference > 0 && (
              <li className="flex flex-col gap-1">
                <div>
                  <span className="font-semibold">Access Points:</span> {consistencyDetails.accessPoints.markers} markers /{" "}
                  {consistencyDetails.accessPoints.equipment} equipment items
                </div>
                {consistencyDetails.accessPoints.markers < consistencyDetails.accessPoints.equipment && (
                  <div className="text-xs text-amber-500 flex items-center ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{consistencyDetails.accessPoints.equipment - consistencyDetails.accessPoints.markers} access points need to be placed on floorplans</span>
                  </div>
                )}
              </li>
            )}
            {consistencyDetails.cameras.difference > 0 && (
              <li className="flex flex-col gap-1">
                <div>
                  <span className="font-semibold">Cameras:</span> {consistencyDetails.cameras.markers} markers /{" "}
                  {consistencyDetails.cameras.equipment} equipment items
                </div>
                {consistencyDetails.cameras.markers < consistencyDetails.cameras.equipment && (
                  <div className="text-xs text-amber-500 flex items-center ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{consistencyDetails.cameras.equipment - consistencyDetails.cameras.markers} cameras need to be placed on floorplans</span>
                  </div>
                )}
              </li>
            )}
            {consistencyDetails.elevators.difference > 0 && (
              <li className="flex flex-col gap-1">
                <div>
                  <span className="font-semibold">Elevators:</span> {consistencyDetails.elevators.markers} markers /{" "}
                  {consistencyDetails.elevators.equipment} equipment items
                </div>
                {consistencyDetails.elevators.markers < consistencyDetails.elevators.equipment && (
                  <div className="text-xs text-amber-500 flex items-center ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{consistencyDetails.elevators.equipment - consistencyDetails.elevators.markers} elevators need to be placed on floorplans</span>
                  </div>
                )}
              </li>
            )}
            {consistencyDetails.intercoms.difference > 0 && (
              <li className="flex flex-col gap-1">
                <div>
                  <span className="font-semibold">Intercoms:</span> {consistencyDetails.intercoms.markers} markers /{" "}
                  {consistencyDetails.intercoms.equipment} equipment items
                </div>
                {consistencyDetails.intercoms.markers < consistencyDetails.intercoms.equipment && (
                  <div className="text-xs text-amber-500 flex items-center ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>{consistencyDetails.intercoms.equipment - consistencyDetails.intercoms.markers} intercoms need to be placed on floorplans</span>
                  </div>
                )}
              </li>
            )}
          </ul>
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>
              To resolve these issues, please place remaining equipment on floorplans or remove 
              equipment that should not be in the project.
            </p>
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <Button 
              size="sm" 
              onClick={() => setShowAlert(false)}
              variant="outline"
            >
              Dismiss
            </Button>
            <Button 
              size="sm" 
              onClick={checkConsistency}
              disabled={isChecking}
              variant="default"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Check Again
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}