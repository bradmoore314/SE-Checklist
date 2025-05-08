/**
 * Coordinate System Module for PDF Viewer
 * 
 * This module provides a robust and consistent way to convert between coordinate systems
 * in the PDF viewer. It helps ensure markers remain stable during zoom operations by
 * providing precision-controlled coordinate transformations.
 * 
 * Coordinate Systems:
 * - Screen coordinates: Relative to the browser viewport (e.clientX, e.clientY)
 * - Container coordinates: Relative to the PDF container element (after accounting for container position)
 * - PDF coordinates: The coordinate system of the PDF document itself (after removing scale and translation)
 */

export type Point = { x: number; y: number };

/**
 * Coordinates class to encapsulate coordinate transformations with built-in precision control
 * and validation to ensure coordinate stability during zoom operations.
 */
export class CoordinateSystem {
  // PDF viewport dimensions
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  
  // Current transform state
  private scale: number = 1;
  private translateX: number = 0;
  private translateY: number = 0;
  
  // Container reference
  private containerElement: HTMLElement | null = null;
  
  // Precision control (number of decimal places to keep)
  private precision: number = 2;
  
  /**
   * Create a new coordinate system
   * @param containerElement The HTML element containing the PDF viewer
   * @param initialScale Initial zoom scale (default 1.0)
   * @param initialTranslateX Initial X translation (default 0)
   * @param initialTranslateY Initial Y translation (default 0)
   * @param viewportDimensions The dimensions of the PDF viewport
   */
  constructor(
    containerElement: HTMLElement | null = null,
    initialScale: number = 1,
    initialTranslateX: number = 0,
    initialTranslateY: number = 0,
    viewportDimensions: { width: number; height: number } = { width: 0, height: 0 }
  ) {
    this.containerElement = containerElement;
    this.scale = initialScale;
    this.translateX = initialTranslateX;
    this.translateY = initialTranslateY;
    this.viewportWidth = viewportDimensions.width;
    this.viewportHeight = viewportDimensions.height;
  }
  
  /**
   * Update the coordinate system parameters
   * @param params Parameters to update (only specified parameters will be updated)
   */
  updateSystem(params: {
    containerElement?: HTMLElement | null;
    scale?: number;
    translateX?: number;
    translateY?: number;
    viewportDimensions?: { width: number; height: number };
  }): void {
    if (params.containerElement !== undefined) {
      this.containerElement = params.containerElement;
    }
    
    if (params.scale !== undefined) {
      this.scale = params.scale;
    }
    
    if (params.translateX !== undefined) {
      this.translateX = params.translateX;
    }
    
    if (params.translateY !== undefined) {
      this.translateY = params.translateY;
    }
    
    if (params.viewportDimensions) {
      this.viewportWidth = params.viewportDimensions.width;
      this.viewportHeight = params.viewportDimensions.height;
    }
  }
  
  /**
   * Limit precision of numeric values to avoid floating point errors
   * @param value Value to limit precision
   * @returns Value with limited precision
   */
  limitPrecision(value: number): number {
    return parseFloat(value.toFixed(this.precision));
  }
  
  /**
   * Get the container's bounding rect (with validation)
   * @returns The container's DOMRect or an empty rect if no container exists
   */
  getContainerRect(): DOMRect {
    if (!this.containerElement) {
      console.warn("No container element set for coordinate system");
      return new DOMRect(0, 0, 0, 0);
    }
    return this.containerElement.getBoundingClientRect();
  }
  
