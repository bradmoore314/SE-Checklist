/**
 * Coordinate Transformation Utilities
 * 
 * This file contains utilities for transforming coordinates between PDF space and screen space,
 * which is crucial for accurate marker placement and interaction in the floorplan viewer.
 */

/**
 * Represents a point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Interface for viewport dimensions
 */
export interface ViewportDimensions {
  width: number;
  height: number;
}

/**
 * Coordinate system class for handling transformations between screen and PDF spaces
 */
export class CoordinateSystem {
  private containerElement: HTMLElement | null;
  private scale: number;
  private translateX: number;
  private translateY: number;
  private viewportDimensions: ViewportDimensions;
  private lastUpdateTimeMs: number;

  /**
   * Creates a coordinate system
   * 
   * @param containerElement - The containing element for the coordinate system
   * @param scale - The current zoom scale
   * @param translateX - The X translation (pan position)
   * @param translateY - The Y translation (pan position)
   * @param viewportDimensions - Dimensions of the viewport
   */
  constructor(
    containerElement: HTMLElement | null, 
    scale: number = 1, 
    translateX: number = 0, 
    translateY: number = 0,
    viewportDimensions: ViewportDimensions = { width: 0, height: 0 }
  ) {
    this.containerElement = containerElement;
    this.scale = scale;
    this.translateX = translateX;
    this.translateY = translateY;
    this.viewportDimensions = viewportDimensions;
    this.lastUpdateTimeMs = Date.now();
  }

  /**
   * Get current scale factor
   */
  getScale(): number {
    return this.scale;
  }
  
  /**
   * Get current translation (pan) values
   */
  getTranslation(): { x: number, y: number } {
    return { x: this.translateX, y: this.translateY };
  }
  
  /**
   * Get the current viewport dimensions
   */
  getViewportDimensions(): ViewportDimensions {
    return { ...this.viewportDimensions };
  }
  
