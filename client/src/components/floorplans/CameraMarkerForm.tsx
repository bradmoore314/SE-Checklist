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
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface CameraMarkerFormProps {
  projectId: number;
  onSubmit: (equipmentId: number, label: string | null) => void;
  onCancel: () => void;
  position: { x: number, y: number } | null;
}

const CameraMarkerForm: React.FC<CameraMarkerFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
  position
}) => {
  const [label, setLabel] = useState<string>("");
  const [selectedCameraId, setSelectedCameraId] = useState<number>(0);
  const [createNew, setCreateNew] = useState<boolean>(true);

  // Fetch existing cameras
  const { data: cameras, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'cameras'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/cameras`);
      return await res.json();
    },
    enabled: !!projectId,
  });

  const handleSubmit = () => {
    if (createNew) {
      // Equipment ID 0 signals backend to create a new camera
      onSubmit(0, label || null);
    } else {
      // Use selected existing camera
      onSubmit(selectedCameraId, null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="font-medium">Adding Camera Marker at Position {position?.x}%, {position?.y}%</span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
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

        {createNew ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Camera Label</Label>
            <Input
              id="label"
              placeholder="e.g., Lobby Camera"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will create a new camera with default settings.
            </p>
          </div>
        ) : (
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
                  {cameras.map((camera: any) => (
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
          Add Marker
        </Button>
      </div>
    </div>
  );
};

export default CameraMarkerForm;