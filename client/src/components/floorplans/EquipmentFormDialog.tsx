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
  const accessPointQueryKey = ['access-point', projectId, existingEquipmentId, isOpen];
  const { data: accessPointData, isLoading: isLoadingAccessPoint, error: accessPointError } = useQuery({
    queryKey: accessPointQueryKey,
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'access_point') return null;
      console.log(`Fetching access point: projectId=${projectId}, equipmentId=${existingEquipmentId}, timestamp=${Date.now()}`);
      const res = await fetch(`/api/projects/${projectId}/access-points/${existingEquipmentId}`);
      if (res.status === 404) {
        // Equipment not found in database, might have been deleted
        console.warn(`Access point with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch access point data: ${res.statusText}`);
      const data = await res.json();
      // Check if we got an empty response or no actual data returned
      if (!data || Object.keys(data).length === 0) {
        console.warn(`Access point with ID ${existingEquipmentId} returned empty data. May have been deleted.`);
        return null;
      }
      return data;
    },
    enabled: !!existingEquipmentId && markerType === 'access_point' && isOpen,
    retry: (failureCount, error) => {
      // Don't retry 404 errors
      if (error && error.message && error.message.includes('404')) return false;
      return failureCount < 3; // retry up to 3 times for other errors
    }
  });
  
  // Fetch existing camera data if we have an ID
  const cameraQueryKey = ['camera', projectId, existingEquipmentId, isOpen];
  const { data: cameraData, isLoading: isLoadingCamera, error: cameraError } = useQuery({
    queryKey: cameraQueryKey,
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'camera') return null;
      console.log(`Fetching camera: projectId=${projectId}, equipmentId=${existingEquipmentId}, timestamp=${Date.now()}`);
      const res = await fetch(`/api/projects/${projectId}/cameras/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Camera with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch camera data: ${res.statusText}`);
      const data = await res.json();
      // Check if we got an empty response or no actual data returned
      if (!data || Object.keys(data).length === 0) {
        console.warn(`Camera with ID ${existingEquipmentId} returned empty data. May have been deleted.`);
        return null;
      }
      return data;
    },
    enabled: !!existingEquipmentId && markerType === 'camera' && isOpen,
    retry: (failureCount, error) => {
      if (error && error.message && error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // Fetch existing elevator data if we have an ID
  const elevatorQueryKey = ['elevator', projectId, existingEquipmentId, isOpen];
  const { data: elevatorData, isLoading: isLoadingElevator, error: elevatorError } = useQuery({
    queryKey: elevatorQueryKey,
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'elevator') return null;
      console.log(`Fetching elevator: projectId=${projectId}, equipmentId=${existingEquipmentId}, timestamp=${Date.now()}`);
      const res = await fetch(`/api/projects/${projectId}/elevators/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Elevator with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch elevator data: ${res.statusText}`);
      const data = await res.json();
      // Check if we got an empty response or no actual data returned
      if (!data || Object.keys(data).length === 0) {
        console.warn(`Elevator with ID ${existingEquipmentId} returned empty data. May have been deleted.`);
        return null;
      }
      return data;
    },
    enabled: !!existingEquipmentId && markerType === 'elevator' && isOpen,
    retry: (failureCount, error) => {
      if (error && error.message && error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // Fetch existing intercom data if we have an ID
  const intercomQueryKey = ['intercom', projectId, existingEquipmentId, isOpen];
  const { data: intercomData, isLoading: isLoadingIntercom, error: intercomError } = useQuery({
    queryKey: intercomQueryKey,
    queryFn: async () => {
      if (!existingEquipmentId || markerType !== 'intercom') return null;
      console.log(`Fetching intercom: projectId=${projectId}, equipmentId=${existingEquipmentId}, timestamp=${Date.now()}`);
      const res = await fetch(`/api/projects/${projectId}/intercoms/${existingEquipmentId}`);
      if (res.status === 404) {
        console.warn(`Intercom with ID ${existingEquipmentId} not found. May have been deleted.`);
        return null;
      }
      if (!res.ok) throw new Error(`Failed to fetch intercom data: ${res.statusText}`);
      const data = await res.json();
      // Check if we got an empty response or no actual data returned
      if (!data || Object.keys(data).length === 0) {
        console.warn(`Intercom with ID ${existingEquipmentId} returned empty data. May have been deleted.`);
        return null;
      }
      return data;
    },
    enabled: !!existingEquipmentId && markerType === 'intercom' && isOpen,
    retry: (failureCount, error) => {
      if (error && error.message && error.message.includes('404')) return false;
      return failureCount < 3;
    }
  });
  
  // Enhanced logging for debugging configuration issues
  useEffect(() => {
    if (existingEquipmentId && markerType === 'access_point' && !isLoadingAccessPoint) {
      console.log('Access Point Data:', accessPointData);
      
      // Detailed logging to help diagnose configuration issues
      if (accessPointData) {
        console.log('Access Point Configuration Details:');
        console.log('- ID:', accessPointData.id);
        console.log('- Location:', accessPointData.location);
        console.log('- Reader Type:', accessPointData.reader_type);
        console.log('- Lock Type:', accessPointData.lock_type);
        console.log('- Monitoring Type:', accessPointData.monitoring_type);
        console.log('- Quick Config:', accessPointData.quick_config);
      } else {
        console.warn(`Access point data is ${accessPointData === null ? 'null' : 'undefined'} for ID ${existingEquipmentId}`);
        
        // Attempt to force a re-fetch when data is missing
        if (isOpen && existingEquipmentId) {
          console.log(`Re-fetching access point data for ID ${existingEquipmentId}...`);
          fetch(`/api/projects/${projectId}/access-points/${existingEquipmentId}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status}`);
              }
              
              const contentType = res.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Invalid content type: ${contentType}`);
              }
              
              return res.json();
            })
            .then(data => {
              console.log('Direct fetch result:', data);
            })
            .catch(err => {
              console.error('Direct fetch error:', err);
            });
        }
      }
    }
  }, [existingEquipmentId, markerType, accessPointData, isLoadingAccessPoint, isOpen, projectId]);

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
      reader_type: 'KR-100', // Default to KR-100 instead of AIO
      lock_type: 'Standard', // First option in lock_type dropdown
      monitoring_type: 'Prop', // First option in monitoring_type dropdown
      lock_provider: 'Kastle', // First option in lock_provider dropdown
      takeover: 'No', // Default to No
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
      if (existingEquipmentId && accessPointData === null && !isLoadingAccessPoint) {
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
        ? { 
            ...accessPoint,  // Start with default values for all fields
            ...accessPointData, // Override with actual data from database
            id: existingEquipmentId,
            // Explicitly ensure critical fields are set
            quick_config: accessPointData.quick_config || 'Standard',
            reader_type: accessPointData.reader_type || 'AIO',
            lock_type: accessPointData.lock_type || 'Standard',
            monitoring_type: accessPointData.monitoring_type || 'Prop',
          } 
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
      if (existingEquipmentId && cameraData === null && !isLoadingCamera) {
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
        ? { 
            ...camera,  // Start with default values for all fields
            ...cameraData, // Override with actual data from database
            id: existingEquipmentId,
            // Explicitly ensure critical fields are set
            camera_type: cameraData.camera_type || 'IP Camera',
            mounting_type: cameraData.mounting_type || 'Wall Mount',
            resolution: cameraData.resolution || '4K'
          } 
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
      if (existingEquipmentId && elevatorData === null && !isLoadingElevator) {
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
        ? { 
            ...elevator,  // Start with default values for all fields
            ...elevatorData, // Override with actual data from database
            id: existingEquipmentId,
            // Explicitly ensure critical fields are set
            manufacturer: elevatorData.manufacturer || 'Otis',
            model: elevatorData.model || 'Gen2',
            number_of_floors: elevatorData.number_of_floors || 2,
            control_board_location: elevatorData.control_board_location || 'Machine Room',
          } 
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
      if (existingEquipmentId && intercomData === null && !isLoadingIntercom) {
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
        ? { 
            ...intercom,  // Start with default values for all fields
            ...intercomData, // Override with actual data from database
            id: existingEquipmentId,
            // Explicitly ensure critical fields are set
            intercom_type: intercomData.intercom_type || 'Door Station',
            mounting_type: intercomData.mounting_type || 'Surface Mount',
            user_count: intercomData.user_count || 1
          } 
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