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
import { Point } from '@/lib/coordinate-utils';

interface CameraMarkerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marker: {
    id: number;
    position_x: number;
    position_y: number;
    fov?: number;
    range?: number;
    rotation?: number;
    label?: string;
  } | null;
  onUpdate: (updatedData: {
    id: number;
    position_x: number;
    position_y: number;
    fov: number;
    range: number;
    rotation: number;
    label?: string;
  }) => void;
}

const CameraMarkerEditDialog: React.FC<CameraMarkerEditDialogProps> = ({
  open,
  onOpenChange,
  marker,
  onUpdate,
}) => {
  // State for the camera properties
  const [fov, setFov] = useState<number>(90);
  const [range, setRange] = useState<number>(60);
  const [rotation, setRotation] = useState<number>(0);
  const [label, setLabel] = useState<string>('');

  // Initialize form when marker changes
  useEffect(() => {
    if (marker) {
      setFov(marker.fov || 90);
      setRange(marker.range || 60);
      setRotation(marker.rotation || 0);
      setLabel(marker.label || '');
    }
  }, [marker]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marker) return;
    
    onUpdate({
      id: marker.id,
      position_x: marker.position_x,
      position_y: marker.position_y,
      fov,
      range,
      rotation,
      label: label || undefined,
    });
    
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

  return (
    <Dialog open={open && !!marker} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Camera</DialogTitle>
          <DialogDescription>
            Adjust camera field of view, rotation, and range.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-4">
            {/* Camera Label */}
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Camera Label"
              />
            </div>

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
            <div className="border rounded-md p-2 bg-gray-50">
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

          <DialogFooter className="flex space-x-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CameraMarkerEditDialog;