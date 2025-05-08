import { useState, useCallback } from 'react';
import { CoordinateSystem, Point } from '@/utils/coordinates';
import { UseMutationResult } from '@tanstack/react-query';

interface MarkerData {
  id: number;
  position_x: number;
  position_y: number;
  [key: string]: any;
}

interface MarkerUpdateParams {
  id: number;
  position_x: number;
  position_y: number;
  [key: string]: any;
}

/**
 * Custom hook for handling marker dragging with precision
 * Handles the entire marker drag lifecycle with adaptive precision
 */
export function useMarkerDragHandler(
  coordSystemInstance: CoordinateSystem,
  scale: number,
  updateMarkerMutation: UseMutationResult<any, Error, MarkerUpdateParams>
) {
  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedMarkerId, setDraggedMarkerId] = useState<number | null>(null);
  const [dragStartMarkerPdfPos, setDragStartMarkerPdfPos] = useState<Point>({ x: 0, y: 0 });
  const [dragStartMouseScreenPos, setDragStartMouseScreenPos] = useState<Point>({ x: 0, y: 0 });
  
  // Current drag position for optimistic UI updates
  const [currentDraggedPdfPos, setCurrentDraggedPdfPos] = useState<Point | null>(null);
  
  /**
   * Start dragging a marker
   * 
   * @param event - Mouse event that initiated the drag
   * @param marker - The marker data being dragged
   */
  const startMarkerDrag = useCallback((event: React.MouseEvent, marker: MarkerData) => {
    event.stopPropagation();
    
    setIsDragging(true);
    setDraggedMarkerId(marker.id);
    
    // Store the initial marker position in PDF coordinates
    setDragStartMarkerPdfPos({
      x: marker.position_x,
      y: marker.position_y
    });
    
    // Store the initial mouse position in screen coordinates
    setDragStartMouseScreenPos({
      x: event.clientX,
      y: event.clientY
    });
    
    // Set initial drag position for UI updates
    setCurrentDraggedPdfPos({
      x: marker.position_x,
      y: marker.position_y
    });
  }, []);
  
  /**
   * Handle mouse movement during marker drag
   * 
   * @param event - Mouse move event
   * @param applySnapToGrid - Whether to snap to grid (optional)
   * @param gridSize - Grid size for snapping (optional)
   */
  const handleMarkerDragMove = useCallback((
    event: MouseEvent, 
    applySnapToGrid: boolean = false,
    gridSize: number = 10
  ) => {
    if (!isDragging || draggedMarkerId === null) return;
    
    // Calculate the mouse movement delta in screen coordinates
    const deltaScreenX = event.clientX - dragStartMouseScreenPos.x;
    const deltaScreenY = event.clientY - dragStartMouseScreenPos.y;
    
    // Convert the delta to PDF coordinates (accounting for zoom)
    const deltaPdfX = deltaScreenX / scale;
    const deltaPdfY = deltaScreenY / scale;
    
    // Calculate the new marker position in PDF coordinates
    let newX = dragStartMarkerPdfPos.x + deltaPdfX;
    let newY = dragStartMarkerPdfPos.y + deltaPdfY;
    
    // Apply grid snapping if requested
    if (applySnapToGrid) {
      const pdfGridSize = gridSize / scale; // Convert grid size to PDF units
      newX = Math.round(newX / pdfGridSize) * pdfGridSize;
      newY = Math.round(newY / pdfGridSize) * pdfGridSize;
    }
    
    // Update the current dragged position for UI updates (unrounded for smooth movement)
    setCurrentDraggedPdfPos({ x: newX, y: newY });
  }, [isDragging, draggedMarkerId, dragStartMarkerPdfPos, dragStartMouseScreenPos, scale]);
  
  /**
   * End marker dragging and finalize position
   * 
   * @param event - Mouse up event
   * @param applySnapToGrid - Whether to snap to grid (optional)
   * @param gridSize - Grid size for snapping (optional)
   * @param version - Current marker version for optimistic concurrency control
   */
  const endMarkerDrag = useCallback((
    event: MouseEvent, 
    applySnapToGrid: boolean = false,
    gridSize: number = 10,
    version?: number
  ) => {
    if (!isDragging || draggedMarkerId === null || !currentDraggedPdfPos) return;
    
    // Calculate final position (similar to handleMarkerDragMove)
    const deltaScreenX = event.clientX - dragStartMouseScreenPos.x;
    const deltaScreenY = event.clientY - dragStartMouseScreenPos.y;
    
    const deltaPdfX = deltaScreenX / scale;
    const deltaPdfY = deltaScreenY / scale;
    
    let finalX = dragStartMarkerPdfPos.x + deltaPdfX;
    let finalY = dragStartMarkerPdfPos.y + deltaPdfY;
    
    // Apply grid snapping if requested
    if (applySnapToGrid) {
      const pdfGridSize = gridSize / scale;
      finalX = Math.round(finalX / pdfGridSize) * pdfGridSize;
      finalY = Math.round(finalY / pdfGridSize) * pdfGridSize;
    }
    
    // Use coordSystemInstance to apply the same precision logic used in screenToPdf
    // Create a "fake" screen coordinate that would produce our desired PDF coordinate
    const rawPdfPoint = { x: finalX, y: finalY };
    
    // Convert back to screen coordinates
    const screenPoint = coordSystemInstance.pdfToScreen(rawPdfPoint.x, rawPdfPoint.y);
    
    // And back to PDF with proper adaptive precision
    const roundedPdfPoint = coordSystemInstance.screenToPdf(screenPoint.x, screenPoint.y);
    
    // Update the marker position via mutation
    updateMarkerMutation.mutate({
      id: draggedMarkerId,
      position_x: roundedPdfPoint.x,
      position_y: roundedPdfPoint.y,
      ...(version !== undefined ? { version } : {})
    });
    
    // Reset dragging state
    setIsDragging(false);
    setDraggedMarkerId(null);
    setCurrentDraggedPdfPos(null);
  }, [
    isDragging, 
    draggedMarkerId, 
    currentDraggedPdfPos, 
    dragStartMarkerPdfPos, 
    dragStartMouseScreenPos, 
    scale, 
    coordSystemInstance, 
    updateMarkerMutation
  ]);
  
  return {
    isDragging,
    draggedMarkerId,
    currentDraggedPdfPos,
    startMarkerDrag,
    handleMarkerDragMove,
    endMarkerDrag
  };
}