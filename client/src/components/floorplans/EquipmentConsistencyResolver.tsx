import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, BadgeCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface EquipmentConsistencyResolverProps {
  projectId: number;
  onResolved?: () => void;
}

export function EquipmentConsistencyResolver({ projectId, onResolved }: EquipmentConsistencyResolverProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [orphanedEquipment, setOrphanedEquipment] = useState<{ 
    type: string; 
    id: number; 
    name: string; 
  }[]>([]);

  // Get marker statistics from the floorplan
  const { data: markerStats, refetch: refetchMarkerStats } = useQuery({
    queryKey: [`/api/projects/${projectId}/marker-stats`],
    enabled: !!projectId,
  });

  // Get equipment lists
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

  // Get markers that are assigned to equipment
  const { data: markers } = useQuery({
    queryKey: [`/api/projects/${projectId}/all-markers`],
    queryFn: async () => {
      const floorplans = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      const floorplansData = await floorplans.json();
      
      const markersPromises = floorplansData.map(async (floorplan: any) => {
        const res = await apiRequest('GET', `/api/floorplans/${floorplan.id}/markers`);
        const markers = await res.json();
        return markers;
      });
      
      const allMarkers = await Promise.all(markersPromises);
      return allMarkers.flat();
    },
    enabled: !!projectId,
  });

  // Function to identify orphaned equipment (equipment with no markers)
  const findOrphanedEquipment = async () => {
    setIsChecking(true);
    
    // Refresh all data
    await Promise.all([
      refetchMarkerStats(),
      refetchAccessPoints(),
      refetchCameras(),
      refetchElevators(),
      refetchIntercoms()
    ]);
    
    // Create a map of all equipment IDs with markers
    const equipmentWithMarkers = new Map<string, Set<number>>();
    equipmentWithMarkers.set('access_point', new Set());
    equipmentWithMarkers.set('camera', new Set());
    equipmentWithMarkers.set('elevator', new Set());
    equipmentWithMarkers.set('intercom', new Set());
    
    // Populate the map with equipment IDs that have markers
    if (markers) {
      markers.forEach((marker: any) => {
        if (marker.equipment_id && marker.marker_type) {
          const typeSet = equipmentWithMarkers.get(marker.marker_type);
          if (typeSet) {
            typeSet.add(marker.equipment_id);
          }
        }
      });
    }
    
    // Find orphaned equipment
    const orphaned: { type: string; id: number; name: string }[] = [];
    
    // Check access points
    if (accessPoints) {
      accessPoints.forEach((ap: any) => {
        if (!equipmentWithMarkers.get('access_point')?.has(ap.id)) {
          orphaned.push({ 
            type: 'access_point', 
            id: ap.id, 
            name: ap.location || `Access Point ${ap.id}` 
          });
        }
      });
    }
    
    // Check cameras
    if (cameras) {
      cameras.forEach((cam: any) => {
        if (!equipmentWithMarkers.get('camera')?.has(cam.id)) {
          orphaned.push({ 
            type: 'camera', 
            id: cam.id, 
            name: cam.location || `Camera ${cam.id}` 
          });
        }
      });
    }
    
    // Check elevators
    if (elevators) {
      elevators.forEach((elev: any) => {
        if (!equipmentWithMarkers.get('elevator')?.has(elev.id)) {
          orphaned.push({ 
            type: 'elevator', 
            id: elev.id, 
            name: elev.location || `Elevator ${elev.id}` 
          });
        }
      });
    }
    
    // Check intercoms
    if (intercoms) {
      intercoms.forEach((intercom: any) => {
        if (!equipmentWithMarkers.get('intercom')?.has(intercom.id)) {
          orphaned.push({ 
            type: 'intercom', 
            id: intercom.id, 
            name: intercom.location || `Intercom ${intercom.id}` 
          });
        }
      });
    }
    
    setOrphanedEquipment(orphaned);
    setIsChecking(false);
    
    if (orphaned.length === 0) {
      toast({
        title: "No Issues Found",
        description: "All equipment is properly associated with markers.",
        variant: "default",
      });
    }
  };

  // Function to get equipment type label
  const getEquipmentTypeLabel = (type: string) => {
    switch (type) {
      case 'access_point': return 'Access Point';
      case 'camera': return 'Camera';
      case 'elevator': return 'Elevator';
      case 'intercom': return 'Intercom';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Equipment Consistency Check</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={findOrphanedEquipment}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <BadgeCheck className="mr-2 h-4 w-4" />
              Check Consistency
            </>
          )}
        </Button>
      </div>
      
      {orphanedEquipment.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Equipment Issues Found</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Found {orphanedEquipment.length} equipment items that are not placed on any floorplan:
            </p>
            <ul className="text-sm space-y-1 pl-4 mb-4 max-h-40 overflow-y-auto">
              {orphanedEquipment.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  {getEquipmentTypeLabel(item.type)}: {item.name}
                </li>
              ))}
            </ul>
            <p className="text-sm">
              These items exist in the equipment tables but are not placed on any floorplan. 
              Add them to floorplans using the "Add existing equipment" dropdown.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}