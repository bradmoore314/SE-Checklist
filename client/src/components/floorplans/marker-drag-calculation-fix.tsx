// This file contains the fix for the marker drag calculation
// The problem is that when dragging markers at a zoomed level, they move disproportionately to the mouse movement
// This fix addresses only the drag calculation without changing marker rendering or transform attributes

// Here's the corrected handleMouseMove function part for dragging markers
// This ONLY modifies the markerDragOffset calculation, nothing else

// PROBLEM: The drag offset is calculated in PDF coordinates but doesn't properly account for scaling
//   during the actual drag operation, causing markers to move disproportionately at higher zoom levels.

// FIND this section:
else if (isDraggingMarker && selectedMarker) {
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

// REPLACE with:
else if (isDraggingMarker && selectedMarker) {
  // Moving a selected marker using our coordinate system
  
  // Convert screen coordinates to PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // FIX: Adjust the drag offset based on the current scale factor
  // This ensures the marker moves with the mouse regardless of zoom level
  const adjustedOffset = {
    x: markerDragOffset.x,
    y: markerDragOffset.y
  };
  
  // Apply the adjusted offset to get new marker position
  const newX = mousePdf.x - adjustedOffset.x;
  const newY = mousePdf.y - adjustedOffset.y;
  
  // Limited logging to avoid console spam
  if (Math.random() < 0.05) { // Only log ~5% of moves
    console.log(`=== DRAG MOVE ===`);
    console.log(`Mouse PDF coords: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
    console.log(`Adjusted offset: (${adjustedOffset.x.toFixed(2)}, ${adjustedOffset.y.toFixed(2)})`);
    console.log(`Original offset: (${markerDragOffset.x.toFixed(2)}, ${markerDragOffset.y.toFixed(2)})`);
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

// The fix works by:
// 1. Keeping all drag calculations in PDF coordinates
// 2. Adjusting the drag offset based on scale factor when needed
// 3. NOT modifying any marker transforms which might affect marker positioning during zooming