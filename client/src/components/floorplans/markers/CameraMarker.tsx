import React, { useMemo } from 'react';
import { Point } from '@/utils/coordinates';
import { calculateSvgFovPathD, calculateFovHandlePosition, calculateRangeIndicatorPathD } from '@/utils/geometry';

interface CameraMarkerProps {
  id: number;
  position: Point;
  selected: boolean;
  label?: string;
  fov?: number; // Field of view in degrees (default: 90)
  range?: number; // Range/radius of the field of view (default: 60)
  rotation?: number; // Rotation in degrees (default: 0, pointing right)
  onClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onHandleMouseDown?: (e: React.MouseEvent, handleType: string) => void;
}

export const CameraMarker: React.FC<CameraMarkerProps> = ({
  id,
  position,
  selected,
  label,
  fov = 90, // Default 90-degree field of view
  range = 60, // Default range
  rotation = 0, // Default rotation (pointing right)
  onClick,
  onRightClick,
  onMouseDown,
  onHandleMouseDown,
}) => {
  // Camera marker dimensions
  const CAMERA_WIDTH = 16;
  const CAMERA_HEIGHT = 12;
  
  // Calculate the FOV arc path with proper SVG arc command
  const fovArcPath = useMemo(() => {
    return calculateSvgFovPathD(
      position.x,
      position.y,
      range,
      fov,
      rotation
    );
  }, [position.x, position.y, range, fov, rotation]);
  
  // Resize handles for adjusting the FOV and range
  const renderResizeHandles = () => {
    if (!selected) return null;
    
    // Calculate position for FOV adjustment handles (both ends of arc)
    const rotationRadians = (rotation * Math.PI) / 180;
    const halfFovRadians = (fov * Math.PI) / 360;
    
    const leftAngle = rotationRadians - halfFovRadians;
    const rightAngle = rotationRadians + halfFovRadians;
    
    const leftHandleX = position.x + range * Math.cos(leftAngle);
    const leftHandleY = position.y + range * Math.sin(leftAngle);
    
    const rightHandleX = position.x + range * Math.cos(rightAngle);
    const rightHandleY = position.y + range * Math.sin(rightAngle);
    
    // Range handle (middle of arc)
    const rangeHandleX = position.x + range * Math.cos(rotationRadians);
    const rangeHandleY = position.y + range * Math.sin(rotationRadians);
    
    return (
      <>
        {/* FOV handles */}
        <circle 
          cx={leftHandleX} 
          cy={leftHandleY} 
          r={4} 
          fill="white" 
          stroke="#2196F3" 
          strokeWidth={2}
          className="resize-handle fov-handle-left"
          data-handle="fov-left"
        />
        <circle 
          cx={rightHandleX} 
          cy={rightHandleY} 
          r={4} 
          fill="white" 
          stroke="#2196F3" 
          strokeWidth={2}
          className="resize-handle fov-handle-right"
          data-handle="fov-right"
        />
        
        {/* Range handle */}
        <circle 
          cx={rangeHandleX} 
          cy={rangeHandleY} 
          r={4} 
          fill="white" 
          stroke="#2196F3" 
          strokeWidth={2}
          className="resize-handle range-handle"
          data-handle="range"
        />
        
        {/* Rotation handle */}
        <line 
          x1={position.x} 
          y1={position.y} 
          x2={rangeHandleX} 
          y2={rangeHandleY}
          stroke="#2196F3"
          strokeWidth={1}
          strokeDasharray="4,2"
        />
      </>
    );
  };
  
  return (
    <g
      className="camera-marker"
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseDown={onMouseDown}
    >
      {/* FOV area */}
      <path
        d={fovArcPath}
        fill="rgba(33, 150, 243, 0.1)"
        stroke="rgba(33, 150, 243, 0.6)"
        strokeWidth={1}
      />
      
      {/* Center line showing the camera direction */}
      <path
        d={calculateRangeIndicatorPathD(
          position.x,
          position.y,
          range * 0.5, // Half range for direction line
          rotation,
          "3,3"
        )}
        stroke="rgba(33, 150, 243, 0.6)"
        strokeWidth={1}
        fill="none"
      />
      
      {/* Camera symbol */}
      <g transform={`translate(${position.x - CAMERA_WIDTH/2}, ${position.y - CAMERA_HEIGHT/2}) rotate(${rotation}, ${CAMERA_WIDTH/2}, ${CAMERA_HEIGHT/2})`}>
        {/* Camera body */}
        <rect
          width={CAMERA_WIDTH}
          height={CAMERA_HEIGHT}
          rx={1}
          fill="#2196F3"
          stroke={selected ? "#ffffff" : "none"}
          strokeWidth={selected ? 2 : 0}
        />
        
        {/* Camera lens */}
        <circle
          cx={CAMERA_WIDTH / 2}
          cy={CAMERA_HEIGHT / 2}
          r={CAMERA_HEIGHT / 3}
          fill="#0D47A1"
        />
      </g>
      
      {/* Label */}
      {label && (
        <text
          x={position.x}
          y={position.y + range + 15}
          textAnchor="middle"
          fontSize={10}
          fill="#333"
          stroke="#fff"
          strokeWidth={0.5}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
      
      {/* Resize and rotate handles (only visible when selected) */}
      {selected && onHandleMouseDown && (
        <>
          {/* FOV handles */}
          {(() => {
            // Calculate FOV handle positions using utility function
            const leftHandlePos = calculateFovHandlePosition(
              position.x,
              position.y,
              range,
              rotation - fov/2
            );
            
            const rightHandlePos = calculateFovHandlePosition(
              position.x,
              position.y,
              range,
              rotation + fov/2
            );
            
            // Range handle position (center of arc)
            const rangeHandlePos = calculateFovHandlePosition(
              position.x,
              position.y,
              range,
              rotation
            );
            
            // Rotation handle (middle of the range line)
            const rotationHandlePos = calculateFovHandlePosition(
              position.x,
              position.y,
              range/2,
              rotation
            );
            
            // Direction line path
            const directionLinePath = calculateRangeIndicatorPathD(
              position.x,
              position.y,
              range,
              rotation,
              "4,2"
            );
            
            return (
              <>
                {/* Left FOV handle */}
                <circle 
                  cx={leftHandlePos.x} 
                  cy={leftHandlePos.y} 
                  r={6} 
                  fill="white" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  className="resize-handle fov-handle-left"
                  data-handle="fov-left"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onHandleMouseDown(e, 'fov-left');
                  }}
                  style={{ cursor: 'ew-resize' }}
                />
                
                {/* Right FOV handle */}
                <circle 
                  cx={rightHandlePos.x} 
                  cy={rightHandlePos.y} 
                  r={6} 
                  fill="white" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  className="resize-handle fov-handle-right"
                  data-handle="fov-right"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onHandleMouseDown(e, 'fov-right');
                  }}
                  style={{ cursor: 'ew-resize' }}
                />
                
                {/* Range handle */}
                <circle 
                  cx={rangeHandlePos.x} 
                  cy={rangeHandlePos.y} 
                  r={6} 
                  fill="white" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  className="resize-handle range-handle"
                  data-handle="range"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onHandleMouseDown(e, 'range');
                  }}
                  style={{ cursor: 'nesw-resize' }}
                />
                
                {/* Rotation direction line */}
                <path
                  d={directionLinePath}
                  stroke="#2196F3"
                  strokeWidth={1}
                  strokeDasharray="4,2"
                  fill="none"
                />
                
                {/* Rotation handle (middle of direction line) */}
                <circle 
                  cx={rotationHandlePos.x} 
                  cy={rotationHandlePos.y} 
                  r={6} 
                  fill="white" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  className="resize-handle rotation-handle"
                  data-handle="rotation"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onHandleMouseDown(e, 'rotation');
                  }}
                  style={{ cursor: 'crosshair' }}
                />
              </>
            );
          })()}
        </>
      )}
    </g>
  );
};

export default CameraMarker;