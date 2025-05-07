/**
 * Marker Drag Calculation Fix
 * 
 * This file contains the fixed implementation of marker dragging to ensure markers
 * move proportionally to mouse movements at all zoom levels.
 * 
 * The problem: When zoomed in, markers would move too far when dragged - the motion wasn't
 * 1:1 with mouse movement. This was because we weren't properly accounting for the zoom scale.
 */

import { MarkerData } from '@shared/schema';
import React from 'react';
import { CoordinateSystem } from '@/lib/coordinate-utils';

/**
 * FIXED startMarkerDrag function
 * 
 * This properly calculates and stores the offset between mouse and marker
 * in PDF coordinates.
 */
export const fixedStartMarkerDrag = (
  e: React.MouseEvent, 
  marker: MarkerData,
  screenToPdfCoordinates: (x: number, y: number) => {x: number, y: number},
  containerRef: React.RefObject<HTMLDivElement>,
  setMarkerDragOffset: (offset: {x: number, y: number}) => void,
  setSelectedMarker: (marker: MarkerData | null) => void,
  setIsDraggingMarker: (isDragging: boolean) => void,
  scale: number
) => {
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get the mouse position in PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // IMPORTANT FIX:
  // Calculate the pure offset between mouse and marker in PDF coordinates
  // No scale adjustments needed at this point since both coordinates are in PDF space
  const offset = {
    x: mousePdf.x - marker.position_x,
    y: mousePdf.y - marker.position_y
  };
  
  // Debug logging
  console.log(`Drag marker #${marker.id}: offset (${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}), scale=${scale.toFixed(2)}`);
  console.log(`Selected marker #${marker.id} (${marker.marker_type}): PDF pos (${marker.position_x.toFixed(1)}, ${marker.position_y.toFixed(1)}), scale=${scale.toFixed(2)}`);
  
  // Store pure PDF coordinate offset without any scale adjustments
  setMarkerDragOffset(offset);
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
};

/**
 * FIXED marker drag section for handleMouseMove
 * 
 * This properly applies the stored offset during marker movement, ensuring
 * 1:1 movement with mouse regardless of zoom level.
 */
export const fixedHandleMouseMoveDragSection = (
  e: React.MouseEvent,
  containerRef: React.RefObject<HTMLDivElement>,
  isDraggingMarker: boolean,
  selectedMarker: MarkerData | null,
  markerDragOffset: {x: number, y: number},
  screenToPdfCoordinates: (x: number, y: number) => {x: number, y: number},
  setSelectedMarker: (updater: (prev: MarkerData | null) => MarkerData | null) => void,
  scale: number,
  translateX: number,
  translateY: number
) => {
  if (!containerRef.current) return;
  
  if (isDraggingMarker && selectedMarker) {
    // Moving a selected marker using our coordinate system
    
    // Convert screen coordinates to PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Apply the pure PDF offset directly
    // This is the key fix - we apply the offset in the same coordinate space (PDF)
    // without any scaling adjustments
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
};

/**
 * EXPLANATION OF THE FIX
 * 
 * The key insight for this fix is to consistently operate in PDF coordinates
 * throughout the drag operation:
 * 
 * 1. When starting the drag:
 *    - Convert mouse position to PDF coordinates
 *    - Calculate offset between mouse and marker in PDF coordinates
 *    - Store this pure PDF offset
 * 
 * 2. When moving the marker:
 *    - Convert current mouse position to PDF coordinates
 *    - Apply the stored PDF offset to calculate new marker position
 *    - No scaling adjustments needed since all operations are in PDF space
 * 
 * This approach ensures that marker movement is proportional to mouse movement
 * regardless of the current zoom level, providing a consistent user experience.
 */