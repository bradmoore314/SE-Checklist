/**
 * This file contains key fixes for the drag operations in EnhancedFloorplanViewer.tsx.
 * The main issue is that when a marker is dragged, it moves much farther than the drag distance.
 * 
 * PROBLEM:
 * The current implementation fails to account for the zoom scale when calculating how far a marker
 * should move during dragging.
 * 
 * Fix for handleMouseMove:
 * 
 * The key fix is to properly calculate the new marker position by dividing the drag delta by the scale:
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
    // Moving a selected marker
    
    // Convert screen coordinates to PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Apply the offset calculated during drag start
    const newX = mousePdf.x - markerDragOffset.x;
    const newY = mousePdf.y - markerDragOffset.y;
    
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
  // ...rest of the function...
}

/**
 * Fix for startMarkerDrag:
 * 
 * The markerDragOffset needs to be calculated in PDF coordinates, which means we need to:
 * 1. Convert mouse position to PDF coordinates
 * 2. Calculate the offset between mouse PDF position and marker PDF position
 * 3. Store this offset (in PDF coordinates)
 */

startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get the mouse position in PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // Calculate the offset between mouse PDF position and marker PDF position
  // This is now properly calculated in PDF coordinates
  const offsetX = mousePdf.x - marker.position_x;
  const offsetY = mousePdf.y - marker.position_y;
  
  setMarkerDragOffset({ x: offsetX, y: offsetY });
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
}

/**
 * Additionally, marker rendering must be updated to avoid scaling the marker position:
 * 
 * Change this:
 * <g transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}>
 * 
 * To this:
 * <g transform={`translate(${marker.position_x}, ${marker.position_y})`}>
 * 
 * For circle markers and other elements that need to maintain the same visual size
 * regardless of zoom level, add a nested group with inverse scale:
 * 
 * <g transform={`translate(${marker.position_x}, ${marker.position_y})`}>
 *   <g transform={`scale(${1/scale})`}>
 *     <circle r={12} .../>
 *     <text .../>
 *   </g>
 * </g>
 */