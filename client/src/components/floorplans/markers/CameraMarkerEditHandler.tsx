import React from 'react';
import UnifiedCameraConfigForm, { CameraConfigData } from '@/components/camera/UnifiedCameraConfigForm';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Point } from '@/utils/coordinates';

interface CameraMarkerEditHandlerProps {
  markerData: {
    id: number;
    position_x: number;
    position_y: number;
    fov?: number;
    range?: number;
    rotation?: number;
    equipment_id?: number;
  };
  projectId: number;
  onUpdate: (updatedData: {
    id: number;
    position_x: number;
    position_y: number;
    fov: number;
    range: number;
    rotation: number;
  }) => void;
  onCancel: () => void;
}

export const CameraMarkerEditHandler: React.FC<CameraMarkerEditHandlerProps> = ({
  markerData,
  projectId,
  onUpdate,
  onCancel,
}) => {
  // If there's an equipment_id, fetch the camera data to populate the form
  const { data: cameraData, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/cameras`, markerData.equipment_id],
    queryFn: async () => {
      if (!markerData.equipment_id) return null;
      const response = await fetch(`/api/projects/${projectId}/cameras/${markerData.equipment_id}`);
      return response.json();
    },
    enabled: !!markerData.equipment_id
  });

  const handleSave = (data: CameraConfigData) => {
    // Only pass the visualization fields to onUpdate
    onUpdate({
      id: markerData.id,
      position_x: markerData.position_x,
      position_y: markerData.position_y,
      fov: data.fov,
      range: data.range,
      rotation: data.rotation,
    });
    
    // If there's an equipment_id, also update the camera details
    if (markerData.equipment_id) {
      apiRequest('PATCH', `/api/projects/${projectId}/cameras/${markerData.equipment_id}`, {
        ...data,
        id: markerData.equipment_id,
        project_id: projectId,
      });
    }
  };

  // Prepare initial data for the form
  const initialData: Partial<CameraConfigData> = {
    fov: markerData.fov || 90,
    range: markerData.range || 60,
    rotation: markerData.rotation || 0,
    ...(cameraData || {})
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-lg max-w-2xl">
      <h3 className="text-lg font-medium mb-4">Edit Camera Settings</h3>
      
      {isLoading && markerData.equipment_id ? (
        <div className="flex justify-center p-4">
          <span className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></span>
        </div>
      ) : (
        <UnifiedCameraConfigForm
          projectId={projectId}
          initialData={initialData}
          onSave={handleSave}
          onCancel={onCancel}
          saveButtonText="Apply Changes"
          cancelButtonText="Cancel"
          showImageUpload={false}
          mode="edit"
        />
      )}
    </div>
  );
};

export default CameraMarkerEditHandler;