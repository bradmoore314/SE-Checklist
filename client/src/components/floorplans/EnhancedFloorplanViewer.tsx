import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationTool } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';
import EquipmentFormDialog from './EquipmentFormDialog';

// Ensure PDF.js worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Define interfaces for props and marker data
interface FloorplanData {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
}

interface LayerData {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order_index: number;
}

interface MarkerData {
  id: number;
  floorplan_id: number;
  unique_id: string;
  page: number;
  marker_type: string;
  equipment_id?: number;
  layer_id?: number;
  position_x: number;
  position_y: number;
  end_x?: number;
  end_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  fill_color?: string;
  opacity?: number;
  line_width?: number;
  label?: string;
  text_content?: string;
  font_size?: number;
  font_family?: string;
  points?: Array<{x: number, y: number}>;
  author_id?: number;
  author_name?: string;
  version: number;
  parent_id?: number;
}

interface CalibrationData {
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
}

interface EnhancedFloorplanViewerProps {
  floorplan: FloorplanData;
  currentPage: number;
  toolMode: AnnotationTool; 
  layers: LayerData[];
  onPageChange: (page: number) => void;
  showAllLabels?: boolean;
}

/**
 * Enhanced Floorplan Viewer Component
 * 
 * A professional PDF viewer with coordinate system for precise annotations
 * similar to Bluebeam functionality
 */
