import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DoorClosed, Camera, Phone, ArrowUpDown, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface EquipmentItem {
  id: number;
  type: string;
  label: string;
}

interface UnassignedEquipment {
  access_points: EquipmentItem[];
  cameras: EquipmentItem[];
  elevators: EquipmentItem[];
  intercoms: EquipmentItem[];
}

interface UnassignedEquipmentSelectProps {
  projectId: number;
  onSelectEquipment: (equipment: EquipmentItem) => void;
}

/**
 * Dropdown component for selecting unassigned equipment to place on floorplans
 */
export const UnassignedEquipmentSelect: React.FC<UnassignedEquipmentSelectProps> = ({
  projectId,
  onSelectEquipment
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  
  // Query unassigned equipment
  const { data, isLoading, isError, refetch } = useQuery<UnassignedEquipment>({
    queryKey: [`/api/projects/${projectId}/unassigned-equipment`],
    enabled: !!projectId,
  });
  
  // Combine all equipment types for the dropdown
  const allEquipment: EquipmentItem[] = React.useMemo(() => {
    if (!data) return [];
    
    return [
      ...data.access_points.map(ap => ({ ...ap, key: `ap-${ap.id}` })),
      ...data.cameras.map(cam => ({ ...cam, key: `cam-${cam.id}` })),
      ...data.elevators.map(elev => ({ ...elev, key: `elev-${elev.id}` })),
      ...data.intercoms.map(intercom => ({ ...intercom, key: `intercom-${intercom.id}` }))
    ];
  }, [data]);
  
  // Handle equipment selection
  const handleSelect = (value: string) => {
    setSelectedEquipment(value);
    const [type, idStr] = value.split("-");
    const id = parseInt(idStr);
    
    let equipmentType = "";
    if (type === "ap") equipmentType = "access_point";
    if (type === "cam") equipmentType = "camera";
    if (type === "elev") equipmentType = "elevator";
    if (type === "intercom") equipmentType = "intercom";
    
    const found = allEquipment.find(item => 
      item.type === equipmentType && item.id === id
    );
    
    if (found) {
      onSelectEquipment(found);
      
      // Clear the selection and refetch the unassigned equipment list
      // This ensures the dropdown reflects the most current state
      setTimeout(() => {
        setSelectedEquipment("");
        refetch();
      }, 500);
    }
  };
  
  // Get equipment icon based on type
  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'access_point':
        return <DoorClosed className="h-4 w-4 mr-2" />;
      case 'camera':
        return <Camera className="h-4 w-4 mr-2" />;
      case 'elevator':
        return <ArrowUpDown className="h-4 w-4 mr-2" />;
      case 'intercom':
        return <Phone className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  // If no unassigned equipment is available
  const hasUnassignedEquipment = allEquipment.length > 0;
  
  // If no data or loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Loading equipment...</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }
  
  // If error occurred
  if (isError) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-destructive">Failed to load equipment</span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm whitespace-nowrap">Add existing equipment:</span>
      
      <Select value={selectedEquipment} onValueChange={handleSelect}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder={hasUnassignedEquipment ? "Select equipment..." : "No unassigned equipment"} />
        </SelectTrigger>
        <SelectContent>
          {hasUnassignedEquipment ? (
            <>
              {data?.access_points.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Access Points</SelectLabel>
                  {data.access_points.map(ap => (
                    <SelectItem key={`ap-${ap.id}`} value={`ap-${ap.id}`}>
                      <div className="flex items-center">
                        {getEquipmentIcon('access_point')}
                        <span>{ap.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              
              {data?.cameras.length > 0 && (
                <>
                  {data?.access_points.length > 0 && <Separator className="my-1" />}
                  <SelectGroup>
                    <SelectLabel>Cameras</SelectLabel>
                    {data.cameras.map(cam => (
                      <SelectItem key={`cam-${cam.id}`} value={`cam-${cam.id}`}>
                        <div className="flex items-center">
                          {getEquipmentIcon('camera')}
                          <span>{cam.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
              
              {data?.elevators.length > 0 && (
                <>
                  {(data?.access_points.length > 0 || data?.cameras.length > 0) && 
                    <Separator className="my-1" />
                  }
                  <SelectGroup>
                    <SelectLabel>Elevators</SelectLabel>
                    {data.elevators.map(elev => (
                      <SelectItem key={`elev-${elev.id}`} value={`elev-${elev.id}`}>
                        <div className="flex items-center">
                          {getEquipmentIcon('elevator')}
                          <span>{elev.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
              
              {data?.intercoms.length > 0 && (
                <>
                  {(data?.access_points.length > 0 || data?.cameras.length > 0 || data?.elevators.length > 0) && 
                    <Separator className="my-1" />
                  }
                  <SelectGroup>
                    <SelectLabel>Intercoms</SelectLabel>
                    {data.intercoms.map(intercom => (
                      <SelectItem key={`intercom-${intercom.id}`} value={`intercom-${intercom.id}`}>
                        <div className="flex items-center">
                          {getEquipmentIcon('intercom')}
                          <span>{intercom.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
            </>
          ) : (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No unassigned equipment available.
              <div className="mt-1 text-xs">
                Add equipment from the tables first.
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => refetch()}
        title="Refresh equipment list"
      >
        <Loader2 className="h-4 w-4" />
      </Button>
    </div>
  );
};