import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Point } from '@/lib/coordinate-utils';
import { Camera } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface CombinedCameraConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  marker: {
    id: number;
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
    id: number;
    position_x: number;
    position_y: number;
    equipment_id?: number;
    fov: number;
    range: number;
    rotation: number;
    label?: string;
  }) => void;
  onCancel: () => void;
}

const CombinedCameraConfigForm: React.FC<CombinedCameraConfigFormProps> = ({
  open,
  onOpenChange,
  projectId,
  marker,
  isNew = false,
  onUpdate,
  onCancel,
}) => {
  // Camera visualization properties
  const [fov, setFov] = useState<number>(90);
  const [range, setRange] = useState<number>(60);
  const [rotation, setRotation] = useState<number>(0);
  const [label, setLabel] = useState<string>('');

  // Camera details state
  const [location, setLocation] = useState<string>('');
  const [cameraType, setCameraType] = useState<string>("Fixed");
  const [mountingType, setMountingType] = useState<string>("Wall");
  const [interiorExterior, setInteriorExterior] = useState<string>("Interior");
  const [notes, setNotes] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  const [fieldOfView, setFieldOfView] = useState<string>('');

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
    queryKey: ['/api/cameras', marker?.equipment_id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/cameras/${marker?.equipment_id}`);
      return await res.json();
    },
    enabled: !!marker?.equipment_id && open,
  });

  // Initialize form when marker or camera data changes
  useEffect(() => {
    if (marker) {
      // Set camera visualization properties
      setFov(marker.fov || 90);
      setRange(marker.range || 60);
      setRotation(marker.rotation || 0);
      setLabel(marker.label || '');
    }
  }, [marker]);

  // Update form fields if existing camera data loads
  useEffect(() => {
    if (existingCamera) {
      setLocation(existingCamera.location || '');
      setCameraType(existingCamera.camera_type || 'Fixed');
      setMountingType(existingCamera.mounting_type || 'Wall');
      setNotes(existingCamera.notes || '');
      setResolution(existingCamera.resolution || '');
      setFieldOfView(existingCamera.field_of_view || '');
    } else if (isNew) {
      // For new cameras, use defaults
      setLocation(label || ''); // Use marker label as default location
      setCameraType('Fixed');
      setMountingType('Wall');
      setInteriorExterior('Interior');
      setNotes('');
      setResolution('');
      setFieldOfView(fov.toString() + '°'); // Use marker FOV as default
    }
  }, [existingCamera, isNew, label, fov]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marker) return;
    
    const cameraData = {
      location,
      camera_type: cameraType,
      mounting_type: mountingType,
      resolution: resolution || null,
      field_of_view: fieldOfView || null,
      notes,
      project_id: projectId
    };
    
    // Combine camera record data with visual properties
    onUpdate({
      id: marker.id,
      position_x: marker.position_x,
      position_y: marker.position_y,
      equipment_id: marker.equipment_id,
      fov,
      range,
      rotation,
      label: location || label, // Use location as the label
      cameraData // Pass camera data for backend processing
    });
    
    onOpenChange(false);
  };

  // Safely close dialog and cleanup
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  // Calculate FOV arc points for preview
  const calculateFovArc = () => {
    const centerX = 0;
    const centerY = 0;
    
    // Convert FOV from degrees to radians
    const fovRadians = (fov * Math.PI) / 180;
    
    // Calculate the starting and ending angles based on rotation
    const rotationRadians = (rotation * Math.PI) / 180;
    const startAngle = rotationRadians - fovRadians / 2;
    const endAngle = rotationRadians + fovRadians / 2;
    
    // Generate points along the arc
    const arcPoints: Point[] = [];
    const segments = 20; // Number of segments to approximate the arc
    const previewRange = 80; // Fixed preview range
    
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (i / segments) * fovRadians;
      const x = centerX + previewRange * Math.cos(angle);
      const y = centerY + previewRange * Math.sin(angle);
      arcPoints.push({ x, y });
    }
    
    // Create path
    let path = `M${centerX},${centerY}`;
    arcPoints.forEach(point => {
      path += ` L${point.x},${point.y}`;
    });
    path += ` Z`;
    
    return path;
  };

  // If we're loading an existing marker's details, show a loading state
  if (isLoadingExisting && !isNew) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading camera details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open && !!marker} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Camera" : "Edit Camera"}</DialogTitle>
          <DialogDescription>
            Configure camera properties and visualization settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Camera details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Camera Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location/Name</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Entrance Camera"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="off"
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
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field-of-view">Field of View</Label>
                  <Input
                    id="field-of-view"
                    placeholder="e.g., 120°, Wide Angle"
                    value={fieldOfView}
                    onChange={(e) => setFieldOfView(e.target.value)}
                    autoComplete="off"
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
                  autoComplete="off"
                />
              </div>
            </div>
            
            {/* Right column: Camera visualization */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Camera Visualization</h3>
              
              {/* Field of View (FOV) */}
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fov">Field of View</Label>
                  <span className="text-sm text-muted-foreground">{fov}°</span>
                </div>
                <Slider
                  id="fov"
                  min={10}
                  max={360}
                  step={5}
                  value={[fov]}
                  onValueChange={(values) => setFov(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Narrow</span>
                  <span>Wide</span>
                </div>
              </div>

              {/* Range */}
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="range">Range (Coverage Distance)</Label>
                  <span className="text-sm text-muted-foreground">{range} units</span>
                </div>
                <Slider
                  id="range"
                  min={20}
                  max={200}
                  step={10}
                  value={[range]}
                  onValueChange={(values) => setRange(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>

              {/* Rotation */}
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="rotation">Rotation</Label>
                  <span className="text-sm text-muted-foreground">{rotation}°</span>
                </div>
                <Slider
                  id="rotation"
                  min={0}
                  max={359}
                  step={5}
                  value={[rotation]}
                  onValueChange={(values) => setRotation(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0°</span>
                  <span>359°</span>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-md p-2 bg-gray-50 mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
                <svg width="100%" height="160" viewBox="-100 -100 200 200">
                  {/* FOV area */}
                  <path
                    d={calculateFovArc()}
                    fill="rgba(33, 150, 243, 0.1)"
                    stroke="rgba(33, 150, 243, 0.6)"
                    strokeWidth={1}
                  />
                  
                  {/* Center line showing direction */}
                  <line
                    x1={0}
                    y1={0}
                    x2={80 * Math.cos(rotation * Math.PI / 180)}
                    y2={80 * Math.sin(rotation * Math.PI / 180)}
                    stroke="rgba(33, 150, 243, 0.6)"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                  
                  {/* Camera symbol */}
                  <g transform={`translate(-8, -6) rotate(${rotation}, 8, 6)`}>
                    <rect width={16} height={12} rx={1} fill="#2196F3" />
                    <circle cx={8} cy={6} r={4} fill="#0D47A1" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{isNew ? "Add Camera" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedCameraConfigForm;