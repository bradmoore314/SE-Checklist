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
    access_point: { total: number; interior: number; perimeter: number };
    camera: { total: number; indoor: number; outdoor: number };
    elevator: { total: number };
    intercom: { total: number };
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
  const { data: markerStats, refetch: refetchMarkerStats } = useQuery({
    queryKey: [`/api/projects/${projectId}/marker-stats`],
    enabled: !!projectId,
  });

  // Get equipment counts from their respective endpoints
  const { data: accessPoints, refetch: refetchAccessPoints } = useQuery({
    queryKey: [`/api/projects/${projectId}/access-points`],
    enabled: !!projectId,
  });

  const { data: cameras, refetch: refetchCameras } = useQuery({
    queryKey: [`/api/projects/${projectId}/cameras`],
    enabled: !!projectId,
  });

  const { data: elevators, refetch: refetchElevators } = useQuery({
    queryKey: [`/api/projects/${projectId}/elevators`],
    enabled: !!projectId,
  });

  const { data: intercoms, refetch: refetchIntercoms } = useQuery({
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
    
    // Get counts
    const markerAccessPoints = markerStats?.types?.access_point?.total || 0;
    const markerCameras = markerStats?.types?.camera?.total || 0;
    const markerElevators = markerStats?.types?.elevator?.total || 0;
    const markerIntercoms = markerStats?.types?.intercom?.total || 0;
    
    const equipmentAccessPoints = accessPoints?.length || 0;
    const equipmentCameras = cameras?.length || 0;
    const equipmentElevators = elevators?.length || 0;
    const equipmentIntercoms = intercoms?.length || 0;
    
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
              <li>
                Access Points: {consistencyDetails.accessPoints.markers} markers vs{" "}
                {consistencyDetails.accessPoints.equipment} equipment items
              </li>
            )}
            {consistencyDetails.cameras.difference > 0 && (
              <li>
                Cameras: {consistencyDetails.cameras.markers} markers vs{" "}
                {consistencyDetails.cameras.equipment} equipment items
              </li>
            )}
            {consistencyDetails.elevators.difference > 0 && (
              <li>
                Elevators: {consistencyDetails.elevators.markers} markers vs{" "}
                {consistencyDetails.elevators.equipment} equipment items
              </li>
            )}
            {consistencyDetails.intercoms.difference > 0 && (
              <li>
                Intercoms: {consistencyDetails.intercoms.markers} markers vs{" "}
                {consistencyDetails.intercoms.equipment} equipment items
              </li>
            )}
          </ul>
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
            >
              {isChecking ? "Checking..." : "Check Again"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}