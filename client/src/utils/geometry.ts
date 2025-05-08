import { Point } from './coordinates';

/**
 * Generate an SVG path string for a camera FOV using proper arc commands
 * 
 * @param centerX - X coordinate of camera center
 * @param centerY - Y coordinate of camera center
 * @param range - Range/radius of FOV
 * @param fovDegrees - Field of view in degrees
 * @param baseRotationDegrees - Base rotation in degrees
 * @returns SVG path string for the field of view
 */
export function calculateSvgFovPathD(
  centerX: number, 
  centerY: number, 
  range: number, 
  fovDegrees: number, 
  baseRotationDegrees: number
): string {
  // Validate and clamp input values
  const clampedFov = Math.max(0, Math.min(360, fovDegrees));
  if (clampedFov === 0 || range <= 0) return '';

  // Special case for 360 degrees (or near 360)
  if (clampedFov >= 359.9) {
    // Create a full circle using two arcs (better for filling from center)
    const p1x = centerX + range;
    const p1y = centerY;
    const p2x = centerX - range;
    const p2y = centerY;
    
    return `M ${centerX},${centerY} 
            L ${p1x},${p1y} 
            A ${range},${range} 0 1,1 ${p2x},${p2y} 
            A ${range},${range} 0 1,1 ${p1x},${p1y} 
            Z`;
  }
  
  // For standard FOV less than 360 degrees
  // Convert angles to radians
  const fovRadians = (clampedFov * Math.PI) / 180;
  const rotationRadians = (baseRotationDegrees * Math.PI) / 180;
  
  // Calculate start and end angles
  const angle1 = rotationRadians - fovRadians / 2;
  const angle2 = rotationRadians + fovRadians / 2;
  
  // Calculate points on the arc
  const x1 = centerX + range * Math.cos(angle1);
  const y1 = centerY + range * Math.sin(angle1);
  const x2 = centerX + range * Math.cos(angle2);
  const y2 = centerY + range * Math.sin(angle2);
  
  // Determine large arc flag (1 if angle > 180 degrees)
  const largeArcFlag = fovRadians > Math.PI ? 1 : 0;
  
  // Always use sweep flag 1 for clockwise path
  const sweepFlag = 1;
  
  // Construct the path string:
  // M = move to center
  // L = line to first point on arc
  // A = arc from first to second point (rx,ry rotation largeArc,sweep endX,endY)
  // Z = close path back to center
  return `M ${centerX},${centerY} 
          L ${x1},${y1} 
          A ${range},${range} 0 ${largeArcFlag},${sweepFlag} ${x2},${y2} 
          Z`;
}

/**
 * Generate an SVG path string for the range indicator line
 * 
 * @param centerX - X coordinate of camera center
 * @param centerY - Y coordinate of camera center
 * @param range - Range/radius to indicate
 * @param rotationDegrees - Rotation in degrees
 * @param dashPattern - Optional SVG dash pattern
 * @returns SVG path string for the range indicator line
 */
export function calculateRangeIndicatorPathD(
  centerX: number,
  centerY: number,
  range: number,
  rotationDegrees: number,
  dashPattern: string = "4,2"
): string {
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const x2 = centerX + range * Math.cos(rotationRadians);
  const y2 = centerY + range * Math.sin(rotationRadians);
  
  return `M ${centerX},${centerY} L ${x2},${y2}`;
}

/**
 * Calculate the position of a handle on the FOV arc
 * 
 * @param centerX - X coordinate of camera center
 * @param centerY - Y coordinate of camera center
 * @param range - Range/radius of FOV
 * @param angleDegrees - Angle in degrees
 * @returns Point for handle position
 */
export function calculateFovHandlePosition(
  centerX: number,
  centerY: number,
  range: number,
  angleDegrees: number
): Point {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: centerX + range * Math.cos(angleRadians),
    y: centerY + range * Math.sin(angleRadians)
  };
}