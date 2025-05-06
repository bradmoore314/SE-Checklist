import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Layers, ZoomIn, ZoomOut, CheckSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationTool } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';
import { LayerManager } from './LayerManager';
import EquipmentFormDialog from './EquipmentFormDialog';

// Ensure PDF.js worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
  showAllLabels?: boolean;
  onMarkersUpdated?: () => void;
}

export const EnhancedFloorplanViewer = ({
  floorplan,
  currentPage,
  toolMode,
  layers,
  onPageChange,
  showAllLabels = false,
  onMarkersUpdated
}: EnhancedFloorplanViewerProps) => {
  // Hooks and refs
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgLayerRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [viewportDimensions, setViewportDimensions] = useState({width: 0, height: 0});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [pdfToViewportScale, setPdfToViewportScale] = useState<number>(1);
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingMarker, setIsDraggingMarker] = useState<boolean>(false);
  const [isResizingMarker, setIsResizingMarker] = useState<boolean>(false);
  const [markerDragOffset, setMarkerDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Convert screen coordinates to PDF space coordinates
  const screenToPdfCoordinates = (screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    // Adjust for container position and current translation
    const containerX = screenX - rect.left - translateX;
    const containerY = screenY - rect.top - translateY;
    
    // Convert to PDF coordinates by dividing by the scale factor
    return {
      x: containerX / pdfToViewportScale,
      y: containerY / pdfToViewportScale
    };
  };

  // DEFINE RENDER PAGE FUNCTION FIRST
  const renderPage = async (pageNum: number) => {
    if (!pdfDocument || !canvasRef.current || !svgLayerRef.current || pageNum < 1 || pageNum > pdfDocument.numPages) {
      return;
    }

    setIsLoading(true);
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      
      const viewport = page.getViewport({ scale: scale });
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
      
      // Calculate scale from PDF points to viewport pixels
      const scaleFactor = viewport.width / page.getViewport({ scale: 1 }).width;
      setPdfToViewportScale(scaleFactor);
      
      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      setIsLoading(false);
    } catch (error) {
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

  // Show autosave feedback
  const showAutoSaveFeedback = () => {
    toast({
      title: "Changes saved",
      description: "All changes automatically saved to floorplan",
      duration: 2000
    });
  };

  // Handle marker clicks
  const handleMarkerClick = (marker: MarkerData) => {
    if (toolMode === 'select') {
      setSelectedMarker(prevMarker => 
        prevMarker?.id === marker.id ? null : marker
      );
    }
  };
  
  // Start dragging a marker
  const startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
    if (toolMode !== 'select') return;
    
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate the offset between mouse position and marker position
    const offsetX = (e.clientX - rect.left - translateX) - (marker.position_x * pdfToViewportScale);
    const offsetY = (e.clientY - rect.top - translateY) - (marker.position_y * pdfToViewportScale);
    
    setMarkerDragOffset({ x: offsetX, y: offsetY });
    setSelectedMarker(marker);
    setIsDraggingMarker(true);
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
      toast({
        title: 'Calibration Saved',
        description: 'The floorplan has been calibrated successfully.',
        duration: 3000
      });
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
      toast({
        title: 'Error Loading PDF',
        description: 'Could not load the floorplan PDF. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
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
    const handleMouseWheel = (e: WheelEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    // Prevent default browser zoom on trackpad/wheel to avoid competing behaviors
    window.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleMouseWheel);
    };
  }, [scale, translateX, translateY]);

  // Keyboard handler for marker operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we have a selected marker
      if (selectedMarker) {
        // Delete marker with Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteMarkerMutation.mutate(selectedMarker.id);
          setSelectedMarker(null);
          toast({
            title: 'Marker Deleted',
            description: 'Marker has been removed from the floorplan',
            duration: 2000,
          });
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
          toast({
            title: 'Marker Duplicated',
            description: 'Created a copy of the selected marker',
            duration: 2000,
          });
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
        toast({
          title: 'Zoom Reset',
          description: 'Restored default view',
          duration: 1000,
        });
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
        const pdfCoords = screenToPdfCoordinates(x, y);
        
        // Create temporary marker based on tool mode
        const newMarker: Partial<MarkerData> = {
          floorplan_id: floorplan.id,
          unique_id: uuidv4(),
          page: currentPage,
          marker_type: toolMode,
          position_x: pdfCoords.x,
          position_y: pdfCoords.y,
          version: 1,
          layer_id: activeLayer?.id
        };
        
        // For shapes that need dragging to size them
        if (['rectangle', 'ellipse', 'line'].includes(toolMode)) {
          setIsAddingMarker(true);
          setTempMarker(newMarker);
        } else if (toolMode === 'polyline' || toolMode === 'polygon') {
          // Start collecting points
          setIsDrawing(true);
          setDrawingPoints([{ x: pdfCoords.x, y: pdfCoords.y }]);
        } else if (['access_point', 'camera', 'elevator', 'intercom'].includes(toolMode)) {
          // For equipment markers that need configuration
          setTempMarker(newMarker);
          setIsEquipmentFormOpen(true);
        } else {
          // For other point markers that don't need sizing or configuration
          addMarkerMutation.mutate(newMarker);
          toast({
            title: 'Marker Added',
            description: `Added ${toolMode} marker to floorplan`,
            duration: 2000
          });
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
    } else if (isDraggingMarker && selectedMarker) {
      // Moving a selected marker
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate where the marker should be, accounting for the offset
      const newX = (e.clientX - rect.left - translateX - markerDragOffset.x) / pdfToViewportScale;
      const newY = (e.clientY - rect.top - translateY - markerDragOffset.y) / pdfToViewportScale;
      
      // Update local state for smooth visual feedback
      setSelectedMarker(prev => {
        if (!prev) return null;
        return {
          ...prev,
          position_x: newX,
          position_y: newY
        };
      });
    } else if (isResizingMarker && selectedMarker) {
      // Resizing a selected marker
      const pdfCoords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Calculate new dimensions based on marker type
      setSelectedMarker(prev => {
        if (!prev) return null;
        
        const newProperties: Partial<MarkerData> = {};
        
        // For markers with width/height properties
        if (['rectangle', 'ellipse', 'image'].includes(prev.marker_type)) {
          newProperties.width = Math.abs(pdfCoords.x - prev.position_x);
          newProperties.height = Math.abs(pdfCoords.y - prev.position_y);
        }
        
        // For line markers
        if (prev.marker_type === 'line') {
          newProperties.end_x = pdfCoords.x;
          newProperties.end_y = pdfCoords.y;
        }
        
        return {
          ...prev,
          ...newProperties
        };
      });
    } else if (isAddingMarker && tempMarker) {
      // Sizing a shape marker
      const pdfCoords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      setTempMarker(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          end_x: pdfCoords.x,
          end_y: pdfCoords.y,
          width: Math.abs(pdfCoords.x - (prev.position_x || 0)),
          height: Math.abs(pdfCoords.y - (prev.position_y || 0))
        };
      });
    } else if (isDrawing && (toolMode === 'polyline' || toolMode === 'polygon')) {
      // Update preview for polyline/polygon
      const pdfCoords = screenToPdfCoordinates(e.clientX, e.clientY);
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      
      // Only update if mouse moved significantly (avoid excessive updates)
      const distance = Math.sqrt(
        Math.pow(pdfCoords.x - lastPoint.x, 2) + 
        Math.pow(pdfCoords.y - lastPoint.y, 2)
      );
      
      if (distance > 5 / pdfToViewportScale) { // 5px in screen space
        setDrawingPoints([...drawingPoints.slice(0, -1), { x: pdfCoords.x, y: pdfCoords.y }]);
      }
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isAddingMarker && tempMarker) {
      // Finalize shape marker
      const pdfCoords = screenToPdfCoordinates(e.clientX, e.clientY);
      
      // Calculate width/height/end points
      const width = Math.abs(pdfCoords.x - (tempMarker.position_x || 0));
      const height = Math.abs(pdfCoords.y - (tempMarker.position_y || 0));
      
      // Only add if the shape has some size
      if (width > 5 / pdfToViewportScale || height > 5 / pdfToViewportScale) {
        const finalMarker = {
          ...tempMarker,
          end_x: pdfCoords.x,
          end_y: pdfCoords.y,
          width,
          height,
          color: activeLayer?.color || '#ff0000',
          fill_color: activeLayer?.color ? `${activeLayer.color}80` : '#ff000080', // Add 50% opacity
          opacity: 0.8,
          line_width: 2
        };
        
        addMarkerMutation.mutate(finalMarker);
        
        toast({
          title: 'Shape Added',
          description: `Added ${toolMode} to floorplan`,
          duration: 2000
        });
      }
      
      setIsAddingMarker(false);
      setTempMarker(null);
    } else if (isDraggingMarker && selectedMarker) {
      // Save the new marker position
      updateMarkerMutation.mutate(selectedMarker);
      setIsDraggingMarker(false);
      showAutoSaveFeedback();
    } else if (isResizingMarker && selectedMarker) {
      // Save the resized marker
      updateMarkerMutation.mutate(selectedMarker);
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
        const finalMarker = {
          floorplan_id: floorplan.id,
          unique_id: uuidv4(),
          page: currentPage,
          marker_type: toolMode,
          position_x: drawingPoints[0].x,
          position_y: drawingPoints[0].y,
          points: drawingPoints,
          color: activeLayer?.color || '#ff0000',
          line_width: 2,
          opacity: 0.8,
          version: 1,
          layer_id: activeLayer?.id
        };
        
        addMarkerMutation.mutate(finalMarker);
        
        toast({
          title: `${toolMode === 'polyline' ? 'Polyline' : 'Polygon'} Added`,
          description: `Added ${toolMode} to floorplan`,
          duration: 2000
        });
      }
      
      setIsDrawing(false);
      setDrawingPoints([]);
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left - translateX;
    const mouseY = e.clientY - rect.top - translateY;
    
    // Calculate new scale
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, scale * delta));
    
    // Calculate new translate to zoom toward mouse position
    const scaleRatio = newScale / scale;
    const newTranslateX = translateX + mouseX - mouseX * scaleRatio;
    const newTranslateY = translateY + mouseY - mouseY * scaleRatio;
    
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
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
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
        >
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
            
            // Base classnames and props
            const baseClassName = `marker-group cursor-pointer ${isSelected ? 'selected-marker' : ''}`;
            const baseProps = {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              },
              onMouseDown: toolMode === 'select' ? 
                (e: React.MouseEvent) => {
                  if (e.button === 0) { // Left click
                    e.stopPropagation();
                    startMarkerDrag(e, marker);
                  }
                } : undefined
            };
            
            // Render different marker types
            switch (marker.marker_type) {
              case 'access_point':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <circle 
                      r="12" 
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    <text 
                      fontSize="14" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#FFFFFF"
                    >AP</text>
                    {(isSelected || showAllLabels) && marker.label && (
                      <text 
                        fontSize="11" 
                        y="24" 
                        textAnchor="middle" 
                        fill={markerColor}
                        stroke="#FFFFFF" 
                        strokeWidth="0.5"
                        paintOrder="stroke"
                      >{marker.label}</text>
                    )}
                  </g>
                );
              
              case 'camera':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <rect 
                      x="-10" 
                      y="-10" 
                      width="20" 
                      height="20"
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                      rx="2"
                    />
                    <text 
                      fontSize="12" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#FFFFFF"
                    >C</text>
                    {(isSelected || showAllLabels) && marker.label && (
                      <text 
                        fontSize="11" 
                        y="24" 
                        textAnchor="middle" 
                        fill={markerColor}
                        stroke="#FFFFFF" 
                        strokeWidth="0.5"
                        paintOrder="stroke"
                      >{marker.label}</text>
                    )}
                  </g>
                );
              
              case 'rectangle':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <rect 
                      x="0" 
                      y="0" 
                      width={marker.width! * pdfToViewportScale} 
                      height={marker.height! * pdfToViewportScale}
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <>
                        {/* Resize handle - bottom right corner */}
                        <circle 
                          cx={marker.width! * pdfToViewportScale} 
                          cy={marker.height! * pdfToViewportScale} 
                          r="6" 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth="1"
                          className="cursor-nwse-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerResize(e, marker);
                          }}
                        />
                      </>
                    )}
                  </g>
                );
                
              case 'ellipse':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <ellipse 
                      cx={(marker.width! * pdfToViewportScale) / 2} 
                      cy={(marker.height! * pdfToViewportScale) / 2}
                      rx={(marker.width! * pdfToViewportScale) / 2} 
                      ry={(marker.height! * pdfToViewportScale) / 2}
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <>
                        {/* Resize handle - bottom right corner */}
                        <circle 
                          cx={marker.width! * pdfToViewportScale} 
                          cy={marker.height! * pdfToViewportScale} 
                          r="6" 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth="1"
                          className="cursor-nwse-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerResize(e, marker);
                          }}
                        />
                      </>
                    )}
                  </g>
                );
                
              case 'line':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    {...baseProps}
                  >
                    <line 
                      x1={marker.position_x * pdfToViewportScale} 
                      y1={marker.position_y * pdfToViewportScale}
                      x2={marker.end_x! * pdfToViewportScale} 
                      y2={marker.end_y! * pdfToViewportScale}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    {isSelected && toolMode === 'select' && (
                      <>
                        {/* Start point handle */}
                        <circle 
                          cx={marker.position_x * pdfToViewportScale} 
                          cy={marker.position_y * pdfToViewportScale} 
                          r="6" 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth="1"
                          className="cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerDrag(e, marker);
                          }}
                        />
                        {/* End point handle (resize) */}
                        <circle 
                          cx={marker.end_x! * pdfToViewportScale} 
                          cy={marker.end_y! * pdfToViewportScale} 
                          r="6" 
                          fill="#ffffff" 
                          stroke="#000000" 
                          strokeWidth="1"
                          className="cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startMarkerResize(e, marker);
                          }}
                        />
                      </>
                    )}
                  </g>
                );

              case 'note':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    {/* Note icon */}
                    <rect 
                      x="-10" 
                      y="-10" 
                      width="20" 
                      height="20"
                      fill="#ffff80"
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                      rx="4"
                    />
                    <text 
                      fontSize="12" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#000000"
                    >N</text>
                    {(isSelected || showAllLabels) && marker.text_content && (
                      <foreignObject 
                        x="10" 
                        y="-10" 
                        width="150" 
                        height="60"
                      >
                        <div 
                          className="bg-yellow-100 p-1 rounded shadow-sm border border-yellow-400 text-xs overflow-hidden"
                          style={{
                            maxWidth: '150px',
                            maxHeight: '60px',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {marker.text_content.substring(0, 100)}
                          {marker.text_content.length > 100 && '...'}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );

              default:
                return null;
            }
          })}
        </svg>
      </div>
      
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white bg-opacity-80 p-2 rounded shadow">
        <button 
          onClick={() => {
            const newScale = Math.min(10, scale * 1.2);
            setScale(newScale);
            renderPage(currentPage);
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={() => {
            const newScale = Math.max(0.1, scale * 0.8);
            setScale(newScale);
            renderPage(currentPage);
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={() => {
            setScale(1);
            setTranslateX(0);
            setTranslateY(0);
            renderPage(currentPage);
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Reset View"
        >
          <CheckSquare size={20} />
        </button>
        <button
          onClick={() => setIsLayerManagerOpen(true)}
          className="p-2 rounded hover:bg-gray-200"
          title="Manage Layers"
        >
          <Layers size={20} />
        </button>
      </div>
      
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
              
              toast({
                title: 'Equipment Added',
                description: `Added ${tempMarker.marker_type} marker with equipment configuration`,
                duration: 2000
              });
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
    </div>
  );
};