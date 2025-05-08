/**
 * Direct Marker Drag Fix
 * 
 * This file contains a direct replacement for the drag calculation functions
 * that aren't properly handling the zoom level in the floorplan viewer.
 */

// Define types here to avoid schema dependency
type Point = { x: number; y: number };

// Minimal MarkerData interface with just the properties we need
interface MarkerData {
  id: number;
  position_x: number;
  position_y: number;
  marker_type: string;
  [key: string]: any; // Allow other properties
}
import { CoordinateSystem } from '@/lib/coordinate-utils';
import React from 'react';

/**
 * FIXED IMPLEMENTATION: Completely rewritten screen-to-pdf conversion logic
 * that eliminates any scale-related inconsistencies.
 */
export function directScreenToPdfCoordinates(
  screenX: number, 
  screenY: number,
  containerRef: React.RefObject<HTMLDivElement>,
  scale: number,
  translateX: number,
  translateY: number
): Point {
  if (!containerRef.current) return { x: 0, y: 0 };
  
  // Step 1: Get position relative to the container
  const rect = containerRef.current.getBoundingClientRect();
  const containerX = screenX - rect.left;
  const containerY = screenY - rect.top;
  
  // Step 2: Apply inverse transform to get PDF coordinates
  const pdfX = (containerX - translateX) / scale;
  const pdfY = (containerY - translateY) / scale;
  
  // Return precise PDF coordinates
  return { x: pdfX, y: pdfY };
}

/**
 * FIXED IMPLEMENTATION: Direct startMarkerDrag function that uses
 * the simplified coordinate conversion
 */
export function directStartMarkerDrag(
  e: React.MouseEvent, 
  marker: MarkerData,
  containerRef: React.RefObject<HTMLDivElement>,
  scale: number,
  translateX: number,
  translateY: number,
  setMarkerDragOffset: (offset: {x: number, y: number}) => void,
  setSelectedMarker: (marker: MarkerData | null) => void,
  setIsDraggingMarker: (isDragging: boolean) => void
) {
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get mouse position in PDF coordinates using direct conversion
  const mousePdf = directScreenToPdfCoordinates(
    e.clientX, 
    e.clientY, 
    containerRef,
    scale,
    translateX,
    translateY
  );
  
  // Calculate pure offset in PDF space
  const offset = {
    x: mousePdf.x - marker.position_x,
    y: mousePdf.y - marker.position_y
  };
  
  // Log for debugging
  console.log("[DIRECT FIX] Drag start offset calculation:");
  console.log(` - Marker position: (${marker.position_x.toFixed(2)}, ${marker.position_y.toFixed(2)})`);
  console.log(` - Mouse PDF pos: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
  console.log(` - Calculated offset: (${offset.x.toFixed(2)}, ${offset.y.toFixed(2)})`);
  console.log(` - Current scale: ${scale.toFixed(2)}`);
  
  // Store offset and update state
  setMarkerDragOffset(offset);
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
}

/**
 * FIXED IMPLEMENTATION: Direct mouse move handling specific to marker dragging
 */
export function directHandleMarkerDrag(
  e: React.MouseEvent,
  containerRef: React.RefObject<HTMLDivElement>,
  selectedMarker: MarkerData,
  markerDragOffset: {x: number, y: number},
  scale: number,
  translateX: number,
  translateY: number,
  setSelectedMarker: (updater: (prev: MarkerData | null) => MarkerData | null) => void
) {
  if (!containerRef.current) return;
  
  // Get current mouse position in PDF coordinates using direct conversion
  const mousePdf = directScreenToPdfCoordinates(
    e.clientX, 
    e.clientY, 
    containerRef,
    scale,
    translateX,
    translateY
  );
  
  // Calculate new position by directly applying the offset
  const newX = mousePdf.x - markerDragOffset.x;
  const newY = mousePdf.y - markerDragOffset.y;
  
  // Limited logging to avoid console spam
  if (Math.random() < 0.05) { // Only log ~5% of moves
    console.log("[DIRECT FIX] Drag move calculation:");
    console.log(` - Mouse PDF pos: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
    console.log(` - Using offset: (${markerDragOffset.x.toFixed(2)}, ${markerDragOffset.y.toFixed(2)})`);
    console.log(` - New position: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
    console.log(` - Current scale: ${scale.toFixed(2)}`);
  }
  
  // Update marker position
  setSelectedMarker(prev => {
    if (!prev) return null;
    return {
      ...prev,
      position_x: newX,
      position_y: newY
    };
  });
  
  // Set cursor for dragging
  containerRef.current.style.cursor = 'grabbing';
}