  /**
   * Convert screen coordinates (from mouse events) to PDF coordinates
   * @param screenX X coordinate in screen space (e.clientX)
   * @param screenY Y coordinate in screen space (e.clientY)
   * @param debug Whether to log debug information
   * @returns Point in PDF coordinate space
   */
  screenToPdf(screenX: number, screenY: number, debug: boolean = false): Point {
    const rect = this.getContainerRect();
    
    // 1. Convert to container-relative coordinates
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;
    
    // 2. Apply inverse transformation to get PDF coordinates
    // Be extra careful to preserve precision during division
    const pdfX = (containerX - this.translateX) / this.scale;
    const pdfY = (containerY - this.translateY) / this.scale;
    
    if (debug) {
      console.log(`Screen(${screenX}, ${screenY}) → Container(${containerX.toFixed(2)}, ${containerY.toFixed(2)}) → PDF(${pdfX.toFixed(4)}, ${pdfY.toFixed(4)}) @ scale ${this.scale.toFixed(4)}`);
    }
    
    // Only limit precision at the very end to avoid cumulative errors
    return { 
      x: this.limitPrecision(pdfX),
      y: this.limitPrecision(pdfY)
    };
  }
  
  /**
   * Convert PDF coordinates to screen coordinates
   * @param pdfX X coordinate in PDF space
   * @param pdfY Y coordinate in PDF space
   * @param debug Whether to log debug information
   * @returns Point in screen coordinate space (relative to viewport)
   */
  pdfToScreen(pdfX: number, pdfY: number, debug: boolean = false): Point {
    const rect = this.getContainerRect();
    
    // 1. Apply transformation to convert to container coordinates
    const containerX = this.limitPrecision(pdfX * this.scale + this.translateX);
    const containerY = this.limitPrecision(pdfY * this.scale + this.translateY);
    
    // 2. Convert to screen coordinates
    const screenX = containerX + rect.left;
    const screenY = containerY + rect.top;
    
    if (debug) {
      console.log(`PDF(${pdfX}, ${pdfY}) → Container(${containerX}, ${containerY}) → Screen(${screenX.toFixed(2)}, ${screenY.toFixed(2)}) @ scale ${this.scale.toFixed(2)}`);
    }
    
    return { x: screenX, y: screenY };
  }
  
  /**
   * Convert container coordinates to PDF coordinates
   * @param containerX X coordinate relative to container
   * @param containerY Y coordinate relative to container
   * @param debug Whether to log debug information
   * @returns Point in PDF coordinate space
   */
  containerToPdf(containerX: number, containerY: number, debug: boolean = false): Point {
    // Calculate precise PDF coordinates by correctly inverting the transform
    const pdfX = (containerX - this.translateX) / this.scale;
    const pdfY = (containerY - this.translateY) / this.scale;
    
    if (debug) {
      console.log(`Container(${containerX.toFixed(2)}, ${containerY.toFixed(2)}) → PDF(${pdfX.toFixed(4)}, ${pdfY.toFixed(4)}) @ scale ${this.scale.toFixed(4)}`);
    }
    
    // Apply precision limits at the end to avoid cumulative errors
    return { 
      x: this.limitPrecision(pdfX), 
      y: this.limitPrecision(pdfY) 
    };
  }
  
  /**
   * Convert PDF coordinates to container coordinates
   * @param pdfX X coordinate in PDF space
   * @param pdfY Y coordinate in PDF space
   * @returns Point in container coordinate space
   */
  pdfToContainer(pdfX: number, pdfY: number): Point {
    const containerX = this.limitPrecision(pdfX * this.scale + this.translateX);
    const containerY = this.limitPrecision(pdfY * this.scale + this.translateY);
    
    return { x: containerX, y: containerY };
  }
  
  /**
   * Calculate a new zoom transformation centered on a specific point
   * @param mouseX X coordinate of mouse in container space
   * @param mouseY Y coordinate of mouse in container space
   * @param newScale New scale factor
   * @returns New transform parameters (scale, translateX, translateY)
   */
  calculateZoomTransform(
    mouseX: number, 
    mouseY: number, 
    newScale: number
  ): { scale: number; translateX: number; translateY: number } {
    // Get the point in PDF coordinates
    const mousePdfX = (mouseX - this.translateX) / this.scale;
    const mousePdfY = (mouseY - this.translateY) / this.scale;
    
    // Calculate new translation to keep the mouse point fixed
    const newTranslateX = this.limitPrecision(mouseX - mousePdfX * newScale);
    const newTranslateY = this.limitPrecision(mouseY - mousePdfY * newScale);
    
    return {
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    };
  }
  
