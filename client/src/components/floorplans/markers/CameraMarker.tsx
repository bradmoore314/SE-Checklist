import React, { useState } from 'react';
import { Point } from '@/lib/coordinate-utils';

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
  
  // Calculate the FOV arc points
  const calculateFovArc = () => {
    const centerX = position.x;
    const centerY = position.y;
    
    // Convert FOV from degrees to radians
    const fovRadians = (fov * Math.PI) / 180;
    
    // Calculate the starting and ending angles based on rotation
    const rotationRadians = (rotation * Math.PI) / 180;
    const startAngle = rotationRadians - fovRadians / 2;
    const endAngle = rotationRadians + fovRadians / 2;
    
    // Generate points along the arc
    const arcPoints: Point[] = [];
    const segments = 20; // Number of segments to approximate the arc
    
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (i / segments) * fovRadians;
      const x = centerX + range * Math.cos(angle);
      const y = centerY + range * Math.sin(angle);
      arcPoints.push({ x, y });
    }
    
    // Create an SVG path for the arc
    let path = `M${centerX},${centerY}`;
    
    // Add the arc segments
    arcPoints.forEach(point => {
      path += ` L${point.x},${point.y}`;
    });
    
    // Return to center to complete the shape
    path += ` Z`;
    
    return path;
  };
  
  // Create FOV arc path
  const fovArcPath = calculateFovArc();
  
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
      <line
        x1={position.x}
        y1={position.y}
        x2={position.x + range * 0.5 * Math.cos(rotation * Math.PI / 180)}
        y2={position.y + range * 0.5 * Math.sin(rotation * Math.PI / 180)}
        stroke="rgba(33, 150, 243, 0.6)"
        strokeWidth={1}
        strokeDasharray="3,3"
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
          <circle 
            cx={position.x + range * Math.cos((rotation - fov/2) * Math.PI / 180)} 
            cy={position.y + range * Math.sin((rotation - fov/2) * Math.PI / 180)} 
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
            style={{ cursor: 'move' }}
          />
          <circle 
            cx={position.x + range * Math.cos((rotation + fov/2) * Math.PI / 180)} 
            cy={position.y + range * Math.sin((rotation + fov/2) * Math.PI / 180)} 
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
            style={{ cursor: 'move' }}
          />
          
          {/* Range handle */}
          <circle 
            cx={position.x + range * Math.cos(rotation * Math.PI / 180)} 
            cy={position.y + range * Math.sin(rotation * Math.PI / 180)} 
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
            style={{ cursor: 'move' }}
          />
          
          {/* Rotation handle */}
          <line 
            x1={position.x} 
            y1={position.y} 
            x2={position.x + range * Math.cos(rotation * Math.PI / 180)} 
            y2={position.y + range * Math.sin(rotation * Math.PI / 180)}
            stroke="#2196F3"
            strokeWidth={1}
            strokeDasharray="4,2"
          />
        </>
      )}
    </g>
  );
};

export default CameraMarker;