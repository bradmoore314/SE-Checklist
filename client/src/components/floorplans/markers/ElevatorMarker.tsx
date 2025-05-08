import React from 'react';
import { Point } from '@/utils/coordinates';

interface ElevatorMarkerProps {
  id: number;
  position: Point;
  selected: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const ElevatorMarker: React.FC<ElevatorMarkerProps> = ({
  id,
  position,
  selected,
  label,
  onClick,
  onRightClick,
  onMouseDown,
}) => {
  // Elevator marker dimensions
  const WIDTH = 20;
  const HEIGHT = 20;
  
  return (
    <g
      className="elevator-marker"
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseDown={onMouseDown}
    >
      {/* Elevator square */}
      <rect
        x={position.x - WIDTH/2}
        y={position.y - HEIGHT/2}
        width={WIDTH}
        height={HEIGHT}
        rx={2}
        fill="#9C27B0"
        stroke={selected ? "#ffffff" : "none"}
        strokeWidth={selected ? 2 : 0}
      />
      
      {/* Elevator symbol - up and down arrows */}
      <g transform={`translate(${position.x}, ${position.y})`} fill="white">
        {/* Up arrow */}
        <path d="M0,-7 L4,-3 L-4,-3 Z" />
        
        {/* Down arrow */}
        <path d="M0,7 L4,3 L-4,3 Z" />
        
        {/* Horizontal line */}
        <line x1={-5} y1={0} x2={5} y2={0} stroke="white" strokeWidth={1.5} />
      </g>
      
      {/* Label */}
      {label && (
        <text
          x={position.x}
          y={position.y + HEIGHT/2 + 15}
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
    </g>
  );
};

export default ElevatorMarker;