import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  CheckSquare, 
  Copy, 
  Trash, 
  Edit, 
  Eye,
  EyeOff
} from 'lucide-react';
import { DeltaDragTest } from './fixes/delta-drag-test';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationTool } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';
import { LayerManager } from './LayerManager';
import EquipmentFormDialog from './EquipmentFormDialog';
import { CoordinateSystem, Point, screenToPdfCoordinates as utilScreenToPdf, pdfToScreenCoordinates as utilPdfToScreen } from '@/lib/coordinate-utils';
import CameraMarker from './markers/CameraMarker';
import CameraMarkerEditDialog from './markers/CameraMarkerEditDialog';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Ensure PDF.js worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Helper function to normalize angles to the range -180 to 180 degrees
// This is important for smooth camera FOV calculations
const normalizeAngle = (angle: number): number => {
  // Normalize angle to range [-180, 180]
  let normalizedAngle = angle;
  while (normalizedAngle > 180) normalizedAngle -= 360;
  while (normalizedAngle < -180) normalizedAngle += 360;
  return normalizedAngle;
};

// Define interfaces
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
  visibleLabelTypes?: Record<string, boolean>;
  onMarkersUpdated?: () => void;
  selectedEquipment?: {
    id: number;
    type: string;
    label: string;
  } | null;
}

