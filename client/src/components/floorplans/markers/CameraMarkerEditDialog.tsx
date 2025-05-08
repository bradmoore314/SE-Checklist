import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';

interface CameraMarkerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  marker: {
    id: number;
    position_x: number;
    position_y: number;
    fov?: number;
    range?: number;
    rotation?: number;
    label?: string;
    equipment_id?: number;
  } | null;
  onUpdate: (updatedData: {
    id: number;
    position_x: number;
    position_y: number;
    fov: number;
    range: number;
    rotation: number;
    label?: string;
  }) => void;
}

const CameraMarkerEditDialog: React.FC<CameraMarkerEditDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  marker,
  onUpdate,
}) => {
  if (!marker) {
    return null;
  }

  const handleSave = (data: CameraConfigData) => {
    onUpdate({
      id: marker.id,
      position_x: marker.position_x,
      position_y: marker.position_y,
      fov: data.fov,
      range: data.range,
      rotation: data.rotation,
      label: data.location || marker.label,
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const initialData: Partial<CameraConfigData> = {
    location: marker.label || '',
    fov: marker.fov || 90,
    range: marker.range || 60,
    rotation: marker.rotation || 0,
  };

  return (
    <Dialog open={open && !!marker} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Camera</DialogTitle>
          <DialogDescription>
            Adjust camera properties and visualization settings.
          </DialogDescription>
        </DialogHeader>
        
        <UnifiedCameraConfigForm
          projectId={projectId}
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          saveButtonText="Save Changes"
          cancelButtonText="Cancel"
          showImageUpload={false}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
};

export default CameraMarkerEditDialog;