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
  }

  /**
   * Calculate a zoom transform with the mouse position as the zoom origin
   * 
   * @param mouseX - Mouse X position in container coordinates
   * @param mouseY - Mouse Y position in container coordinates
   * @param newScale - The new scale to zoom to
   * @returns An object with the new scale and translations
   */
  calculateZoomTransform(mouseX: number, mouseY: number, newScale: number): { scale: number, translateX: number, translateY: number } {
    if (!this.containerElement) {
      return { scale: newScale, translateX: 0, translateY: 0 };
    }

    // Calculate the point in PDF space where the mouse is pointing
    const pointBeforeZoom = this.containerToPdf(mouseX, mouseY);
    
    // Calculate what the translations would be to keep the point under the mouse
    const newTranslateX = mouseX - pointBeforeZoom.x * newScale;
    const newTranslateY = mouseY - pointBeforeZoom.y * newScale;
    
    return {
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    };
  }

  /**
   * Convert container coordinates to PDF coordinates
   * Similar to screenToPdf but doesn't account for the container's position
   * 
   * @param containerX - X coordinate in container space
   * @param containerY - Y coordinate in container space
   * @returns Point in PDF coordinates
   */
  containerToPdf(containerX: number, containerY: number): Point {
    // Transform to PDF coordinates
    const pdfX = (containerX - this.translateX) / this.scale;
    const pdfY = (containerY - this.translateY) / this.scale;
    
    // Use higher precision for greater zoom levels
    const adjustedPrecision = Math.min(Math.max(2, Math.ceil(Math.log10(this.scale) + 2)), 4);
    
    // Ensure consistent precision with adaptive decimal places
    return {
      x: Number(pdfX.toFixed(adjustedPrecision)),
      y: Number(pdfY.toFixed(adjustedPrecision))
    };
  }

  /**
   * Convert screen coordinates to PDF coordinates
   * 
   * @param screenX - X coordinate in screen space
   * @param screenY - Y coordinate in screen space
   * @param debug - Whether to log debug information
   * @param precision - Decimal places to preserve (default: 4)
   * @returns Point in PDF coordinates
   */
  screenToPdf(screenX: number, screenY: number, debug: boolean = false, precision: number = 4): Point {
    if (!this.containerElement) return { x: 0, y: 0 };
    
    // Get container-relative coordinates
    const rect = this.containerElement.getBoundingClientRect();
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;
    
    // Transform to PDF coordinates using containerToPdf
    const pdfPoint = this.containerToPdf(containerX, containerY);
    
    if (debug) {
      console.log(`Screen(${screenX}, ${screenY}) → PDF(${pdfPoint.x.toFixed(precision)}, ${pdfPoint.y.toFixed(precision)}) @ scale ${this.scale.toFixed(2)}`);
    }
    
    return pdfPoint;
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
 * Standalone function to convert screen coordinates to PDF coordinates
 * 
 * @param screenX - X coordinate in screen space
 * @param screenY - Y coordinate in screen space
 * @param containerElement - The containing element
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 * @param precision - Decimal places to preserve (default: 4)
 * @returns Point in PDF coordinates
 */
export function screenToPdfCoordinates(
  screenX: number, 
  screenY: number, 
  containerElement: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number,
  precision: number = 4
): Point {
  const rect = containerElement.getBoundingClientRect();
  const containerX = screenX - rect.left;
  const containerY = screenY - rect.top;
  
  const pdfX = (containerX - translateX) / scale;
  const pdfY = (containerY - translateY) / scale;
  
  // Use higher precision for greater zoom levels
  const adjustedPrecision = Math.min(Math.max(2, Math.ceil(Math.log10(scale) + 2)), precision);
  
  return {
    x: Number(pdfX.toFixed(adjustedPrecision)),
    y: Number(pdfY.toFixed(adjustedPrecision))
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