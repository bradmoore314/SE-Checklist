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
  onEquipmentCreated
}: EquipmentFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Determine which form to show based on marker type
  const getEquipmentFormModal = () => {
    // Default empty equipment templates
    const accessPoint = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      reader_type: '',
      mounting_type: '',
      connection_type: '',
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const camera = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      camera_type: '',
      mounting_type: '',
      resolution: '',
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const elevator = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      manufacturer: '',
      model: '',
      number_of_floors: 0,
      control_board_location: '',
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    const intercom = {
      id: 0,
      project_id: projectId,
      location: `Floor ${position.x.toFixed(0)}, ${position.y.toFixed(0)}`,
      intercom_type: '',
      connection_type: '',
      mounting_type: '',
      notes: `Placed at coordinates x: ${position.x.toFixed(2)}, y: ${position.y.toFixed(2)}`
    };

    // Handle access point form
    if (markerType === 'access_point') {
      return (
        <EditAccessPointModal
          isOpen={isOpen}
          accessPoint={accessPoint}
          onClose={onClose}
          onSave={async (id, data) => {
            onEquipmentCreated(id, data.location);
          }}
          fromFloorplan={true}
          isNewAccessPoint={true}
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