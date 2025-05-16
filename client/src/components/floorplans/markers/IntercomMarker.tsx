import React from 'react';
import { Point } from '@/utils/coordinates';

interface IntercomMarkerProps {
  id: number;
  position: Point;
  selected: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export const IntercomMarker: React.FC<IntercomMarkerProps> = ({
  id,
  position,
  selected,
  label,
  onClick,
  onRightClick,
  onMouseDown,
  onTouchStart,
}) => {
  // Intercom marker dimensions
  const WIDTH = 18;
  const HEIGHT = 18;
  
  return (
    <g
      className="intercom-marker"
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Intercom circle with speaker symbol */}
      <circle
        cx={position.x}
        cy={position.y}
        r={WIDTH/2}
        fill="#4CAF50"
        stroke={selected ? "#ffffff" : "none"}
        strokeWidth={selected ? 2 : 0}
      />
      
      {/* Speaker grille lines */}
      <g transform={`translate(${position.x}, ${position.y})`}>
        <line x1={-5} y1={-5} x2={5} y2={-5} stroke="white" strokeWidth={1.5} />
        <line x1={-5} y1={0} x2={5} y2={0} stroke="white" strokeWidth={1.5} />
        <line x1={-5} y1={5} x2={5} y2={5} stroke="white" strokeWidth={1.5} />
        <circle cx={0} cy={0} r={3} fill="white" />
      </g>
      
      {/* Label */}
      {label && (
        <text
          x={position.x}
          y={position.y + 20}
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

export default IntercomMarker;