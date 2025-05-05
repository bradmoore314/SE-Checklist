import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import EditAccessPointModal from '@/components/modals/EditAccessPointModal';
import EditCameraModal from '@/components/modals/EditCameraModal';
import EditElevatorModal from '@/components/modals/EditElevatorModal';
import EditIntercomModal from '@/components/modals/EditIntercomModal';

interface EquipmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  markerType: string;
  projectId: number;
  position: { x: number, y: number };
  onEquipmentCreated: (equipmentId: number, equipmentLabel: string) => void;
}

export function EquipmentFormDialog({
  isOpen,
  onClose,
  markerType,
  projectId,
  position,
  onEquipmentCreated
}: EquipmentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create empty equipment object based on marker type
  const emptyEquipment = {
    id: 0,
    project_id: projectId,
    location: `${markerType.charAt(0).toUpperCase() + markerType.slice(1).replace('_', ' ')} at position (${Math.round(position.x)}, ${Math.round(position.y)})`,
    notes: ''
  };
  
  // Access point specific fields
  const emptyAccessPoint = {
    ...emptyEquipment,
    reader_type: 'KR-100',
    lock_type: 'Standard',
    monitoring_type: 'Prop Monitoring',
    lock_provider: 'Kastle',
    interior_perimeter: 'Interior'
  };
  
  // Camera specific fields
  const emptyCamera = {
    ...emptyEquipment,
    camera_type: 'Dome',
    mounting_type: 'Ceiling',
    resolution: '4MP',
    field_of_view: '120°',
    is_indoor: true
  };
  
  // Elevator specific fields
  const emptyElevator = {
    ...emptyEquipment,
    manufacturer: '',
    model: '',
    number_of_floors: 0,
    control_board_location: ''
  };
  
  // Intercom specific fields
  const emptyIntercom = {
    ...emptyEquipment, 
    intercom_type: 'Aiphone',
    connection_type: 'IP',
    mounting_type: 'Wall'
  };
  
  // Create equipment mutation handlers for each type
  const handleAccessPointCreated = async (id: number, label: string) => {
    setIsSubmitting(false);
    onEquipmentCreated(id, label);
    onClose();
    
    toast({
      title: 'Access Point Created',
      description: `Successfully created "${label}"`,
    });
  };
  
  const handleCameraCreated = async (id: number, label: string) => {
    setIsSubmitting(false);
    onEquipmentCreated(id, label);
    onClose();
    
    toast({
      title: 'Camera Created',
      description: `Successfully created "${label}"`,
    });
  };
  
  const handleElevatorCreated = async (id: number, label: string) => {
    setIsSubmitting(false);
    onEquipmentCreated(id, label);
    onClose();
    
    toast({
      title: 'Elevator Created',
      description: `Successfully created "${label}"`,
    });
  };
  
  const handleIntercomCreated = async (id: number, label: string) => {
    setIsSubmitting(false);
    onEquipmentCreated(id, label);
    onClose();
    
    toast({
      title: 'Intercom Created',
      description: `Successfully created "${label}"`,
    });
  };
  
  // Render the appropriate form based on marker type
  const renderEquipmentForm = () => {
    switch (markerType) {
      case 'access_point':
        return (
          <EditAccessPointModal
            isOpen={true}
            accessPoint={emptyAccessPoint as any}
            onClose={onClose}
            onSave={(id, data) => handleAccessPointCreated(id, data.location)}
            fromFloorplan={true}
            isNewAccessPoint={true}
          />
        );
      case 'camera':
        return (
          <EditCameraModal
            isOpen={true}
            camera={emptyCamera as any}
            onClose={onClose}
            onSave={(id, data) => handleCameraCreated(id, data.location)}
            fromFloorplan={true}
            isNewCamera={true}
          />
        );
      case 'elevator':
        return (
          <EditElevatorModal
            isOpen={true}
            elevator={emptyElevator as any}
            onClose={onClose}
            onSave={(id, data) => handleElevatorCreated(id, data.location)}
            fromFloorplan={true}
            isNewElevator={true}
          />
        );
      case 'intercom':
        return (
          <EditIntercomModal
            isOpen={true}
            intercom={emptyIntercom as any}
            onClose={onClose}
            onSave={(id, data) => handleIntercomCreated(id, data.location)}
            fromFloorplan={true}
            isNewIntercom={true}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">
              Form not available for this equipment type.
            </p>
          </div>
        );
    }
  };

  // Note: We don't use the Dialog component here because the specific modal components
  // already include their own Dialog component. Instead, we're making this a wrapper
  // that conditionally renders the right modal.
  return isOpen ? renderEquipmentForm() : null;
}

export default EquipmentFormDialog;