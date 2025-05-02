import jsPDF from 'jspdf';

// Extended jsPDF type that includes additional methods used in this utility
interface ExtendedJsPDF extends jsPDF {
  moveTo(x: number, y: number): this;
  lineTo(x: number, y: number): this;
  stroke(): this;
  polygon(points: Array<[number, number]>, style: string): this;
  translateY(y: number): this;
  translateX(x: number): this;
  rotate(angle: number): this;
  GState(options: { opacity: number }): any;
}
import { MarkerData, LayerData, CalibrationData, PDFExportData, ExportOptions } from '@/types/floorplan';

/**
 * PDF Exporter Utility
 * 
 * This utility handles exporting the floorplan with all annotations
 * to create a shareable PDF file that maintains all markup.
 * 
 * Inspired by Bluebeam's export capabilities.
 */

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeLayers: true,
  includeOnlyVisibleLayers: true,
  includeCalibration: true,
  includeProperties: true,
  includeComments: false,
  qualityLevel: 'high',
  addWatermark: false,
  watermarkText: '',
  fileName: 'floorplan_export',
  pageSize: 'auto',
  orientation: 'landscape',
  compression: true,
};

/**
 * Exports a PDF with annotations
 */
export const exportAnnotatedPDF = async (
  data: PDFExportData,
  options: ExportOptions = {}
): Promise<string> => {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  try {
    // Create new PDF document
    const { pageWidth, pageHeight, orientation } = data;
    const pdfDoc = new jsPDF({
      orientation: mergedOptions.orientation,
      unit: 'pt',
      format: mergedOptions.pageSize === 'auto' ? [pageWidth, pageHeight] : mergedOptions.pageSize,
    }) as ExtendedJsPDF;
    
    // Add the original PDF page as the background
    await addOriginalPageAsBackground(pdfDoc, data.pdfDataUrl, data.currentPage);
    
    // Add annotations
    const visibleLayers = data.layers.filter(layer => 
      !mergedOptions.includeOnlyVisibleLayers || layer.visible
    );
    
    const visibleLayerIds = visibleLayers.map(layer => layer.id);
    
    const markersToRender = data.markers.filter(marker => 
      !marker.layer_id || visibleLayerIds.includes(marker.layer_id)
    );
    
    // Sort markers by layer order for proper rendering order
    markersToRender.sort((a, b) => {
      const layerA = a.layer_id ? data.layers.find(l => l.id === a.layer_id) : null;
      const layerB = b.layer_id ? data.layers.find(l => l.id === b.layer_id) : null;
      
      const orderA = layerA?.order || 0;
      const orderB = layerB?.order || 0;
      
      return orderA - orderB;
    });
    
    // Render all markers
    for (const marker of markersToRender) {
      await renderMarker(pdfDoc, marker, data);
    }
    
    // Add calibration if requested
    if (mergedOptions.includeCalibration && data.calibration) {
      addCalibrationToExport(pdfDoc, data.calibration, data);
    }
    
    // Add watermark if requested
    if (mergedOptions.addWatermark && mergedOptions.watermarkText) {
      addWatermark(pdfDoc, mergedOptions.watermarkText, pageWidth, pageHeight);
    }
    
    // Add metadata
    addMetadata(pdfDoc, data, visibleLayers);
    
    // Save the PDF
    const fileName = mergedOptions.fileName || 'floorplan_export';
    
    // Return as base64 data URL
    const pdfOutput = pdfDoc.output('datauristring');
    return pdfOutput;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error(`Failed to export PDF: ${error}`);
  }
};

/**
 * Add the original PDF page as the background of the new PDF
 */
