// This is the fixed version of EnhancedFloorplanViewer.tsx with updates to the transform attributes
// You should copy the key fixes from this file back to the original EnhancedFloorplanViewer.tsx

// Fix #1: Update the transform for access_point markers
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

// Fix #2: Update the transform for camera markers
case 'camera':
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
        >C</text>
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

// Fix #3: Update the transform for elevator markers
case 'elevator':
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
        >E</text>
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

// Fix #4: Update the transform for intercom markers
case 'intercom':
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
        >I</text>
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

// Fix #5: Update the transform for note markers
case 'note':
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
        <rect 
          x={-12} 
          y={-12} 
          width={24} 
          height={24}
          fill={'#ffffffcc'} /* White rectangle with partial transparency */
          stroke={markerColor}
          strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
        />
        <text 
          fontSize={14} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="#ff0000" /* Red text */
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >N</text>
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