export const EnhancedFloorplanViewer = ({
  floorplan,
  currentPage,
  toolMode,
  layers,
  onPageChange,
  showAllLabels
}: EnhancedFloorplanViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgLayerRef = useRef<SVGSVGElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActionPanelOpen, setMobileActionPanelOpen] = useState(false);
  
  // State for viewer properties
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });
  const [pdfToViewportScale, setPdfToViewportScale] = useState(1);
  
  // State for marker dragging
  const [isMarkerDragging, setIsMarkerDragging] = useState(false);
  const [draggedMarkerId, setDraggedMarkerId] = useState<number | null>(null);
  const [markerDragStartX, setMarkerDragStartX] = useState(0);
  const [markerDragStartY, setMarkerDragStartY] = useState(0);
  
  // State for drawing/measuring
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartX, setDrawStartX] = useState(0);
  const [drawStartY, setDrawStartY] = useState(0);
  const [drawEndX, setDrawEndX] = useState(0);
  const [drawEndY, setDrawEndY] = useState(0);
  
  // State for calibration
  const [isCalibrationDialogOpen, setIsCalibrationDialogOpen] = useState(false);
  const [calibrationLine, setCalibrationLine] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    pdfDistance: number;
  } | null>(null);
  
  // State for marker selection and operations
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  // State for equipment form dialog
  const [showEquipmentFormDialog, setShowEquipmentFormDialog] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<{
    position_x: number;
    position_y: number;
    marker_type: string;
  } | null>(null);
  
  // Convert PDF data URL to Uint8Array for PDF.js
  const loadPDF = async () => {
    setIsLoading(true);
    try {
      // Process the base64 data, handling both with and without data URL prefix
      let base64Data = floorplan.pdf_data;
      if (base64Data.includes(',')) {
        // If it's a data URL, extract just the base64 part
        base64Data = base64Data.split(',')[1];
      }
      
      // Convert base64 to Uint8Array
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(bytes);
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      
      // Render the current page
      renderPage(currentPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PDF document.',
        variant: 'destructive',
      });
    }
  };
  
  // Fetch markers for the current page
  const { 
    data: markers,
    isLoading: isLoadingMarkers
  } = useQuery<MarkerData[]>({
    queryKey: ['/api/enhanced-floorplan', floorplan.id, 'markers', currentPage],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/enhanced-floorplan/${floorplan.id}/markers?page=${currentPage}`);
      return await res.json();
    },
    enabled: !isNaN(floorplan.id) && currentPage > 0
  });
  
  // Use the prop value instead of local state for showAllLabels
  
  // Fetch calibration data for the current page
  const { 
    data: calibration,
    isLoading: isLoadingCalibration
  } = useQuery<CalibrationData | null>({
    queryKey: ['/api/floorplans', floorplan.id, 'calibrations', currentPage],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/floorplans/${floorplan.id}/calibrations/${currentPage}`);
        if (res.status === 404) {
          console.log('Calibration not found, this is expected for new floorplans');
          return null;
        }
        return await res.json();
      } catch (error) {
        // Silently fail as calibration might not exist yet
        console.log('Calibration not found, this is expected for new floorplans');
        return null;
      }
    },
    enabled: !isNaN(floorplan.id) && currentPage > 0,
    retry: false // Don't retry as calibration might not exist yet
  });
  
  // Mutation for creating markers
  const createMarkerMutation = useMutation({
    mutationFn: async (markerData: any) => {
      const response = await apiRequest(
        'POST', 
        `/api/enhanced-floorplan/${floorplan.id}/markers`,
        markerData
      );
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the markers query to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['/api/enhanced-floorplan', floorplan.id, 'markers', currentPage]
      });
      toast({
        title: 'Success',
        description: 'Marker created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating marker:', error);
      toast({
        title: 'Error',
        description: 'Failed to create marker.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for updating marker position
  const updateMarkerPositionMutation = useMutation({
    mutationFn: async ({ markerId, positionX, positionY }: { markerId: number, positionX: number, positionY: number }) => {
      // Round to 2 decimal places for better precision storage
      const roundedX = Math.round(positionX * 100) / 100;
      const roundedY = Math.round(positionY * 100) / 100;
      
      const response = await apiRequest(
        'PATCH',
        `/api/enhanced-floorplan/markers/${markerId}/position`,
        { position_x: roundedX, position_y: roundedY }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      // Only invalidate specific marker to avoid full refresh
      queryClient.invalidateQueries({ 
        queryKey: ['/api/enhanced-floorplan', floorplan.id, 'markers', currentPage]
      });
      
      // Show success toast with precise coordinates - handle undefined data gracefully
      toast({
        title: 'Position Updated',
        description: data && typeof data.position_x === 'number' && typeof data.position_y === 'number'
          ? `Marker moved to (${data.position_x.toFixed(2)}, ${data.position_y.toFixed(2)})`
          : 'Marker position updated successfully',
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Error updating marker position:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update marker position. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for deleting a marker
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/enhanced-floorplan/markers/${markerId}`
      );
      
      // For successful deletion (204 No Content), we don't need to parse the response
      if (response.status !== 204) {
        let errorText = 'Failed to delete marker';
        try {
          const errorData = await response.text();
          if (errorData) errorText = errorData;
        } catch (e) {
          console.error('Error parsing delete response:', e);
        }
        throw new Error(errorText);
      }
      
      return markerId;
    },
    onSuccess: () => {
      // Clear selected marker
      setSelectedMarker(null);
      
      // Invalidate the markers query to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['/api/enhanced-floorplan', floorplan.id, 'markers', currentPage]
      });
      toast({
        title: 'Success',
        description: 'Marker deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting marker:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete marker.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for duplicating a marker
  const duplicateMarkerMutation = useMutation({
    mutationFn: async (marker: MarkerData) => {
      // Create new marker based on existing one
      const duplicateMarker = {
        ...marker,
        unique_id: uuidv4(), // Generate new unique ID
        position_x: marker.position_x + 20, // Offset position slightly
        position_y: marker.position_y + 20
      };
      
      // Create a new object without the id property instead of using delete
      const { id, ...markerWithoutId } = duplicateMarker;
      
      const response = await apiRequest(
        'POST', 
        `/api/enhanced-floorplan/${floorplan.id}/markers`,
        markerWithoutId
      );
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the markers query to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['/api/enhanced-floorplan', floorplan.id, 'markers', currentPage]
      });
      toast({
        title: 'Success',
        description: 'Marker duplicated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error duplicating marker:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate marker.',
        variant: 'destructive',
      });
    }
  });
  
  // Rendering the PDF page with performance optimization
  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current || !containerRef.current) return;
    
    try {
      setIsLoading(true);
      // Get the page
      const page = await pdfDocRef.current.getPage(pageNumber);
      
      // Get the viewport
      let viewport = page.getViewport({ scale, rotation });
      
      // Get container dimensions
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate scale to fit the container
      const scaleX = containerWidth / viewport.width;
      const scaleY = containerHeight / viewport.height;
      const fitScale = Math.min(scaleX, scaleY) * 0.95; // 95% to add a bit of margin
      
      // For better performance, use integer dimensions
      const scaleFactor = scale * fitScale;
      const scaledWidth = Math.floor(viewport.width * scaleFactor);
      const scaledHeight = Math.floor(viewport.height * scaleFactor);
      
      // Update the viewport with the new scale - use rounded values for better performance
      viewport = page.getViewport({ scale: scaleFactor, rotation });
      
      // Store dimensions for coordinate conversion
      setPdfDimensions({ width: viewport.width / scale, height: viewport.height / scale });
      setViewportDimensions({ width: scaledWidth, height: scaledHeight });
      setPdfToViewportScale(fitScale);
      
      // Set canvas dimensions
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
      if (!context) return;
      
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Optimize rendering
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'medium'; // Balance between quality and performance
      
      // Set SVG layer dimensions
      if (svgLayerRef.current) {
        svgLayerRef.current.setAttribute('width', `${scaledWidth}px`);
        svgLayerRef.current.setAttribute('height', `${scaledHeight}px`);
        // This viewBox ensures SVG coordinates match PDF coordinates
        svgLayerRef.current.setAttribute('viewBox', `0 0 ${scaledWidth} ${scaledHeight}`);
      }
      
      // Render the page with optimized settings
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display', // 'display' is faster than 'print'
        enableWebGL: false, // WebGL can cause issues on some devices
        renderInteractiveForms: false // Disable interactive forms for better performance
      };
      
      await page.render(renderContext).promise;
      setIsLoading(false);
      
      // Only draw markers if we have them and they're not too many (for performance)
      if (markers && markers.length > 0) {
        // Use a small timeout to ensure UI remains responsive
        setTimeout(() => {
          drawMarkers();
        }, 0);
      }
      
      // Draw calibration if available, also with a small delay
      if (calibration) {
        setTimeout(() => {
          drawCalibration(calibration);
        }, 10);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to render PDF page.',
        variant: 'destructive',
      });
    }
  };
  
  // Drawing marker on the SVG layer
  const drawMarkers = () => {
    if (!svgLayerRef.current || !markers) return;
    
    // Clear existing markers
    while (svgLayerRef.current.firstChild) {
      svgLayerRef.current.removeChild(svgLayerRef.current.firstChild);
    }
    
    // Group and count markers by type
    const markerTypeGroups: Record<string, MarkerData[]> = {};
    
    // First, organize markers by type and sort them by ID
    markers.forEach(marker => {
      if (!markerTypeGroups[marker.marker_type]) {
        markerTypeGroups[marker.marker_type] = [];
      }
      markerTypeGroups[marker.marker_type].push(marker);
    });
    
    // Sort each group by ID
    Object.keys(markerTypeGroups).forEach(type => {
      markerTypeGroups[type].sort((a, b) => a.id - b.id);
    });
    
    // Draw each marker based on its type
    markers.forEach(marker => {
      // Find the layer this marker belongs to
      const layer = layers.find(l => l.id === marker.layer_id);
      
      // Skip if layer is not visible
      if (layer && !layer.visible) return;
      
      // Get marker coordinates in viewport space
      const x = marker.position_x * pdfToViewportScale;
      const y = marker.position_y * pdfToViewportScale;
      
      // Default styling based on marker type
      let color = marker.color || (layer ? layer.color : '#3b82f6');
      let fillColor = marker.fill_color || 'none';
      const strokeWidth = marker.line_width || 2;
      const opacity = marker.opacity || 1;
      
      // Set type-specific colors if not overridden by marker.color
      if (!marker.color) {
        switch (marker.marker_type) {
          case 'access_point':
            color = '#ef4444'; // Red for Card Access
            fillColor = 'rgba(239, 68, 68, 0.1)'; // Light red fill
            break;
          case 'camera':
            color = '#3b82f6'; // Blue for Cameras
            fillColor = 'rgba(59, 130, 246, 0.1)'; // Light blue fill
            break;
          case 'elevator':
            color = '#10b981'; // Green for Elevators
            fillColor = 'rgba(16, 185, 129, 0.1)'; // Light green fill
            break;
          case 'intercom':
            color = '#eab308'; // Yellow for Intercoms
            fillColor = 'rgba(234, 179, 8, 0.1)'; // Light yellow fill
            break;
          case 'note':
            color = '#f59e0b'; // Amber
            fillColor = 'rgba(245, 158, 11, 0.1)'; // Light amber fill
            break;
        }
      }
      
      // Create different elements based on marker type
      let element;
      
      switch (marker.marker_type) {
        case 'access_point':
        case 'camera':
        case 'elevator':
        case 'intercom':
          // Create a group for the marker
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('class', `marker-group marker-type-${marker.marker_type}`);
          group.setAttribute('data-marker-id', marker.id.toString());
          
          // Choose colors based on marker type
          let markerFillColor = color;
          let textColor = 'white';
          // Use marker type-specific counters for numbering from markerTypeGroups
          let markerNumber = 0;
          
          // The marker type group already exists and is sorted by ID
          const thisTypeGroup = markerTypeGroups[marker.marker_type] || [];
          
          // Find this marker's position in its type group (simpler and more reliable)
          const position = thisTypeGroup.findIndex(m => m.id === marker.id);
          markerNumber = position !== -1 ? position + 1 : 1;
          
          // If label contains a number, use that instead
          if (marker.label) {
            const match = marker.label.match(/\d+$/);
            if (match) {
              markerNumber = parseInt(match[0]);
            }
          }
          let typeSymbol = '';
          
          // Apply professional styling based on marker type with client's requested colors
          switch (marker.marker_type) {
            case 'access_point':
              markerFillColor = '#ef4444'; // Red for Card Access
              typeSymbol = 'A'; 
              break;
            case 'camera':
              markerFillColor = '#3b82f6'; // Blue for Cameras
              typeSymbol = 'C';
              break;
            case 'elevator':
              markerFillColor = '#10b981'; // Green for Elevators
              typeSymbol = 'E';
              break;
            case 'intercom':
              markerFillColor = '#eab308'; // Yellow for Intercoms
              typeSymbol = 'I';
              break;
          }
          
          // Use custom color if specified
          if (marker.color) {
            markerFillColor = marker.color;
          }
          
          // Create drop shadow filter for the marker
          const filterId = `drop-shadow-${marker.id}`;
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.setAttribute('id', filterId);
          filter.innerHTML = `<feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3" />`;
          defs.appendChild(filter);
          group.appendChild(defs);
          
          // Create a rectangular marker that displays the ID more prominently
          // Main equipment marker rectangle with rounded corners
          element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          element.setAttribute('x', `${x - 18}`); // Wider rectangle
          element.setAttribute('y', `${y - 14}`);
          element.setAttribute('width', '36'); // Increased width for better visibility
          element.setAttribute('height', '28'); // Increased height
          element.setAttribute('rx', '4'); // Rounded corners
          element.setAttribute('fill', markerFillColor);
          element.setAttribute('stroke', '#ffffff');
          element.setAttribute('stroke-width', '1.5');
          element.setAttribute('opacity', '0.9');
          element.setAttribute('filter', `url(#${filterId})`);
          element.setAttribute('class', 'marker-rectangle');
          
          // Add marker number as the most prominent element
          const markerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          markerLabel.setAttribute('x', `${x}`);
          markerLabel.setAttribute('y', `${y - 2}`); // Positioned above the center for ID
          markerLabel.setAttribute('text-anchor', 'middle');
          markerLabel.setAttribute('dominant-baseline', 'central');
          markerLabel.setAttribute('font-size', '14px'); // Larger font
          markerLabel.setAttribute('font-weight', 'bold');
          markerLabel.setAttribute('fill', textColor);
          markerLabel.setAttribute('stroke', 'rgba(0,0,0,0.6)');
          markerLabel.setAttribute('stroke-width', '0.8');
          markerLabel.setAttribute('paint-order', 'stroke');
          markerLabel.setAttribute('class', 'marker-number');
          markerLabel.setAttribute('pointer-events', 'none');
          markerLabel.textContent = markerNumber.toString();
          
          // Add type text below the ID
          const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          typeText.setAttribute('x', `${x}`);
          typeText.setAttribute('y', `${y + 8}`); // Positioned below the center
          typeText.setAttribute('text-anchor', 'middle');
          typeText.setAttribute('dominant-baseline', 'central');
          typeText.setAttribute('font-size', '10px');
          typeText.setAttribute('font-weight', 'bold');
          typeText.setAttribute('fill', textColor);
          typeText.setAttribute('stroke', 'rgba(0,0,0,0.4)');
          typeText.setAttribute('stroke-width', '0.5');
          typeText.setAttribute('paint-order', 'stroke');
          typeText.setAttribute('pointer-events', 'none');
          typeText.textContent = typeSymbol;
          
          // We're not using the small circles as requested
          
          // Add hit area for better interaction
          const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          hitArea.setAttribute('cx', `${x}`);
          hitArea.setAttribute('cy', `${y}`);
          hitArea.setAttribute('r', '18');
          hitArea.setAttribute('fill', 'transparent');
          hitArea.setAttribute('style', 'pointer-events: all;');
          
          // Enhanced tooltip and label system
          hitArea.addEventListener('mouseenter', () => {
            const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            tooltip.setAttribute('class', 'marker-tooltip');
            tooltip.setAttribute('id', `tooltip-${marker.id}`);
            
            // Get label text with more detail and formatting
            let labelText = marker.label || `${marker.marker_type.charAt(0).toUpperCase() + marker.marker_type.slice(1).replace('_', ' ')} ${markerNumber}`;
            
            // Add equipment type prefix if not already included
            const typePrefix = marker.marker_type.charAt(0).toUpperCase() + marker.marker_type.slice(1).replace('_', ' ');
            if (!labelText.includes(typePrefix)) {
              labelText = `${typePrefix}: ${labelText}`;
            }
            
            // Add unique ID to the label
            labelText = `${labelText} (ID: ${marker.unique_id.substring(0, 8)})`;
            
            // Calculate appropriate size based on text length
            const labelWidth = Math.max(labelText.length * 7 + 20, 120);
            
            // Determine best position for tooltip based on marker position
            // This prevents tooltips from going off-screen
            const viewportWidth = svgLayerRef.current?.getBoundingClientRect().width || 1000;
            let tooltipX = x + 20;
            let textAnchor = 'start';
            let textX = tooltipX + 10;
            
            // If too close to right edge, show tooltip to the left
            if (tooltipX + labelWidth > viewportWidth - 20) {
              tooltipX = x - labelWidth - 10;
              textAnchor = 'end';
              textX = tooltipX + labelWidth - 10;
            }
            
            // Enhanced tooltip background with drop shadow
            const dropShadowId = `dropShadow-tooltip-${marker.id}`;
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', dropShadowId);
            filter.innerHTML = `<feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3" />`;
            defs.appendChild(filter);
            tooltip.appendChild(defs);
            
            // Tooltip background
            const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            tooltipBg.setAttribute('x', `${tooltipX}`);
            tooltipBg.setAttribute('y', `${y - 15}`);
            tooltipBg.setAttribute('width', `${labelWidth}px`);
            tooltipBg.setAttribute('height', '30px');
            tooltipBg.setAttribute('rx', '6');
            tooltipBg.setAttribute('fill', '#000000');
            tooltipBg.setAttribute('opacity', '0.85');
            tooltipBg.setAttribute('filter', `url(#${dropShadowId})`);
            
            // Tooltip text
            const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tooltipText.setAttribute('x', `${textX}`);
            tooltipText.setAttribute('y', `${y}`);
            tooltipText.setAttribute('text-anchor', textAnchor);
            tooltipText.setAttribute('fill', '#ffffff');
            tooltipText.setAttribute('font-size', '13px');
            tooltipText.setAttribute('font-weight', 'normal');
            tooltipText.textContent = labelText;
            
            // Connector line to marker
            const connectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            connectorLine.setAttribute('x1', `${x}`);
            connectorLine.setAttribute('y1', `${y}`);
            connectorLine.setAttribute('x2', tooltipX > x ? `${tooltipX}` : `${tooltipX + labelWidth}`);
            connectorLine.setAttribute('y2', `${y}`);
            connectorLine.setAttribute('stroke', '#ffffff');
            connectorLine.setAttribute('stroke-width', '1');
            connectorLine.setAttribute('stroke-dasharray', '3,2');
            
            // Assemble tooltip
            tooltip.appendChild(connectorLine);
            tooltip.appendChild(tooltipBg);
            tooltip.appendChild(tooltipText);
            group.appendChild(tooltip);
            
            // Optional: Display a permanent small label below the marker
            // Always show labels when showAllLabels is true or during mouseover
            if (!document.getElementById(`permanent-label-${marker.id}`)) {
              const smallLabel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              smallLabel.setAttribute('id', `permanent-label-${marker.id}`);
              // Use CSS class for controlling visibility based on showAllLabels state
              smallLabel.setAttribute('class', showAllLabels ? 'marker-permanent-label marker-label-visible' : 'marker-permanent-label');
              
              // Get short version of label (first few characters, possibly including ID)
              let shortLabel = `${typePrefix} ${markerNumber}`;
              // Add shortened unique ID
              shortLabel += ` (${marker.unique_id.substring(0, 6)})`;
              
              // Small background
              const smallLabelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              smallLabelBg.setAttribute('x', `${x - (shortLabel.length * 3)}`);
              smallLabelBg.setAttribute('y', `${y + 14}`);
              smallLabelBg.setAttribute('width', `${shortLabel.length * 6}px`);
              smallLabelBg.setAttribute('height', '16px');
              smallLabelBg.setAttribute('rx', '3');
              smallLabelBg.setAttribute('fill', markerFillColor);
              smallLabelBg.setAttribute('opacity', '0.9');
              
              // Small label text
              const smallLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              smallLabelText.setAttribute('x', `${x}`);
              smallLabelText.setAttribute('y', `${y + 22}`);
              smallLabelText.setAttribute('text-anchor', 'middle');
              smallLabelText.setAttribute('fill', textColor);
              smallLabelText.setAttribute('font-size', '10px');
              smallLabelText.setAttribute('font-weight', 'bold');
              smallLabelText.setAttribute('paint-order', 'stroke');
              smallLabelText.setAttribute('stroke', 'rgba(0,0,0,0.5)');
              smallLabelText.setAttribute('stroke-width', '1px');
              smallLabelText.textContent = shortLabel;
              
              smallLabel.appendChild(smallLabelBg);
              smallLabel.appendChild(smallLabelText);
              group.appendChild(smallLabel);
            }
          });
          
          hitArea.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById(`tooltip-${marker.id}`);
            if (tooltip) {
              tooltip.remove();
            }
            
            // Option: You can decide whether to keep or remove the permanent label
            // Uncomment the following to remove permanent label on mouseleave
            /*
            const permanentLabel = document.getElementById(`permanent-label-${marker.id}`);
            if (permanentLabel) {
              permanentLabel.remove();
            }
            */
          });
          
          group.appendChild(hitArea);
          
          // Assemble all elements
          group.appendChild(element);
          group.appendChild(markerLabel);
          group.appendChild(typeText);
          
          // Add click event to the group
          group.addEventListener('click', () => handleMarkerClick(marker));
          
          // Add to SVG layer
          svgLayerRef.current?.appendChild(group);
          break;
          
        case 'measurement':
          // Measurement is a line with dimension label
          if (marker.end_x !== undefined && marker.end_y !== undefined) {
            const endX = marker.end_x * pdfToViewportScale;
            const endY = marker.end_y * pdfToViewportScale;
            
            // Create line
            element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            element.setAttribute('x1', `${x}`);
            element.setAttribute('y1', `${y}`);
            element.setAttribute('x2', `${endX}`);
            element.setAttribute('y2', `${endY}`);
            element.setAttribute('stroke', color);
            element.setAttribute('stroke-width', `${strokeWidth}`);
            element.setAttribute('opacity', `${opacity}`);
            
            // Add measurement label if we have calibration data
            if (calibration && marker.label) {
              const midX = (x + endX) / 2;
              const midY = (y + endY) / 2;
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', `${midX}`);
              text.setAttribute('y', `${midY}`);
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('dy', '-5');
              text.setAttribute('font-size', '12px');
              text.setAttribute('fill', color);
              text.setAttribute('stroke', 'white');
              text.setAttribute('stroke-width', '0.5');
              text.setAttribute('paint-order', 'stroke');
              text.textContent = marker.label;
              svgLayerRef.current?.appendChild(text);
            }
          }
          break;
          
        case 'rectangle':
          // Rectangle with optional fill
          if (marker.width !== undefined && marker.height !== undefined) {
            element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            element.setAttribute('x', `${x}`);
            element.setAttribute('y', `${y}`);
            element.setAttribute('width', `${marker.width * pdfToViewportScale}`);
            element.setAttribute('height', `${marker.height * pdfToViewportScale}`);
            element.setAttribute('stroke', color);
            element.setAttribute('fill', fillColor);
            element.setAttribute('stroke-width', `${strokeWidth}`);
            element.setAttribute('opacity', `${opacity}`);
            
            // Apply rotation if specified
            if (marker.rotation) {
              const centerX = x + (marker.width * pdfToViewportScale) / 2;
              const centerY = y + (marker.height * pdfToViewportScale) / 2;
              element.setAttribute('transform', `rotate(${marker.rotation} ${centerX} ${centerY})`);
            }
          }
          break;
          
        case 'circle':
          // Circle with optional fill
          if (marker.width !== undefined) {
            const radius = marker.width * pdfToViewportScale / 2;
            element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            element.setAttribute('cx', `${x}`);
            element.setAttribute('cy', `${y}`);
            element.setAttribute('r', `${radius}`);
            element.setAttribute('stroke', color);
            element.setAttribute('fill', fillColor);
            element.setAttribute('stroke-width', `${strokeWidth}`);
            element.setAttribute('opacity', `${opacity}`);
          }
          break;
          
        case 'text':
          // Text annotation
          if (marker.text_content) {
            element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            element.setAttribute('x', `${x}`);
            element.setAttribute('y', `${y}`);
            element.setAttribute('font-family', marker.font_family || 'Arial');
            element.setAttribute('font-size', `${marker.font_size || 14}px`);
            element.setAttribute('fill', color);
            element.setAttribute('opacity', `${opacity}`);
            element.textContent = marker.text_content;
            
            // Apply rotation if specified
            if (marker.rotation) {
              element.setAttribute('transform', `rotate(${marker.rotation} ${x} ${y})`);
            }
          }
          break;
          
        case 'polygon':
          // Polygon (for irregular shapes)
          if (marker.points && marker.points.length > 2) {
            const points = marker.points.map(point => 
              `${point.x * pdfToViewportScale},${point.y * pdfToViewportScale}`
            ).join(' ');
            
            element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            element.setAttribute('points', points);
            element.setAttribute('stroke', color);
            element.setAttribute('fill', fillColor);
            element.setAttribute('stroke-width', `${strokeWidth}`);
            element.setAttribute('opacity', `${opacity}`);
          }
          break;
          
        default:
          // Default to simple circle for unknown types
          element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          element.setAttribute('cx', `${x}`);
          element.setAttribute('cy', `${y}`);
          element.setAttribute('r', '5');
          element.setAttribute('fill', color);
          element.setAttribute('opacity', `${opacity}`);
          break;
      }
      
      if (element) {
        // Store marker data for interaction
        element.dataset.markerId = marker.id.toString();
        
        // Add event listeners for interaction
        element.addEventListener('click', () => handleMarkerClick(marker));
        
        // Add to SVG layer
        svgLayerRef.current?.appendChild(element);
      }
    });
  };
  
  // Draw calibration line
  const drawCalibration = (calibData: CalibrationData | null) => {
    if (!svgLayerRef.current || !calibData) return;
    
    // Convert coordinates to viewport space
    const startX = calibData.start_x * pdfToViewportScale;
    const startY = calibData.start_y * pdfToViewportScale;
    const endX = calibData.end_x * pdfToViewportScale;
    const endY = calibData.end_y * pdfToViewportScale;
    
    // Create calibration line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${startX}`);
    line.setAttribute('y1', `${startY}`);
    line.setAttribute('x2', `${endX}`);
    line.setAttribute('y2', `${endY}`);
    line.setAttribute('stroke', '#ef4444');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    
    // Create label showing the measurement
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', `${midX}`);
    text.setAttribute('y', `${midY}`);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dy', '-5');
    text.setAttribute('font-size', '12px');
    text.setAttribute('fill', '#ef4444');
    text.setAttribute('stroke', 'white');
    text.setAttribute('stroke-width', '0.5');
    text.setAttribute('paint-order', 'stroke');
    text.textContent = `${calibData.real_world_distance} ${calibData.unit}`;
    
    // Add to SVG layer
    svgLayerRef.current?.appendChild(line);
    svgLayerRef.current?.appendChild(text);
  };
  
  // Handle marker click with enhanced mobile controls
  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
    
    // Show contextual menu for marker operations - especially useful on mobile
    setContextMenuPosition({
      x: marker.position_x * pdfToViewportScale, 
      y: marker.position_y * pdfToViewportScale
    });
    setContextMenuOpen(true);
    
    // Enhanced feedback with marker type-specific messages
    const markerTypeLabels = {
      'access_point': 'Card Access',
      'camera': 'Camera',
      'elevator': 'Elevator',
      'intercom': 'Intercom',
      'note': 'Note'
    };
    
    const typeLabel = markerTypeLabels[marker.marker_type as keyof typeof markerTypeLabels] || marker.marker_type;
    
    toast({
      title: `${typeLabel} Selected`,
      description: `${typeLabel} #${marker.id} selected. Use the toolbar for edit options.`,
      duration: 3000,
    });
    
    // Apply visual highlighting to selected marker
    if (svgLayerRef.current) {
      // Remove previous highlighting
      const allMarkers = svgLayerRef.current.querySelectorAll('.marker-group');
      allMarkers.forEach(m => {
        if (m instanceof Element) {
          m.classList.remove('marker-selected');
          m.setAttribute('filter', '');
        }
      });
      
      // Add highlighting to selected marker
      const selectedMarkerElement = svgLayerRef.current.querySelector(`.marker-group[data-marker-id="${marker.id}"]`);
      if (selectedMarkerElement instanceof Element) {
        selectedMarkerElement.classList.add('marker-selected');
        // Add glow effect
        const pulseFilter = document.getElementById('pulse-filter');
        if (pulseFilter) {
          selectedMarkerElement.setAttribute('filter', 'url(#pulse-filter)');
        }
      }
    }
  };
  
  // Convert screen coordinates to PDF coordinates
  const screenToPdfCoordinates = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const x = (screenX - rect.left) / pdfToViewportScale;
    const y = (screenY - rect.top) / pdfToViewportScale;
    
    return { x, y };
  };
  
  // Mouse event handlers for pan and zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if we clicked on a marker when in select mode
    if (toolMode === 'select' && svgLayerRef.current) {
      // Get all marker elements in the viewport
      const markerGroups = svgLayerRef.current.querySelectorAll('.marker-group');
      
      // Check if we clicked on a marker
      if (markerGroups.length > 0) {
        // Get mouse position
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Get the element under the cursor
        const element = document.elementFromPoint(mouseX, mouseY);
        
        // Find the parent marker group
        if (element) {
          let markerGroup = null;
          let current = element;
          
          // Walk up the DOM tree to find the marker group
          while (current && current !== svgLayerRef.current.parentElement) {
            if (current instanceof Element && current.classList && current.classList.contains('marker-group')) {
              markerGroup = current;
              break;
            }
            if (current.parentElement) {
              current = current.parentElement;
            } else {
              break;
            }
          }
          
          // If we found a marker group
          if (markerGroup && markerGroup instanceof Element && markerGroup.getAttribute('data-marker-id')) {
            const markerIdStr = markerGroup.getAttribute('data-marker-id');
            const markerId = parseInt(markerIdStr || '0');
            
            // Find the marker data for this ID
            const marker = markers?.find(m => m.id === markerId);
            if (marker) {
              // Set as selected marker
              setSelectedMarker(marker);
              
              // Start dragging
              setIsMarkerDragging(true);
              setDraggedMarkerId(markerId);
              
              // Store initial position
              const coords = screenToPdfCoordinates(mouseX, mouseY);
              setMarkerDragStartX(coords.x);
              setMarkerDragStartY(coords.y);
              
              // Visual feedback for selection
              // Remove previous selection styling
              markerGroups.forEach(g => {
                if (g instanceof Element) {
                  g.classList.remove('selected-marker');
                  const markerCircle = g.querySelector('circle.marker-circle');
                  if (markerCircle) {
                    markerCircle.setAttribute('stroke-width', '2');
                    markerCircle.setAttribute('stroke-dasharray', '');
                  }
                }
              });
              
              // Add selection styling
              markerGroup.classList.add('selected-marker');
              const markerCircle = markerGroup.querySelector('circle.marker-circle');
              if (markerCircle) {
                markerCircle.setAttribute('stroke-width', '3');
                markerCircle.setAttribute('stroke-dasharray', '3,2');
              }
              
              // Show toast to indicate selection
              toast({
                title: 'Marker Selected',
                description: `Marker #${markerId} selected. Drag to reposition or press Delete to remove.`,
              });
              
              // Don't process further
              return;
            }
          }
        }
      }
    }
    
    // Handle regular panning
    if (toolMode === 'pan') {
      setIsDragging(true);
      setStartX(e.clientX - translateX);
      setStartY(e.clientY - translateY);
    } else if (toolMode === 'measure' || toolMode === 'calibrate') {
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      setIsDrawing(true);
      setDrawStartX(coords.x);
      setDrawStartY(coords.y);
      setDrawEndX(coords.x);
      setDrawEndY(coords.y);
    } else if (['access_point', 'camera', 'elevator', 'intercom'].includes(toolMode)) {
      // Handle equipment placement
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Instead of directly creating the marker, show the equipment form dialog
      setNewMarkerData({
        position_x: coords.x,
        position_y: coords.y,
        marker_type: toolMode
      });
      setShowEquipmentFormDialog(true);
      
      // Show toast notification
      toast({
        title: 'Adding Equipment',
        description: `Fill in the details for this ${toolMode.replace('_', ' ')}`,
      });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && toolMode === 'pan') {
      // Regular panning of the view
      setTranslateX(e.clientX - startX);
      setTranslateY(e.clientY - startY);
    } else if (isMarkerDragging && draggedMarkerId !== null) {
      // Handle marker dragging
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Update marker position visually during drag
      if (svgLayerRef.current) {
        const markerGroup = svgLayerRef.current.querySelector(`[data-marker-id="${draggedMarkerId}"]`);
        if (markerGroup) {
          // Calculate visual position with viewport scaling
          const visualX = coords.x * pdfToViewportScale;
          const visualY = coords.y * pdfToViewportScale;
          
          // Update the marker circle position
          const circle = markerGroup.querySelector('circle.marker-circle');
          if (circle) {
            circle.setAttribute('cx', `${visualX}`);
            circle.setAttribute('cy', `${visualY}`);
          }
          
          // Update the marker label position
          const label = markerGroup.querySelector('text.marker-number');
          if (label) {
            label.setAttribute('x', `${visualX}`);
            label.setAttribute('y', `${visualY}`);
          }
          
          // Update badge position
          const badge = markerGroup.querySelector('.marker-type-badge circle');
          const badgeText = markerGroup.querySelector('.marker-type-badge text');
          if (badge && badgeText) {
            badge.setAttribute('cx', `${visualX + 12}`);
            badge.setAttribute('cy', `${visualY - 10}`);
            badgeText.setAttribute('x', `${visualX + 12}`);
            badgeText.setAttribute('y', `${visualY - 10}`);
          }
          
          // Update hit area position
          const hitArea = markerGroup.querySelector('circle[style*="pointer-events: all"]');
          if (hitArea) {
            hitArea.setAttribute('cx', `${visualX}`);
            hitArea.setAttribute('cy', `${visualY}`);
          }
        }
      }
    } else if (isDrawing && (toolMode === 'measure' || toolMode === 'calibrate')) {
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      setDrawEndX(coords.x);
      setDrawEndY(coords.y);
      
      // Draw temporary measurement line
      if (svgLayerRef.current) {
        // Remove any previous temp line
        const tempLine = svgLayerRef.current.querySelector('.temp-measure-line');
        if (tempLine) {
          svgLayerRef.current.removeChild(tempLine);
        }
        
        // Create new temp line
        const startX = drawStartX * pdfToViewportScale;
        const startY = drawStartY * pdfToViewportScale;
        const endX = coords.x * pdfToViewportScale;
        const endY = coords.y * pdfToViewportScale;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'temp-measure-line');
        line.setAttribute('x1', `${startX}`);
        line.setAttribute('y1', `${startY}`);
        line.setAttribute('x2', `${endX}`);
        line.setAttribute('y2', `${endY}`);
        line.setAttribute('stroke', '#ef4444');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        
        svgLayerRef.current?.appendChild(line);
        
        // If we have calibration, show distance
        if (calibration) {
          // Calculate distance in PDF space
          const dx = coords.x - drawStartX;
          const dy = coords.y - drawStartY;
          const pdfDistance = Math.sqrt(dx * dx + dy * dy);
          
          // Convert to real-world distance
          const realDistance = (pdfDistance * calibration.real_world_distance) / calibration.pdf_distance;
          
          // Create or update distance label
          const tempLabel = svgLayerRef.current?.querySelector('.temp-measure-label');
          if (tempLabel && svgLayerRef.current) {
            svgLayerRef.current.removeChild(tempLabel);
          }
          
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('class', 'temp-measure-label');
          text.setAttribute('x', `${midX}`);
          text.setAttribute('y', `${midY}`);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dy', '-5');
          text.setAttribute('font-size', '12px');
          text.setAttribute('fill', '#ef4444');
          text.setAttribute('stroke', 'white');
          text.setAttribute('stroke-width', '0.5');
          text.setAttribute('paint-order', 'stroke');
          text.textContent = `${realDistance.toFixed(2)} ${calibration.unit}`;
          
          svgLayerRef.current?.appendChild(text);
        }
      }
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
    }
    
    if (isMarkerDragging && draggedMarkerId !== null) {
      // End marker dragging
      setIsMarkerDragging(false);
      
      // Get final position
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Save the new position to the database
      updateMarkerPositionMutation.mutate({
        markerId: draggedMarkerId,
        positionX: coords.x,
        positionY: coords.y
      });
      
      // Reset dragged marker
      setDraggedMarkerId(null);
      
      // Show toast confirmation
      toast({
        title: 'Position Updated',
        description: 'Marker position has been updated.',
      });
    }
    
    if (isDrawing) {
      setIsDrawing(false);
      
      // Get the end coordinates
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Only create if it's not just a click (minimum distance)
      const dx = coords.x - drawStartX;
      const dy = coords.y - drawStartY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5 / pdfToViewportScale) { // Minimum 5 pixels in viewport space
        if (toolMode === 'measure') {
          // Calculate real-world distance if calibration is available
          let label = '';
          if (calibration) {
            const pdfDistance = distance;
            const realDistance = (pdfDistance * calibration.real_world_distance) / calibration.pdf_distance;
            label = `${realDistance.toFixed(2)} ${calibration.unit}`;
          }
          
          // Find default layer for measurements
          const measurementLayer = layers.find(l => l.name.toLowerCase().includes('measure'));
          
          // Create the measurement marker
          const markerData = {
            floorplan_id: floorplan.id,
            page: currentPage,
            marker_type: 'measurement',
            layer_id: measurementLayer?.id,
            position_x: drawStartX,
            position_y: drawStartY,
            end_x: coords.x,
            end_y: coords.y,
            color: '#ef4444',
            line_width: 2,
            label
          };
          
          createMarkerMutation.mutate(markerData);
        }
        else if (toolMode === 'calibrate') {
          // Open calibration dialog with the line data
          setCalibrationLine({
            startX: drawStartX,
            startY: drawStartY,
            endX: coords.x,
            endY: coords.y,
            pdfDistance: distance
          });
          setIsCalibrationDialogOpen(true);
        }
      }
      
      // Clear temporary drawing elements
      if (svgLayerRef.current) {
        const tempLine = svgLayerRef.current.querySelector('.temp-measure-line');
        if (tempLine) {
          svgLayerRef.current?.removeChild(tempLine);
        }
        
        const tempLabel = svgLayerRef.current.querySelector('.temp-measure-label');
        if (tempLabel) {
          svgLayerRef.current?.removeChild(tempLabel);
        }
      }
    }
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Always allow zoom with ctrl key, otherwise only in zoom mode
    if (toolMode === 'zoom' || e.ctrlKey) {
      // Get cursor position relative to canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate cursor position in document coordinates (before scaling)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Position in PDF coordinates
      const pdfX = mouseX / pdfToViewportScale;
      const pdfY = mouseY / pdfToViewportScale;
      
      // Calculate new scale
      const delta = e.deltaY > 0 ? 0.8 : 1.25; // More dramatic zoom factor for better user experience
      const newScale = Math.max(0.1, Math.min(10, scale * delta));
      
      // Apply new scale
      setScale(newScale);
      
      // Re-render page at new scale
      renderPage(currentPage);
      
      // Update translation to zoom towards cursor position
      if (containerRef.current) {
        // Allow small delay for the renderPage to update dimensions
        setTimeout(() => {
          const containerWidth = containerRef.current?.clientWidth || 0;
          const containerHeight = containerRef.current?.clientHeight || 0;
          
          // Calculate new center point
          const newCenterX = pdfX * pdfToViewportScale * (newScale / scale);
          const newCenterY = pdfY * pdfToViewportScale * (newScale / scale);
          
          // Calculate translation needed to keep the point under cursor
          const newTranslateX = containerWidth / 2 - newCenterX;
          const newTranslateY = containerHeight / 2 - newCenterY;
          
          setTranslateX(newTranslateX);
          setTranslateY(newTranslateY);
        }, 10);
      }
      
      // Show toast for user feedback
      if (e.deltaY > 0) {
        toast({
          title: 'Zooming Out',
          description: `Scale: ${newScale.toFixed(1)}x`,
          variant: 'default',
          duration: 1000,
        });
      } else {
        toast({
          title: 'Zooming In',
          description: `Scale: ${newScale.toFixed(1)}x`,
          variant: 'default',
          duration: 1000,
        });
      }
    }
  };
  
  // Load PDF when the component mounts or the floorplan/page changes
  useEffect(() => {
    if (floorplan && floorplan.pdf_data) {
      loadPDF();
    }
  }, [floorplan, currentPage, scale, rotation]);
  
  // Redraw markers when they change
  useEffect(() => {
    if (!isLoading && markers) {
      drawMarkers();
    }
  }, [markers, isLoading, pdfToViewportScale, layers]);
  
  // Mobile detection for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Add a confirmation state for delete operations
  const [markerToDelete, setMarkerToDelete] = useState<number | null>(null);
  
  // Function to deselect the current marker and clear styling
  const deselectMarker = () => {
    setSelectedMarker(null);
    
    // Clear selection styling
    if (svgLayerRef.current) {
      const markerGroups = svgLayerRef.current.querySelectorAll('.marker-group');
      markerGroups.forEach(g => {
        if (g instanceof Element) {
          g.classList.remove('selected-marker');
          const markerCircle = g.querySelector('circle.marker-circle');
          if (markerCircle) {
            markerCircle.setAttribute('stroke-width', '2');
            markerCircle.setAttribute('stroke-dasharray', '');
          }
        }
      });
    }
  };
  
  // Function to handle marker deletion with confirmation
  const confirmDeleteMarker = (markerId: number) => {
    setMarkerToDelete(markerId);
    
    // Show confirmation toast
    toast({
      title: 'Confirm Deletion',
      description: (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete this marker?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={() => setMarkerToDelete(null)}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                deleteMarkerMutation.mutate(markerId);
                setMarkerToDelete(null);
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      duration: 5000,
    });
  };
  
  // Keyboard handler for marker operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we have a selected marker
      if (selectedMarker) {
        // Delete key for deleting marker
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          confirmDeleteMarker(selectedMarker.id);
        }
        
        // Ctrl+D for duplicating marker
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          duplicateMarkerMutation.mutate(selectedMarker);
          
          // Show toast for user feedback
          toast({
            title: 'Duplicating Marker',
            description: 'Creating a copy with offset position',
            duration: 2000,
          });
        }
        
        // Escape key to deselect
        if (e.key === 'Escape') {
          e.preventDefault();
          deselectMarker();
        }
      }
      
      // Global keyboard shortcuts regardless of selection
      
      // Ctrl+Plus for zoom in
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const newScale = Math.min(10, scale * 1.2);
        setScale(newScale);
        renderPage(currentPage);
        
        toast({
          title: 'Zooming In',
          description: `Scale: ${newScale.toFixed(1)}x`,
          duration: 1000,
        });
      }
      
      // Ctrl+Minus for zoom out
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        const newScale = Math.max(0.1, scale * 0.8);
        setScale(newScale);
        renderPage(currentPage);
        
        toast({
          title: 'Zooming Out',
          description: `Scale: ${newScale.toFixed(1)}x`,
          duration: 1000,
        });
      }
      
      // Ctrl+0 for reset zoom and position
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
        renderPage(currentPage);
        
        toast({
          title: 'Zoom Reset',
          description: 'Restored default view',
          duration: 1000,
        });
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMarker, deleteMarkerMutation, duplicateMarkerMutation, scale, currentPage]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={(e) => {
        // Get the first touch
        const touch = e.touches[0];
        
        // Store touch data for potential long press detection
        const touchStartTime = Date.now();
        const touchStartX = touch.clientX;
        const touchStartY = touch.clientY;
        
        // Convert coordinates to PDF space
        const pdfCoords = screenToPdfCoordinates(touchStartX, touchStartY);
        
        // Find if we're touching a marker
        let touchedMarker = null;
        if (markers && svgLayerRef.current) {
          // Use elementFromPoint to detect if we're touching a marker
          const element = document.elementFromPoint(touchStartX, touchStartY);
          if (element) {
            // Find the parent marker group
            let currentElement = element;
            while (currentElement && currentElement !== svgLayerRef.current.parentElement) {
              if (currentElement instanceof Element && 
                  currentElement.classList && 
                  currentElement.classList.contains('marker-group')) {
                const markerId = currentElement.getAttribute('data-marker-id');
                if (markerId) {
                  touchedMarker = markers.find(m => m.id === parseInt(markerId));
                }
                break;
              }
              if (currentElement.parentElement) {
                currentElement = currentElement.parentElement;
              } else {
                break;
              }
            }
          }
        }
        
        // Setup long press detection
        const longPressTimer = setTimeout(() => {
          // If a marker was touched and we haven't moved much, trigger long press
          if (touchedMarker) {
            // Select the marker
            handleMarkerClick(touchedMarker);
            
            // Vibrate device for feedback if supported
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            
            // Show the context menu at the marker position
            setContextMenuPosition({
              x: touchedMarker.position_x * pdfToViewportScale, 
              y: touchedMarker.position_y * pdfToViewportScale
            });
            setContextMenuOpen(true);
            
            // Prevent normal click
            e.preventDefault();
          }
        }, 500); // 500ms for long press
        
        // Store the timer so we can clear it on move/end
        (e.currentTarget as any).longPressTimer = longPressTimer;
        (e.currentTarget as any).touchStartTime = touchStartTime;
        (e.currentTarget as any).touchStartX = touchStartX;
        (e.currentTarget as any).touchStartY = touchStartY;
        (e.currentTarget as any).touchedMarker = touchedMarker;
        
        // Also dispatch a regular mouse event for compatibility with existing handlers
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true,
          view: window,
        });
        e.currentTarget.dispatchEvent(mouseEvent);
      }}
      onTouchMove={(e) => {
        // Prevent default scroll behavior on touch devices
        e.preventDefault();
        
        // Get touch coordinates
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // Cancel long press timer if user moved their finger significantly
        const longPressTimer = (e.currentTarget as any).longPressTimer;
        const touchStartX = (e.currentTarget as any).touchStartX;
        const touchStartY = (e.currentTarget as any).touchStartY;
        
        if (longPressTimer) {
          // Calculate movement distance
          const movementX = Math.abs(touchX - touchStartX);
          const movementY = Math.abs(touchY - touchStartY);
          const totalMovement = Math.sqrt(movementX * movementX + movementY * movementY);
          
          // If moved more than 10 pixels, cancel the long press
          if (totalMovement > 10) {
            clearTimeout(longPressTimer);
            (e.currentTarget as any).longPressTimer = null;
          }
        }
        
        // Convert touch to mouse event for handler compatibility
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touchX,
          clientY: touchY,
          bubbles: true,
          cancelable: true,
          view: window,
        });
        e.currentTarget.dispatchEvent(mouseEvent);
      }}
      onTouchEnd={(e) => {
        // Clear any long press timer
        const longPressTimer = (e.currentTarget as any).longPressTimer;
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          (e.currentTarget as any).longPressTimer = null;
        }
        
        // Check if this was a tap on a marker (quick touch)
        const touchStartTime = (e.currentTarget as any).touchStartTime;
        const touchedMarker = (e.currentTarget as any).touchedMarker;
        
        if (touchStartTime && touchedMarker) {
          const touchDuration = Date.now() - touchStartTime;
          
          // If it was a quick tap (less than 300ms) on a marker, select it
          if (touchDuration < 300) {
            // Select the marker with a slight delay to avoid double handling
            setTimeout(() => {
              if (!contextMenuOpen) {
                handleMarkerClick(touchedMarker);
                
                // Toast feedback for mobile users
                toast({
                  title: 'Marker Selected',
                  description: `${touchedMarker.marker_type.replace('_', ' ')} marker selected. Tap and hold for more options.`,
                  duration: 2000,
                });
              }
            }, 50);
          }
        }
        
        // Convert touch event to mouse event for compatibility with other handlers
        const mouseEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        e.currentTarget.dispatchEvent(mouseEvent);
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div
        className="relative transform-gpu transition-transform duration-75"
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`
        }}
      >
        <canvas ref={canvasRef} className="block" />
        <svg
          ref={svgLayerRef}
          className="absolute top-0 left-0 pointer-events-auto"
          style={{
            width: viewportDimensions.width,
            height: viewportDimensions.height
          }}
        />
      </div>
      
      {/* Controls Panel */}
      <div className="controls-panel">
        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button
            onClick={() => {
              const newScale = Math.min(10, scale * 1.2);
              setScale(newScale);
              renderPage(currentPage);
              toast({
                title: 'Zooming In',
                description: `Scale: ${newScale.toFixed(1)}x`,
                duration: 1000,
              });
            }}
            title="Zoom In (Ctrl +)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button
            onClick={() => {
              const newScale = Math.max(0.1, scale * 0.8);
              setScale(newScale);
              renderPage(currentPage);
              toast({
                title: 'Zooming Out',
                description: `Scale: ${newScale.toFixed(1)}x`,
                duration: 1000,
              });
            }}
            title="Zoom Out (Ctrl -)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button
            onClick={() => {
              setScale(1);
              setTranslateX(0);
              setTranslateY(0);
              renderPage(currentPage);
              toast({
                title: 'Zoom Reset',
                description: 'Restored default view',
                duration: 1000,
              });
            }}
            title="Reset Zoom and Position (Ctrl 0)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8"></path>
            </svg>
          </button>
        </div>
        
        {/* Floorplan Scaling Controls */}
        <div className="scale-controls mt-4">
          <div className="scale-label">Scale Floorplan</div>
          <div className="scale-inputs">
            <button 
              onClick={() => {
                // Open calibration dialog to set up scaling
                if (toolMode !== 'calibrate') {
                  toast({
                    title: 'Scaling Tool',
                    description: 'Draw a line of known length on the floorplan to set the scale',
                    duration: 3000
                  });
                  // This is a workaround since we don't have direct access to the parent component
                  const event = new CustomEvent('set-tool-mode', { 
                    detail: { mode: 'calibrate' } 
                  });
                  document.dispatchEvent(event);
                }
              }}
              title="Calibrate Scale"
              className="scale-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/>
                <path d="M13 17h4"/>
                <path d="M13 7h4"/>
                <path d="M5 7H3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
                <path d="M5 7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>
              </svg>
              <span>Scale</span>
            </button>
          </div>
          {calibration && (
            <div className="current-scale text-xs mt-1">
              Scale: {calibration.real_world_distance} {calibration.unit} = {calibration.pdf_distance.toFixed(2)} px
            </div>
          )}
        </div>
        
        {/* Layers Panel Button */}
        <div className="layers-panel mt-4">
          <button 
            onClick={() => {
              toast({
                title: 'Layers Panel',
                description: (
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Available Layers:</p>
                    <div className="max-h-40 overflow-y-auto">
                      {layers.length > 0 ? (
                        <ul className="space-y-1">
                          {layers.map(layer => (
                            <li key={layer.id} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: layer.color }}
                              />
                              <span>{layer.name}</span>
                              <input 
                                type="checkbox"
                                checked={layer.visible}
                                onChange={() => {
                                  // This would ideally update the layer visibility
                                  toast({
                                    title: 'Layer Toggled',
                                    description: `Layer "${layer.name}" visibility toggled`,
                                    duration: 1000
                                  });
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No layers created yet</p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          toast({
                            title: 'Feature Coming Soon',
                            description: 'Layer management will be implemented in the next update.',
                            duration: 3000
                          });
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Add Layer
                      </button>
                    </div>
                  </div>
                ),
                duration: 8000,
              });
            }}
            title="Manage Layers"
            className="layer-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Layers</span>
          </button>
        </div>
        
        {/* Export Button */}
        <div className="export-panel mt-4">
          <button 
            onClick={() => {
              toast({
                title: 'Export Options',
                description: (
                  <div className="flex flex-col gap-2">
                    <button 
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-left"
                      onClick={() => {
                        // Create a temporary canvas to export as image
                        const tempCanvas = document.createElement('canvas');
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        if (tempCtx && canvasRef.current && svgLayerRef.current) {
                          // Set canvas dimensions
                          tempCanvas.width = canvasRef.current.width;
                          tempCanvas.height = canvasRef.current.height;
                          
                          // Draw PDF from original canvas
                          tempCtx.drawImage(canvasRef.current, 0, 0);
                          
                          // Convert SVG to image and draw it
                          const svgData = new XMLSerializer().serializeToString(svgLayerRef.current);
                          const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                          const url = URL.createObjectURL(svgBlob);
                          
                          const img = new Image();
                          img.onload = () => {
                            tempCtx.drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            
                            // Create download link
                            const link = document.createElement('a');
                            link.download = `${floorplan.name || 'floorplan'}_page${currentPage}.png`;
                            link.href = tempCanvas.toDataURL('image/png');
                            link.click();
                            
                            toast({
                              title: 'Export Complete',
                              description: 'Floorplan exported as PNG image',
                              duration: 3000
                            });
                          };
                          img.src = url;
                        }
                      }}
                    >
                      <span className="font-bold">Export as PNG Image</span>
                      <span className="block text-sm">Exports the current view as a PNG image with all annotations</span>
                    </button>
                    
                    <button 
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-left"
                      onClick={() => {
                        toast({
                          title: 'Feature Coming Soon',
                          description: 'PDF export with annotations will be implemented in the next update.',
                          duration: 3000
                        });
                      }}
                    >
                      <span className="font-bold">Export as PDF</span>
                      <span className="block text-sm">Exports the floorplan as a PDF with all annotations</span>
                    </button>
                  </div>
                ),
                duration: 8000,
              });
            }}
            title="Export Floorplan"
            className="export-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Mobile-friendly marker context menu */}
      {contextMenuOpen && selectedMarker && (
        <div 
          className="marker-context-menu fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50 max-w-[85vw] touch-none"
          style={{
            top: `${Math.min(window.innerHeight - 300, contextMenuPosition.y + 20)}px`,
            left: `${Math.min(Math.max(10, contextMenuPosition.x - 100), window.innerWidth - 170)}px`,
            width: '200px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 py-2 px-3 flex justify-between items-center">
            <h3 className="text-sm font-medium truncate">{selectedMarker.marker_type.replace('_', ' ')} #{selectedMarker.id}</h3>
            <button
              onClick={() => setContextMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-2">
            <button 
              className="w-full text-left px-3 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center my-1"
              onClick={() => {
                // View/Edit equipment details
                toast({
                  title: 'Edit Equipment',
                  description: 'Opening equipment details form',
                  duration: 2000,
                });
                
                // Close menu
                setContextMenuOpen(false);
                
                // Redirect to equipment edit page based on type and ID
                let route = '';
                switch (selectedMarker.marker_type) {
                  case 'access_point':
                    window.location.href = `/projects/${floorplan.project_id}/access-points/${selectedMarker.equipment_id}/edit`;
                    break;
                  case 'camera':
                    window.location.href = `/projects/${floorplan.project_id}/cameras/${selectedMarker.equipment_id}/edit`;
                    break;
                  case 'elevator':
                    window.location.href = `/projects/${floorplan.project_id}/elevators/${selectedMarker.equipment_id}/edit`;
                    break;
                  case 'intercom':
                    window.location.href = `/projects/${floorplan.project_id}/intercoms/${selectedMarker.equipment_id}/edit`;
                    break;
                  default:
                    toast({
                      title: 'Not Supported',
                      description: `Editing ${selectedMarker.marker_type} is not supported.`,
                      variant: 'destructive',
                    });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Details
            </button>
            
            <button 
              className="w-full text-left px-3 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center my-1"
              onClick={() => {
                // Duplicate the marker
                createMarkerMutation.mutate({
                  floorplan_id: floorplan.id,
                  page: currentPage,
                  marker_type: selectedMarker.marker_type,
                  equipment_id: selectedMarker.equipment_id,
                  position_x: Math.min(100, selectedMarker.position_x + 2),
                  position_y: Math.min(100, selectedMarker.position_y + 2),
                  unique_id: uuidv4(),
                  label: selectedMarker.label ? `${selectedMarker.label} (Copy)` : null,
                  version: 1
                });
                
                // Close menu
                setContextMenuOpen(false);
                
                toast({
                  title: 'Marker Duplicated',
                  description: 'Created a copy of the marker',
                });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>
            
            <button 
              className="w-full text-left px-3 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center my-1"
              onClick={() => {
                // Enable drag mode for moving marker
                if (selectedMarker) {
                  setIsMarkerDragging(true);
                  setDraggedMarkerId(selectedMarker.id);
                  setMarkerDragStartX(selectedMarker.position_x);
                  setMarkerDragStartY(selectedMarker.position_y);
                  
                  toast({
                    title: 'Move Mode Enabled',
                    description: 'Drag the marker to a new position and release to place it',
                  });
                }
                
                // Close menu
                setContextMenuOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9l-3 3 3 3"></path>
                <path d="M9 5l3-3 3 3"></path>
                <path d="M15 19l3 3 3-3"></path>
                <path d="M19 9l3 3-3 3"></path>
                <path d="M2 12h20"></path>
                <path d="M12 2v20"></path>
              </svg>
              Move
            </button>
            
            <button 
              className="w-full text-left px-3 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 rounded flex items-center my-1"
              onClick={() => {
                // Delete the marker
                if (selectedMarker && selectedMarker.id) {
                  deleteMarkerMutation.mutate(selectedMarker.id);
                }
                
                // Close menu
                setContextMenuOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex justify-center">
            <button 
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full"
              onClick={() => setContextMenuOpen(false)}
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Calibration Dialog */}
      <CalibrationDialog
        open={isCalibrationDialogOpen}
        onOpenChange={setIsCalibrationDialogOpen}
        floorplanId={floorplan.id}
        currentPage={currentPage}
        calibrationLine={calibrationLine}
        onCalibrationComplete={() => {
          // Refresh calibration data
          queryClient.invalidateQueries({
            queryKey: ['/api/floorplans', floorplan.id, 'calibrations', currentPage]
          });
          // Show success toast
          toast({
            title: 'Success',
            description: 'Calibration saved successfully',
          });
        }}
      />
      
      {/* Equipment form dialog */}
      {showEquipmentFormDialog && newMarkerData && (
        <EquipmentFormDialog
          isOpen={showEquipmentFormDialog}
          onClose={() => {
            setShowEquipmentFormDialog(false);
            setNewMarkerData(null);
          }}
          markerType={newMarkerData.marker_type}
          projectId={floorplan.project_id}
          position={{ x: newMarkerData.position_x, y: newMarkerData.position_y }}
          onEquipmentCreated={(equipmentId, equipmentLabel) => {
            // Create the marker after equipment is created
            if (equipmentId && newMarkerData) {
              const newMarker = {
                floorplan_id: floorplan.id,
                page: currentPage,
                marker_type: newMarkerData.marker_type,
                position_x: newMarkerData.position_x,
                position_y: newMarkerData.position_y,
                equipment_id: equipmentId,
                unique_id: uuidv4(),
                label: equipmentLabel,
                version: 1
              };
              
              // Send to server
              createMarkerMutation.mutate(newMarker);
            }
          }}
        />
      )}
    </div>
  );
};

export default EnhancedFloorplanViewer;