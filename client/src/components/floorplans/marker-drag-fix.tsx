// Marker Drag Fix for EnhancedFloorplanViewer
// This code contains the fixes needed to correctly handle marker dragging at different zoom levels

/**
 * 1. First, fix the marker transform attribute in each marker rendering section
 * 
 * FIND this pattern for the access_point, camera, elevator, and intercom marker types:
 *
 * transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}
 *
 * REPLACE with:
 *
 * transform={`translate(${marker.position_x}, ${marker.position_y})`}
 */

// For the access_point marker (around line 1197):
<g 
  key={marker.id} 
  className={baseClassName}
  data-marker-id={marker.id}
  transform={`translate(${marker.position_x}, ${marker.position_y})`}
  {...baseProps}
>
  {/* Inner group with inverse scale */}
  <g transform={`scale(${1/scale})`}>
    {/* Marker content */}
  </g>
</g>

/**
 * 2. Fix the startMarkerDrag function to correctly calculate the drag offset
 * 
 * FIND:
 */
startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
  // Allow dragging regardless of tool mode (this check is now handled in baseProps)
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get the mouse position in PDF coordinates using our coordinate system
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // Calculate the offset between mouse and marker in PDF coordinates
  const offset = coordSystem.calculateDragOffset(
    mousePdf.x,
    mousePdf.y,
    marker.position_x,
    marker.position_y
  );
  
  // Compact logging for drag start
  console.log(`Drag marker #${marker.id}: offset (${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}), scale=${scale.toFixed(2)}`);
  console.log(`Selected marker #${marker.id} (${marker.marker_type}): PDF pos (${marker.position_x}, ${marker.position_y}), scale=${scale.toFixed(2)}`);
  
  setMarkerDragOffset(offset);
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
}

/**
 * 3. Fix the handleMouseMove function when dragging markers
 * 
 * FIND:
 */
handleMouseMove = (e: React.MouseEvent) => {
  if (!containerRef.current) return;
  
  if (isDragging && toolMode === 'pan') {
    // Panning the view
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setTranslateX(prev => prev + deltaX);
    setTranslateY(prev => prev + deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Set cursor for panning
    containerRef.current.style.cursor = 'grabbing';
  } else if (isDraggingMarker && selectedMarker) {
    // Moving a selected marker using our coordinate system
    
    // Convert screen coordinates to PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Apply the offset calculated during drag start
    // The offset already accounts for the scale factor when it was calculated
    const newX = mousePdf.x - markerDragOffset.x;
    const newY = mousePdf.y - markerDragOffset.y;
    
    // Limited logging to avoid console spam
    if (Math.random() < 0.05) { // Only log ~5% of moves
      console.log(`=== DRAG MOVE ===`);
      console.log(`Mouse PDF coords: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
      console.log(`Offset: (${markerDragOffset.x.toFixed(2)}, ${markerDragOffset.y.toFixed(2)})`);
      console.log(`New position: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
      console.log(`Current transform: scale=${scale.toFixed(2)}, translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
    }
    
    // Update local state for smooth visual feedback
    setSelectedMarker(prev => {
      if (!prev) return null;
      return {
        ...prev,
        position_x: newX,
        position_y: newY
      };
    });
    
    // Set cursor for dragging marker
    containerRef.current.style.cursor = 'grabbing';
  }
  // ... rest of the function ...
}

/**
 * 4. Make sure the screenToPdfCoordinates function or coordSystem is being used correctly
 *    for all coordinate transformations.
 * 
 * The key insight is that we need to:
 * 1. Keep all marker positions in PDF coordinates (no scaling)
 * 2. Apply transform=translate(x,y) directly with these unscaled coordinates
 * 3. Use a nested group with inverse scale to maintain visual size
 * 4. Calculate drag offsets in PDF coordinates
 */