  /**
   * Calculate drag offset between cursor and marker position
   * @param cursorPdfX X position of cursor in PDF coordinates
   * @param cursorPdfY Y position of cursor in PDF coordinates
   * @param markerPdfX X position of marker in PDF coordinates
   * @param markerPdfY Y position of marker in PDF coordinates
   * @returns Offset point in PDF coordinates
   */
  calculateDragOffset(
    cursorPdfX: number,
    cursorPdfY: number,
    markerPdfX: number,
    markerPdfY: number
  ): Point {
    // Calculate the offset in PDF coordinates
    // This works at any zoom level because both coordinates are in the same PDF coordinate space
    return {
      x: this.limitPrecision(cursorPdfX - markerPdfX),
      y: this.limitPrecision(cursorPdfY - markerPdfY)
    };
  }
  
  /**
   * Determine if a point is inside a marker's hit area
   * @param point The point to test (in PDF coordinates)
   * @param markerPosition The marker's position
   * @param hitRadius Additional hit area radius beyond the marker's visual size
   * @returns True if the point is inside the marker's hit area
   */
  isPointInMarker(
    point: Point,
    markerPosition: Point,
    hitRadius: number = 10
  ): boolean {
    const dx = point.x - markerPosition.x;
    const dy = point.y - markerPosition.y;
    const distanceSquared = dx * dx + dy * dy;
    
    // When zoomed out, increase the hit radius for easier selection
    const adjustedRadius = hitRadius / this.scale;
    
    return distanceSquared <= adjustedRadius * adjustedRadius;
  }
  
  /**
   * Get the current transform parameters
   * @returns Current transform parameters
   */
  getTransform(): { scale: number; translateX: number; translateY: number } {
    return {
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY
    };
  }
}

// Export legacy API for backward compatibility, but with improved precision
export function screenToPdfCoordinates(
  screenX: number,
  screenY: number,
  containerRect: DOMRect,
  scale: number,
  translateX: number,
  translateY: number,
  pdfViewport: { width: number; height: number } = { width: 0, height: 0 }
): Point {
  // Create a temporary coordinate system with our improved approach
  const coords = new CoordinateSystem(
    null,
    scale,
    translateX,
    translateY,
    pdfViewport
  );
  
  // 1. Convert client coordinates to relative coordinates within the container
  const containerX = screenX - containerRect.left;
  const containerY = screenY - containerRect.top;
  
  // 2. Enable debug mode for better logging
  return coords.containerToPdf(containerX, containerY, true);
}

export function pdfToScreenCoordinates(
  pdfX: number,
  pdfY: number,
  containerRect: DOMRect = new DOMRect(0, 0, 0, 0),
  scale: number = 1,
  translateX: number = 0,
  translateY: number = 0,
  viewport: { width: number; height: number } = { width: 0, height: 0 }
): Point {
  // Create a temporary coordinate system
  const coords = new CoordinateSystem(
    null,
    scale,
    translateX,
    translateY,
    viewport
  );
  
  const containerCoords = coords.pdfToContainer(pdfX, pdfY);
  
  return {
    x: containerCoords.x + containerRect.left,
    y: containerCoords.y + containerRect.top
  };
}

export function calculateDragOffset(
  cursorPdfX: number,
  cursorPdfY: number,
  markerPdfX: number,
  markerPdfY: number
): Point {
  const coords = new CoordinateSystem();
  return coords.calculateDragOffset(cursorPdfX, cursorPdfY, markerPdfX, markerPdfY);
}

export function isPointInMarker(
  point: Point,
  markerPosition: Point,
  hitRadius: number = 10
): boolean {
  const coords = new CoordinateSystem();
  return coords.isPointInMarker(point, markerPosition, hitRadius);
}