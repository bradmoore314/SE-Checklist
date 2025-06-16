import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';

interface Camera {
  id: number;
  project_id: number;
  location: string;
  camera_type: string;
  mounting_type: string;
  resolution: string;
  notes?: string;
  is_indoor?: boolean;
  import_to_gateway?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EditCameraModalProps {
  isOpen: boolean;
  camera: Camera;
  onClose: () => void;
  onSave: (updatedData: Camera) => void;
  projectId: number;
}

export default function EditCameraModal({
  isOpen,
  camera,
  onClose,
  onSave,
  projectId
}: EditCameraModalProps) {
  const { toast } = useToast();

  const updateCameraMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/cameras/${camera.id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/cameras`] });
      toast({
        title: "Success",
        description: "Camera updated successfully",
      });
      if (onSave) {
        onSave(data);
      }
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSave = (data: CameraConfigData) => {
    // Transform data to match database schema
    const transformedData = {
      ...data,
      // Convert "indoor"/"outdoor" string to boolean
      is_indoor: data.is_indoor === "indoor" ? true : false,
      // Ensure field_of_view is a string
      field_of_view: data.fov ? data.fov.toString() : "90"
    };
    
    console.log("Sending camera update data:", transformedData);
    updateCameraMutation.mutate(transformedData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-camera-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Edit Camera
          </DialogTitle>
        </DialogHeader>
        
        <div id="edit-camera-dialog">
          <UnifiedCameraConfigForm
            projectId={projectId}
            onSave={handleSave}
            onCancel={handleCancel}
            saveButtonText="Save Camera"
            showImageUpload={true}
            mode="edit"
            initialData={{
              ...camera,
              is_indoor: camera.is_indoor ? "indoor" : "outdoor"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}