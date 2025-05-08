// This is how the access_point marker should be rendered

case 'access_point':
  // Apply transform to the parent group for position
  // And use a nested group with inverse scale to keep marker size constant
  return (
    <g 
      key={marker.id} 
      className={baseClassName}
      data-marker-id={marker.id}
      transform={`translate(${marker.position_x}, ${marker.position_y})`}
      {...baseProps}
    >
      {/* Add inner group with inverse scale to maintain consistent visual size */}
      <g transform={`scale(${1/scale})`}>
        <circle 
          r={12} // Constant size regardless of zoom level
          fill={fillColor} /* Red circle */
          stroke={markerColor}
          strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
        />
        <text 
          fontSize={14} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="white" /* White text */
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >AP</text>
        {(isSelected || showAllLabels) && marker.label && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={-40}
              y={17}
              width={80}
              height={16}
              rx={4}
              fill="#ffff00" /* Yellow background */
              stroke="#ff0000" /* Red border */
              strokeWidth={1}
            />
            <text
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              y={25}
              fill="#ff0000" /* Red text */
              fontWeight="bold"
            >{marker.label}</text>
          </g>
        )}
      </g>
    </g>
  );