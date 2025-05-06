import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Camera, DoorClosed, Phone, AlertCircle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UnplacedEquipmentPanelProps {
  projectId: number;
  floorplanId: number;
  onSelectEquipment: (equipment: UnplacedEquipment) => void;
}

export interface UnplacedEquipment {
  id: number;
  type: 'access_point' | 'camera' | 'intercom' | 'elevator';
  location?: string;
  name?: string;
  label?: string;
  equipmentType?: string;
}

export function UnplacedEquipmentPanel({ 
  projectId, 
  floorplanId,
  onSelectEquipment 
}: UnplacedEquipmentPanelProps) {
  const { toast } = useToast();
  const [unplacedEquipment, setUnplacedEquipment] = useState<UnplacedEquipment[]>([]);
  
  // Fetch all equipment for the project
  const { data: accessPoints, isLoading: isLoadingAccessPoints } = useQuery({
    queryKey: ['/api/projects', projectId, 'access-points'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/access-points`);
      return await res.json();
    }
  });
  
  const { data: cameras, isLoading: isLoadingCameras } = useQuery({
    queryKey: ['/api/projects', projectId, 'cameras'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/cameras`);
      return await res.json();
    }
  });
  
  const { data: intercoms, isLoading: isLoadingIntercoms } = useQuery({
    queryKey: ['/api/projects', projectId, 'intercoms'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/intercoms`);
      return await res.json();
    }
  });
  
  // Fetch placed markers for this floorplan
  const { data: placedMarkers, isLoading: isLoadingMarkers } = useQuery({
    queryKey: ['/api/enhanced-floorplan', floorplanId, 'markers'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/enhanced-floorplan/${floorplanId}/markers`);
      return await res.json();
    },
    enabled: !!floorplanId
  });
  
  // Process the data to find unplaced equipment
  useEffect(() => {
    if (isLoadingAccessPoints || isLoadingCameras || isLoadingIntercoms || isLoadingMarkers) {
      return;
    }
    
    const unplaced: UnplacedEquipment[] = [];
    
    // Get IDs of already placed equipment
    const placedEquipmentIds = new Map<string, number[]>();
    placedMarkers?.forEach((marker: any) => {
      if (!placedEquipmentIds.has(marker.marker_type)) {
        placedEquipmentIds.set(marker.marker_type, []);
      }
      if (marker.equipment_id) {
        placedEquipmentIds.get(marker.marker_type)?.push(marker.equipment_id);
      }
    });
    
    // Add unplaced access points
    if (accessPoints) {
      const placedIds = placedEquipmentIds.get('access_point') || [];
      accessPoints.forEach((ap: any) => {
        if (!placedIds.includes(ap.id)) {
          unplaced.push({
            id: ap.id,
            type: 'access_point',
            location: ap.location,
            label: ap.location || `Door ${ap.id}`,
            equipmentType: ap.reader_type
          });
        }
      });
    }
    
    // Add unplaced cameras
    if (cameras) {
      const placedIds = placedEquipmentIds.get('camera') || [];
      cameras.forEach((camera: any) => {
        if (!placedIds.includes(camera.id)) {
          unplaced.push({
            id: camera.id,
            type: 'camera',
            location: camera.location,
            label: camera.location || `Camera ${camera.id}`,
            equipmentType: camera.camera_type
          });
        }
      });
    }
    
    // Add unplaced intercoms
    if (intercoms) {
      const placedIds = placedEquipmentIds.get('intercom') || [];
      intercoms.forEach((intercom: any) => {
        if (!placedIds.includes(intercom.id)) {
          unplaced.push({
            id: intercom.id,
            type: 'intercom',
            location: intercom.location,
            label: intercom.location || `Intercom ${intercom.id}`,
            equipmentType: intercom.intercom_type
          });
        }
      });
    }
    
    setUnplacedEquipment(unplaced);
  }, [accessPoints, cameras, intercoms, placedMarkers, isLoadingAccessPoints, isLoadingCameras, isLoadingIntercoms, isLoadingMarkers]);
  
  // Get icon based on equipment type
  const getEquipmentIcon = (type: string) => {
    switch(type) {
      case 'access_point':
        return <DoorClosed className="h-4 w-4 mr-2" />;
      case 'camera':
        return <Camera className="h-4 w-4 mr-2" />;
      case 'intercom':
        return <Phone className="h-4 w-4 mr-2" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-2" />;
    }
  };
  
  const isLoading = isLoadingAccessPoints || isLoadingCameras || isLoadingIntercoms || isLoadingMarkers;
  
  return (
    <div className="bg-card rounded-md border p-4">
      <h3 className="text-lg font-medium mb-2">Unplaced Equipment</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Select equipment to place on the floorplan
      </p>
      
      {isLoading ? (
        <div className="py-4 text-center text-muted-foreground">
          Loading equipment...
        </div>
      ) : unplacedEquipment.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground">
          No unplaced equipment found
        </div>
      ) : (
        <ScrollArea className="h-[250px] rounded-md">
          <div className="space-y-1">
            {unplacedEquipment.map(equipment => (
              <div key={`${equipment.type}-${equipment.id}`} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                <div className="flex items-center">
                  {getEquipmentIcon(equipment.type)}
                  <span className="text-sm">
                    {equipment.label || `${equipment.type} ${equipment.id}`}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onSelectEquipment(equipment)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <Separator className="my-2" />
      
      <div className="mt-3 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-primary/5">
          {unplacedEquipment.filter(e => e.type === 'access_point').length} Access Points
        </Badge>
        <Badge variant="outline" className="bg-primary/5">
          {unplacedEquipment.filter(e => e.type === 'camera').length} Cameras
        </Badge>
        <Badge variant="outline" className="bg-primary/5">
          {unplacedEquipment.filter(e => e.type === 'intercom').length} Intercoms
        </Badge>
      </div>
    </div>
  );
}