const addOriginalPageAsBackground = async (
  pdfDoc: ExtendedJsPDF,
  pdfDataUrl: string,
  pageNumber: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element from the PDF data URL
      const img = new Image();
      img.src = pdfDataUrl;
      
      img.onload = () => {
        try {
          // Add the image as background
          pdfDoc.addImage(
            img, 
            'PNG', 
            0, 
            0, 
            pdfDoc.internal.pageSize.getWidth(),
            pdfDoc.internal.pageSize.getHeight(),
            `page_${pageNumber}`,
            'FAST'
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = (err) => {
        reject(new Error('Failed to load PDF background image'));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Render a marker on the PDF
 */
const renderMarker = async (
  pdfDoc: ExtendedJsPDF,
  marker: MarkerData,
  data: PDFExportData
): Promise<void> => {
  const { position_x, position_y, marker_type, color, fill_color, opacity, line_width } = marker;
  
  // Set basic styles
  const strokeColor = color || '#000000';
  const fillColor = fill_color || '';
  const lineWidth = line_width || 1;
  
  // Parse colors to RGB values for jsPDF
  const parseColor = (colorStr: string) => {
    // Simple hex to RGB conversion
    const hex = colorStr.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  };
  
  // Set stroke color
  if (strokeColor) {
    const { r, g, b } = parseColor(strokeColor);
    pdfDoc.setDrawColor(r, g, b);
  }
  
  // Set fill color if provided
  if (fillColor) {
    const { r, g, b } = parseColor(fillColor);
    pdfDoc.setFillColor(r, g, b);
  }
  
  // Set line width
  pdfDoc.setLineWidth(lineWidth);
  
  // Draw based on marker type
  switch (marker_type) {
    case 'rectangle':
      drawRectangle(pdfDoc, marker);
      break;
    case 'circle':
      drawCircle(pdfDoc, marker);
      break;
    case 'line':
      drawLine(pdfDoc, marker);
      break;
    case 'text':
      drawText(pdfDoc, marker);
      break;
    case 'freehand':
      drawFreehand(pdfDoc, marker);
      break;
    case 'polygon':
      drawPolygon(pdfDoc, marker);
      break;
    case 'access_point':
      drawAccessPoint(pdfDoc, marker);
      break;
    case 'camera':
      drawCamera(pdfDoc, marker);
      break;
    case 'measure':
      drawMeasurement(pdfDoc, marker, data);
      break;
    default:
      // Default fallback for unknown types
      drawGenericMarker(pdfDoc, marker);
      break;
  }
};

// Individual drawing functions for different marker types
const drawRectangle = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, width, height, fill_color } = marker;
  
  if (width && height) {
    if (fill_color) {
      // Filled rectangle
      pdfDoc.rect(position_x, position_y, width, height, 'F');
    }
    // Stroked rectangle (can be in addition to fill)
    pdfDoc.rect(position_x, position_y, width, height, 'S');
  }
};

const drawCircle = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, width, fill_color } = marker;
  
  if (width) {
    const radius = width / 2;
    const style = fill_color ? 'FD' : 'S'; // FD = fill and stroke, S = stroke only
    
    // jsPDF uses a different circle method than canvas
    pdfDoc.circle(position_x + radius, position_y + radius, radius, style);
  }
};

const drawLine = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, end_x, end_y } = marker;
  
  if (end_x !== undefined && end_y !== undefined) {
    pdfDoc.line(position_x, position_y, end_x, end_y);
  }
};

const drawText = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, text_content, font_size, font_family, color } = marker;
  
  if (text_content) {
    // Set text properties
    const fontSize = font_size || 12;
    const fontFamily = (font_family || 'helvetica').toLowerCase();
    
    pdfDoc.setFontSize(fontSize);
    pdfDoc.setFont(fontFamily);
    
    // Set text color
    if (color) {
      const { r, g, b } = parseColor(color);
      pdfDoc.setTextColor(r * 255, g * 255, b * 255);
    } else {
      pdfDoc.setTextColor(0, 0, 0);
    }
    
    // Add text to PDF
    pdfDoc.text(text_content, position_x, position_y);
  }
};

const drawFreehand = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { points } = marker;
  
  if (points && points.length >= 2) {
    // Start at the first point
    pdfDoc.moveTo(points[0].x, points[0].y);
    
    // Draw lines to each subsequent point
    for (let i = 1; i < points.length; i++) {
      pdfDoc.lineTo(points[i].x, points[i].y);
    }
    
    // Draw the path
    pdfDoc.stroke();
  }
};

