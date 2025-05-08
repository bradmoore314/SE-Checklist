import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
  onCancel: () => void;
}

interface Gateway {
  id: number;
  name: string;
  ip_address: string;
  location: string;
}

interface Camera {
  id: number;
  project_id: number;
  location: string;
  gateway_id: number | null;
  camera_type: string | null;
  resolution: string | null;
  notes: string | null;
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
  const [label, setLabel] = useState<string>(marker?.label || '');
  const [fov, setFov] = useState<number>(marker?.fov || 90);
  const [range, setRange] = useState<number>(marker?.range || 60);
  const [rotation, setRotation] = useState<number>(marker?.rotation || 0);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>(marker?.equipment_id);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null);
  const [useExistingCamera, setUseExistingCamera] = useState<boolean>(false);

  // Fetch gateways for this project
  const { data: gateways, isLoading: loadingGateways } = useQuery<Gateway[]>({
    queryKey: ['/api/projects', projectId, 'gateways'],
    enabled: open
  });

  // Fetch cameras for this project (for selecting existing camera)
  const { data: cameras, isLoading: loadingCameras } = useQuery<Camera[]>({
    queryKey: ['/api/projects', projectId, 'cameras'],
    enabled: open
  });

  // When editing existing camera, fetch its details
  const { data: cameraDetails, isLoading: loadingCameraDetails } = useQuery<Camera>({
    queryKey: ['/api/cameras', marker?.equipment_id],
    enabled: open && !!marker?.equipment_id
  });

  // Update form state when camera details are loaded
  useEffect(() => {
    if (cameraDetails && marker?.equipment_id) {
      setSelectedGatewayId(cameraDetails.gateway_id);
      if (cameraDetails.location && !label) {
        setLabel(cameraDetails.location);
      }
    }
  }, [cameraDetails, marker?.equipment_id, label]);

  // Reset form when marker changes or dialog opens
  useEffect(() => {
    if (open && marker) {
      setLabel(marker.label || '');
      setFov(marker.fov || 90);
      setRange(marker.range || 60);
      setRotation(marker.rotation || 0);
      setSelectedEquipmentId(marker.equipment_id);
      setUseExistingCamera(false);
    }
  }, [open, marker]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marker) return;
    
    onUpdate({
      id: marker.id,
      position_x: marker.position_x,
      position_y: marker.position_y,
      equipment_id: useExistingCamera ? selectedEquipmentId : undefined,
      fov,
      range,
      rotation,
      label,
      gateway_id: selectedGatewayId
    });
  };

  // Format the angle for display
  const formatAngle = (angle: number): string => {
    // Normalize to 0-360 range for display
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle.toFixed(0) + '°';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Camera' : 'Edit Camera'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Camera equipment settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Camera Equipment</h3>
              
              {isNew && (
                <div className="flex items-center space-x-2 mb-4">
                  <Label htmlFor="camera-type">Camera Source</Label>
                  <div className="flex space-x-4">
                    <Label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="camera-source"
                        checked={!useExistingCamera}
                        onChange={() => setUseExistingCamera(false)}
                        className="h-4 w-4"
                      />
                      <span>New Camera</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="camera-source"
                        checked={useExistingCamera}
                        onChange={() => setUseExistingCamera(true)}
                        className="h-4 w-4"
                      />
                      <span>Existing Camera</span>
                    </Label>
                  </div>
                </div>
              )}
              
              {useExistingCamera ? (
                <div className="space-y-2">
                  <Label htmlFor="existingCamera">Select Existing Camera</Label>
                  {loadingCameras ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <Select 
                      value={selectedEquipmentId?.toString()} 
                      onValueChange={(value) => setSelectedEquipmentId(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a camera..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cameras?.filter(cam => cam.id !== marker?.equipment_id).map(camera => (
                          <SelectItem key={camera.id} value={camera.id.toString()}>
                            {camera.location || `Camera ${camera.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Camera Name/Location</Label>
                    <Input
                      id="name"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Enter camera name or location"
                      required={!useExistingCamera}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gateway">Stream Gateway</Label>
                    {loadingGateways ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <Select 
                        value={selectedGatewayId?.toString() || ""} 
                        onValueChange={(value) => setSelectedGatewayId(value ? Number(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gateway (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Gateway</SelectItem>
                          {gateways?.map(gateway => (
                            <SelectItem key={gateway.id} value={gateway.id.toString()}>
                              {gateway.name || gateway.ip_address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Right column - Marker visualization settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Marker Visualization</h3>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="fov">Field of View: {fov.toFixed(0)}°</Label>
                        <span className="text-xs text-gray-500">(10° - 360°)</span>
                      </div>
                      <Slider
                        id="fov"
                        min={10}
                        max={360}
                        step={1}
                        value={[fov]}
                        onValueChange={(values) => setFov(values[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="range">Range: {range.toFixed(0)} units</Label>
                        <span className="text-xs text-gray-500">(20 - 200 units)</span>
                      </div>
                      <Slider
                        id="range"
                        min={20}
                        max={200}
                        step={1}
                        value={[range]}
                        onValueChange={(values) => setRange(values[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="rotation">Rotation: {formatAngle(rotation)}</Label>
                        <span className="text-xs text-gray-500">(0° - 359°)</span>
                      </div>
                      <Slider
                        id="rotation"
                        min={0}
                        max={359}
                        step={1}
                        value={[rotation]}
                        onValueChange={(values) => setRotation(values[0])}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium mb-2">Visualization Preview</h4>
                <div className="relative bg-white border border-gray-300 rounded-md h-32 flex items-center justify-center">
                  <div className="absolute w-20 h-20">
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full"
                    />
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 origin-center"
                      style={{
                        width: `${range * 0.2}px`,
                        height: `${range * 0.2}px`,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      }}
                    >
                      <div 
                        className="absolute top-1/2 left-1/2 bg-blue-200 opacity-50"
                        style={{
                          width: `${range * 0.2}px`,
                          height: `${range * 0.2}px`,
                          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                          clipPath: `polygon(50% 50%, ${50 - fov/2}% 0%, ${50 + fov/2}% 0%)`,
                          borderRadius: '50%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isNew ? 'Add Camera' : 'Update Camera'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedCameraConfigForm;