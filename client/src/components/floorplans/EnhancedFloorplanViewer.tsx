import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  order: number;
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
  toolMode: string; 
  layers: LayerData[];
  onPageChange: (page: number) => void;
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
  onPageChange
}: EnhancedFloorplanViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgLayerRef = useRef<SVGSVGElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // State for drawing/measuring
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartX, setDrawStartX] = useState(0);
  const [drawStartY, setDrawStartY] = useState(0);
  const [drawEndX, setDrawEndX] = useState(0);
  const [drawEndY, setDrawEndY] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  
  // Convert PDF data URL to Uint8Array for PDF.js
  const loadPDF = async () => {
    setIsLoading(true);
    try {
      // Extract the base64 data from the data URL
      const base64Data = floorplan.pdf_data.split(',')[1];
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
  
  // Fetch calibration data for the current page
  const { 
    data: calibration,
    isLoading: isLoadingCalibration
  } = useQuery<CalibrationData>({
    queryKey: ['/api/floorplans', floorplan.id, 'calibrations', currentPage],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/floorplans/${floorplan.id}/calibrations/${currentPage}`);
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
  
  // Rendering the PDF page
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
      
      // Update the viewport with the new scale
      viewport = page.getViewport({ scale: scale * fitScale, rotation });
      
      // Store dimensions for coordinate conversion
      setPdfDimensions({ width: viewport.width / scale, height: viewport.height / scale });
      setViewportDimensions({ width: viewport.width, height: viewport.height });
      setPdfToViewportScale(fitScale);
      
      // Set canvas dimensions
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Set SVG layer dimensions
      if (svgLayerRef.current) {
        svgLayerRef.current.setAttribute('width', `${viewport.width}px`);
        svgLayerRef.current.setAttribute('height', `${viewport.height}px`);
        // This viewBox ensures SVG coordinates match PDF coordinates
        svgLayerRef.current.setAttribute('viewBox', `0 0 ${viewport.width} ${viewport.height}`);
      }
      
      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      setIsLoading(false);
      
      // Draw markers
      if (markers && markers.length > 0) {
        drawMarkers();
      }
      
      // Draw calibration if available
      if (calibration) {
        drawCalibration(calibration);
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
    
    // Draw each marker based on its type
    markers.forEach(marker => {
      // Find the layer this marker belongs to
      const layer = layers.find(l => l.id === marker.layer_id);
      
      // Skip if layer is not visible
      if (layer && !layer.visible) return;
      
      // Get marker coordinates in viewport space
      const x = marker.position_x * pdfToViewportScale;
      const y = marker.position_y * pdfToViewportScale;
      
      // Default styling
      const color = marker.color || (layer ? layer.color : '#3b82f6');
      const fillColor = marker.fill_color || 'none';
      const strokeWidth = marker.line_width || 2;
      const opacity = marker.opacity || 1;
      
      // Create different elements based on marker type
      let element;
      
      switch (marker.marker_type) {
        case 'access_point':
        case 'camera':
        case 'elevator':
        case 'intercom':
          // Equipment markers are circles with labels
          element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          element.setAttribute('cx', `${x}`);
          element.setAttribute('cy', `${y}`);
          element.setAttribute('r', '12');
          element.setAttribute('fill', color);
          element.setAttribute('stroke', 'white');
          element.setAttribute('stroke-width', '1');
          element.setAttribute('opacity', `${opacity}`);
          
          // Add label
          if (marker.label) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', `${x}`);
            text.setAttribute('y', `${y}`);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dy', '0.3em');
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', 'white');
            text.textContent = marker.label;
            svgLayerRef.current?.appendChild(text);
          }
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
  
  // Handle marker click
  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
    toast({
      title: 'Marker Selected',
      description: `${marker.marker_type} marker ${marker.id}`,
    });
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
    if (toolMode === 'pan') {
      setIsDragging(true);
      setStartX(e.clientX - translateX);
      setStartY(e.clientY - translateY);
    } else if (toolMode === 'measure') {
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      setIsDrawing(true);
      setDrawStartX(coords.x);
      setDrawStartY(coords.y);
      setDrawEndX(coords.x);
      setDrawEndY(coords.y);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && toolMode === 'pan') {
      setTranslateX(e.clientX - startX);
      setTranslateY(e.clientY - startY);
    } else if (isDrawing && toolMode === 'measure') {
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
    
    if (isDrawing && toolMode === 'measure') {
      setIsDrawing(false);
      
      // Create a permanent measurement marker
      const coords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Only create if it's not just a click (minimum distance)
      const dx = coords.x - drawStartX;
      const dy = coords.y - drawStartY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5 / pdfToViewportScale) { // Minimum 5 pixels in viewport space
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
    
    if (toolMode === 'zoom') {
      // Zoom in/out
      const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom factor
      setScale(prev => Math.max(0.1, Math.min(10, prev * delta)));
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
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
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
    </div>
  );
};

export default EnhancedFloorplanViewer;