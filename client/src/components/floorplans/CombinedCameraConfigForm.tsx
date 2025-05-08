import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  // Prevent scrolling in background PDF when dialog is open
  useEffect(() => {
    if (open) {
      // Save the original overflow style
      const originalStyle = document.body.style.overflow;
      
      // Create a modal overlay that captures all wheel events
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.zIndex = '999'; // High z-index below dialog
      overlay.style.background = 'transparent';
      document.body.appendChild(overlay);
      
      // Completely block all wheel events on the document
      const handleWheel = (e: WheelEvent) => {
        const dialogContent = document.querySelector('[role="dialog"]');
        
        // Only allow wheel events inside the dialog content
        if (!dialogContent || !dialogContent.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      
      // Add the event listeners with capture phase to catch events before they reach the PDF
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      
      // Clean up when the dialog closes
      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('wheel', handleWheel, { capture: true });
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };
    }
  }, [open]);

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
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Camera' : 'Edit Camera'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <UnifiedCameraConfigForm
            projectId={projectId}
            initialData={initialData}
            onSave={handleSave}
            onCancel={handleCancel}
            saveButtonText={isNew ? 'Add Camera' : 'Update Camera'}
            showImageUpload={false}
            mode={isNew ? "add" : "edit"}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedCameraConfigForm;