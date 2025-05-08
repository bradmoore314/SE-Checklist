import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';
import ImageUploadSection from '@/components/ImageUploadSection';

interface CombinedCameraConfigFormProps {
  // Common props for both floorplan and standalone modes
  projectId: number;
  cameraData?: any; // Camera equipment data from the database
  
  // Dialog control (different props accepted)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean; // Alternate prop for backward compatibility
  onClose?: () => void; // Alternate prop for backward compatibility
  
  // Marker props (for floorplan view)
  marker?: {
    id?: number;
    position_x?: number;
    position_y?: number;
    equipment_id?: number;
    fov?: number;
    range?: number;
    rotation?: number;
    label?: string;
  } | null;
  
  // Other marker data (required for consistency between views)
  floorplanId?: number | null;
  markerId?: number | null;
  
  // Mode flags
  isNew?: boolean;
  
  // Callback handlers (different naming conventions)
  onUpdate?: (updatedData: any) => void;
  onSave?: (updatedData: any) => void;
  onCancel?: () => void;
  
  // UI customization
  title?: string;
}

const CombinedCameraConfigForm: React.FC<CombinedCameraConfigFormProps> = ({
  open, 
  onOpenChange,
  isOpen,
  onClose,
  projectId,
  marker,
  floorplanId,
  markerId,
  isNew = false,
  cameraData,
  onUpdate,
  onSave,
  onCancel,
  title
}) => {
  // For compatibility with both prop styles
  const dialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || ((isOpen: boolean) => {
    if (!isOpen && onClose) onClose();
  });
  const submitHandler = onUpdate || onSave;
  
  // Prevent scrolling in background PDF when dialog is open
  useEffect(() => {
    if (dialogOpen) {
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
  }, [dialogOpen]);

  // Different behavior based on the source (floorplan or standalone)
  const isFloorplanMode = !!marker;
  
  const handleSave = (data: CameraConfigData) => {
    if (!submitHandler) return;
    
    if (isFloorplanMode && marker) {
      // In floorplan mode, we update the marker with position and FOV
      submitHandler({
        id: marker.id,
        position_x: marker.position_x,
        position_y: marker.position_y,
        equipment_id: data.useExistingCamera ? data.existingCameraId : undefined,
        fov: data.fov,
        range: data.range,
        rotation: data.rotation,
        label: data.location,
        gateway_id: data.gateway_id || null
      });
    } else {
      // In standalone mode, we're just updating the camera data
      submitHandler({
        id: cameraData?.id,
        location: data.location,
        camera_type: data.camera_type,
        mounting_type: data.mounting_type,
        resolution: data.resolution,
        field_of_view: data.fov?.toString(),
        is_indoor: data.is_indoor === 'indoor',
        import_to_gateway: data.import_to_gateway,
        notes: data.notes,
        gateway_id: data.gateway_id || null
      });
    }
    
    // Close the dialog
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    }
  };

  // Prepare initialData for UnifiedCameraConfigForm
  const initialData: Partial<CameraConfigData> = {};
  
  if (isFloorplanMode && marker) {
    // Floorplan mode - initialize from marker data
    Object.assign(initialData, {
      location: marker.label || '',
      fov: marker.fov || 90,
      range: marker.range || 60,
      rotation: marker.rotation || 0,
      equipment_id: marker.equipment_id,
      useExistingCamera: isNew && false
    });
  } else {
    // Standalone mode - initialize directly from camera data
    Object.assign(initialData, {
      location: cameraData?.location || '',
      camera_type: cameraData?.camera_type || '',
      mounting_type: cameraData?.mounting_type || '',
      resolution: cameraData?.resolution || '',
      fov: cameraData?.field_of_view ? parseInt(cameraData.field_of_view) : 90,
      is_indoor: cameraData?.is_indoor ? 'indoor' : 'outdoor',
      import_to_gateway: cameraData?.import_to_gateway || false,
      notes: cameraData?.notes || '',
      gateway_id: cameraData?.gateway_id || null
    });
  }
  
  // If we have camera data from the server and we're in floorplan mode, merge camera data
  if (isFloorplanMode && cameraData && !isNew) {
    console.log("Using camera data from server:", cameraData);
    
    // Add camera-specific fields from the database
    Object.assign(initialData, {
      camera_type: cameraData.camera_type || '',
      mounting_type: cameraData.mounting_type || '',
      resolution: cameraData.resolution || '',
      is_indoor: cameraData.is_indoor ? 'indoor' : 'outdoor',
      import_to_gateway: cameraData.import_to_gateway || false,
      gateway_id: cameraData.gateway_id || null,
      notes: cameraData.notes || ''
    });
  }

  const dialogTitle = title || (isNew ? 'Add New Camera' : 'Edit Camera');

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[calc(100vh-40px)]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(100vh-180px)] pr-4">
          <div className="space-y-6 pb-4">
            <UnifiedCameraConfigForm
              projectId={projectId}
              initialData={initialData}
              onSave={handleSave}
              onCancel={handleCancel}
              saveButtonText={isNew ? 'Add Camera' : 'Update Camera'}
              showImageUpload={false}
              mode={isNew ? "add" : "edit"}
            />
            
            {!isNew && cameraData && cameraData.id && (
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mt-8">
                <h2 className="text-xl font-semibold mb-2">Camera Images</h2>
                <div className="text-sm text-muted-foreground mb-4">
                  Add photos of the camera location to document its installation
                </div>
                <ImageUploadSection 
                  projectId={projectId} 
                  equipmentId={cameraData.id} 
                  equipmentType="camera"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedCameraConfigForm;