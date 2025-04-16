import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { Camera } from '@shared/schema';

interface CameraMarkerFormProps {
  projectId: number;
  onSubmit: (equipmentId: number, label: string | null, cameraData?: any) => void;
  onCancel: () => void;
  position: { x: number, y: number } | null;
  existingMarker?: { id: number; equipment_id: number };
}

const CameraMarkerForm: React.FC<CameraMarkerFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
  position,
  existingMarker
}) => {
  // Fetch existing cameras
  const { data: cameras, isLoading } = useQuery<Camera[]>({
    queryKey: ['/api/projects', projectId, 'cameras'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/cameras`);
      return await res.json();
    },
    enabled: !!projectId,
  });
  
  // Fetch lookup data for proper options
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ['/api/lookup'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/lookup');
      return await res.json();
    },
  });
  
  // Fetch specific camera if we're editing an existing marker
  const { data: existingCamera, isLoading: isLoadingExisting } = useQuery<Camera>({
    queryKey: ['/api/cameras', existingMarker?.equipment_id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/cameras/${existingMarker?.equipment_id}`);
      return await res.json();
    },
    enabled: !!existingMarker?.equipment_id,
  });

  // Form state
  const [createNew, setCreateNew] = useState<boolean>(!existingMarker);
  const [selectedCameraId, setSelectedCameraId] = useState<number>(existingMarker?.equipment_id || 0);
  
  // Camera details state - prepopulated if editing
  const [location, setLocation] = useState<string>(existingCamera?.location || "");
  const [cameraType, setCameraType] = useState<string>(existingCamera?.camera_type || "Fixed");
  const [mountingType, setMountingType] = useState<string>(existingCamera?.mounting_type || "Wall");
  const [interiorExterior, setInteriorExterior] = useState<string>("Interior"); // Custom field just for markers
  const [notes, setNotes] = useState<string>(existingCamera?.notes || "");
  const [resolution, setResolution] = useState<string>(existingCamera?.resolution || "");
  const [fieldOfView, setFieldOfView] = useState<string>(existingCamera?.field_of_view || "");

  // Update form fields if existing camera data loads
  React.useEffect(() => {
    if (existingCamera) {
      setLocation(existingCamera.location || "");
      setCameraType(existingCamera.camera_type || "Fixed");
      setMountingType(existingCamera.mounting_type || "Wall");
      setNotes(existingCamera.notes || "");
      setResolution(existingCamera.resolution || "");
      setFieldOfView(existingCamera.field_of_view || "");
    }
  }, [existingCamera]);

  const handleSubmit = () => {
    if (createNew) {
      // For new cameras, pass all the form data to create a complete record
      const cameraData = {
        location,
        camera_type: cameraType,
        mounting_type: mountingType,
        resolution: resolution || null,
        field_of_view: fieldOfView || null,
        notes,
        project_id: projectId
      };
      
      // Pass 0 for equipmentId to signal creating a new one, along with the form data
      onSubmit(0, location, cameraData);
    } else if (existingMarker) {
      // If we're editing an existing marker, pass the updated data
      const updatedData = {
        location,
        camera_type: cameraType,
        mounting_type: mountingType,
        resolution: resolution || null,
        field_of_view: fieldOfView || null,
        notes
      };
      
      // Pass the existing equipment ID and the form data for updates
      onSubmit(existingMarker.equipment_id, location, updatedData);
    } else {
      // Using an existing camera without modifications
      onSubmit(selectedCameraId, null);
    }
  };

  // If we're loading an existing marker's details, show a loading state
  if (existingMarker && isLoadingExisting) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading camera details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="font-medium">
            {existingMarker 
              ? `Editing Camera Marker #${existingMarker.id}` 
              : `Adding Camera Marker at Position ${position?.x}%, ${position?.y}%`}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {!existingMarker && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="marker-type">Marker Type</Label>
            <Select
              value={createNew ? "new" : "existing"}
              onValueChange={(value) => setCreateNew(value === "new")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Camera</SelectItem>
                <SelectItem value="existing">Use Existing Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {createNew || existingMarker ? (
          // Form for new camera or editing existing one
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location/Name</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Entrance Camera"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="camera-type">Camera Type</Label>
                  <Select 
                    value={cameraType} 
                    onValueChange={setCameraType}
                  >
                    <SelectTrigger id="camera-type">
                      <SelectValue placeholder="Select camera type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLookups ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : lookupData?.cameraTypes ? (
                        lookupData.cameraTypes.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Fixed Indoor Dome">Fixed Indoor Dome</SelectItem>
                          <SelectItem value="Fixed Outdoor Dome">Fixed Outdoor Dome</SelectItem>
                          <SelectItem value="PTZ">PTZ</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interior-exterior">Interior/Exterior</Label>
                  <Select 
                    value={interiorExterior} 
                    onValueChange={setInteriorExterior}
                  >
                    <SelectTrigger id="interior-exterior">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Exterior">Exterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mounting-type">Mount Type</Label>
                <Select 
                  value={mountingType} 
                  onValueChange={setMountingType}
                >
                  <SelectTrigger id="mounting-type">
                    <SelectValue placeholder="Select mount type" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLookups ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : lookupData?.mountingTypes ? (
                      lookupData.mountingTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Wall">Wall</SelectItem>
                        <SelectItem value="Ceiling">Ceiling</SelectItem>
                        <SelectItem value="Pole">Pole</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Input
                    id="resolution"
                    placeholder="e.g., 4MP, 1080p"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field-of-view">Field of View</Label>
                  <Input
                    id="field-of-view"
                    placeholder="e.g., 120°, Wide Angle"
                    value={fieldOfView}
                    onChange={(e) => setFieldOfView(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this camera"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        ) : (
          // Form for selecting existing camera
          <div className="flex flex-col gap-2">
            <Label htmlFor="existing-camera">Select Existing Camera</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading cameras...</span>
              </div>
            ) : cameras && cameras.length > 0 ? (
              <Select
                value={selectedCameraId.toString()}
                onValueChange={(value) => setSelectedCameraId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id.toString()}>
                      {camera.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">No cameras found. Create a new one instead.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {existingMarker ? "Update Marker" : "Add Marker"}
        </Button>
      </div>
    </div>
  );
};

export default CameraMarkerForm;