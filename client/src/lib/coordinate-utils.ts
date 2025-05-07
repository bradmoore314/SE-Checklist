/**
 * Coordinate conversion utilities for PDF viewer
 * This module provides consistent conversion between different coordinate systems:
 * - Screen coordinates: Relative to the browser viewport
 * - Container coordinates: Relative to the PDF container element
 * - PDF coordinates: The coordinate system of the PDF document itself
 */

export type Point = { x: number; y: number };

/**
 * Convert screen (browser) coordinates to PDF document coordinates
 * @param screenX X coordinate in screen space (from mouse event)
 * @param screenY Y coordinate in screen space (from mouse event)
 * @param containerRect The bounding rectangle of the PDF container
 * @param scale Current zoom scale factor
 * @param translateX Current X translation (pan)
 * @param translateY Current Y translation (pan)
 * @param pdfViewport The dimensions of the PDF viewport
 * @returns Coordinates in PDF space
 */
export function screenToPdfCoordinates(
  screenX: number,
  screenY: number,
  containerRect: DOMRect,
  scale: number,
  translateX: number,
  translateY: number,
  pdfViewport: { width: number; height: number } = { width: 0, height: 0 }
): Point {
  // First convert screen coordinates to container-relative coordinates
  const containerX = screenX - containerRect.left;
  const containerY = screenY - containerRect.top;
  
  // Then convert container coordinates to PDF coordinates, accounting for pan and zoom
  const pdfX = (containerX - translateX) / scale;
  const pdfY = (containerY - translateY) / scale;
  
  console.log(`Converting Screen(${screenX}, ${screenY}) → PDF(${pdfX.toFixed(2)}, ${pdfY.toFixed(2)}) @ scale ${scale}`);
  
  return { x: pdfX, y: pdfY };
}

/**
 * Convert PDF document coordinates to screen coordinates
 * @param pdfX X coordinate in PDF space
 * @param pdfY Y coordinate in PDF space
 * @param containerRect The bounding rectangle of the PDF container
 * @param scale Current zoom scale factor
 * @param translateX Current X translation (pan)
 * @param translateY Current Y translation (pan)
 * @returns Coordinates in screen space
 */
export function pdfToScreenCoordinates(
  pdfX: number,
  pdfY: number,
  containerRect: DOMRect = new DOMRect(0, 0, 0, 0),
  scale: number = 1,
  translateX: number = 0,
  translateY: number = 0,
  viewport: { width: number; height: number } = { width: 0, height: 0 }
): Point {
  // Convert PDF coordinates to screen coordinates
  const screenX = pdfX * scale + translateX;
  const screenY = pdfY * scale + translateY;
  
  return { x: screenX, y: screenY };
}

/**
 * Calculate the offset between a marker's position and the cursor position
 * Used for dragging operations to maintain the relative position between cursor and marker
 */
export function calculateDragOffset(
  cursorPdfX: number,
  cursorPdfY: number,
  markerPdfX: number,
  markerPdfY: number
): Point {
  return {
    x: cursorPdfX - markerPdfX,
    y: cursorPdfY - markerPdfY
  };
}

/**
 * Determine if a point is inside a marker's hit area
 * @param point The point to test (in PDF coordinates)
 * @param marker The marker's position and dimensions
 * @param hitRadius Additional hit area radius beyond the marker's visual size
 * @returns True if the point is inside the marker's hit area
 */
export function isPointInMarker(
  point: Point,
  markerPosition: Point,
  hitRadius: number = 10
): boolean {
  const dx = point.x - markerPosition.x;
  const dy = point.y - markerPosition.y;
  const distanceSquared = dx * dx + dy * dy;
  return distanceSquared <= hitRadius * hitRadius;
}