  /**
   * Get the CSS transform string for current state
   */
  getTransformString(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
  
  /**
   * Calculate a transform matrix for zooming operations
   * This is used by the EnhancedFloorplanViewer component
   */
  calculateZoomTransform(newScale: number, focalPointX: number, focalPointY: number): { scale: number, translateX: number, translateY: number } {
    if (!this.containerElement) {
      return { scale: newScale, translateX: this.translateX, translateY: this.translateY };
    }
    
    // Calculate the PDF coordinates of the focal point before zooming
    const focalPointPdf = this.screenToPdf(focalPointX, focalPointY);
    
    // Calculate the new translations needed to keep the focal point stable
    const rect = this.containerElement.getBoundingClientRect();
    const containerFocalX = focalPointX - rect.left;
    const containerFocalY = focalPointY - rect.top;
    
    // New translation values that keep the focal point in place
    const newTranslateX = containerFocalX - focalPointPdf.x * newScale;
    const newTranslateY = containerFocalY - focalPointPdf.y * newScale;
    
    return {
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    };
  }

  /**
   * Update the coordinate system with new values
   * 
   * @param params - Parameters to update
   */
  updateSystem(params: {
    containerElement?: HTMLElement | null;
    scale?: number;
    translateX?: number;
    translateY?: number;
    viewportDimensions?: ViewportDimensions;
  }) {
    if (params.containerElement !== undefined) this.containerElement = params.containerElement;
    if (params.scale !== undefined) this.scale = params.scale;
    if (params.translateX !== undefined) this.translateX = params.translateX;
    if (params.translateY !== undefined) this.translateY = params.translateY;
    if (params.viewportDimensions !== undefined) this.viewportDimensions = params.viewportDimensions;
    
    // Track the last update time - useful for detecting rapid changes
    this.lastUpdateTimeMs = Date.now();
  }

  /**
   * Convert container-relative coordinates to PDF coordinates
   * This is useful when working with mouse or pointer events directly on the container
   * 
   * @param containerX - X coordinate relative to container
   * @param containerY - Y coordinate relative to container
   * @param maxPrecision - Maximum decimal places to preserve (default: 6)
   * @returns Point in PDF coordinates
   */
  containerToPdf(containerX: number, containerY: number, maxPrecision: number = 6): Point {
    // Transform to PDF coordinates (unrounded)
    const pdfXUnrounded = (containerX - this.translateX) / this.scale;
    const pdfYUnrounded = (containerY - this.translateY) / this.scale;
    
    // Calculate pixels per PDF point for dynamic precision
    const pixelsPerPdfPoint = this.scale;
    
    // Implement continuous dynamic precision calculation
    let dynamicDecimalPlaces: number;
    if (pixelsPerPdfPoint < 0.1) {
      // Very low zoom (< 0.1x) - use minimal precision
      dynamicDecimalPlaces = 1;
    } else if (pixelsPerPdfPoint > 500) {
      // Extremely high zoom (> 500x) - use maximum precision
      dynamicDecimalPlaces = 5;
    } else {
      // Dynamic precision based on zoom level
      dynamicDecimalPlaces = Math.max(2, Math.ceil(Math.log10(pixelsPerPdfPoint)) + 2);
    }
    
    // Cap at maximum practical precision
    const finalPrecision = Math.min(dynamicDecimalPlaces, maxPrecision);
    
    // Apply the calculated precision
    return {
      x: Number(pdfXUnrounded.toFixed(finalPrecision)),
      y: Number(pdfYUnrounded.toFixed(finalPrecision))
    };
  }

  /**
   * Convert screen coordinates to PDF coordinates with continuous dynamic precision
   * 
   * @param screenX - X coordinate in screen space
   * @param screenY - Y coordinate in screen space
   * @param debug - Whether to log debug information
   * @param maxPrecision - Maximum decimal places to preserve (default: 6)
   * @returns Point in PDF coordinates
   */
  screenToPdf(screenX: number, screenY: number, debug: boolean = false, maxPrecision: number = 6): Point {
    if (!this.containerElement) return { x: 0, y: 0 };
    
    // Get container-relative coordinates
    const rect = this.containerElement.getBoundingClientRect();
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;
    
    // Transform to PDF coordinates (unrounded)
    const pdfXUnrounded = (containerX - this.translateX) / this.scale;
    const pdfYUnrounded = (containerY - this.translateY) / this.scale;
    
    // Calculate pixels per PDF point for dynamic precision
    const pixelsPerPdfPoint = this.scale;
    
    // Implement continuous dynamic precision calculation
    let dynamicDecimalPlaces: number;
    if (pixelsPerPdfPoint < 0.1) {
      // Very low zoom (< 0.1x) - use minimal precision
      dynamicDecimalPlaces = 1;
    } else if (pixelsPerPdfPoint > 500) {
      // Extremely high zoom (> 500x) - use maximum precision
      dynamicDecimalPlaces = 5;
    } else {
      // Dynamic precision based on zoom level
      // The formula log10(scale) + 2 gives a good approximation:
      // - At scale 1, we get 2 decimal places
      // - At scale 10, we get 3 decimal places
      // - At scale 100, we get 4 decimal places
      dynamicDecimalPlaces = Math.max(2, Math.ceil(Math.log10(pixelsPerPdfPoint)) + 2);
    }
    
    // Cap at maximum practical precision
    const finalPrecision = Math.min(dynamicDecimalPlaces, maxPrecision);
    
    if (debug) {
      console.log(
        `Screen(${screenX}, ${screenY}) → ` +
        `PDF(${pdfXUnrounded.toFixed(finalPrecision)}, ${pdfYUnrounded.toFixed(finalPrecision)}) @ ` +
        `scale ${this.scale.toFixed(2)}, precision: ${finalPrecision}`
      );
    }
    
    // Apply the calculated precision
    return {
      x: Number(pdfXUnrounded.toFixed(finalPrecision)),
      y: Number(pdfYUnrounded.toFixed(finalPrecision))
    };
  }

  /**
   * Convert PDF coordinates to screen coordinates
   * 
   * @param pdfX - X coordinate in PDF space
   * @param pdfY - Y coordinate in PDF space
   * @param debug - Whether to log debug information
   * @returns Point in screen coordinates
   */
  pdfToScreen(pdfX: number, pdfY: number, debug: boolean = false): Point {
    if (!this.containerElement) return { x: 0, y: 0 };
    
    // Apply transformation to get screen coordinates
    const screenX = pdfX * this.scale + this.translateX;
    const screenY = pdfY * this.scale + this.translateY;
    
    if (debug) {
      console.log(`PDF(${pdfX}, ${pdfY}) → Screen(${screenX.toFixed(2)}, ${screenY.toFixed(2)}) @ scale ${this.scale.toFixed(2)}`);
    }
    
    return { x: screenX, y: screenY };
  }
}

/**
 * Standalone function to convert screen coordinates to PDF coordinates with continuous dynamic precision
 * 
 * @param screenX - X coordinate in screen space
 * @param screenY - Y coordinate in screen space
 * @param containerElement - The containing element
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 * @param maxPrecision - Maximum decimal places to preserve (default: 6)
 * @returns Point in PDF coordinates
 */
export function screenToPdfCoordinates(
  screenX: number, 
  screenY: number, 
  containerElement: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number,
  maxPrecision: number = 6
): Point {
  const rect = containerElement.getBoundingClientRect();
  const containerX = screenX - rect.left;
  const containerY = screenY - rect.top;
  
  const pdfXUnrounded = (containerX - translateX) / scale;
  const pdfYUnrounded = (containerY - translateY) / scale;
  
  // Calculate pixels per PDF point for dynamic precision
  const pixelsPerPdfPoint = scale;
  
  // Implement continuous dynamic precision calculation
  let dynamicDecimalPlaces: number;
  if (pixelsPerPdfPoint < 0.1) {
    // Very low zoom (< 0.1x) - use minimal precision
    dynamicDecimalPlaces = 1;
  } else if (pixelsPerPdfPoint > 500) {
    // Extremely high zoom (> 500x) - use maximum precision
    dynamicDecimalPlaces = 5;
  } else {
    // Dynamic precision based on zoom level
    dynamicDecimalPlaces = Math.max(2, Math.ceil(Math.log10(pixelsPerPdfPoint)) + 2);
  }
  
  // Cap at maximum practical precision
  const finalPrecision = Math.min(dynamicDecimalPlaces, maxPrecision);
  
  return {
    x: Number(pdfXUnrounded.toFixed(finalPrecision)),
    y: Number(pdfYUnrounded.toFixed(finalPrecision))
  };
}

/**
 * Standalone function to convert PDF coordinates to screen coordinates
 * 
 * @param pdfX - X coordinate in PDF space
 * @param pdfY - Y coordinate in PDF space
 * @param containerElement - The containing element
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 * @returns Point in screen coordinates
 */
export function pdfToScreenCoordinates(
  pdfX: number, 
  pdfY: number, 
  containerElement: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number
): Point {
  const screenX = pdfX * scale + translateX;
  const screenY = pdfY * scale + translateY;
  
  return { x: screenX, y: screenY };
}

/**
 * Calculate distance between two points
 * 
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance between points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points in degrees
 * 
 * @param p1 - First point (center)
 * @param p2 - Second point
 * @returns Angle in degrees
 */
export function calculateAngle(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  // Calculate angle in radians, then convert to degrees
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Normalize to 0-360 range
  if (angle < 0) angle += 360;
  
  return angle;
}

/**
 * Normalize an angle to the range -180 to 180 degrees
 * This is important for smooth camera FOV calculations
 * 
 * @param angle - Angle in degrees
 * @returns Normalized angle
 */
export function normalizeAngle(angle: number): number {
  // Normalize angle to range [-180, 180]
  let normalizedAngle = angle;
  while (normalizedAngle > 180) normalizedAngle -= 360;
  while (normalizedAngle < -180) normalizedAngle += 360;
  return normalizedAngle;
}

/**
 * Calculate the transform matrix for the PDF viewport
 * 
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 * @returns Transform matrix as a string for CSS transform
 */
export function calculateTransformMatrix(scale: number, translateX: number, translateY: number): string {
  return `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
}

/**
 * Apply a viewport transform to a DOM element
 * 
 * @param element - DOM element to transform
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 */
export function applyViewportTransform(
  element: HTMLElement | null,
  scale: number,
  translateX: number,
  translateY: number
): void {
  if (!element) return;
  
  // Apply transform
  const transformStr = calculateTransformMatrix(scale, translateX, translateY);
  element.style.transform = transformStr;
  
  // Set transform origin to top left (default is center, which can cause issues)
  element.style.transformOrigin = '0 0';
}

/**
 * Calculate an optimized mouse-to-marker offset for precise dragging
 * 
 * @param mouseClientX - Mouse X position in client coordinates
 * @param mouseClientY - Mouse Y position in client coordinates
 * @param markerPdfX - Marker X position in PDF coordinates
 * @param markerPdfY - Marker Y position in PDF coordinates
 * @param coordSystem - Coordinate system for transformations
 * @returns Offset in screen coordinates
 */
export function calculateDragOffset(
  mouseClientX: number,
  mouseClientY: number,
  markerPdfX: number,
  markerPdfY: number,
  coordSystem: CoordinateSystem
): Point {
  // Convert marker PDF position to screen
  const markerScreenPos = coordSystem.pdfToScreen(markerPdfX, markerPdfY);
  
  // Calculate offset from mouse to marker
  return {
    x: mouseClientX - markerScreenPos.x,
    y: mouseClientY - markerScreenPos.y
  };
}