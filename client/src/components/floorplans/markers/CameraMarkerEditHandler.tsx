import React, { useState, useRef, useEffect } from 'react';
import { Point } from '@/lib/coordinate-utils';

interface CameraMarkerEditHandlerProps {
  markerData: {
    id: number;
    position_x: number;
    position_y: number;
    fov?: number;
    range?: number;
    rotation?: number;
  };
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
  onUpdate,
  onCancel,
}) => {
  // Initial state based on marker data or defaults
  const [fov, setFov] = useState(markerData.fov || 90);
  const [range, setRange] = useState(markerData.range || 60);
  const [rotation, setRotation] = useState(markerData.rotation || 0);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onUpdate({
      id: markerData.id,
      position_x: markerData.position_x,
      position_y: markerData.position_y,
      fov,
      range,
      rotation,
    });
  };
  
  return (
    <div className="p-4 bg-white rounded-md shadow-lg">
      <h3 className="text-lg font-medium mb-4">Edit Camera Settings</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Field of View (FOV) */}
            <div>
              <label htmlFor="fov" className="block text-sm font-medium text-gray-700">
                Field of View (degrees)
              </label>
              <input
                id="fov"
                type="range"
                min="10"
                max="360"
                step="5"
                value={fov}
                onChange={(e) => setFov(Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10°</span>
                <span>{fov}°</span>
                <span>360°</span>
              </div>
            </div>
            
            {/* Range */}
            <div>
              <label htmlFor="range" className="block text-sm font-medium text-gray-700">
                Range (units)
              </label>
              <input
                id="range"
                type="range"
                min="20"
                max="200"
                step="10"
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>20</span>
                <span>{range}</span>
                <span>200</span>
              </div>
            </div>
          </div>
          
          {/* Rotation */}
          <div>
            <label htmlFor="rotation" className="block text-sm font-medium text-gray-700">
              Rotation (degrees)
            </label>
            <input
              id="rotation"
              type="range"
              min="0"
              max="359"
              step="5"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0°</span>
              <span>{rotation}°</span>
              <span>359°</span>
            </div>
          </div>
          
          {/* Preview */}
          <div className="border rounded-md p-2 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
            <svg width="100%" height="120" viewBox="-100 -100 200 200">
              {/* FOV area */}
              <path
                d={(() => {
                  const centerX = 0;
                  const centerY = 0;
                  const fovRadians = (fov * Math.PI) / 180;
                  const rotationRadians = (rotation * Math.PI) / 180;
                  const startAngle = rotationRadians - fovRadians / 2;
                  const endAngle = rotationRadians + fovRadians / 2;
                  
                  // Generate points along the arc
                  const arcPoints: Point[] = [];
                  const segments = 20;
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
                })()}
                fill="rgba(33, 150, 243, 0.1)"
                stroke="rgba(33, 150, 243, 0.6)"
                strokeWidth={1}
              />
              
              {/* Center line */}
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
          
          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CameraMarkerEditHandler;