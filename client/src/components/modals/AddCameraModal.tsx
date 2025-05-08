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
  onSave?: (id: number, data: any) => void;
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
  const addCameraMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/cameras`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/cameras`] });
      toast({
        title: "Success",
        description: "Camera added successfully",
      });
      if (onSave) {
        onSave(data.id, data);
      }
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSave = async (data: CameraConfigData) => {
    // Create the payload with field_of_view for database compatibility
    const payload = {
      ...data,
      project_id: projectId,
      field_of_view: data.fov ? data.fov.toString() : "90", // Convert fov to string for field_of_view
    };
    
    // Debug the payload
    console.log("Camera data being sent:", payload);
    
    try {
      const result = await addCameraMutation.mutateAsync(payload);
      console.log("Camera creation successful:", result);
    } catch (error) {
      console.error("Camera creation error:", error);
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