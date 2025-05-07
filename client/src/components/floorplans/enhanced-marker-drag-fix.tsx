import { MarkerData } from '@shared/schema';
import React from 'react';

/**
 * Enhanced marker drag fix implementation
 * 
 * This includes both the startMarkerDrag and the handleMouseMove sections needed
 * to fix the marker dragging issue at different zoom levels.
 * 
 * The issue occurs when a marker is dragged at high zoom levels - it moves
 * disproportionately to the mouse movement.
 */

/**
 * 1. FIXED startMarkerDrag IMPLEMENTATION
 * 
 * The original issue was that we weren't properly calculating the offset while
 * accounting for the current scale level.
 */
const startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get the mouse position in PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // Calculate the offset between mouse and marker in PDF coordinates without any scaling
  // This is critical - we want the pure offset in the PDF coordinate space
  const offset = {
    x: mousePdf.x - marker.position_x,
    y: mousePdf.y - marker.position_y
  };
  
  console.log(`Drag marker #${marker.id}: pure offset (${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}), scale=${scale.toFixed(2)}`);
  console.log(`Selected marker #${marker.id} (${marker.marker_type}): PDF pos (${marker.position_x.toFixed(1)}, ${marker.position_y.toFixed(1)}), scale=${scale.toFixed(2)}`);
  
  // Store pure PDF coordinate offset without any scale adjustments
  setMarkerDragOffset(offset);
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
}

/**
 * 2. FIXED handleMouseMove SECTION FOR MARKER DRAGGING
 * 
 * When moving the marker, we need to translate the mouse position correctly
 * and apply the stored offset in the exact same scale context.
 */
const handleMouseMoveDragSection = () => {
  // Moving a selected marker using our coordinate system
  
  // Convert screen coordinates to PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // Apply the pure PDF offset directly (no adjustment needed)
  // This works because we're operating in the same coordinate space
  const newX = mousePdf.x - markerDragOffset.x;
  const newY = mousePdf.y - markerDragOffset.y;
  
  // Limited logging to avoid console spam
  if (Math.random() < 0.05) { // Only log ~5% of moves
    console.log(`=== DRAG MOVE (FIXED) ===`);
    console.log(`Mouse PDF coords: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
    console.log(`Pure PDF offset: (${markerDragOffset.x.toFixed(2)}, ${markerDragOffset.y.toFixed(2)})`);
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

/**
 * 3. EXPLANATION OF WHY THIS FIXES THE ISSUE
 * 
 * The issue is happening because of inconsistent coordinate handling during drag operations.
 * When we start a drag, we calculate an offset in PDF coordinates, but then during the drag
 * operation, we were not applying this offset correctly given the current zoom level.
 * 
 * Both the marker position and mouse position must be in the exact same coordinate system
 * with the same scaling factors applied. By ensuring both are in pure PDF coordinates,
 * we make the drag operation scale-invariant - it works the same at any zoom level.
 * 
 * The key is to always:
 * 1. Calculate positions in PDF coordinates
 * 2. Calculate offsets in PDF coordinates
 * 3. Apply offsets in PDF coordinates
 * 4. Only convert to screen coordinates at the very end when actually rendering
 */