const drawPolygon = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { points, fill_color } = marker;
  
  if (points && points.length >= 3) {
    const style = fill_color ? 'FD' : 'S'; // FD = fill and stroke, S = stroke only
    
    // Create polygon path
    // Cast each point to the expected tuple type for polygon
    const pointsArray: [number, number][] = points.map(p => [p.x, p.y] as [number, number]);
    pdfDoc.polygon(pointsArray, style);
  }
};

const drawAccessPoint = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, label } = marker;
  
  // Draw a door symbol as a rectangle with a small gap
  pdfDoc.setFillColor(59, 130, 246); // Blue color
  pdfDoc.rect(position_x, position_y, 20, 5, 'F');
  
  // Draw the label if present
  if (label) {
    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(label, position_x, position_y + 20);
  }
};

const drawCamera = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  const { position_x, position_y, label, rotation } = marker;
  
  // Save the current transform
  pdfDoc.saveGraphicsState();
  
  // Apply rotation if specified
  if (rotation) {
    // jsPDF rotation works differently; need to translate to the center point first
    pdfDoc.translateY(position_y);
    pdfDoc.translateX(position_x);
    pdfDoc.rotate(rotation);
    pdfDoc.translateX(-position_x);
    pdfDoc.translateY(-position_y);
  }
  
  // Draw a camera symbol as a rectangle with a small triangle
  pdfDoc.setFillColor(16, 185, 129); // Green color
  pdfDoc.rect(position_x, position_y, 15, 10, 'F');
  
  // Draw a triangle for the lens
  pdfDoc.triangle(
    position_x + 15, position_y + 5,  // Tip
    position_x + 25, position_y,      // Top right
    position_x + 25, position_y + 10  // Bottom right
  );
  
  // Restore the transform
  pdfDoc.restoreGraphicsState();
  
  // Draw the label if present
  if (label) {
    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(label, position_x, position_y + 25);
  }
};

const drawMeasurement = (pdfDoc: ExtendedJsPDF, marker: MarkerData, data: PDFExportData): void => {
  const { position_x, position_y, end_x, end_y, label } = marker;
  
  if (end_x !== undefined && end_y !== undefined) {
    // Draw the measurement line
    pdfDoc.setDrawColor(239, 68, 68); // Red color
    pdfDoc.line(position_x, position_y, end_x, end_y);
    
    // Add small perpendicular lines at the ends
    const angle = Math.atan2(end_y - position_y, end_x - position_x);
    const perpLength = 5;
    
    // Start cap
    pdfDoc.line(
      position_x, 
      position_y, 
      position_x + perpLength * Math.cos(angle + Math.PI/2),
      position_y + perpLength * Math.sin(angle + Math.PI/2)
    );
    pdfDoc.line(
      position_x, 
      position_y, 
      position_x + perpLength * Math.cos(angle - Math.PI/2),
      position_y + perpLength * Math.sin(angle - Math.PI/2)
    );
    
    // End cap
    pdfDoc.line(
      end_x, 
      end_y, 
      end_x + perpLength * Math.cos(angle + Math.PI/2),
      end_y + perpLength * Math.sin(angle + Math.PI/2)
    );
    pdfDoc.line(
      end_x, 
      end_y, 
      end_x + perpLength * Math.cos(angle - Math.PI/2),
      end_y + perpLength * Math.sin(angle - Math.PI/2)
    );
    
    // Draw the measurement text
    if (label) {
      const midX = (position_x + end_x) / 2;
      const midY = (position_y + end_y) / 2 - 10; // Offset slightly above the line
      
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(239, 68, 68); // Red color
      
      // Add a small white background for better readability
      const textWidth = pdfDoc.getStringUnitWidth(label) * 10 / pdfDoc.internal.scaleFactor;
      pdfDoc.setFillColor(255, 255, 255);
      pdfDoc.rect(midX - textWidth/2 - 2, midY - 8, textWidth + 4, 12, 'F');
      
      pdfDoc.text(label, midX, midY, { align: 'center' });
    }
  }
};

