import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EditAccessPointModal from '../modals/EditAccessPointModal'; 
import EditCameraModal from '../modals/EditCameraModal';
import EditElevatorModal from '../modals/EditElevatorModal';
import EditIntercomModal from '../modals/EditIntercomModal';

interface EquipmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  markerType: string;
  projectId: number;
  position: { x: number, y: number };
  onEquipmentCreated: (equipmentId: number, equipmentLabel: string) => void;
  existingEquipmentId?: number;
}

/**
 * EquipmentFormDialog Component
 * 
 * This component automatically displays the appropriate equipment form modal
 * based on the marker type when a user places a marker on the floorplan.
 */
const EquipmentFormDialog = ({
  isOpen,
  onClose,
  markerType,
  projectId,
  position,
  onEquipmentCreated,
  existingEquipmentId
}: EquipmentFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch existing access point data if we have an ID
  const { data: accessPointData, isLoading: isLoadingAccessPoint, error: accessPointError } = useQuery({
    queryKey: [`/api/projects/${projectId}/access-points/${existingEquipmentId}`],
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'access_point') return null;
      const res = await fetch(`/api/projects/${projectId}/access-points/${existingEquipmentId}`);
      if (res.status === 404) {
        // Equipment not found in database, might have been deleted
        console.warn(`Access point with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch access point data: ${res.statusText}`);
      return res.json();
    },
    enabled: !!existingEquipmentId && markerType === 'access_point' && isOpen,
    retry: (failureCount, error) => {
      // Don't retry 404 errors
      if (error.message.includes('404')) return false;
      return failureCount < 3; // retry up to 3 times for other errors
    }
  });
  
  // Fetch existing camera data if we have an ID
  const { data: cameraData, isLoading: isLoadingCamera, error: cameraError } = useQuery({
    queryKey: [`/api/projects/${projectId}/cameras/${existingEquipmentId}`],
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'camera') return null;
      const res = await fetch(`/api/projects/${projectId}/cameras/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Camera with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch camera data: ${res.statusText}`);
      return res.json();
    },
    enabled: !!existingEquipmentId && markerType === 'camera' && isOpen,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // Fetch existing elevator data if we have an ID
  const { data: elevatorData, isLoading: isLoadingElevator, error: elevatorError } = useQuery({
    queryKey: [`/api/projects/${projectId}/elevators/${existingEquipmentId}`],
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'elevator') return null;
      const res = await fetch(`/api/projects/${projectId}/elevators/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Elevator with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch elevator data: ${res.statusText}`);
      return res.json();
    },
    enabled: !!existingEquipmentId && markerType === 'elevator' && isOpen,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // Fetch existing intercom data if we have an ID
  const { data: intercomData, isLoading: isLoadingIntercom, error: intercomError } = useQuery({
    queryKey: [`/api/projects/${projectId}/intercoms/${existingEquipmentId}`],
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'intercom') return null;
      const res = await fetch(`/api/projects/${projectId}/intercoms/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Intercom with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch intercom data: ${res.statusText}`);
      return res.json();
    },
    enabled: !!existingEquipmentId && markerType === 'intercom' && isOpen,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // If any equipment error occurs and it's not a 404, show an error toast
  useEffect(() => {
    const errors = [accessPointError, cameraError, elevatorError, intercomError].filter(Boolean);
    
    for (const error of errors) {
      if (error && !error.message.includes('404')) {
        toast({
          title: "Error Loading Equipment Data",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  }, [accessPointError, cameraError, elevatorError, intercomError, toast]);

  // Determine which form to show based on marker type
  const getEquipmentFormModal = () => {
    // Default empty equipment templates with first available option for each field
    const accessPoint = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      quick_config: 'Standard', // Required legacy field
      reader_type: 'AIO', // First option in reader_type dropdown
      lock_type: 'Standard', // First option in lock_type dropdown
      monitoring_type: 'Prop', // First option in monitoring_type dropdown
      lock_provider: 'Kastle', // First option in lock_provider dropdown
      takeover: 'Yes', // First option in takeover dropdown
      interior_perimeter: 'Interior', // First option in interior_perimeter dropdown
      exst_panel_location: '',
      exst_panel_type: '',
      exst_reader_type: '',
      new_panel_location: '',
      new_panel_type: '',
      new_reader_type: '',
      noisy_prop: 'No', // Default to No
      crashbars: 'No', // Default to No
      real_lock_type: 'Mortise', // First option in real_lock_type dropdown
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const camera = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      camera_type: 'IP Camera', // First option in camera_type dropdown
      mounting_type: 'Wall Mount', // First option in mounting_type dropdown
      resolution: '4K', // First option in resolution dropdown
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const elevator = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      manufacturer: 'Otis', // First option in manufacturer dropdown
      model: 'Gen2', // First option in model dropdown
      number_of_floors: 2, // Default reasonable value
      control_board_location: 'Machine Room', // First option in control_board_location dropdown
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const intercom = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      intercom_type: 'Audio Only', // First option in intercom_type dropdown
      connection_type: 'IP', // First option in connection_type dropdown
      mounting_type: 'Surface Mount', // First option in mounting_type dropdown
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    // Handle access point form
    if (markerType === 'access_point') {
      // Show loading state when fetching existing data
      if (existingEquipmentId && isLoadingAccessPoint) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Loading Access Point Data</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Handle case where equipment was deleted or not found
      if (existingEquipmentId && !accessPointData && !isLoadingAccessPoint) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Equipment Not Found</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>This access point (ID: {existingEquipmentId}) no longer exists in the database. It may have been deleted.</p>
                <p>Would you like to create a new access point or remove this marker?</p>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Clear the existing ID and create a new one
                    onEquipmentCreated(0, `Access Point ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`);
                    onClose();
                  }}>
                    Create New
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Use fetched data if available, otherwise use default
      const formData = existingEquipmentId && accessPointData 
        ? { ...accessPointData, id: existingEquipmentId } 
        : { ...accessPoint, id: existingEquipmentId || 0 };
      
      return (
        <EditAccessPointModal
          isOpen={isOpen}
          accessPoint={formData}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewAccessPoint={!existingEquipmentId} // Only new if no ID provided
        />
      );
    }

    // Handle camera form
    if (markerType === 'camera') {
      // Show loading state when fetching existing data
      if (existingEquipmentId && isLoadingCamera) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Loading Camera Data</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Handle case where equipment was deleted or not found
      if (existingEquipmentId && !cameraData && !isLoadingCamera) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Equipment Not Found</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>This camera (ID: {existingEquipmentId}) no longer exists in the database. It may have been deleted.</p>
                <p>Would you like to create a new camera or remove this marker?</p>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Clear the existing ID and create a new one
                    onEquipmentCreated(0, `Camera ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`);
                    onClose();
                  }}>
                    Create New
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Use fetched data if available, otherwise use default
      const formData = existingEquipmentId && cameraData 
        ? { ...cameraData, id: existingEquipmentId } 
        : { ...camera, id: existingEquipmentId || 0 };
      
      return (
        <EditCameraModal
          isOpen={isOpen}
          camera={formData}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewCamera={!existingEquipmentId} // Only new if no ID provided
        />
      );
    }

    // Handle elevator form
    if (markerType === 'elevator') {
      // Show loading state when fetching existing data
      if (existingEquipmentId && isLoadingElevator) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Loading Elevator Data</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Handle case where equipment was deleted or not found
      if (existingEquipmentId && !elevatorData && !isLoadingElevator) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Equipment Not Found</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>This elevator (ID: {existingEquipmentId}) no longer exists in the database. It may have been deleted.</p>
                <p>Would you like to create a new elevator or remove this marker?</p>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Clear the existing ID and create a new one
                    onEquipmentCreated(0, `Elevator ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`);
                    onClose();
                  }}>
                    Create New
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Use fetched data if available, otherwise use default
      const formData = existingEquipmentId && elevatorData 
        ? { ...elevatorData, id: existingEquipmentId } 
        : { ...elevator, id: existingEquipmentId || 0 };
      
      return (
        <EditElevatorModal
          isOpen={isOpen}
          elevator={formData}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewElevator={!existingEquipmentId} // Only new if no ID provided
        />
      );
    }

    // Handle intercom form
    if (markerType === 'intercom') {
      // Show loading state when fetching existing data
      if (existingEquipmentId && isLoadingIntercom) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Loading Intercom Data</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Handle case where equipment was deleted or not found
      if (existingEquipmentId && !intercomData && !isLoadingIntercom) {
        return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Equipment Not Found</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>This intercom (ID: {existingEquipmentId}) no longer exists in the database. It may have been deleted.</p>
                <p>Would you like to create a new intercom or remove this marker?</p>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Clear the existing ID and create a new one
                    onEquipmentCreated(0, `Intercom ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`);
                    onClose();
                  }}>
                    Create New
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      }
      
      // Use fetched data if available, otherwise use default
      const formData = existingEquipmentId && intercomData 
        ? { ...intercomData, id: existingEquipmentId } 
        : { ...intercom, id: existingEquipmentId || 0 };
      
      return (
        <EditIntercomModal
          isOpen={isOpen}
          intercom={formData}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewIntercom={!existingEquipmentId} // Only new if no ID provided
        />
      );
    }

    // If no matching equipment type, show a generic dialog
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Equipment Type Not Supported</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              The selected equipment type "{markerType}" doesn't have a form implementation yet.
            </p>
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return <>{getEquipmentFormModal()}</>;
};

export default EquipmentFormDialog;