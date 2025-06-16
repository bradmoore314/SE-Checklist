import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from '@/hooks/use-toast';
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';

interface AddCameraModalProps {
  projectId: number;
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export default function AddCameraModal({
  projectId,
  open,
  isOpen,
  onOpenChange,
  onClose,
  onSave,
  onCancel
}: AddCameraModalProps) {
  const handleSave = (data: CameraConfigData) => {
    // Create the payload with proper format conversions for database compatibility
    const payload = {
      ...data,
      project_id: projectId,
      field_of_view: data.fov ? data.fov.toString() : "90", // Convert fov to string for field_of_view
      is_indoor: data.is_indoor === "indoor" ? true : false, // Convert "indoor"/"outdoor" to boolean
    };
    
    // Debug the payload
    console.log("Camera data being sent:", payload);
    
    // Call the parent's onSave function instead of making direct API call
    if (onSave) {
      onSave(payload);
    }
    
    // Close modal
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onClose) {
      onClose();
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="camera-config-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Camera
          </DialogTitle>
        </DialogHeader>
        
        <div id="camera-config-dialog">
          <UnifiedCameraConfigForm
            projectId={projectId}
            onSave={handleSave}
            onCancel={handleCancel}
            saveButtonText="Add Camera"
            showImageUpload={true}
            mode="add"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}