const drawGenericMarker = (pdfDoc: ExtendedJsPDF, marker: MarkerData): void => {
  // Fallback for any unhandled marker types
  const { position_x, position_y, label } = marker;
  
  // Draw a simple circle
  pdfDoc.circle(position_x, position_y, 5, 'S');
  
  // Draw the label if present
  if (label) {
    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(label, position_x + 10, position_y + 5);
  }
};

/**
 * Add calibration information to the export
 */
const addCalibrationToExport = (
  pdfDoc: ExtendedJsPDF,
  calibration: CalibrationData,
  data: PDFExportData
): void => {
  const { start_x, start_y, end_x, end_y, real_world_distance, unit } = calibration;
  
  // Draw the calibration line
  pdfDoc.setDrawColor(0, 0, 0);
  pdfDoc.setLineWidth(0.5);
  pdfDoc.line(start_x, start_y, end_x, end_y);
  
  // Add text describing the calibration
  const midX = (start_x + end_x) / 2;
  const midY = (start_y + end_y) / 2 - 15;
  
  const calibrationText = `Scale: ${real_world_distance} ${unit}`;
  
  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor(0, 0, 0);
  
  // Add a small white background for better readability
  const textWidth = pdfDoc.getStringUnitWidth(calibrationText) * 8 / pdfDoc.internal.scaleFactor;
  pdfDoc.setFillColor(255, 255, 255);
  pdfDoc.rect(midX - textWidth/2 - 2, midY - 6, textWidth + 4, 10, 'F');
  
  pdfDoc.text(calibrationText, midX, midY, { align: 'center' });
};

/**
 * Add a watermark to the PDF
 */
const addWatermark = (
  pdfDoc: ExtendedJsPDF,
  text: string,
  pageWidth: number,
  pageHeight: number
): void => {
  // Save the current state
  pdfDoc.saveGraphicsState();
  
  // Set watermark properties
  pdfDoc.setTextColor(200, 200, 200);
  pdfDoc.setFontSize(30);
  pdfDoc.setGState(pdfDoc.GState({ opacity: 0.3 }));
  
  // Rotate and position the watermark
  const textWidth = pdfDoc.getStringUnitWidth(text) * 30 / pdfDoc.internal.scaleFactor;
  
  // Calculate center of page
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Translate to center, rotate, translate back
  pdfDoc.translateY(centerY);
  pdfDoc.translateX(centerX);
  pdfDoc.rotate(-45);
  pdfDoc.text(text, 0, 0, { align: 'center' });
  
  // Restore the original state
  pdfDoc.restoreGraphicsState();
};

/**
 * Add metadata to the PDF
 */
const addMetadata = (
  pdfDoc: ExtendedJsPDF,
  data: PDFExportData,
  visibleLayers: LayerData[]
): void => {
  const { projectName, userName, exportDate } = data;
  
  // Set document properties
  pdfDoc.setProperties({
    title: `${projectName} - Floor Plan`,
    subject: 'Annotated Floor Plan',
    author: userName,
    keywords: 'floor plan, annotations, blueprint',
    creator: 'SiteWalk Checklist App'
    // Note: 'producer' is automatically set by jsPDF itself
  });
  
  // Add footer with metadata
  const footerText = `Project: ${projectName} | Exported by: ${userName} | Date: ${exportDate.toLocaleString()}`;
  const pageWidth = pdfDoc.internal.pageSize.getWidth();
  const pageHeight = pdfDoc.internal.pageSize.getHeight();
  
  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor(100, 100, 100);
  pdfDoc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Add page number
  const pageText = `Page ${data.currentPage} of ${data.totalPages}`;
  pdfDoc.text(pageText, pageWidth - 20, pageHeight - 10, { align: 'right' });
};

// Helper function for color parsing
const parseColor = (colorStr: string) => {
  // Simple hex to RGB conversion
  const hex = colorStr.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b };
};

export default exportAnnotatedPDF;