export const EnhancedFloorplanViewer = ({
  floorplan,
  currentPage,
  toolMode,
  layers,
  onPageChange,
  visibleLabelTypes,
  onMarkersUpdated,
  selectedEquipment
}: EnhancedFloorplanViewerProps) => {
  // Hooks and refs
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgLayerRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [viewportDimensions, setViewportDimensions] = useState({width: 0, height: 0});
  const [pdfDimensions, setPdfDimensions] = useState({width: 0, height: 0});
  
  // Create a coordinate system instance
  const [coordSystem] = useState(() => new CoordinateSystem(
    containerRef.current,
    scale,
    translateX,
    translateY,
    { width: viewportDimensions.width, height: viewportDimensions.height }
  ));
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [tempMarker, setTempMarker] = useState<Partial<MarkerData> | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isCalibrationDialogOpen, setIsCalibrationDialogOpen] = useState<boolean>(false);
  const [calibrationStep, setCalibrationStep] = useState<'start' | 'end' | 'distance'>('start');
  const [calibrationPoints, setCalibrationPoints] = useState<{start?: {x: number, y: number}, end?: {x: number, y: number}}>({});
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<LayerData | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [isLayerManagerOpen, setIsLayerManagerOpen] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.5);
  const [drawingPoints, setDrawingPoints] = useState<Array<{x: number, y: number}>>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [areLabelsVisible, setAreLabelsVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingMarker, setIsDraggingMarker] = useState<boolean>(false);
  const [isResizingMarker, setIsResizingMarker] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [markerDragOffset, setMarkerDragOffset] = useState<{
    screenX: number;
    screenY: number;
    markerStartX: number;
    markerStartY: number;
    mouseStartX: number;
    mouseStartY: number;
    cameraStartRotation: number;
    cameraStartFov: number;
    cameraStartRange: number;
  }>({
    screenX: 0,
    screenY: 0,
    markerStartX: 0,
    markerStartY: 0,
    mouseStartX: 0,
    mouseStartY: 0,
    cameraStartRotation: 0,
    cameraStartFov: 90,
    cameraStartRange: 60
  });
  
  // Camera edit dialog state
  const [isCameraEditDialogOpen, setIsCameraEditDialogOpen] = useState<boolean>(false);

  // Function to determine if a marker's label should be visible
  const shouldShowMarkerLabel = (marker: MarkerData, isSelected: boolean): boolean => {
    // Always show labels for selected markers
    if (isSelected) return true;
    
    // If visibleLabelTypes is not provided, no labels are shown
    if (!visibleLabelTypes) return false;
    
    // If 'all' is true, show all labels
    if (visibleLabelTypes['all']) return true;
    
    // Check if this specific marker type should have visible labels
    return !!visibleLabelTypes[marker.marker_type];
  };

  // Update coordinate system when view state changes
  // This is a critical part of our approach to fixing marker position issues during zoom
  useEffect(() => {
    // Update the coordinate system with the latest state values
    // This ensures that all coordinate transformations remain consistent
    coordSystem.updateSystem({
      containerElement: containerRef.current,
      scale: scale,
      translateX: translateX,
      translateY: translateY,
      viewportDimensions: viewportDimensions
    });
    
    // Log the update for debugging (less verbose now that we've confirmed it's working)
    if (scale % 0.2 < 0.05) { // Only log occasionally to reduce noise
      console.log(`COORDINATE SYSTEM UPDATED: Scale=${scale.toFixed(2)}, ` +
        `Translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)}), ` +
        `Viewport=${viewportDimensions.width}x${viewportDimensions.height}`);
    }
  }, [scale, translateX, translateY, viewportDimensions, containerRef]);
  
  // Use our new coordinate system for all transformations
  const screenToPdfCoordinates = (screenX: number, screenY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    // The coordSystem is updated via useEffect when scale, translateX, or translateY changes
    // We use the debug parameter to provide detailed logging for important operations like adding markers
    const result = coordSystem.screenToPdf(screenX, screenY, true);
    
    // Ensure the result is using the precise scale value without any drift
    // This ensures markers are placed exactly where clicked at any zoom level
    return {
      x: parseFloat((result.x).toFixed(2)),
      y: parseFloat((result.y).toFixed(2))
    };
  };
  
  // Use our coordinate system for PDF to screen conversion
  const pdfToScreenCoordinates = (pdfX: number, pdfY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    return coordSystem.pdfToScreen(pdfX, pdfY);
  };

  // Store the current render task so we can cancel it if needed
  const renderTaskRef = useRef<any>(null);
  
  // DEFINE RENDER PAGE FUNCTION FIRST
  // Function to calculate ideal scale to fit width of the page container
  const calculateFitToWidthScale = (pageWidth: number): number => {
    if (!pageContainerRef.current) return 1;
    
    // Calculate the scale needed to fit the page width to the page container width
    // This is the specific div with className="relative" at line 1155
    // Add a small margin (0.95) to avoid it being exactly at the edge
    const pageContainerWidth = pageContainerRef.current.clientWidth;
    const scaleFactor = (pageContainerWidth * 0.95) / pageWidth;
    
    console.log(`Calculating fit scale: PDF width=${pageWidth}px, Container width=${pageContainerWidth}px, Scale=${scaleFactor.toFixed(2)}`);
    
    // Cap the scale between reasonable limits
    return Math.min(Math.max(scaleFactor, 0.1), 5.0);
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDocument || !canvasRef.current || !svgLayerRef.current || pageNum < 1 || pageNum > pdfDocument.numPages) {
      return;
    }

    // Cancel any pending render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setIsLoading(true);
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      
      // Get default viewport at scale 1.0 to determine original PDF dimensions
      const defaultViewport = page.getViewport({ scale: 1 });
      
      // Auto-scale to fit width on initial load or reset
      let currentScale = scale;
      if (scale === 1 && translateX === 0 && translateY === 0) {
        // This is either initial load or a reset - auto-scale to fit width
        currentScale = calculateFitToWidthScale(defaultViewport.width);
        console.log(`Auto-scaling PDF to fit width: scale = ${currentScale.toFixed(2)}`);
        setScale(currentScale);
      }
      
      // Apply the scale (either auto-calculated or user-defined)
      const viewport = page.getViewport({ scale: currentScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Update canvas and SVG dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setViewportDimensions({ width: viewport.width, height: viewport.height });
      
      // Store actual PDF dimensions for coordinate calculations
      setPdfDimensions({ 
        width: defaultViewport.width,
        height: defaultViewport.height
      });
      
      // Calculate scale from PDF points to viewport pixels
      const scaleFactor = viewport.width / defaultViewport.width;
      // We no longer need to set pdfToViewportScale as we're using scale directly
      
      // Clear the canvas 
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create a new render task
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      });
      
      // Store the render task so we can cancel it if needed
      renderTaskRef.current = renderTask;
      
      // Wait for rendering to complete
      await renderTask.promise;
      
      // Clear the reference since rendering is complete
      renderTaskRef.current = null;
      
      setIsLoading(false);
    } catch (error: any) {
      // Check if this was a cancelled task
      if (error && error.name === 'RenderingCancelledException') {
        console.log('Rendering cancelled as expected');
        return; // Don't show an error for cancellation
      }
      
      console.error('Error rendering PDF page:', error);
      setIsLoading(false);
      toast({
        title: 'Rendering Error',
        description: 'Could not render the floorplan page.',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  // DEFINE EXPORT FUNCTION FIRST
  const exportAsPng = () => {
    if (canvasRef.current && svgLayerRef.current) {
      // Create a temporary canvas for the export
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvasRef.current) {
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        
        // Draw the canvas content (PDF)
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
    }
  };

  // Show autosave feedback - disabled per user request
  const showAutoSaveFeedback = () => {
    // Toast notifications disabled - changes are still saved silently
    // No visual feedback to avoid interrupting workflow
    console.log("Changes auto-saved to floorplan");
  };

  // Handle marker clicks
  const handleMarkerClick = (marker: MarkerData) => {
    if (toolMode === 'select') {
      setSelectedMarker(prevMarker => 
        prevMarker?.id === marker.id ? null : marker
      );
    } else if (toolMode === 'delete') {
      // Delete the marker immediately when in delete mode
      deleteMarkerMutation.mutate(marker.id);
      setSelectedMarker(null);
      // Visual feedback disabled per user request
      console.log('Marker deleted from floorplan');
    }
  };

  // Handle marker right-click for context menu
  const handleMarkerRightClick = (e: React.MouseEvent, marker: MarkerData) => {
    e.preventDefault(); // Prevent default browser context menu
    e.stopPropagation(); // Stop event from bubbling up
    
    // Set the selected marker
    setSelectedMarker(marker);
    
    // Position the context menu at the mouse position
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };
  
  // Start dragging a marker - IMPROVED SCALING IMPLEMENTATION
  const startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    // Store the initial marker position and mouse position for relative movement
    const rect = containerRef.current.getBoundingClientRect();
    const mouseScreenX = e.clientX;
    const mouseScreenY = e.clientY;
    
    // Store initial marker screen position (where the marker appears on screen)
    const markerScreenX = marker.position_x * scale + translateX + rect.left;
    const markerScreenY = marker.position_y * scale + translateY + rect.top;
    
    // Calculate mouse offset from the marker's visual position
    const offset = {
      screenX: mouseScreenX - markerScreenX,
      screenY: mouseScreenY - markerScreenY,
      // Also store original marker position for relative movement calculation
      markerStartX: marker.position_x,
      markerStartY: marker.position_y,
      // Store initial mouse position for calculating deltas
      mouseStartX: mouseScreenX,
      mouseStartY: mouseScreenY,
      // Add camera properties to prevent TypeScript errors
      cameraStartRotation: marker.rotation || 0,
      cameraStartFov: (marker as any).fov || 90,
      cameraStartRange: (marker as any).range || 60
    };
    
    // Detailed logging for debugging the scaling-aware implementation
    console.log(`[SCALING-AWARE] Starting drag of marker #${marker.id}:`);
    console.log(` - Mouse screen pos: (${mouseScreenX}, ${mouseScreenY})`);
    console.log(` - Marker screen pos: (${markerScreenX.toFixed(2)}, ${markerScreenY.toFixed(2)})`);
    console.log(` - Marker PDF pos: (${marker.position_x.toFixed(2)}, ${marker.position_y.toFixed(2)})`);
    console.log(` - Screen offset: (${offset.screenX.toFixed(2)}, ${offset.screenY.toFixed(2)})`);
    console.log(` - Current scale: ${scale.toFixed(2)}`);
    
    // Store all relevant data needed for precise drag calculations
    setMarkerDragOffset(offset);
    setSelectedMarker(marker);
    setIsDraggingMarker(true);
    
    // Show feedback cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };
  
  // Start dragging a camera handle (FOV, range, rotation)
  const startCameraHandleDrag = (e: React.MouseEvent, marker: MarkerData, handleType: string) => {
    e.stopPropagation();
    
    if (toolMode !== 'select' || !containerRef.current) return;
    
    // Set the active handle type and marker
    setActiveHandle(handleType);
    setSelectedMarker(marker);
    setIsResizingMarker(true);
    
    // Store initial values for relative adjustments
    const mouseScreenX = e.clientX;
    const mouseScreenY = e.clientY;
    
    // Get the initial camera properties with default values if not set
    const initialRotation = marker.rotation || 0;
    const initialFov = (marker as any).fov || 90;
    const initialRange = (marker as any).range || 60;
    
    // Get mouse position in PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Calculate angle from camera to mouse
    const cameraX = marker.position_x;
    const cameraY = marker.position_y;
    const angleToMouse = Math.atan2(mousePdf.y - cameraY, mousePdf.x - cameraX) * 180 / Math.PI;
    
    // Store the initial camera properties
    setMarkerDragOffset({
      screenX: mouseScreenX,
      screenY: mouseScreenY,
      mouseStartX: mouseScreenX,
      mouseStartY: mouseScreenY,
      markerStartX: marker.position_x,
      markerStartY: marker.position_y,
      cameraStartRotation: initialRotation,
      cameraStartFov: initialFov,
      cameraStartRange: initialRange
    });
    
    console.log(`=== STARTING CAMERA HANDLE DRAG ===`);
    console.log(`Handle type: ${handleType}`);
    console.log(`Camera position: (${marker.position_x.toFixed(2)}, ${marker.position_y.toFixed(2)})`);
    console.log(`Mouse PDF position: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
    console.log(`Angle to mouse: ${angleToMouse.toFixed(2)}°`);
    console.log(`Initial FOV: ${initialFov.toFixed(2)}°`);
    console.log(`Initial range: ${initialRange.toFixed(2)}`);
    console.log(`Initial rotation: ${initialRotation.toFixed(2)}°`);
  };
  
  // Start resizing a marker
  const startMarkerResize = (e: React.MouseEvent, marker: MarkerData) => {
    if (toolMode !== 'select') return;
    
    e.stopPropagation();
    
    setSelectedMarker(marker);
    setIsResizingMarker(true);
  };

  // Query Hooks
  const { 
    data: markers = [], 
    isLoading: isLoadingMarkers, 
    refetch: refetchMarkers 
  } = useQuery({
    queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/floorplans/${floorplan.id}/markers?page=${currentPage}`);
      return await res.json();
    },
    enabled: !!floorplan.id
  });

  const {
    data: calibrationData,
    isLoading: isLoadingCalibration,
  } = useQuery({
    queryKey: [`/api/floorplans/${floorplan.id}/calibration`, currentPage],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/floorplans/${floorplan.id}/calibration?page=${currentPage}`);
      return await res.json();
    },
    enabled: !!floorplan.id
  });

  // Mutations for CRUD operations
  const addMarkerMutation = useMutation({
    mutationFn: async (marker: Partial<MarkerData>) => {
      // Use the correct API endpoint (/api/floorplan-markers) that matches the server-side route
      const res = await apiRequest('POST', `/api/floorplan-markers`, {
        ...marker,
        floorplan_id: floorplan.id  // Ensure floorplan_id is included
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
      
      console.log("Marker added successfully, updating UI");
      
      // Call onMarkersUpdated callback if provided
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      // Show autosave feedback
      showAutoSaveFeedback();
    },
    onError: (error) => {
      console.error("Error adding marker:", error);
    }
  });

  const updateMarkerMutation = useMutation({
    mutationFn: async (marker: MarkerData) => {
      // Use the correct API endpoint for updating markers
      const res = await apiRequest('PUT', `/api/floorplan-markers/${marker.id}`, marker);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
      
      console.log("Marker updated successfully, updating UI");
      
      // Call onMarkersUpdated callback if provided
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      // Show autosave feedback
      showAutoSaveFeedback();
    },
    onError: (error) => {
      console.error("Error updating marker:", error);
    }
  });

  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      // Use the correct API endpoint for deleting markers
      await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`);
    },
    onSuccess: () => {
      // Invalidate the queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
      
      console.log("Marker deleted successfully, updating UI");
      
      // Call onMarkersUpdated callback if provided
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
    },
    onError: (error) => {
      console.error("Error deleting marker:", error);
    }
  });

  const duplicateMarkerMutation = useMutation({
    mutationFn: async (marker: Partial<MarkerData>) => {
      // For duplication, we actually create a new marker with the same properties
      // using the standard create marker endpoint
      const res = await apiRequest('POST', `/api/floorplan-markers`, {
        ...marker,
        floorplan_id: floorplan.id,  // Ensure floorplan_id is included
        unique_id: uuidv4()  // Generate a new unique ID for the duplicated marker
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
      
      console.log("Marker duplicated successfully, updating UI");
      
      // Call onMarkersUpdated callback if provided
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
    },
    onError: (error) => {
      console.error("Error duplicating marker:", error);
    }
  });

  const saveCalibrationMutation = useMutation({
    mutationFn: async (calibrationData: Partial<CalibrationData>) => {
      const res = await apiRequest('POST', `/api/floorplans/${floorplan.id}/calibration`, calibrationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/calibration`, currentPage],
      });
      // Visual feedback disabled per user request
      console.log('Calibration saved successfully');
    }
  });

  // Load and render PDF document
  useEffect(() => {
    if (!floorplan?.pdf_data) return;
    
    // Show loading state
    setIsLoading(true);
    
    // Convert base64 to byte array
    const pdfData = atob(floorplan.pdf_data);
    const pdfBytes = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      pdfBytes[i] = pdfData.charCodeAt(i);
    }
    
    // Load PDF document
    pdfjsLib.getDocument({ data: pdfBytes }).promise.then((pdf) => {
      setPdfDocument(pdf);
      setIsLoading(false);
      renderPage(currentPage);
    }).catch(error => {
      console.error('Error loading PDF:', error);
      setIsLoading(false);
      // Keep this error message in the console for debugging
      console.error('Could not load the floorplan PDF. Please try again.');
    });
  }, [floorplan, toast, currentPage]);

  // Render current page when it changes
  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDocument, scale]);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdfDocument) {
        renderPage(currentPage);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pdfDocument, currentPage]);

  // Pan and zoom event handlers
  useEffect(() => {
    // Create a custom wheel handler that doesn't use preventDefault
    // Instead, we'll manage zoom in our own handler
    const handleMouseWheel = (e: WheelEvent) => {
      // Disable zooming if equipment form or any modal dialog is open
      // or if contextMenuOpen is true (context menu is showing)
      if (isEquipmentFormOpen || isCalibrationDialogOpen || isLayerManagerOpen || contextMenuOpen) {
        e.stopPropagation(); // Stop event propagation to prevent any zooming
        return; // Do not handle zoom when modals or context menus are open
      }
      
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        const delta = e.deltaY;
        
        // Implement zoom functionality directly in our handler
        if (delta !== 0) {
          // Determine zoom direction (in or out)
          const zoomFactor = delta > 0 ? 0.9 : 1.1; // Zoom out if positive delta, in if negative
          
          // Calculate new scale
          const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));
          
          // Update scale
          setScale(newScale);
          
          // Log for debugging
          console.log(`Zooming: scale changed to ${newScale.toFixed(2)}`);
        }
      }
    };
    
    // Use passive event listener which is more performant and avoids warnings
    containerRef.current?.addEventListener('wheel', handleMouseWheel, { passive: true });
    
    return () => {
      containerRef.current?.removeEventListener('wheel', handleMouseWheel);
    };
  }, [scale, isEquipmentFormOpen, isCalibrationDialogOpen, isLayerManagerOpen, contextMenuOpen]);

  // Keyboard handler for marker operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we have a selected marker
      if (selectedMarker) {
        // Delete marker with Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteMarkerMutation.mutate(selectedMarker.id);
          setSelectedMarker(null);
          // Visual feedback disabled per user request
          console.log('Marker deleted using keyboard shortcut');
        }
        
        // Duplicate marker with Ctrl+D
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault(); // Prevent browser's default bookmark action
          // Clone the marker with a slight offset
          duplicateMarkerMutation.mutate({
            ...selectedMarker,
            id: undefined, // Remove ID so a new one is generated
            position_x: selectedMarker.position_x + 20, 
            position_y: selectedMarker.position_y + 20,
          });
          // Visual feedback disabled per user request
          console.log('Marker duplicated using keyboard shortcut');
        }
      }
      
      // Global shortcuts
      
      // Reset view with Ctrl+0
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
        renderPage(currentPage);
        // Visual feedback disabled per user request
        console.log('View reset to default');
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Listen for export event from parent component
    const handleExportEvent = () => {
      exportAsPng();
    };
    
    document.addEventListener('export-floorplan', handleExportEvent);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('export-floorplan', handleExportEvent);
    };
  }, [selectedMarker, deleteMarkerMutation, duplicateMarkerMutation, scale, currentPage]);

  // Mouse handling for pan/zoom and marker placement
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX;
      const y = e.clientY;
      
      if (toolMode === 'pan' || e.button === 1) { // Middle click or pan tool
        setIsDragging(true);
        setDragStart({ x, y });
      } else if (toolMode === 'select') {
        // Check if clicking on a marker for selection
        // This will be handled by the marker click handler
      } else {
        // We're in an annotation tool mode - prepare to add a marker
        // Get the mouse position using our coordinate system
        if (!containerRef.current) return; // Safety check
        
        // Convert screen coordinates to PDF coordinates
        const mousePdf = screenToPdfCoordinates(x, y);
        
        console.log(`=== ADDING NEW MARKER ===`);
        console.log(`Mouse screen position: (${x}, ${y})`);
        console.log(`Current transform: scale=${scale.toFixed(2)}, translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
        console.log(`Calculated PDF position: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
        
        // Create temporary marker based on tool mode
        const newMarker: Partial<MarkerData> = {
          floorplan_id: floorplan.id,
          unique_id: uuidv4(),
          page: currentPage,
          marker_type: toolMode,
          position_x: mousePdf.x,
          position_y: mousePdf.y,
          version: 1,
          layer_id: activeLayer?.id
        };
        
        // If we have selected equipment of the correct type, use it
        if (selectedEquipment && selectedEquipment.type === toolMode) {
          console.log("Using selected equipment for marker:", selectedEquipment);
          newMarker.equipment_id = selectedEquipment.id;
          newMarker.label = selectedEquipment.label;
        }
        
        // For shapes that need dragging to size them
        if (['rectangle', 'ellipse', 'line'].includes(toolMode)) {
          setIsAddingMarker(true);
          setTempMarker(newMarker);
        } else if (toolMode === 'polyline' || toolMode === 'polygon') {
          // Start collecting points
          console.log(`Starting polyline at: x=${mousePdf.x}, y=${mousePdf.y}`);
          setIsDrawing(true);
          setDrawingPoints([{ x: mousePdf.x, y: mousePdf.y }]);
        } else if (['access_point', 'camera', 'elevator', 'intercom'].includes(toolMode)) {
          // For equipment markers that need configuration
          setTempMarker(newMarker);
          setIsEquipmentFormOpen(true);
        } else {
          // For other point markers that don't need sizing or configuration
          addMarkerMutation.mutate(newMarker);
          // Visual feedback disabled per user request
          console.log(`Added ${toolMode} marker to floorplan`);
        }
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    if (isDragging && toolMode === 'pan') {
      // Panning the view
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setTranslateX(prev => prev + deltaX);
      setTranslateY(prev => prev + deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Set cursor for panning
      containerRef.current.style.cursor = 'grabbing';
    } else if (isDraggingMarker && selectedMarker) {
      // Moving a selected marker - IMPROVED SCALING-AWARE IMPLEMENTATION
      
      // Calculate mouse delta in screen coordinates (how far the mouse has moved since drag start)
      const mouseScreenX = e.clientX;
      const mouseScreenY = e.clientY;
      const mouseDeltaX = mouseScreenX - markerDragOffset.mouseStartX;
      const mouseDeltaY = mouseScreenY - markerDragOffset.mouseStartY;
      
      // Convert screen delta to PDF coordinates (divide by scale)
      const pdfDeltaX = mouseDeltaX / scale;
      const pdfDeltaY = mouseDeltaY / scale;
      
      // Apply PDF delta to the marker's original position
      const newX = markerDragOffset.markerStartX + pdfDeltaX;
      const newY = markerDragOffset.markerStartY + pdfDeltaY;
      
      // Limited logging to avoid console spam
      if (Math.random() < 0.05) { // Only log ~5% of moves
        console.log(`[SCALING-AWARE] Marker drag move calculation:`);
        console.log(` - Original mouse pos: (${markerDragOffset.mouseStartX}, ${markerDragOffset.mouseStartY})`);
        console.log(` - Current mouse pos: (${mouseScreenX}, ${mouseScreenY})`);
        console.log(` - Mouse delta screen: (${mouseDeltaX.toFixed(2)}, ${mouseDeltaY.toFixed(2)})`);
        console.log(` - Mouse delta PDF: (${pdfDeltaX.toFixed(2)}, ${pdfDeltaY.toFixed(2)})`);
        console.log(` - Original marker pos: (${markerDragOffset.markerStartX.toFixed(2)}, ${markerDragOffset.markerStartY.toFixed(2)})`);
        console.log(` - New marker pos: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
        console.log(` - Current scale: ${scale.toFixed(2)}`);
      }
      
      // Update local state for smooth visual feedback
      setSelectedMarker(prev => {
        if (!prev) return null;
        return {
          ...prev,
          position_x: newX,
          position_y: newY
        };
      });
      
      // Set cursor for dragging marker
      containerRef.current.style.cursor = 'grabbing';
    } else if (isResizingMarker && selectedMarker) {
      // Resizing a selected marker using our coordinate system
      
      // Get PDF coordinates directly using our coordinate system
      const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Log occasionally for debugging
      if (Math.random() < 0.05) { // Log ~5% of resize operations
        console.log(`=== RESIZE EVENT ===`);
        console.log(`Mouse screen: (${e.clientX}, ${e.clientY})`);
        console.log(`Mouse PDF: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
        console.log(`Current transform: scale=${scale.toFixed(2)}, translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
      }
      
      // Store PDF coordinates for clarity in the remaining code
      const pdfX = mousePdf.x;
      const pdfY = mousePdf.y;
      
      // Handle camera marker properties (FOV, range, rotation)
      if (selectedMarker.marker_type === 'camera' && activeHandle) {
        // For camera markers, we handle special properties
        const cameraX = selectedMarker.position_x;
        const cameraY = selectedMarker.position_y;
        
        // Calculate angle from camera position to mouse position
        const angleToMouse = Math.atan2(pdfY - cameraY, pdfX - cameraX) * 180 / Math.PI;
        
        // Calculate distance from camera position to mouse position
        const distanceToMouse = Math.sqrt(
          Math.pow(pdfX - cameraX, 2) + 
          Math.pow(pdfY - cameraY, 2)
        );
        
        // Update different properties based on which handle is being dragged
        if (activeHandle === 'range') {
          // Update the range property (distance from camera)
          setSelectedMarker(prev => {
            if (!prev) return null;
            return {
              ...prev,
              range: Math.max(20, distanceToMouse) // Minimum 20 units range
            } as MarkerData;
          });
        } 
        else if (activeHandle === 'fov-left' || activeHandle === 'fov-right') {
          // Use the initial FOV from when the drag started
          // This allows for smoother relative adjustments
          const startRotation = markerDragOffset.cameraStartRotation || 0;
          const startFov = markerDragOffset.cameraStartFov || 90;
          const currentFov = (selectedMarker as any).fov || 90;

          // Calculate mouse position relative to camera center
          const relativeX = pdfX - selectedMarker.position_x;
          const relativeY = pdfY - selectedMarker.position_y;
          
          // Calculate angle from camera to mouse in degrees
          // We already have angleToMouse calculated
          
          // Calculate FOV based on handle type
          let newFov = currentFov;

          // Get the angle between current mouse position and camera center
          // This already calculated as angleToMouse

          // Calculate the angle of the FOV handle at drag start
          const startLeftAngle = startRotation - startFov/2;
          const startRightAngle = startRotation + startFov/2;
          
          // For debugging
          console.log(`FOV Calculation:
            - Handle: ${activeHandle}
            - Start FOV: ${startFov}°
            - Mouse angle: ${angleToMouse.toFixed(1)}°
            - Start left angle: ${startLeftAngle.toFixed(1)}°
            - Start right angle: ${startRightAngle.toFixed(1)}°
          `);
          
          // Calculate new FOV
          if (activeHandle === 'fov-left') {
            // For left handle, adjust FOV relative to start angle
            const angleChange = normalizeAngle(angleToMouse - startLeftAngle);
            
            // Adjust FOV based on change to left angle (negative change = wider FOV)
            newFov = startFov - angleChange * 2;
            
            // Log for debugging
            console.log(`Left FOV handle:
              - Angle change: ${angleChange.toFixed(1)}°
              - New FOV: ${newFov.toFixed(1)}°
            `);
          } else { // fov-right
            // For right handle, adjust FOV relative to start angle
            const angleChange = normalizeAngle(angleToMouse - startRightAngle);
            
            // Adjust FOV based on change to right angle (positive change = wider FOV)
            newFov = startFov + angleChange * 2;
            
            // Log for debugging
            console.log(`Right FOV handle:
              - Angle change: ${angleChange.toFixed(1)}°
              - New FOV: ${newFov.toFixed(1)}°
            `);
          }
          
          // Make sure we have gradual changes by limiting max change per frame
          // This will smooth out any jumps
          const maxChangePerFrame = 15;
          const clampedDelta = Math.max(-maxChangePerFrame, Math.min(maxChangePerFrame, newFov - currentFov));
          newFov = currentFov + clampedDelta;
          
          // Constrain FOV between 10 and 360 degrees
          newFov = Math.max(10, Math.min(360, newFov));
          
          // Update the FOV property
          setSelectedMarker(prev => {
            if (!prev) return null;
            return {
              ...prev,
              fov: newFov
            } as MarkerData;
          });
        }
        else if (activeHandle === 'rotation') {
          // If rotating the camera
          setSelectedMarker(prev => {
            if (!prev) return null;
            return {
              ...prev,
              rotation: angleToMouse // Set rotation to the angle to the mouse
            } as MarkerData;
          });
        }
        // Handle other camera drag operations like when user is just dragging a camera handle
        // that's not specifically one of the predefined handles
        else {
          console.log(`Unhandled camera handle: ${activeHandle}, setting rotation to ${angleToMouse.toFixed(2)}`);
          setSelectedMarker(prev => {
            if (!prev) return null;
            return {
              ...prev,
              rotation: angleToMouse // Default to setting rotation
            } as MarkerData;
          });
        }
      } else {
        // Handle regular marker resizing for non-camera markers
        
        // Calculate new dimensions based on marker type
        setSelectedMarker(prev => {
          if (!prev) return null;
          
          const newProperties: Partial<MarkerData> = {};
          
          // For markers with width/height properties
          if (['rectangle', 'ellipse', 'image'].includes(prev.marker_type)) {
            newProperties.width = Math.abs(pdfX - prev.position_x);
            newProperties.height = Math.abs(pdfY - prev.position_y);
          }
          
          // For line markers
          if (prev.marker_type === 'line') {
            newProperties.end_x = pdfX;
            newProperties.end_y = pdfY;
          }
          
          return {
            ...prev,
            ...newProperties
          };
        });
      }
    } else if (isAddingMarker && tempMarker) {
      // Sizing a shape marker using our coordinate system
      
      // Get mouse position in PDF coordinates
      const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
      
      setTempMarker(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          end_x: mousePdf.x,
          end_y: mousePdf.y,
          width: Math.abs(mousePdf.x - (prev.position_x || 0)),
          height: Math.abs(mousePdf.y - (prev.position_y || 0))
        };
      });
    } else if (isDrawing && (toolMode === 'polyline' || toolMode === 'polygon')) {
      // Get mouse position using our coordinate system
      if (!containerRef.current) return;
      
      // Convert screen coordinates to PDF coordinates
      const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
      
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      
      // Only update if mouse moved significantly (avoid excessive updates)
      const distance = Math.sqrt(
        Math.pow(mousePdf.x - lastPoint.x, 2) + 
        Math.pow(mousePdf.y - lastPoint.y, 2)
      );
      
      if (distance > 5 / scale) { // 5px in screen space
        setDrawingPoints([...drawingPoints.slice(0, -1), { x: mousePdf.x, y: mousePdf.y }]);
      }
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isAddingMarker && tempMarker) {
      // Finalize shape marker using our coordinate system
      if (!containerRef.current) return;
      
      // Get mouse position in PDF coordinates
      const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Calculate width/height/end points
      const width = Math.abs(mousePdf.x - (tempMarker.position_x || 0));
      const height = Math.abs(mousePdf.y - (tempMarker.position_y || 0));
      
      // Only add if the shape has some size
      if (width > 5 / scale || height > 5 / scale) {
        // Log the coordinates for debugging
        console.log(`=== FINALIZING MARKER ===`);
        console.log(`Position: (${tempMarker.position_x}, ${tempMarker.position_y})`);
        console.log(`End point: (${mousePdf.x}, ${mousePdf.y})`);
        console.log(`Size: ${width} x ${height}`);
        
        const finalMarker = {
          ...tempMarker,
          end_x: mousePdf.x,
          end_y: mousePdf.y,
          width: parseFloat(width.toFixed(2)),
          height: parseFloat(height.toFixed(2)),
          color: activeLayer?.color || '#ff0000',
          fill_color: activeLayer?.color ? `${activeLayer.color}80` : '#ff000080', // Add 50% opacity
          opacity: 0.8,
          line_width: 2
        };
        
        addMarkerMutation.mutate(finalMarker);
        
        // Visual feedback disabled per user request
        console.log(`Added ${toolMode} shape to floorplan`);
      }
      
      setIsAddingMarker(false);
      setTempMarker(null);
    } else if (isDraggingMarker && selectedMarker) {
      // Save the new marker position
      // Log for debugging
      console.log(`=== DRAG END ===`);
      console.log(`Marker ID: ${selectedMarker.id}`);
      console.log(`Final position: (${selectedMarker.position_x.toFixed(2)}, ${selectedMarker.position_y.toFixed(2)})`);
      console.log(`Current scale: ${scale}`);
      
      // Save to database with precise positioning
      updateMarkerMutation.mutate({
        ...selectedMarker,
        // Ensure precision is maintained with numeric values
        // This is critical to maintain stability during zoom operations
        position_x: parseFloat(selectedMarker.position_x.toFixed(2)),
        position_y: parseFloat(selectedMarker.position_y.toFixed(2))
      });
      
      setIsDraggingMarker(false);
      
      // Reset cursor style
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
      
      showAutoSaveFeedback();
    } else if (isResizingMarker && selectedMarker) {
      // Save the resized marker
      console.log("Saving resized marker with properties:", {
        id: selectedMarker.id,
        marker_type: selectedMarker.marker_type,
        fov: selectedMarker.marker_type === 'camera' ? (selectedMarker as any).fov : undefined,
        range: selectedMarker.marker_type === 'camera' ? (selectedMarker as any).range : undefined,
        rotation: selectedMarker.rotation
      });
      
      // Make sure we're including all camera-specific properties when updating
      const markerToUpdate = {
        ...selectedMarker,
        // Ensure precision is maintained with numeric values
        position_x: parseFloat(selectedMarker.position_x.toFixed(2)),
        position_y: parseFloat(selectedMarker.position_y.toFixed(2))
      };
      
      // For camera markers, ensure we're saving FOV, range and rotation properly
      if (selectedMarker.marker_type === 'camera') {
        if (activeHandle) {
          console.log(`Saving camera after ${activeHandle} adjustment`);
        }
        // Reset the active handle
        setActiveHandle(null);
      }
      
      updateMarkerMutation.mutate(markerToUpdate);
      setIsResizingMarker(false);
      showAutoSaveFeedback();
    } else if (toolMode === 'polyline' || toolMode === 'polygon') {
      // Continue collecting points - don't finalize yet
      // Double-click will finalize (handled in handleDoubleClick)
    } else {
      setIsDragging(false);
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isDrawing && (toolMode === 'polyline' || toolMode === 'polygon')) {
      // Finalize polyline or polygon with at least 2 points
      if (drawingPoints.length >= 2) {
        // Calculate precision points array to avoid zoom drift
        const precisePoints = drawingPoints.map(point => ({
          x: parseFloat(point.x.toFixed(2)),
          y: parseFloat(point.y.toFixed(2))
        }));
      
        console.log(`=== FINALIZING ${toolMode.toUpperCase()} ===`);
        console.log(`Total points: ${precisePoints.length}`);
        console.log(`Start: (${precisePoints[0].x}, ${precisePoints[0].y})`);
        console.log(`End: (${precisePoints[precisePoints.length-1].x}, ${precisePoints[precisePoints.length-1].y})`);
      
        const finalMarker = {
          floorplan_id: floorplan.id,
          unique_id: uuidv4(),
          page: currentPage,
          marker_type: toolMode,
          position_x: precisePoints[0].x,
          position_y: precisePoints[0].y,
          points: precisePoints, // Use precision-limited points
          color: activeLayer?.color || '#ff0000',
          line_width: 2,
          opacity: 0.8,
          version: 1,
          layer_id: activeLayer?.id
        };
        
        addMarkerMutation.mutate(finalMarker);
        
        // Visual feedback disabled per user request
        console.log(`Added ${toolMode === 'polyline' ? 'polyline' : 'polygon'} to floorplan`);
      }
      
      setIsDrawing(false);
      setDrawingPoints([]);
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    // Don't use preventDefault since we're in passive mode
    // Instead let the custom wheel handler manage zoom behavior
    
    // Don't process wheel events if any modal or context menu is open
    if (isEquipmentFormOpen || isCalibrationDialogOpen || isLayerManagerOpen || contextMenuOpen) {
      return; // Exit early - no zooming when dialogs are open
    }
    
    // IMPORTANT: This zoom handler is where our coordinate system fixes make a big difference
    // We now use the coordinate system's calculation to ensure markers stay in the correct 
    // position relative to the cursor during zooming operations
    
    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Get the mouse position in container coordinates
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new scale factor
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out on positive deltaY (scroll down)
    const newScale = Math.max(0.1, Math.min(10, scale * delta));
    
    // Use our coordinate system to calculate the new transform
    // This is the key improvement - our coordinate system handles all the math
    const newTransform = coordSystem.calculateZoomTransform(
      mouseX,
      mouseY,
      newScale
    );
    
    // Reduce logging - only log every 5th zoom event to avoid console spam
    if (Math.random() < 0.2) {
      console.log(`ZOOM: Scale ${scale.toFixed(2)} → ${newScale.toFixed(2)}, ` +
        `Mouse PDF (${coordSystem.containerToPdf(mouseX, mouseY).x.toFixed(0)}, ${coordSystem.containerToPdf(mouseX, mouseY).y.toFixed(0)})`);
    }
    
    // Extract the calculated values
    const newTranslateX = newTransform.translateX;
    const newTranslateY = newTransform.translateY;
    
    // Debug information has already been logged above with the coordinate system
    
    // Update state
    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  };

  // Main component render
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        // Reset cursor when mouse leaves the container entirely
        if (containerRef.current && !isDraggingMarker) {
          containerRef.current.style.cursor = 'default';
        }
      }}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div
        ref={pageContainerRef}
        className="relative"
      >
        {/* The PDF Canvas - we'll transform this with the pan and zoom */}
        <canvas 
          ref={canvasRef} 
          className="block pointer-events-none"
          style={{
            width: `${viewportDimensions.width}px`,
            height: `${viewportDimensions.height}px`,
            transformOrigin: '0 0',
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transition: 'transform 75ms'
          }}
        />
        
        {/* The SVG overlay layer must use identical transform */}
        <svg
          ref={svgLayerRef}
          className="absolute top-0 left-0 pointer-events-auto"
          style={{
            width: `${viewportDimensions.width}px`,
            height: `${viewportDimensions.height}px`,
            transformOrigin: '0 0',
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transition: 'transform 75ms',
            userSelect: 'none',  /* Disable text selection */
            WebkitUserSelect: 'none', /* Safari */
            msUserSelect: 'none' /* IE/Edge */
          }}
        >
          {/* Debug grid removed */}
          
          {/* Render markers here based on their type */}
          {markers.map((marker: MarkerData) => {
            // Skip markers on hidden layers
            const markerLayer = layers.find(l => l.id === marker.layer_id);
            if (markerLayer && !markerLayer.visible) return null;
            
            // Apply styling
            const markerColor = marker.color || (markerLayer ? markerLayer.color : '#ff0000');
            const fillColor = marker.fill_color || (markerColor + '80'); // Add 50% opacity
            const isSelected = selectedMarker?.id === marker.id;
            const strokeWidth = marker.line_width || 2;
            const selectedStrokeWidth = strokeWidth * 1.5;
            
            // Calculate screen coordinates from PDF coordinates using our utility function
            // Only occasionally log selected marker details to reduce console spam
            if (isSelected && Math.random() < 0.1) { // Log only 10% of the time
              console.log(`Selected marker #${marker.id} (${marker.marker_type}): ` +
                `PDF pos (${marker.position_x.toFixed(1)}, ${marker.position_y.toFixed(1)}), ` +
                `scale=${scale.toFixed(2)}`);
            }
            
            // Base classnames and props
            const baseClassName = `marker-group ${isSelected ? 'selected-marker' : ''}`;
            const baseProps = {
              style: {
                cursor: toolMode === 'delete' ? 'not-allowed' : 'grab',
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              },
              onContextMenu: (e: React.MouseEvent) => {
                handleMarkerRightClick(e, marker);
              },
              onMouseDown: (e: React.MouseEvent) => {
                // Allow dragging with left click regardless of current tool mode
                // Only exclude drawing modes or when actually adding a marker
                if (e.button === 0 && 
                    !isAddingMarker && 
                    !isDrawing && 
                    !['polyline', 'polygon'].includes(toolMode) && 
                    toolMode !== 'delete') {
                  e.stopPropagation();
                  startMarkerDrag(e, marker);
                }
              },
              onMouseEnter: (e: React.MouseEvent) => {
                // Show grab cursor when hovering over a marker that can be dragged
                if (!isAddingMarker && 
                    !isDrawing && 
                    !['polyline', 'polygon'].includes(toolMode) && 
                    toolMode !== 'delete') {
                  if (containerRef.current) {
                    containerRef.current.style.cursor = 'grab';
                  }
                }
              },
              onMouseLeave: (e: React.MouseEvent) => {
                // Reset cursor when no longer hovering over a marker
                if (!isDraggingMarker && containerRef.current) {
                  containerRef.current.style.cursor = 'default';
                }
              }
            };
            
            // Render different marker types
            switch (marker.marker_type) {
              case 'access_point':
                // Apply transform to the parent group for position
                // And use a nested group with inverse scale to keep marker size constant
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}
                    {...baseProps}
                  >
                    {/* Add inner group with inverse scale to maintain consistent visual size */}
                    <g transform={`scale(${1/scale})`}>
                      <circle 
                        r={12} // Constant size regardless of zoom level
                        fill={fillColor} /* Red circle */
                        stroke={markerColor}
                        strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                      />
                      <text 
                        fontSize={14} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#FFFFFF" /* White text */
                        fontWeight="bold"
                        style={{ 
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      >AP</text>
                      {shouldShowMarkerLabel(marker, isSelected) && marker.label && (
                        <g style={{ pointerEvents: 'none' }}>
                          <rect
                            x={-40}
                            y={17}
                            width={80}
                            height={16}
                            rx={4}
                            fill="#ffff00" /* Yellow background */
                            stroke="#ff0000"
                            strokeWidth={0.5}
                          />
                          <text 
                            fontSize={11} 
                            y={24} 
                            textAnchor="middle" 
                            fill="#ff0000" /* Red text */
                            fontWeight="bold"
                          >{marker.label}</text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              
              case 'camera':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    {...baseProps}
                  >
                    <CameraMarker
                      id={marker.id}
                      position={{ 
                        x: marker.position_x * scale, 
                        y: marker.position_y * scale 
                      }}
                      selected={isSelected}
                      label={shouldShowMarkerLabel(marker, isSelected) ? marker.label || undefined : undefined}
                      fov={(marker as any).fov || 90}
                      range={(marker as any).range || 60}
                      rotation={marker.rotation || 0}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleMarkerClick(marker);
                      }}
                      onRightClick={(e: React.MouseEvent) => {
                        handleMarkerRightClick(e, marker);
                      }}
                      onMouseDown={(e: React.MouseEvent) => {
                        if (e.button === 0 && 
                            !isAddingMarker && 
                            !isDrawing && 
                            !['polyline', 'polygon'].includes(toolMode) && 
                            toolMode !== 'delete') {
                          e.stopPropagation();
                          startMarkerDrag(e, marker);
                        }
                      }}
                      onHandleMouseDown={(e: React.MouseEvent, handleType: string) => {
                        if (e.button === 0 && 
                            !isAddingMarker && 
                            !isDrawing && 
                            !['polyline', 'polygon'].includes(toolMode) && 
                            toolMode !== 'delete') {
                          e.stopPropagation();
                          startCameraHandleDrag(e, marker, handleType);
                        }
                      }}
                    />
                  </g>
                );
              
              case 'rectangle':
                // Apply transform to the parent group for position
                // But don't apply inverse scale to rectangle dimensions
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}
                    {...baseProps}
                  >
                    <rect 
                      x="0" 
                      y="0" 
                      width={marker.width! * scale} 
                      height={marker.height! * scale}
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <g transform={`scale(${1/scale})`}>
                        {/* Resize handle - bottom right corner */}
                        <circle 
                          cx={marker.width! * scale} 
                          cy={marker.height! * scale} 
                          r={6} 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth={1}
                          className="cursor-nwse-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerResize(e, marker);
                          }}
                        />
                      </g>
                    )}
                  </g>
                );
                
              case 'ellipse':
                // Apply transform to the parent group for position
                // But don't apply inverse scale to ellipse dimensions
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}
                    {...baseProps}
                  >
                    <ellipse 
                      cx={(marker.width! * scale) / 2} 
                      cy={(marker.height! * scale) / 2}
                      rx={(marker.width! * scale) / 2} 
                      ry={(marker.height! * scale) / 2}
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <g transform={`scale(${1/scale})`}>
                        {/* Resize handle - bottom right corner */}
                        <circle 
                          cx={marker.width! * scale} 
                          cy={marker.height! * scale} 
                          r={6} 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth={1}
                          className="cursor-nwse-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerResize(e, marker);
                          }}
                        />
                      </g>
                    )}
                  </g>
                );
                
              case 'line':
                // For lines we need both the position and end points to be scaled
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(0, 0)`} // No translation for lines - we use absolute coordinates
                    {...baseProps}
                  >
                    <line 
                      x1={marker.position_x * scale} 
                      y1={marker.position_y * scale}
                      x2={marker.end_x! * scale} 
                      y2={marker.end_y! * scale}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <g transform={`scale(${1})`}>
                        {/* Start point handle */}
                        <g transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale}) scale(${1/scale})`}>
                          <circle 
                            cx={0} 
                            cy={0} 
                            r={6} 
                            fill="#ffffff" 
                            stroke="#000000" 
                            strokeWidth={1}
                            className="cursor-move"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              startMarkerDrag(e, marker);
                            }}
                          />
                        </g>
                        {/* End point handle (resize) */}
                        <g transform={`translate(${marker.end_x! * scale}, ${marker.end_y! * scale}) scale(${1/scale})`}>
                          <circle 
                            cx={0} 
                            cy={0} 
                            r={6} 
                            fill="#ffffff" 
                            stroke="#000000" 
                            strokeWidth={1}
                            className="cursor-move"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              startMarkerResize(e, marker);
                            }}
                          />
                        </g>
                      </g>
                    )}
                  </g>
                );

              case 'note':
                // Apply transform to the parent group for position
                // And use a nested group with inverse scale to keep marker size constant
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * scale}, ${marker.position_y * scale})`}
                    {...baseProps}
                  >
                    {/* Add inner group with inverse scale to maintain consistent visual size */}
                    <g transform={`scale(${1/scale})`}>
                      {/* Note icon with yellow background and clear border */}
                      <rect 
                        x={-10} 
                        y={-10} 
                        width={20} 
                        height={20}
                        fill="#ffff00" /* Bright yellow background */
                        stroke={markerColor}
                        strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                        rx={4}
                      />
                      <text 
                        fontSize={12} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#ff0000" /* Red text */
                        fontWeight="bold"
                        style={{ 
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      >N</text>
                      {shouldShowMarkerLabel(marker, isSelected) && marker.text_content && (
                        <foreignObject 
                          x={10} 
                          y={-10} 
                          width={150} 
                          height={60}
                        >
                          <div 
                            className="bg-yellow-200 p-1 rounded shadow-sm border border-yellow-500 text-red-600 text-xs overflow-hidden"
                            style={{
                              maxWidth: '150px',
                              maxHeight: '60px',
                              textOverflow: 'ellipsis',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              msUserSelect: 'none',
                              pointerEvents: 'none'
                            }}
                          >
                            {marker.text_content?.substring(0, 100)}
                            {marker.text_content?.length > 100 && '...'}
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  </g>
                );

              default:
                return null;
            }
          })}
        </svg>
      </div>
      
      {/* We removed the zoom buttons and test panel as they were causing issues */}
      
      {/* Page Controls */}
      {floorplan.page_count > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white bg-opacity-80 px-4 py-2 rounded shadow">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 disabled:opacity-50 rounded"
          >
            Prev
          </button>
          <span>Page {currentPage} of {floorplan.page_count}</span>
          <button
            onClick={() => onPageChange(Math.min(floorplan.page_count, currentPage + 1))}
            disabled={currentPage === floorplan.page_count}
            className="px-3 py-1 bg-gray-200 disabled:opacity-50 rounded"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Dialogs and overlay components */}
      {isLayerManagerOpen && (
        <LayerManager 
          floorplanId={floorplan.id}
          layers={layers}
          activeLayer={activeLayer}
          onSetActiveLayer={setActiveLayer}
          onClose={() => setIsLayerManagerOpen(false)}
        />
      )}
      
      {isCalibrationDialogOpen && (
        <CalibrationDialog 
          calibrationPoints={calibrationPoints}
          onSave={(data) => {
            saveCalibrationMutation.mutate({
              floorplan_id: floorplan.id,
              page: currentPage,
              start_x: calibrationPoints.start?.x,
              start_y: calibrationPoints.start?.y,
              end_x: calibrationPoints.end?.x,
              end_y: calibrationPoints.end?.y,
              real_world_distance: data.distance,
              pdf_distance: Math.sqrt(
                Math.pow((calibrationPoints.end?.x || 0) - (calibrationPoints.start?.x || 0), 2) +
                Math.pow((calibrationPoints.end?.y || 0) - (calibrationPoints.start?.y || 0), 2)
              ),
              unit: data.unit
            });
            setIsCalibrationDialogOpen(false);
          }}
          onClose={() => {
            setIsCalibrationDialogOpen(false);
            setCalibrationStep('start');
          }}
          calibrationStep={calibrationStep}
          setCalibrationStep={(step) => setCalibrationStep(step)}
        />
      )}
      
      {isEquipmentFormOpen && tempMarker && (
        <EquipmentFormDialog
          isOpen={isEquipmentFormOpen}
          markerType={tempMarker.marker_type || ''}
          projectId={floorplan.project_id}
          position={{ 
            x: tempMarker.position_x || 0, 
            y: tempMarker.position_y || 0 
          }}
          onEquipmentCreated={(equipmentId, equipmentLabel) => {
            // Update the temporary marker with equipment details and save
            if (tempMarker) {
              const updatedMarker = {
                ...tempMarker,
                equipment_id: equipmentId,
                label: equipmentLabel
              };
              addMarkerMutation.mutate(updatedMarker);
              
              // Removed toast notification per user request
              console.log(`Added ${tempMarker.marker_type} marker with equipment configuration`);
            }
            setIsEquipmentFormOpen(false);
            setTempMarker(null);
          }}
          onClose={() => {
            setIsEquipmentFormOpen(false);
            setTempMarker(null);
          }}
        />
      )}
      {isEquipmentFormOpen && selectedMarker && !tempMarker && (
        <EquipmentFormDialog
          isOpen={isEquipmentFormOpen}
          markerType={selectedMarker.marker_type}
          projectId={floorplan.project_id}
          position={{ 
            x: selectedMarker.position_x, 
            y: selectedMarker.position_y 
          }}
          onEquipmentCreated={(equipmentId, equipmentLabel) => {
            // Update the selected marker with new equipment details
            const updatedMarker = {
              ...selectedMarker,
              equipment_id: equipmentId,
              label: equipmentLabel
            };
            updateMarkerMutation.mutate(updatedMarker);
            setIsEquipmentFormOpen(false);
          }}
          onClose={() => setIsEquipmentFormOpen(false)}
        />
      )}
      
      {/* Context Menu */}
      {contextMenuOpen && selectedMarker && (
        <div 
          className="fixed z-50" 
          style={{ 
            left: `${contextMenuPosition.x}px`, 
            top: `${contextMenuPosition.y}px` 
          }}
        >
          <ContextMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
            <ContextMenuContent className="w-64">
              <ContextMenuItem
                onClick={() => {
                  // Duplicate the selected marker with a slight offset
                  duplicateMarkerMutation.mutate({
                    ...selectedMarker,
                    id: undefined, // Remove ID so a new one is generated
                    position_x: selectedMarker.position_x + 20,
                    position_y: selectedMarker.position_y + 20,
                  });
                  setContextMenuOpen(false);
                  // Removed toast notification per user request
                  console.log('Marker duplicated');
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </ContextMenuItem>
              
              <ContextMenuItem
                onClick={() => {
                  // Delete the selected marker
                  deleteMarkerMutation.mutate(selectedMarker.id);
                  setSelectedMarker(null);
                  setContextMenuOpen(false);
                  // Removed toast notification per user request
                  console.log('Marker deleted');
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
              
              <ContextMenuSeparator />
              
              <ContextMenuItem
                onClick={() => {
                  // Open the marker properties dialog
                  setIsEquipmentFormOpen(true);
                  setContextMenuOpen(false);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Properties
              </ContextMenuItem>
              
              {/* Only show camera settings option for camera markers */}
              {selectedMarker && selectedMarker.marker_type === 'camera' && (
                <ContextMenuItem
                  onClick={() => {
                    // Open the camera settings dialog
                    setIsCameraEditDialogOpen(true);
                    setContextMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    Camera Settings
                  </div>
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      )}
      
      {/* Camera Settings Edit Dialog */}
      {selectedMarker && selectedMarker.marker_type === 'camera' && (
        <CameraMarkerEditDialog
          open={isCameraEditDialogOpen}
          onOpenChange={setIsCameraEditDialogOpen}
          marker={selectedMarker}
          onUpdate={(updatedData) => {
            // Update the camera marker with new settings
            const updatedMarker = {
              ...selectedMarker,
              label: updatedData.label,
              // Use spread for additional attributes that might not be in MarkerData type
              ...(updatedData.fov !== undefined ? { fov: updatedData.fov } : {}),
              ...(updatedData.range !== undefined ? { range: updatedData.range } : {}),
              ...(updatedData.rotation !== undefined ? { rotation: updatedData.rotation } : {})
            };
            updateMarkerMutation.mutate(updatedMarker);
            
            // Close the dialog
            setIsCameraEditDialogOpen(false);
            
            // Show feedback
            toast({
              title: "Camera Updated",
              description: "Camera settings have been updated successfully.",
              duration: 3000
            });
          }}
        />
      )}
    </div>
  );
};