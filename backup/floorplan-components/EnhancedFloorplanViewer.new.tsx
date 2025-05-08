import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Layers } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationTool } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';
import EquipmentFormDialog from './EquipmentFormDialog';
import { LayerManager } from './LayerManager';

// Ensure PDF.js worker is configured with matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
  showAllLabels = false
}: EnhancedFloorplanViewerProps) => {
  // Hooks for refs, state, toast, queries
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgLayerRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Define the exportAsPng function before it's used in useEffect
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

  // Query for fetching markers
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

  // Query for fetching calibration data
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
      const res = await apiRequest('POST', `/api/floorplans/${floorplan.id}/markers`, marker);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
    }
  });

  const updateMarkerMutation = useMutation({
    mutationFn: async (marker: MarkerData) => {
      const res = await apiRequest('PATCH', `/api/floorplans/${floorplan.id}/markers/${marker.id}`, marker);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
    }
  });

  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      await apiRequest('DELETE', `/api/floorplans/${floorplan.id}/markers/${markerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
    }
  });

  const duplicateMarkerMutation = useMutation({
    mutationFn: async (marker: Partial<MarkerData>) => {
      const res = await apiRequest('POST', `/api/floorplans/${floorplan.id}/markers/duplicate`, marker);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplan.id}/markers`, currentPage],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${floorplan.project_id}/marker-stats`],
      });
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
  }, [floorplan, toast]);

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
  }, [pdfDocument, currentPage, renderPage]);

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
  }, [scale, translateX, translateY, containerRef.current]); // Dependencies for pan/zoom

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
  }, [selectedMarker, deleteMarkerMutation, duplicateMarkerMutation, scale, currentPage, exportAsPng]);

  // Define PDF rendering function
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
        } else {
          // For point markers that don't need sizing
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
    } else if (isDrawing && toolMode === 'polyline' || toolMode === 'polygon') {
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
  
  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(prevMarker => 
      prevMarker?.id === marker.id ? null : marker
    );
  };
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        >
          {/* Render vector markers based on their type */}
          {markers.map((marker) => {
            // If marker is on a hidden layer, don't render
            const markerLayer = layers.find(l => l.id === marker.layer_id);
            if (markerLayer && !markerLayer.visible) return null;
            
            // Apply layer color if marker doesn't have its own
            const markerColor = marker.color || (markerLayer ? markerLayer.color : '#ff0000');
            const fillColor = marker.fill_color || (markerColor + '80'); // Add 50% opacity
            
            // Apply styling based on selection state
            const isSelected = selectedMarker?.id === marker.id;
            const strokeWidth = marker.line_width || 2;
            const selectedStrokeWidth = strokeWidth * 1.5;
            
            // Base classnames and props for all markers
            const baseClassName = `marker-group cursor-pointer ${isSelected ? 'selected-marker' : ''}`;
            const baseProps = {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleMarkerClick(marker);
              }
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
                
              case 'elevator':
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
                      y="-15" 
                      width="20" 
                      height="30"
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    <text 
                      fontSize="12" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#FFFFFF"
                    >EL</text>
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
                
              case 'intercom':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <polygon 
                      points="0,-15 12,10 -12,10"
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    <text 
                      fontSize="11" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#FFFFFF"
                      y="-2"
                    >IC</text>
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
                
              case 'note':
                return (
                  <g 
                    key={marker.id} 
                    className={baseClassName}
                    data-marker-id={marker.id}
                    transform={`translate(${marker.position_x * pdfToViewportScale},${marker.position_y * pdfToViewportScale})`}
                    {...baseProps}
                  >
                    <circle 
                      r="15" 
                      fill={fillColor}
                      stroke={markerColor}
                      strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    />
                    <text 
                      fontSize="18" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#FFFFFF"
                      fontWeight="bold"
                    >!</text>
                    {(isSelected || showAllLabels) && marker.text_content && (
                      <text 
                        fontSize="11" 
                        y="24" 
                        textAnchor="middle" 
                        fill={markerColor}
                        stroke="#FFFFFF" 
                        strokeWidth="0.5"
                        paintOrder="stroke"
                      >{marker.text_content.substring(0, 20)}{marker.text_content.length > 20 ? '...' : ''}</text>
                    )}
                  </g>
                );
                
              case 'rectangle':
                if (!marker.width || !marker.height) return null;
                return (
                  <rect
                    key={marker.id}
                    className={baseClassName}
                    data-marker-id={marker.id}
                    x={marker.position_x * pdfToViewportScale}
                    y={marker.position_y * pdfToViewportScale}
                    width={marker.width * pdfToViewportScale}
                    height={marker.height * pdfToViewportScale}
                    fill={fillColor}
                    fillOpacity={marker.opacity || 0.5}
                    stroke={markerColor}
                    strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    {...baseProps}
                  />
                );
                
              case 'ellipse':
                if (!marker.width || !marker.height) return null;
                return (
                  <ellipse
                    key={marker.id}
                    className={baseClassName}
                    data-marker-id={marker.id}
                    cx={(marker.position_x + (marker.width / 2)) * pdfToViewportScale}
                    cy={(marker.position_y + (marker.height / 2)) * pdfToViewportScale}
                    rx={(marker.width / 2) * pdfToViewportScale}
                    ry={(marker.height / 2) * pdfToViewportScale}
                    fill={fillColor}
                    fillOpacity={marker.opacity || 0.5}
                    stroke={markerColor}
                    strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    {...baseProps}
                  />
                );
                
              case 'line':
                if (!marker.end_x || !marker.end_y) return null;
                return (
                  <line
                    key={marker.id}
                    className={baseClassName}
                    data-marker-id={marker.id}
                    x1={marker.position_x * pdfToViewportScale}
                    y1={marker.position_y * pdfToViewportScale}
                    x2={marker.end_x * pdfToViewportScale}
                    y2={marker.end_y * pdfToViewportScale}
                    stroke={markerColor}
                    strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    {...baseProps}
                  />
                );
                
              case 'polyline':
                if (!marker.points || marker.points.length < 2) return null;
                
                const polylinePoints = marker.points
                  .map(p => `${p.x * pdfToViewportScale},${p.y * pdfToViewportScale}`)
                  .join(' ');
                  
                return (
                  <polyline
                    key={marker.id}
                    className={baseClassName}
                    data-marker-id={marker.id}
                    points={polylinePoints}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    {...baseProps}
                  />
                );
                
              case 'polygon':
                if (!marker.points || marker.points.length < 3) return null;
                
                const polygonPoints = marker.points
                  .map(p => `${p.x * pdfToViewportScale},${p.y * pdfToViewportScale}`)
                  .join(' ');
                  
                return (
                  <polygon
                    key={marker.id}
                    className={baseClassName}
                    data-marker-id={marker.id}
                    points={polygonPoints}
                    fill={fillColor}
                    fillOpacity={marker.opacity || 0.5}
                    stroke={markerColor}
                    strokeWidth={isSelected ? selectedStrokeWidth : strokeWidth}
                    {...baseProps}
                  />
                );
                
              default:
                return null;
            }
          })}
          
          {/* Preview for temporary markers being created */}
          {isAddingMarker && tempMarker && (
            <>
              {tempMarker.marker_type === 'rectangle' && tempMarker.end_x && tempMarker.end_y && (
                <rect
                  x={Math.min(tempMarker.position_x || 0, tempMarker.end_x) * pdfToViewportScale}
                  y={Math.min(tempMarker.position_y || 0, tempMarker.end_y) * pdfToViewportScale}
                  width={Math.abs((tempMarker.end_x - (tempMarker.position_x || 0)) * pdfToViewportScale)}
                  height={Math.abs((tempMarker.end_y - (tempMarker.position_y || 0)) * pdfToViewportScale)}
                  fill={activeLayer?.color ? `${activeLayer.color}40` : '#ff000040'}
                  stroke={activeLayer?.color || '#ff0000'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              
              {tempMarker.marker_type === 'ellipse' && tempMarker.end_x && tempMarker.end_y && (
                <ellipse
                  cx={((tempMarker.position_x || 0) + (tempMarker.end_x - (tempMarker.position_x || 0)) / 2) * pdfToViewportScale}
                  cy={((tempMarker.position_y || 0) + (tempMarker.end_y - (tempMarker.position_y || 0)) / 2) * pdfToViewportScale}
                  rx={Math.abs((tempMarker.end_x - (tempMarker.position_x || 0)) / 2) * pdfToViewportScale}
                  ry={Math.abs((tempMarker.end_y - (tempMarker.position_y || 0)) / 2) * pdfToViewportScale}
                  fill={activeLayer?.color ? `${activeLayer.color}40` : '#ff000040'}
                  stroke={activeLayer?.color || '#ff0000'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              
              {tempMarker.marker_type === 'line' && tempMarker.end_x && tempMarker.end_y && (
                <line
                  x1={(tempMarker.position_x || 0) * pdfToViewportScale}
                  y1={(tempMarker.position_y || 0) * pdfToViewportScale}
                  x2={tempMarker.end_x * pdfToViewportScale}
                  y2={tempMarker.end_y * pdfToViewportScale}
                  stroke={activeLayer?.color || '#ff0000'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </>
          )}
          
          {/* Preview for polyline/polygon creation */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {toolMode === 'polyline' && (
                <polyline
                  points={drawingPoints
                    .map(p => `${p.x * pdfToViewportScale},${p.y * pdfToViewportScale}`)
                    .join(' ')}
                  fill="none"
                  stroke={activeLayer?.color || '#ff0000'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              
              {toolMode === 'polygon' && (
                <polygon
                  points={drawingPoints
                    .map(p => `${p.x * pdfToViewportScale},${p.y * pdfToViewportScale}`)
                    .join(' ')}
                  fill={activeLayer?.color ? `${activeLayer.color}40` : '#ff000040'}
                  stroke={activeLayer?.color || '#ff0000'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Control points */}
              {drawingPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x * pdfToViewportScale}
                  cy={point.y * pdfToViewportScale}
                  r={4}
                  fill={index === 0 ? 'green' : 'blue'}
                  stroke="white"
                  strokeWidth={1}
                />
              ))}
              
              {/* Instruction text */}
              <text
                x={10}
                y={viewportDimensions.height - 10}
                fontSize={12}
                fill="black"
                stroke="white"
                strokeWidth={0.3}
                paintOrder="stroke"
              >
                Double-click to complete {toolMode === 'polyline' ? 'polyline' : 'polygon'}
              </text>
            </>
          )}
          
          {/* Show calibration points if calibrating */}
          {calibrationStep === 'start' && calibrationPoints.start && (
            <circle
              cx={calibrationPoints.start.x * pdfToViewportScale}
              cy={calibrationPoints.start.y * pdfToViewportScale}
              r={5}
              fill="green"
              stroke="white"
              strokeWidth={1}
            />
          )}
          
          {calibrationStep === 'end' && calibrationPoints.start && calibrationPoints.end && (
            <>
              <circle
                cx={calibrationPoints.start.x * pdfToViewportScale}
                cy={calibrationPoints.start.y * pdfToViewportScale}
                r={5}
                fill="green"
                stroke="white"
                strokeWidth={1}
              />
              <circle
                cx={calibrationPoints.end.x * pdfToViewportScale}
                cy={calibrationPoints.end.y * pdfToViewportScale}
                r={5}
                fill="red"
                stroke="white"
                strokeWidth={1}
              />
              <line
                x1={calibrationPoints.start.x * pdfToViewportScale}
                y1={calibrationPoints.start.y * pdfToViewportScale}
                x2={calibrationPoints.end.x * pdfToViewportScale}
                y2={calibrationPoints.end.y * pdfToViewportScale}
                stroke="blue"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            </>
          )}
        </svg>
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
                setIsCalibrationDialogOpen(true);
                setCalibrationStep('start');
                setCalibrationPoints({});
                toast({
                  title: 'Calibration Mode',
                  description: 'Click to set the starting point of your measurement',
                  duration: 3000,
                });
              }}
              title="Set Scale"
              className="scale-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 6H3"></path>
                <path d="M21 12H3"></path>
                <path d="M21 18H3"></path>
              </svg>
              <span>Set Scale</span>
            </button>
          </div>
        </div>
        
        {/* Layer Manager Toggle */}
        <div className="layer-controls mt-4">
          <button
            onClick={() => setIsLayerManagerOpen(true)}
            className="layer-button"
            title="Manage Layers"
          >
            <Layers size={16} />
            <span>Layers</span>
          </button>
        </div>
      </div>
      
      {/* Layer Opacity Slider */}
      <div className="layer-opacity-slider">
        <label htmlFor="layer-opacity" className="opacity-label">Layer Opacity</label>
        <input
          id="layer-opacity"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={layerOpacity}
          onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
          className="opacity-slider"
        />
      </div>
      
      {/* Page Navigation Controls */}
      {floorplan.page_count > 1 && (
        <div className="page-controls">
          <button
            onClick={() => {
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className="page-button"
          >
            &lt;
          </button>
          <span className="page-indicator">
            Page {currentPage} of {floorplan.page_count}
          </span>
          <button
            onClick={() => {
              if (currentPage < floorplan.page_count) {
                onPageChange(currentPage + 1);
              }
            }}
            disabled={currentPage === floorplan.page_count}
            className="page-button"
          >
            &gt;
          </button>
        </div>
      )}
      
      {/* Scale Information */}
      {calibrationData && (
        <div className="scale-info">
          <div className="scale-info-content">
            <span className="scale-value">
              1:{(calibrationData.real_world_distance / calibrationData.pdf_distance).toFixed(2)} {calibrationData.unit}
            </span>
          </div>
        </div>
      )}
      
      {/* Context Menu for selected marker */}
      {contextMenuOpen && selectedMarker && (
        <div 
          className="context-menu"
          style={{
            left: contextMenuPosition.x + translateX,
            top: contextMenuPosition.y + translateY
          }}
        >
          <button
            onClick={() => {
              // Delete the marker
              deleteMarkerMutation.mutate(selectedMarker.id);
              setSelectedMarker(null);
              setContextMenuOpen(false);
              toast({
                title: 'Marker Deleted',
                description: 'Marker has been removed from the floorplan',
                duration: 2000,
              });
            }}
          >
            Delete
          </button>
          <button
            onClick={() => {
              // Clone marker
              duplicateMarkerMutation.mutate({
                ...selectedMarker,
                id: undefined, // Remove ID so a new one is generated
                position_x: selectedMarker.position_x + 20, 
                position_y: selectedMarker.position_y + 20,
              });
              setContextMenuOpen(false);
              toast({
                title: 'Marker Duplicated',
                description: 'Created a copy of the selected marker',
                duration: 2000,
              });
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              // Edit marker properties
              setIsEquipmentFormOpen(true);
              setContextMenuOpen(false);
            }}
          >
            Properties
          </button>
          <button
            onClick={() => setContextMenuOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Calibration Dialog */}
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
      
      {/* Layer Manager Dialog */}
      {isLayerManagerOpen && (
        <LayerManager 
          floorplanId={floorplan.id}
          layers={layers}
          activeLayer={activeLayer}
          onSetActiveLayer={setActiveLayer}
          onClose={() => setIsLayerManagerOpen(false)}
        />
      )}
      
      {/* Equipment Form Dialog for editing marker properties */}
      {isEquipmentFormOpen && selectedMarker && (
        <EquipmentFormDialog
          marker={selectedMarker}
          onSave={(updatedMarker) => {
            updateMarkerMutation.mutate(updatedMarker);
            setIsEquipmentFormOpen(false);
            toast({
              title: 'Marker Updated',
              description: 'Marker properties have been updated',
              duration: 2000,
            });
          }}
          onClose={() => setIsEquipmentFormOpen(false)}
        />
      )}
    </div>
  );
};