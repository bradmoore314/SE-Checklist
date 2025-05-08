import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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
      // Set the id field if we have an existing equipment ID
      if (existingEquipmentId) {
        accessPoint.id = existingEquipmentId;
      }
      
      return (
        <EditAccessPointModal
          isOpen={isOpen}
          accessPoint={accessPoint}
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
      return (
        <EditCameraModal
          isOpen={isOpen}
          camera={camera}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewCamera={true}
        />
      );
    }

    // Handle elevator form
    if (markerType === 'elevator') {
      return (
        <EditElevatorModal
          isOpen={isOpen}
          elevator={elevator}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewElevator={true}
        />
      );
    }

    // Handle intercom form
    if (markerType === 'intercom') {
      return (
        <EditIntercomModal
          isOpen={isOpen}
          intercom={intercom}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewIntercom={true}
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