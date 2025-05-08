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
   * Convert screen coordinates to PDF coordinates
   * 
   * @param screenX - X coordinate in screen space
   * @param screenY - Y coordinate in screen space
   * @param debug - Whether to log debug information
   * @returns Point in PDF coordinates
   */
  screenToPdf(screenX: number, screenY: number, debug: boolean = false): Point {
    if (!this.containerElement) return { x: 0, y: 0 };
    
    // Get container-relative coordinates
    const rect = this.containerElement.getBoundingClientRect();
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;
    
    // Transform to PDF coordinates
    const pdfX = (containerX - this.translateX) / this.scale;
    const pdfY = (containerY - this.translateY) / this.scale;
    
    if (debug) {
      console.log(`Screen(${screenX}, ${screenY}) → PDF(${pdfX.toFixed(2)}, ${pdfY.toFixed(2)}) @ scale ${this.scale.toFixed(2)}`);
    }
    
    // Ensure consistent rounding
    return {
      x: parseFloat(pdfX.toFixed(2)),
      y: parseFloat(pdfY.toFixed(2))
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
 * Standalone function to convert screen coordinates to PDF coordinates
 * 
 * @param screenX - X coordinate in screen space
 * @param screenY - Y coordinate in screen space
 * @param containerElement - The containing element
 * @param scale - Current zoom scale
 * @param translateX - X translation
 * @param translateY - Y translation
 * @returns Point in PDF coordinates
 */
export function screenToPdfCoordinates(
  screenX: number, 
  screenY: number, 
  containerElement: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number
): Point {
  const rect = containerElement.getBoundingClientRect();
  const containerX = screenX - rect.left;
  const containerY = screenY - rect.top;
  
  const pdfX = (containerX - translateX) / scale;
  const pdfY = (containerY - translateY) / scale;
  
  return {
    x: parseFloat(pdfX.toFixed(2)),
    y: parseFloat(pdfY.toFixed(2))
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