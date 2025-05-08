import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';

interface CombinedCameraConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  marker: {
    id?: number;
    position_x: number;
    position_y: number;
    equipment_id?: number;
    fov?: number;
    range?: number;
    rotation?: number;
    label?: string;
  } | null;
  isNew?: boolean;
  onUpdate: (updatedData: {
    id?: number;
    position_x: number;
    position_y: number;
    equipment_id?: number;
    fov: number;
    range: number;
    rotation: number;
    label?: string;
    gateway_id?: number | null;
  }) => void;
  onCancel?: () => void;
}

const CombinedCameraConfigForm: React.FC<CombinedCameraConfigFormProps> = ({
  open, 
  onOpenChange,
  projectId,
  marker,
  isNew = false,
  onUpdate,
  onCancel
}) => {
  if (!marker) {
    return null;
  }

  const handleSave = (data: CameraConfigData) => {
    onUpdate({
      id: marker.id,
      position_x: marker.position_x,
      position_y: marker.position_y,
      equipment_id: data.useExistingCamera ? data.existingCameraId : undefined,
      fov: data.fov,
      range: data.range,
      rotation: data.rotation,
      label: data.location,
      gateway_id: data.gateway_id
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  // Prepare initialData for UnifiedCameraConfigForm
  const initialData: Partial<CameraConfigData> = {
    location: marker.label || '',
    fov: marker.fov || 90,
    range: marker.range || 60,
    rotation: marker.rotation || 0,
    equipment_id: marker.equipment_id,
    // If we're editing an existing marker with equipment_id,
    // we probably don't want to set useExistingCamera
    useExistingCamera: isNew && false
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Camera' : 'Edit Camera'}</DialogTitle>
        </DialogHeader>
        
        <UnifiedCameraConfigForm
          projectId={projectId}
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          saveButtonText={isNew ? 'Add Camera' : 'Update Camera'}
          showImageUpload={false}
          mode={isNew ? "add" : "edit"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CombinedCameraConfigForm;