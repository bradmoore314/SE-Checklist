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

interface AccessPointMarkerFormProps {
  projectId: number;
  onSubmit: (equipmentId: number, label: string | null) => void;
  onCancel: () => void;
  position: { x: number, y: number } | null;
}

const AccessPointMarkerForm: React.FC<AccessPointMarkerFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
  position
}) => {
  const [label, setLabel] = useState<string>("");
  const [selectedAccessPointId, setSelectedAccessPointId] = useState<number>(0);
  const [createNew, setCreateNew] = useState<boolean>(true);

  // Fetch existing access points
  const { data: accessPoints, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'access-points'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/access-points`);
      return await res.json();
    },
    enabled: !!projectId,
  });

  const handleSubmit = () => {
    if (createNew) {
      // Equipment ID 0 signals backend to create a new access point
      onSubmit(0, label || null);
    } else {
      // Use selected existing access point
      onSubmit(selectedAccessPointId, null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="font-medium">Adding Access Point Marker at Position {position?.x}%, {position?.y}%</span>
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
              <SelectItem value="new">Create New Access Point</SelectItem>
              <SelectItem value="existing">Use Existing Access Point</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {createNew ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Access Point Label</Label>
            <Input
              id="label"
              placeholder="e.g., Main Entrance Door"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will create a new access point with default settings.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="existing-access-point">Select Existing Access Point</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading access points...</span>
              </div>
            ) : accessPoints && accessPoints.length > 0 ? (
              <Select
                value={selectedAccessPointId.toString()}
                onValueChange={(value) => setSelectedAccessPointId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an access point" />
                </SelectTrigger>
                <SelectContent>
                  {accessPoints.map((ap: any) => (
                    <SelectItem key={ap.id} value={ap.id.toString()}>
                      {ap.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">No access points found. Create a new one instead.</p>
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

export default AccessPointMarkerForm;