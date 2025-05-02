/**
 * Type definitions for floorplan-related data structures
 * Supporting the Bluebeam-like PDF annotation system
 */

/**
 * Floorplan data structure
 */
export interface FloorplanData {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Layer data structure for organizing markers
 */
export interface LayerData {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Marker data structure for annotations
 */
export interface MarkerData {
  id: number;
  floorplan_id: number;
  unique_id: string;
  page: number;
  marker_type: string;
  equipment_id?: number;
  layer_id?: number;
  
  // Position and size
  position_x: number;
  position_y: number;
  end_x?: number;
  end_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  
  // Style
  color?: string;
  fill_color?: string;
  opacity?: number;
  line_width?: number;
  
  // Text content
  label?: string;
  text_content?: string;
  font_size?: number;
  font_family?: string;
  
  // For polygon shapes
  points?: Array<{x: number, y: number}>;
  
  // Version control
  author_id?: number;
  author_name?: string;
  version: number;
  parent_id?: number;
  
  created_at?: string;
  updated_at?: string;
}

/**
 * Calibration data structure for real-world scaling
 */
export interface CalibrationData {
  id: number;
  floorplan_id: number;
  page: number;
  real_world_distance: number;
  pdf_distance: number;
  unit: string;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Marker comment data structure for collaborative markup
 */
export interface MarkerCommentData {
  id: number;
  marker_id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

/**
 * Export options for PDF export
 */
export interface ExportOptions {
  includeLayers?: boolean;
  includeOnlyVisibleLayers?: boolean;
  includeCalibration?: boolean;
  includeProperties?: boolean;
  includeComments?: boolean;
  qualityLevel?: 'low' | 'medium' | 'high';
  addWatermark?: boolean;
  watermarkText?: string;
  fileName?: string;
  pageSize?: 'a4' | 'letter' | 'legal' | 'tabloid' | 'auto';
  orientation?: 'portrait' | 'landscape';
  compression?: boolean;
}

/**
 * PDF export data for generating annotated PDFs
 */
export interface PDFExportData {
  pdfDataUrl: string;
  markers: MarkerData[];
  layers: LayerData[];
  calibration?: CalibrationData;
  pageWidth: number;
  pageHeight: number;
  currentPage: number;
  totalPages: number;
  projectName: string;
  userName: string;
  exportDate: Date;
  orientation?: 'portrait' | 'landscape';
}