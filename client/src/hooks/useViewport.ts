import { useState, useCallback, useRef } from 'react';
import { CoordinateSystem, ViewportDimensions } from '@/utils/coordinates';

/**
 * Custom hook for managing viewport state and transformations
 * This encapsulates all viewport-related logic including zoom and pan operations
 */
export function useViewport(
  initialScale: number = 1,
  initialTranslateX: number = 0,
  initialTranslateY: number = 0,
  containerRef: React.RefObject<HTMLElement>,
  coordSystemInstance: CoordinateSystem,
  pdfDimensions: {width: number, height: number}
) {
  // Viewport state
  const [scale, setScale] = useState<number>(initialScale);
  const [translateX, setTranslateX] = useState<number>(initialTranslateX);
  const [translateY, setTranslateY] = useState<number>(initialTranslateY);
  
  // Keep track of previous state values for calculations
  const prevStateRef = useRef({ scale, translateX, translateY });
  
  // Update the coordinate system when viewport state changes
  const updateCoordinateSystem = useCallback(() => {
    coordSystemInstance.updateSystem({
      containerElement: containerRef.current,
      scale,
      translateX,
      translateY
    });
    
    // Update ref with current values
    prevStateRef.current = { scale, translateX, translateY };
  }, [scale, translateX, translateY, coordSystemInstance, containerRef]);
  
  /**
   * Zoom to a specific point, maintaining that point's position under the cursor
   * 
   * @param newScale - Target zoom scale
   * @param screenPoint - Screen coordinates to zoom around
   */
  const zoomToPoint = useCallback((newScaleTarget: number, screenPoint: {x: number, y: number}) => {
    if (!containerRef.current || !coordSystemInstance) return;
    
    // Get container-relative coordinates
    const rect = containerRef.current.getBoundingClientRect();
    const containerRelativeScreenX = screenPoint.x - rect.left;
    const containerRelativeScreenY = screenPoint.y - rect.top;
    
    // Calculate the PDF point under the cursor before zooming
    const currentPdfPointAtScreenPoint = coordSystemInstance.screenToPdf(
      screenPoint.x, 
      screenPoint.y
    );
    
    // Calculate new translation to keep the PDF point under the cursor after zooming
    // After scaling, the screen position is:
    // screenPoint.x = (pdfPoint.x * newScale) + newTranslateX
    // Therefore: newTranslateX = screenPoint.x - (pdfPoint.x * newScale)
    const newTX = containerRelativeScreenX - (currentPdfPointAtScreenPoint.x * newScaleTarget);
    const newTY = containerRelativeScreenY - (currentPdfPointAtScreenPoint.y * newScaleTarget);
    
    // Update the viewport state
    setScale(newScaleTarget);
    setTranslateX(newTX);
    setTranslateY(newTY);
    
    // Update coordinate system with new values
    coordSystemInstance.updateSystem({
      scale: newScaleTarget,
      translateX: newTX,
      translateY: newTY
    });
  }, [coordSystemInstance, containerRef]);
  
  /**
   * Pan the viewport by a delta amount
   * 
   * @param deltaScreenX - Amount to pan horizontally in screen pixels
   * @param deltaScreenY - Amount to pan vertically in screen pixels
   */
  const panByDelta = useCallback((deltaScreenX: number, deltaScreenY: number) => {
    setTranslateX(prevTX => prevTX + deltaScreenX);
    setTranslateY(prevTY => prevTY + deltaScreenY);
  }, []);
  
  /**
   * Set zoom scale (centered)
   * 
   * @param newScale - Target zoom scale
   */
  const setZoom = useCallback((newScale: number) => {
    if (!containerRef.current) return;
    
    // Center point of the container
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Zoom to the center point
    zoomToPoint(newScale, { x: centerX, y: centerY });
  }, [containerRef, zoomToPoint]);
  
  /**
   * Reset viewport to initial state
   */
  const resetViewport = useCallback(() => {
    if (!containerRef.current) return;
    
    // Reset to initial scale
    const newScale = 1;
    setScale(newScale);
    
    // Center the PDF in the container
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = (rect.width - pdfDimensions.width * newScale) / 2;
    const centerY = (rect.height - pdfDimensions.height * newScale) / 2;
    
    setTranslateX(centerX);
    setTranslateY(centerY);
    
    // Update coordinate system
    coordSystemInstance.updateSystem({
      scale: newScale,
      translateX: centerX,
      translateY: centerY
    });
  }, [containerRef, pdfDimensions, coordSystemInstance]);
  
  return {
    scale,
    translateX,
    translateY,
    zoomToPoint,
    panByDelta,
    setZoom,
    resetViewport,
    updateCoordinateSystem
  };
}