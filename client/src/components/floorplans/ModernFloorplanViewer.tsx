import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, Download, MoveHorizontal, MousePointer, Camera, 
  Layers, Eye, EyeOff, ZoomIn, ZoomOut, Lock, Unlock, TextCursor, 
  Square, Circle, Minus
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AccessPointMarkerForm from './AccessPointMarkerForm';
import CameraMarkerForm from './CameraMarkerForm';
import { cn } from "@/lib/utils";

// Type definitions
type FloorplanViewerProps = {
  projectId: number;
  onMarkersUpdated?: () => void;
};

type Marker = {
  id: number;
  floorplan_id: number;
  page: number;
  marker_type: 'access_point' | 'camera';
  equipment_id: number;
  position_x: number;
  position_y: number;
  label: string | null;
  created_at: string;
  // Additional camera properties
  view_angle?: number; // Field of view angle in degrees
  view_direction?: number; // Direction angle in degrees (0-360)
  view_distance?: number; // View distance in arbitrary units
};

type Floorplan = {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string; // base64 encoded PDF
  page_count: number;
  created_at: string;
  updated_at: string;
};

// Drawing annotation types
type Annotation = {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text';
  points: { x: number, y: number }[];
  text?: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
};

// Layer configuration types
type LayerConfig = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  type: 'base' | 'access_points' | 'cameras' | 'annotations' | 'measurements';
};

const ModernFloorplanViewer: React.FC<FloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  // Core state
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newFloorplanName, setNewFloorplanName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Advanced state
  const [zoomLevel, setZoomLevel] = useState(100); // Percentage
  const [viewerMode, setViewerMode] = useState<
    'select' | 'pan' | 'add_access_point' | 'add_camera' | 
    'draw_line' | 'draw_rectangle' | 'draw_circle' | 'add_text' | 'measure'
  >('select');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [markerDialogOpen, setMarkerDialogOpen] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  const [markerType, setMarkerType] = useState<'access_point' | 'camera'>('access_point');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [markerSize, setMarkerSize] = useState<{[key: number]: {width: number, height: number}}>({});
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);

  // Layer management
  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'base', name: 'Floor Plan', visible: true, locked: true, type: 'base' },
    { id: 'access_points', name: 'Access Points', visible: true, locked: false, type: 'access_points' },
    { id: 'cameras', name: 'Cameras', visible: true, locked: false, type: 'cameras' },
    { id: 'annotations', name: 'Annotations', visible: true, locked: false, type: 'annotations' },
    { id: 'measurements', name: 'Measurements', visible: true, locked: false, type: 'measurements' },
  ]);

  // Drawing state
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number, y: number } | null>(null);
  const [strokeColor, setStrokeColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('#00000000'); // Transparent by default

  // Marker interaction state
  const [draggedMarker, setDraggedMarker] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [selectedMarkers, setSelectedMarkers] = useState<number[]>([]);
  
  // Equipment cache for performance
  const [equipmentCache, setEquipmentCache] = useState<{[key: string]: any}>({});

  // Fetch floorplans for this project
  const { data: floorplans = [], isLoading: isLoadingFloorplans } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      return await res.json();
    },
  });
  
  // Fetch markers for selected floorplan
  const { data: floorplanMarkers = [], isLoading: isLoadingMarkers } = useQuery<Marker[]>({
    queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'],
    queryFn: async () => {
      if (!selectedFloorplan) return [];
      const res = await apiRequest('GET', `/api/floorplans/${selectedFloorplan.id}/markers`);
      return await res.json();
    },
    enabled: !!selectedFloorplan?.id,
  });

  // Mutations
  const createMarkerMutation = useMutation({
    mutationFn: async (newMarker: Omit<Marker, 'id' | 'created_at'>) => {
      const res = await apiRequest('POST', '/api/floorplan-markers', newMarker);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      if (onMarkersUpdated) onMarkersUpdated();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create marker: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMarkerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Marker> }) => {
      const res = await apiRequest('PUT', `/api/floorplan-markers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      if (onMarkersUpdated) onMarkersUpdated();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update marker: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMarkerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/floorplan-markers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      if (onMarkersUpdated) onMarkersUpdated();
      setSelectedMarkers([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete marker: " + error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFloorplanMutation = useMutation({
    mutationFn: async (newFloorplan: {
      project_id: number;
      name: string;
      pdf_data: string;
    }) => {
      const res = await apiRequest('POST', '/api/floorplans', newFloorplan);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      setSelectedFloorplan(data);
      setNewFloorplanName('');
      setPdfFile(null);
      toast({
        title: "Success",
        description: "Floorplan uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to upload floorplan: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Effect to set markers from query data
  useEffect(() => {
    if (floorplanMarkers && floorplanMarkers.length > 0) {
      setMarkers(floorplanMarkers);
    } else {
      setMarkers([]);
    }
  }, [floorplanMarkers]);

  // Effect to update PDF blob URL when selected floorplan changes
  useEffect(() => {
    if (selectedFloorplan) {
      // Create blob URL for the PDF data
      const pdfBlob = new Blob([Buffer.from(selectedFloorplan.pdf_data, 'base64')], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(blobUrl);
      setCurrentPage(1);

      // Clean up previous blob URL if it exists
      return () => {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      };
    }
  }, [selectedFloorplan]);

  // Handle file input change for floorplan upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Upload a new floorplan
  const handleUploadFloorplan = async () => {
    if (!pdfFile || !newFloorplanName) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert the PDF to base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 part (remove the data:application/pdf;base64, prefix)
          const base64Data = reader.result.split(',')[1];
          
          // Call the mutation
          uploadFloorplanMutation.mutate({
            project_id: projectId,
            name: newFloorplanName,
            pdf_data: base64Data,
          });
        }
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to process the PDF file.",
        variant: "destructive",
      });
    }
  };

  // Handle click on the PDF container to add a marker
  const handlePdfContainerClick = (e: React.MouseEvent) => {
    if (!pdfContainerRef.current || !isAddingMarker) return;
    
    // Get container position and dimensions
    const rect = pdfContainerRef.current.getBoundingClientRect();
    
    // Calculate percentage position within the container
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Set the new marker position
    setNewMarkerPosition({ x, y });
    setMarkerDialogOpen(true);
  };

  // Handle marker drag start
  const handleDragStart = (e: React.MouseEvent, markerId: number) => {
    e.stopPropagation();
    
    if (!isLayerVisible('access_points') && !isLayerVisible('cameras')) {
      return;
    }
    
    if (viewerMode !== 'select') {
      return;
    }
    
    const element = document.getElementById(`marker-${markerId}`);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    
    // Calculate the offset between mouse position and marker center
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
    
    setDraggedMarker(markerId);
    
    // Control key for multi-select
    if (e.ctrlKey || e.metaKey) {
      setSelectedMarkers(prev => 
        prev.includes(markerId) 
          ? prev.filter(id => id !== markerId) 
          : [...prev, markerId]
      );
    } else if (!selectedMarkers.includes(markerId)) {
      setSelectedMarkers([markerId]);
    }
  };

  // Handle mouse move for marker dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedMarker !== null && pdfContainerRef.current) {
        const marker = markers.find(m => m.id === draggedMarker);
        if (!marker) return;
        
        const rect = pdfContainerRef.current.getBoundingClientRect();
        
        // Calculate new position (constrained to container)
        const newX = Math.max(0, Math.min(100, ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100));
        const newY = Math.max(0, Math.min(100, ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100));
        
        // Update the marker position in the local state
        const updatedMarkers = markers.map(m => 
          m.id === draggedMarker 
            ? { ...m, position_x: newX, position_y: newY } 
            : m
        );
        
        setMarkers(updatedMarkers);
      } else if (isPanning && panStart && pdfContainerRef.current) {
        // Handle panning logic
        const container = pdfContainerRef.current;
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        
        // Update scroll position
        container.scrollLeft -= dx;
        container.scrollTop -= dy;
        
        // Update pan start position
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = () => {
      if (draggedMarker !== null) {
        const marker = markers.find(m => m.id === draggedMarker);
        if (marker) {
          // Persist the position change to the server
          updateMarkerMutation.mutate({
            id: draggedMarker,
            data: { 
              position_x: marker.position_x,
              position_y: marker.position_y,
              floorplan_id: marker.floorplan_id,
              page: marker.page,
              marker_type: marker.marker_type,
              equipment_id: marker.equipment_id
            }
          });
        }
        
        // Reset the drag state
        setDraggedMarker(null);
      }
      
      // Reset panning state
      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
      }
      
      // Handle drawing completion
      if (isDrawing && currentAnnotation) {
        setAnnotations([...annotations, currentAnnotation]);
        setCurrentAnnotation(null);
        setIsDrawing(false);
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedMarker, dragOffset, markers, updateMarkerMutation, isPanning, panStart, isDrawing, currentAnnotation, annotations]);

  // Handle drawing tools
  const handleDrawingStart = (e: React.MouseEvent) => {
    if (!pdfContainerRef.current || !isDrawingMode() || !isLayerVisible('annotations')) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (viewerMode === 'add_text') {
      // For text, we just set the position and wait for input
      setTextPosition({ x, y });
      setTextInput('');
      // Open a text input dialog or focus a textarea
    } else {
      // For shapes, create initial annotation
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        type: viewerMode === 'draw_line' ? 'line' : viewerMode === 'draw_rectangle' ? 'rectangle' : 'circle',
        points: [{ x, y }],
        strokeColor,
        strokeWidth,
        fillColor: viewerMode === 'draw_line' ? undefined : fillColor
      };
      
      setCurrentAnnotation(newAnnotation);
      setIsDrawing(true);
    }
  };

  const handleDrawingMove = (e: React.MouseEvent) => {
    if (!pdfContainerRef.current || !isDrawing || !currentAnnotation) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update the annotation based on type
    if (currentAnnotation.type === 'line') {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [currentAnnotation.points[0], { x, y }]
      });
    } else if (currentAnnotation.type === 'rectangle' || currentAnnotation.type === 'circle') {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [currentAnnotation.points[0], { x, y }]
      });
    }
  };

  const handleDrawingEnd = () => {
    if (!isDrawing || !currentAnnotation) return;
    
    if (currentAnnotation.points.length >= 2) {
      // Add completed annotation to list
      setAnnotations([...annotations, currentAnnotation]);
    }
    
    setCurrentAnnotation(null);
    setIsDrawing(false);
  };

  const handleTextSubmit = (text: string) => {
    if (!textPosition) return;
    
    const newAnnotation: Annotation = {
      id: `text-${Date.now()}`,
      type: 'text',
      points: [textPosition],
      text,
      strokeColor,
      strokeWidth
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setTextPosition(null);
    setTextInput('');
  };

  const deleteSelectedAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  // Resize marker
  const resizeMarker = (markerId: number, increase: boolean) => {
    // Get current size or set default
    const currentSize = markerSize[markerId] || { width: 6, height: 6 };
    
    // Use more granular sizing with 20 steps between min and max
    // Min: 3, Max: 24
    // Step size: (24-3)/20 = 1.05
    const stepSize = 1.05;
    
    // Calculate new size
    const newWidth = Math.max(3, Math.min(24, increase 
      ? currentSize.width + stepSize 
      : currentSize.width - stepSize));
    const newHeight = Math.max(3, Math.min(24, increase 
      ? currentSize.height + stepSize 
      : currentSize.height - stepSize));
    
    // Update size in state (round to 2 decimal places for cleaner state)
    setMarkerSize({
      ...markerSize,
      [markerId]: { 
        width: Math.round(newWidth * 100) / 100, 
        height: Math.round(newHeight * 100) / 100 
      }
    });
  };

  // Duplicate marker
  const duplicateMarker = (marker: Marker) => {
    // Create new marker at a slightly offset position
    // Round to integer as the server expects integer values
    const newX = Math.round(Math.min(100, marker.position_x + 2));
    const newY = Math.round(Math.min(100, marker.position_y + 2));
    
    // Always set equipment_id to 0 to force creation of a new equipment item
    // This ensures that duplicating a marker also creates a new access point or camera
    const duplicateData = {
      floorplan_id: marker.floorplan_id,
      page: marker.page || 1,
      marker_type: marker.marker_type,
      equipment_id: 0, // Set to 0 to trigger creation of a new equipment item
      position_x: newX,
      position_y: newY,
      label: marker.label ? `${marker.label} (Copy)` : null
    };
    
    createMarkerMutation.mutate(duplicateData);
    
    // After duplicating, refresh the equipment list as well
    if (selectedFloorplan) {
      // Determine which equipment type to refresh based on marker type
      if (marker.marker_type === 'access_point') {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${selectedFloorplan.project_id}/access-points`] 
        });
      } else if (marker.marker_type === 'camera') {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${selectedFloorplan.project_id}/cameras`] 
        });
      }
    }
  };

  // Edit marker
  const editMarker = (marker: Marker) => {
    setNewMarkerPosition({ x: marker.position_x, y: marker.position_y });
    setMarkerType(marker.marker_type);
    setMarkerDialogOpen(true);
    
    // Pass the existing marker info
    (window as any).__currentEditingMarker = { 
      id: marker.id, 
      equipment_id: marker.equipment_id 
    };
  };

  // Delete selected markers
  const deleteSelectedMarkers = () => {
    if (selectedMarkers.length === 0) return;
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete ${selectedMarkers.length} marker(s)?`)) {
      // Delete each selected marker
      selectedMarkers.forEach(id => {
        deleteMarkerMutation.mutate(id);
      });
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible } 
        : layer
    ));
  };

  // Check if layer is visible
  const isLayerVisible = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId || l.type === layerId);
    return layer ? layer.visible : false;
  };

  // Toggle layer lock
  const toggleLayerLock = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked } 
        : layer
    ));
  };

  // Check if layer is locked
  const isLayerLocked = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId || l.type === layerId);
    return layer ? layer.locked : false;
  };

  // Toggle marker addition mode
  const toggleMarkerMode = (mode: 'select' | 'pan' | 'add_access_point' | 'add_camera' | 
    'draw_line' | 'draw_rectangle' | 'draw_circle' | 'add_text' | 'measure') => {
    
    setViewerMode(mode);
    setIsAddingMarker(mode === 'add_access_point' || mode === 'add_camera');
    
    if (mode === 'add_access_point' || mode === 'add_camera') {
      setMarkerType(mode === 'add_camera' ? 'camera' : 'access_point');
    }
    
    // Reset other states
    setSelectedMarkers([]);
    setIsDrawing(false);
    setCurrentAnnotation(null);
    setTextPosition(null);
  };

  // Check if current mode is a drawing mode
  const isDrawingMode = () => {
    return ['draw_line', 'draw_rectangle', 'draw_circle', 'add_text'].includes(viewerMode);
  };

  // Handle pan start
  const handlePanStart = (e: React.MouseEvent) => {
    if (viewerMode !== 'pan') return;
    
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  // Handle zoom control
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') {
      setZoomLevel(prev => Math.min(200, prev + 10));
    } else if (direction === 'out') {
      setZoomLevel(prev => Math.max(50, prev - 10));
    } else {
      setZoomLevel(100);
    }
  };

  // Handle mouse wheel for zooming
  const handleMouseWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoom('in');
      } else {
        handleZoom('out');
      }
    }
  };

  // Handle page navigation
  const navigateToPage = (page: number) => {
    if (!selectedFloorplan) return;
    
    if (page >= 1 && page <= selectedFloorplan.page_count) {
      setCurrentPage(page);
    }
  };

  // Extract number from location string (e.g., "Access Point 3" -> "3")
  const getMarkerNumber = (label: string | null) => {
    if (!label) return "";
    
    // Try to extract a number from the end of the label
    const match = label.match(/(\d+)$/);
    return match ? match[1] : "";
  };

  // Extract equipment data
  const loadEquipmentDetails = async (marker: Marker) => {
    const cacheKey = `${marker.marker_type}_${marker.equipment_id}`;
    
    // Return from cache if available
    if (equipmentCache[cacheKey]) {
      return equipmentCache[cacheKey];
    }
    
    try {
      // Fetch equipment details based on marker type
      const endpoint = marker.marker_type === 'access_point' 
        ? `/api/access-points/${marker.equipment_id}`
        : `/api/cameras/${marker.equipment_id}`;
        
      const response = await apiRequest('GET', endpoint);
      const data = await response.json();
      
      // Update cache
      setEquipmentCache(prev => ({
        ...prev,
        [cacheKey]: data
      }));
      
      return data;
    } catch (error) {
      console.error(`Error loading ${marker.marker_type} details:`, error);
      return null;
    }
  };

  // Render camera field of view
  const renderCameraFieldOfView = (marker: Marker) => {
    if (!isLayerVisible('cameras') || marker.marker_type !== 'camera') {
      return null;
    }
    
    // Default values if not set
    const viewAngle = marker.view_angle || 60; // 60 degree field of view
    const viewDirection = marker.view_direction || 0; // 0 degrees = right, 90 = down
    const viewDistance = marker.view_distance || 30; // 30% of container
    
    // Calculate points for the field of view triangle
    const startAngle = (viewDirection - viewAngle / 2) * (Math.PI / 180);
    const endAngle = (viewDirection + viewAngle / 2) * (Math.PI / 180);
    
    // Camera position
    const x = marker.position_x;
    const y = marker.position_y;
    
    // Create path for the view cone
    const path = `
      M ${x} ${y}
      L ${x + viewDistance * Math.cos(startAngle)} ${y + viewDistance * Math.sin(startAngle)}
      A ${viewDistance} ${viewDistance} 0 0 1 ${x + viewDistance * Math.cos(endAngle)} ${y + viewDistance * Math.sin(endAngle)}
      Z
    `;
    
    return (
      <svg 
        key={`fov-${marker.id}`}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <path
          d={path}
          fill="rgba(0, 100, 255, 0.1)"
          stroke="rgba(0, 100, 255, 0.5)"
          strokeWidth="1"
          strokeDasharray="5,3"
        />
        
        {/* Direction line */}
        <line
          x1={x}
          y1={y}
          x2={x + (viewDistance / 2) * Math.cos(viewDirection * (Math.PI / 180))}
          y2={y + (viewDistance / 2) * Math.sin(viewDirection * (Math.PI / 180))}
          stroke="rgba(0, 100, 255, 0.7)"
          strokeWidth="1"
        />
      </svg>
    );
  };

  // Render markers
  const renderMarkers = () => {
    if (!isLayerVisible('access_points') && !isLayerVisible('cameras')) {
      return null;
    }
    
    const filteredMarkers = markers
      .filter(marker => 
        (marker.marker_type === 'access_point' && isLayerVisible('access_points')) ||
        (marker.marker_type === 'camera' && isLayerVisible('cameras'))
      )
      .filter(marker => marker.page === currentPage);
    
    return (
      <>
        {/* Render camera field of view first (under markers) */}
        {filteredMarkers
          .filter(marker => marker.marker_type === 'camera')
          .map(marker => renderCameraFieldOfView(marker))}
        
        {/* Render the actual markers */}
        {filteredMarkers.map((marker) => {
          // Get marker size from state or use default
          const size = markerSize[marker.id] || { width: 6, height: 6 };
          
          // Get equipment number from label if available or display sequential number
          const markerLabel = marker.label || '';
          const markerNumber = getMarkerNumber(markerLabel);
          
          // Check if this marker is selected
          const isSelected = selectedMarkers.includes(marker.id);
          
          return (
            <div
              id={`marker-${marker.id}`}
              key={marker.id}
              className={cn(
                "absolute rounded-full flex items-center justify-center cursor-move z-30",
                marker.marker_type === 'access_point' ? 'bg-red-500' : 'bg-blue-500',
                "text-white font-bold text-xs select-none shadow-md hover:shadow-lg",
                "pointer-events-auto transition-transform",
                isSelected && "ring-2 ring-yellow-400 ring-offset-1",
                draggedMarker === marker.id && "opacity-70"
              )}
              style={{
                left: `${marker.position_x}%`,
                top: `${marker.position_y}%`,
                width: `${size.width}rem`,
                height: `${size.height}rem`,
                transform: 'translate(-50%, -50%)',
                transition: draggedMarker === marker.id ? 'none' : 'all 0.2s ease',
                pointerEvents: isLayerLocked(marker.marker_type === 'access_point' ? 'access_points' : 'cameras') ? 'none' : 'auto'
              }}
              title={marker.label || (marker.marker_type === 'access_point' ? 'Access Point' : 'Camera')}
              onMouseDown={(e) => handleDragStart(e, marker.id)}
              onDoubleClick={() => editMarker(marker)}
              onClick={(e) => {
                // Control key for multi-select
                if (e.ctrlKey || e.metaKey) {
                  setSelectedMarkers(prev => 
                    prev.includes(marker.id) 
                      ? prev.filter(id => id !== marker.id) 
                      : [...prev, marker.id]
                  );
                } else {
                  setSelectedMarkers([marker.id]);
                }
              }}
            >
              {markerNumber || (marker.marker_type === 'access_point' ? 'AP' : 'C')}
            </div>
          );
        })}
      </>
    );
  };

  // Render annotations
  const renderAnnotations = () => {
    if (!isLayerVisible('annotations')) {
      return null;
    }
    
    return annotations.map(annotation => {
      switch (annotation.type) {
        case 'line':
          if (annotation.points.length < 2) return null;
          const [start, end] = annotation.points;
          
          return (
            <svg
              key={annotation.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 25 }}
            >
              <line
                x1={`${start.x}%`}
                y1={`${start.y}%`}
                x2={`${end.x}%`}
                y2={`${end.y}%`}
                stroke={annotation.strokeColor}
                strokeWidth={annotation.strokeWidth}
              />
            </svg>
          );
          
        case 'rectangle':
          if (annotation.points.length < 2) return null;
          const [topLeft, bottomRight] = annotation.points;
          
          const rectX = Math.min(topLeft.x, bottomRight.x);
          const rectY = Math.min(topLeft.y, bottomRight.y);
          const rectWidth = Math.abs(topLeft.x - bottomRight.x);
          const rectHeight = Math.abs(topLeft.y - bottomRight.y);
          
          return (
            <svg
              key={annotation.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 25 }}
            >
              <rect
                x={`${rectX}%`}
                y={`${rectY}%`}
                width={`${rectWidth}%`}
                height={`${rectHeight}%`}
                fill={annotation.fillColor || 'none'}
                stroke={annotation.strokeColor}
                strokeWidth={annotation.strokeWidth}
              />
            </svg>
          );
          
        case 'circle':
          if (annotation.points.length < 2) return null;
          const [center, edge] = annotation.points;
          
          // Calculate radius
          const dx = center.x - edge.x;
          const dy = center.y - edge.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          
          return (
            <svg
              key={annotation.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 25 }}
            >
              <circle
                cx={`${center.x}%`}
                cy={`${center.y}%`}
                r={`${radius}%`}
                fill={annotation.fillColor || 'none'}
                stroke={annotation.strokeColor}
                strokeWidth={annotation.strokeWidth}
              />
            </svg>
          );
          
        case 'text':
          if (!annotation.text || annotation.points.length < 1) return null;
          const position = annotation.points[0];
          
          return (
            <div
              key={annotation.id}
              className="absolute pointer-events-none text-base font-medium"
              style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`, 
                color: annotation.strokeColor,
                transform: 'translate(-50%, -50%)',
                zIndex: 25
              }}
            >
              {annotation.text}
            </div>
          );
          
        default:
          return null;
      }
    });
  };

  // Render current annotation being drawn
  const renderCurrentAnnotation = () => {
    if (!currentAnnotation || !isDrawing) return null;
    
    // Similar to renderAnnotations but for the current annotation being drawn
    switch (currentAnnotation.type) {
      case 'line':
        if (currentAnnotation.points.length < 2) return null;
        const [start, end] = currentAnnotation.points;
        
        return (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 25 }}
          >
            <line
              x1={`${start.x}%`}
              y1={`${start.y}%`}
              x2={`${end.x}%`}
              y2={`${end.y}%`}
              stroke={currentAnnotation.strokeColor}
              strokeWidth={currentAnnotation.strokeWidth}
              strokeDasharray="5,5"
            />
          </svg>
        );
        
      case 'rectangle':
        if (currentAnnotation.points.length < 2) return null;
        const [topLeft, bottomRight] = currentAnnotation.points;
        
        const rectX = Math.min(topLeft.x, bottomRight.x);
        const rectY = Math.min(topLeft.y, bottomRight.y);
        const rectWidth = Math.abs(topLeft.x - bottomRight.x);
        const rectHeight = Math.abs(topLeft.y - bottomRight.y);
        
        return (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 25 }}
          >
            <rect
              x={`${rectX}%`}
              y={`${rectY}%`}
              width={`${rectWidth}%`}
              height={`${rectHeight}%`}
              fill={currentAnnotation.fillColor || 'none'}
              stroke={currentAnnotation.strokeColor}
              strokeWidth={currentAnnotation.strokeWidth}
              strokeDasharray="5,5"
            />
          </svg>
        );
        
      case 'circle':
        if (currentAnnotation.points.length < 2) return null;
        const [center, edge] = currentAnnotation.points;
        
        // Calculate radius
        const dx = center.x - edge.x;
        const dy = center.y - edge.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        return (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 25 }}
          >
            <circle
              cx={`${center.x}%`}
              cy={`${center.y}%`}
              r={`${radius}%`}
              fill={currentAnnotation.fillColor || 'none'}
              stroke={currentAnnotation.strokeColor}
              strokeWidth={currentAnnotation.strokeWidth}
              strokeDasharray="5,5"
            />
          </svg>
        );
        
      default:
        return null;
    }
  };

  // Export floorplan with annotations and markers
  const exportFloorplan = useCallback(() => {
    // Create a combined PDF with markers and annotations
    const container = document.getElementById('pdf-container');
    if (!container) return;
    
    // Tell the user we're generating the PDF
    toast({
      title: "Generating Export",
      description: "Creating annotated floor plan export...",
    });
    
    try {
      // Use html2canvas to capture the entire floorplan with markers
      import('html2canvas').then(html2canvasModule => {
        const html2canvas = html2canvasModule.default;
        
        html2canvas(container, {
          scale: 2, // Better resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        }).then(canvas => {
          // Convert the canvas to a PNG
          const imgData = canvas.toDataURL('image/png');
          
          // Create a link element to download the image
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `${selectedFloorplan?.name || 'floorplan'}_annotated.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Export Complete",
            description: "Annotated floor plan exported successfully.",
          });
        });
      }).catch(err => {
        console.error("Error loading html2canvas:", err);
        toast({
          title: "Export Failed",
          description: "Could not load export library. Please try again.",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred during the export.",
        variant: "destructive",
      });
    }
  }, [selectedFloorplan]);

  // Render layer management panel
  const renderLayerPanel = () => {
    return (
      <div className="bg-white/90 shadow-lg border rounded-md p-2 w-full max-w-xs">
        <h3 className="text-sm font-semibold flex items-center mb-2">
          <Layers className="h-4 w-4 mr-2" />
          Layers
        </h3>
        <div className="space-y-1">
          {layers.map((layer) => (
            <div 
              key={layer.id}
              className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50"
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleLayerVisibility(layer.id)}
                  title={layer.visible ? "Hide Layer" : "Show Layer"}
                >
                  {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => toggleLayerLock(layer.id)}
                  title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                >
                  {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
                <span className="text-xs ml-1">{layer.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to generate PDF page navigation
  const renderPageNavigation = () => {
    if (!selectedFloorplan || selectedFloorplan.page_count <= 1) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2"
        >
          Previous
        </Button>
        
        <div className="text-sm">
          Page {currentPage} of {selectedFloorplan.page_count}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= selectedFloorplan.page_count}
          className="h-8 px-2"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Floor Plans</h2>
          <p className="text-sm text-muted-foreground">
            Upload and manage floor plans for your site walk. Add markers and annotations.
          </p>
        </div>
        
        {selectedFloorplan && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom('out')}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="text-sm w-16 text-center">
              {zoomLevel}%
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom('in')}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom('reset')}
              title="Reset Zoom"
            >
              100%
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="viewer" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="viewer">Floor Plan Viewer</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="manage">Manage Floor Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="viewer">
          {selectedFloorplan ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Tools panel */}
              <div className="w-full md:w-64 space-y-4">
                <div className="bg-white/90 shadow-lg border rounded-md p-2">
                  <h3 className="text-sm font-semibold mb-2">Tools</h3>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      size="sm"
                      variant={viewerMode === 'select' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('select')}
                      className="text-xs h-8 px-2"
                      title="Select Tool"
                    >
                      <MousePointer className="h-3 w-3 mr-1" />
                      Select
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'pan' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('pan')}
                      className="text-xs h-8 px-2"
                      title="Pan Tool"
                    >
                      <MoveHorizontal className="h-3 w-3 mr-1" />
                      Pan
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'add_access_point' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('add_access_point')}
                      className="text-xs h-8 px-2"
                      title="Add Access Point"
                      disabled={!isLayerVisible('access_points') || isLayerLocked('access_points')}
                    >
                      <span className="bg-red-500 h-3 w-3 rounded-full mr-1" />
                      AP
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'add_camera' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('add_camera')}
                      className="text-xs h-8 px-2"
                      title="Add Camera"
                      disabled={!isLayerVisible('cameras') || isLayerLocked('cameras')}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Camera
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'draw_line' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('draw_line')}
                      className="text-xs h-8 px-2"
                      title="Draw Line"
                      disabled={!isLayerVisible('annotations') || isLayerLocked('annotations')}
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Line
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'draw_rectangle' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('draw_rectangle')}
                      className="text-xs h-8 px-2"
                      title="Draw Rectangle"
                      disabled={!isLayerVisible('annotations') || isLayerLocked('annotations')}
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Rect
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'draw_circle' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('draw_circle')}
                      className="text-xs h-8 px-2"
                      title="Draw Circle"
                      disabled={!isLayerVisible('annotations') || isLayerLocked('annotations')}
                    >
                      <Circle className="h-3 w-3 mr-1" />
                      Circle
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'add_text' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('add_text')}
                      className="text-xs h-8 px-2"
                      title="Add Text"
                      disabled={!isLayerVisible('annotations') || isLayerLocked('annotations')}
                    >
                      <TextCursor className="h-3 w-3 mr-1" />
                      Text
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={viewerMode === 'measure' ? "default" : "outline"}
                      onClick={() => toggleMarkerMode('measure')}
                      className="text-xs h-8 px-2"
                      title="Measure Distance"
                      disabled={!isLayerVisible('measurements') || isLayerLocked('measurements')}
                    >
                      Measure
                    </Button>
                  </div>
                  
                  {/* Selection tools - only show when in select mode and markers are selected */}
                  {viewerMode === 'select' && selectedMarkers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-medium mb-2">
                        {selectedMarkers.length} marker{selectedMarkers.length > 1 ? 's' : ''} selected
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            selectedMarkers.forEach(id => {
                              resizeMarker(id, true);
                            });
                          }}
                          className="text-xs h-8 px-2"
                        >
                          Larger
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            selectedMarkers.forEach(id => {
                              resizeMarker(id, false);
                            });
                          }}
                          className="text-xs h-8 px-2"
                        >
                          Smaller
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={deleteSelectedMarkers}
                          className="text-xs h-8 px-2"
                        >
                          Delete
                        </Button>
                        
                        {selectedMarkers.length === 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const marker = markers.find(m => m.id === selectedMarkers[0]);
                              if (marker) {
                                duplicateMarker(marker);
                              }
                            }}
                            className="text-xs h-8 px-2"
                          >
                            Duplicate
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Layers panel */}
                {renderLayerPanel()}
                
                {/* Active floor plan info */}
                {selectedFloorplan && (
                  <div className="bg-white/90 shadow-lg border rounded-md p-2">
                    <h3 className="text-sm font-semibold mb-2">Current Floor Plan</h3>
                    <p className="text-xs mb-1">
                      <span className="font-medium">Name:</span> {selectedFloorplan.name}
                    </p>
                    <p className="text-xs mb-1">
                      <span className="font-medium">Pages:</span> {selectedFloorplan.page_count}
                    </p>
                    <p className="text-xs mb-1">
                      <span className="font-medium">Access Points:</span> {
                        markers.filter(m => m.marker_type === 'access_point').length
                      }
                    </p>
                    <p className="text-xs mb-1">
                      <span className="font-medium">Cameras:</span> {
                        markers.filter(m => m.marker_type === 'camera').length
                      }
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={exportFloorplan}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export with Markers
                      </Button>
                      
                      {pdfBlobUrl && (
                        <a
                          href={pdfBlobUrl}
                          download={`${selectedFloorplan.name}.pdf`}
                          className="inline-flex items-center justify-center h-8 text-xs w-full rounded-md bg-transparent text-primary hover:bg-primary/10 border border-input"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Original PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Main floor plan viewer */}
              <div className="flex-1">
                <div 
                  ref={containerRef}
                  className="border rounded-md bg-muted/10 overflow-hidden"
                >
                  <div className="relative" id="pdf-container">
                    <div 
                      ref={pdfContainerRef}
                      className="relative w-full overflow-auto bg-white"
                      style={{ height: '70vh' }}
                      onMouseDown={handlePanStart}
                      onClick={handlePdfContainerClick}
                      onMouseMove={(e) => handleDrawingMove(e)}
                      onMouseUp={() => handleDrawingEnd()}
                      onMouseLeave={() => handleDrawingEnd()}
                      onWheel={handleMouseWheel}
                    >
                      {pdfBlobUrl ? (
                        <div className="relative">
                          <div 
                            style={{ 
                              transformOrigin: 'top left',
                              transform: `scale(${zoomLevel / 100})`,
                              width: `${100 / (zoomLevel / 100)}%`,
                              height: '100%',
                              position: 'relative'
                            }}
                          >
                            {/* PDF iframe */}
                            <iframe 
                              src={`${pdfBlobUrl}#page=${currentPage}`}
                              width="100%"
                              height="100%"
                              className="border-0"
                              style={{ minHeight: '70vh' }}
                            />
                            
                            {/* Markers layer */}
                            <div 
                              className="absolute top-0 left-0 pointer-events-none"
                              style={{ 
                                width: '100%', 
                                height: '100%',
                                position: 'absolute',
                                overflow: 'visible',
                              }}
                            >
                              {renderMarkers()}
                              {renderAnnotations()}
                              {renderCurrentAnnotation()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                          <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          <div className="text-sm text-muted-foreground">Loading PDF...</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Page navigation */}
                  {renderPageNavigation()}
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-8 text-center">
              {isLoadingFloorplans ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">
                    No floor plans available. Upload a floor plan to get started.
                  </p>
                  <Button onClick={() => document.getElementById('upload-tab')?.click()}>
                    Upload Floor Plan
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" id="upload-tab">
          <div className="border rounded-md p-6 bg-muted/10">
            <h3 className="text-lg font-semibold mb-4">Upload New Floor Plan</h3>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="floorplan-name">Name</Label>
                <Input
                  id="floorplan-name"
                  value={newFloorplanName}
                  onChange={(e) => setNewFloorplanName(e.target.value)}
                  placeholder="First Floor"
                  className="text-sm"
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floorplan-file">PDF File</Label>
                <Input
                  id="floorplan-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a PDF file of your floor plan. The file will be processed and made available for annotation.
                </p>
              </div>
              
              <Button 
                onClick={handleUploadFloorplan} 
                disabled={uploadFloorplanMutation.isPending || !pdfFile || !newFloorplanName}
                className="w-full"
              >
                {uploadFloorplanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Upload Floor Plan</>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manage">
          <div className="border rounded-md p-6 bg-muted/10">
            <h3 className="text-lg font-semibold mb-4">Manage Floor Plans</h3>
            
            {isLoadingFloorplans ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : floorplans.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No floor plans available. Upload a floor plan to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {floorplans.map((floorplan) => (
                  <div 
                    key={floorplan.id} 
                    className="border rounded-md p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium mb-2">{floorplan.name}</h4>
                    
                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>Pages: {floorplan.page_count}</p>
                      <p>Added: {new Date(floorplan.created_at).toLocaleDateString()}</p>
                      <p>Markers: {
                        markers.filter(m => m.floorplan_id === floorplan.id).length
                      }</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setSelectedFloorplan(floorplan)}
                      >
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${floorplan.name}"? This will also delete all markers associated with this floor plan.`)) {
                            // Implement delete floorplan functionality
                            apiRequest('DELETE', `/api/floorplans/${floorplan.id}`)
                              .then(() => {
                                queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
                                if (selectedFloorplan?.id === floorplan.id) {
                                  setSelectedFloorplan(null);
                                }
                                toast({
                                  title: "Success",
                                  description: "Floor plan deleted successfully",
                                });
                              })
                              .catch(error => {
                                console.error('Error deleting floor plan:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to delete floor plan",
                                  variant: "destructive",
                                });
                              });
                          }
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Access Point Marker Form Dialog */}
      <Dialog open={markerDialogOpen && markerType === 'access_point'} onOpenChange={(open) => !open && setMarkerDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {(window as any).__currentEditingMarker ? "Edit Access Point" : "Add Access Point"}
            </DialogTitle>
            <DialogDescription>
              Configure the access point details for this marker.
            </DialogDescription>
          </DialogHeader>
          {newMarkerPosition && (
            <AccessPointMarkerForm
              projectId={projectId}
              existingMarker={(window as any).__currentEditingMarker}
              onSubmit={(equipmentId, label, accessPointData) => {
                if (!selectedFloorplan || !newMarkerPosition) return;
                
                if ((window as any).__currentEditingMarker) {
                  // We're editing an existing marker
                  const markerId = (window as any).__currentEditingMarker.id;
                  
                  // Update the equipment data
                  if (accessPointData) {
                    apiRequest('PUT', `/api/access-points/${equipmentId}`, accessPointData)
                      .then(() => {
                        // Equipment updated successfully, now refresh the data
                        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'access-points'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/access-points', equipmentId] });
                        if (onMarkersUpdated) onMarkersUpdated();
                        
                        // Also update the marker label if it changed
                        if (label) {
                          apiRequest('PUT', `/api/floorplan-markers/${markerId}`, { 
                            label,
                            // Include these required fields
                            floorplan_id: selectedFloorplan.id,
                            page: currentPage,
                            marker_type: 'access_point',
                            equipment_id: equipmentId,
                            position_x: newMarkerPosition.x,
                            position_y: newMarkerPosition.y
                          })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
                            });
                        }
                        
                        // Close the dialog and clean up
                        setMarkerDialogOpen(false);
                        setNewMarkerPosition(null);
                        (window as any).__currentEditingMarker = null;
                        
                        toast({
                          title: "Success",
                          description: "Access point updated successfully",
                        });
                      })
                      .catch(err => {
                        console.error('Error updating access point:', err);
                        toast({
                          title: "Error",
                          description: "Failed to update access point",
                          variant: "destructive",
                        });
                      });
                  }
                } else {
                  // Creating a new marker
                  if (equipmentId === 0 && accessPointData) {
                    // First create the access point
                    apiRequest('POST', '/api/access-points', accessPointData)
                      .then(async (res) => {
                        const newAccessPoint = await res.json();
                        
                        // Then create the marker with the new access point ID
                        return createMarkerMutation.mutateAsync({
                          floorplan_id: selectedFloorplan.id,
                          page: currentPage,
                          marker_type: 'access_point',
                          equipment_id: newAccessPoint.id,
                          position_x: newMarkerPosition.x,
                          position_y: newMarkerPosition.y,
                          label: label || newAccessPoint.location
                        });
                      })
                      .then(() => {
                        // Everything successful, refresh data
                        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'access-points'] });
                        if (onMarkersUpdated) onMarkersUpdated();
                        
                        // Close dialog
                        setMarkerDialogOpen(false);
                        setNewMarkerPosition(null);
                        
                        toast({
                          title: "Success",
                          description: "Access point created and marker added",
                        });
                      })
                      .catch(err => {
                        console.error('Error creating access point and marker:', err);
                        toast({
                          title: "Error",
                          description: "Failed to create access point and marker",
                          variant: "destructive",
                        });
                      });
                  } else {
                    // Using an existing access point
                    createMarkerMutation.mutateAsync({
                      floorplan_id: selectedFloorplan.id,
                      page: currentPage,
                      marker_type: 'access_point',
                      equipment_id: equipmentId,
                      position_x: newMarkerPosition.x,
                      position_y: newMarkerPosition.y,
                      label
                    });
                    
                    setMarkerDialogOpen(false);
                    setNewMarkerPosition(null);
                  }
                }
              }}
              onCancel={() => {
                setMarkerDialogOpen(false);
                setNewMarkerPosition(null);
                (window as any).__currentEditingMarker = null;
              }}
              position={newMarkerPosition}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Camera Marker Form Dialog */}
      <Dialog open={markerDialogOpen && markerType === 'camera'} onOpenChange={(open) => !open && setMarkerDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {(window as any).__currentEditingMarker ? "Edit Camera" : "Add Camera"}
            </DialogTitle>
            <DialogDescription>
              Configure the camera details for this marker.
            </DialogDescription>
          </DialogHeader>
          {newMarkerPosition && (
            <CameraMarkerForm
              projectId={projectId}
              existingMarker={(window as any).__currentEditingMarker}
              onSubmit={(equipmentId, label, cameraData) => {
                if (!selectedFloorplan || !newMarkerPosition) return;
                
                if ((window as any).__currentEditingMarker) {
                  // We're editing an existing marker
                  const markerId = (window as any).__currentEditingMarker.id;
                  
                  // Update the equipment data
                  if (cameraData) {
                    apiRequest('PUT', `/api/cameras/${equipmentId}`, cameraData)
                      .then(() => {
                        // Equipment updated successfully, now refresh the data
                        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'cameras'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/cameras', equipmentId] });
                        if (onMarkersUpdated) onMarkersUpdated();
                        
                        // Also update the marker label if it changed
                        if (label) {
                          apiRequest('PUT', `/api/floorplan-markers/${markerId}`, { 
                            label,
                            // Include these required fields
                            floorplan_id: selectedFloorplan.id,
                            page: currentPage,
                            marker_type: 'camera',
                            equipment_id: equipmentId,
                            position_x: newMarkerPosition.x,
                            position_y: newMarkerPosition.y
                          })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
                            });
                        }
                        
                        // Close the dialog and clean up
                        setMarkerDialogOpen(false);
                        setNewMarkerPosition(null);
                        (window as any).__currentEditingMarker = null;
                        
                        toast({
                          title: "Success",
                          description: "Camera updated successfully",
                        });
                      })
                      .catch(err => {
                        console.error('Error updating camera:', err);
                        toast({
                          title: "Error",
                          description: "Failed to update camera",
                          variant: "destructive",
                        });
                      });
                  }
                } else {
                  // Creating a new marker
                  if (equipmentId === 0 && cameraData) {
                    // First create the camera
                    apiRequest('POST', '/api/cameras', cameraData)
                      .then(async (res) => {
                        const newCamera = await res.json();
                        
                        // Then create the marker with the new camera ID
                        return createMarkerMutation.mutateAsync({
                          floorplan_id: selectedFloorplan.id,
                          page: currentPage,
                          marker_type: 'camera',
                          equipment_id: newCamera.id,
                          position_x: newMarkerPosition.x,
                          position_y: newMarkerPosition.y,
                          label: label || newCamera.location
                        });
                      })
                      .then(() => {
                        // Everything successful, refresh data
                        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'cameras'] });
                        if (onMarkersUpdated) onMarkersUpdated();
                        
                        // Close dialog
                        setMarkerDialogOpen(false);
                        setNewMarkerPosition(null);
                        
                        toast({
                          title: "Success",
                          description: "Camera created and marker added",
                        });
                      })
                      .catch(err => {
                        console.error('Error creating camera and marker:', err);
                        toast({
                          title: "Error",
                          description: "Failed to create camera and marker",
                          variant: "destructive",
                        });
                      });
                  } else {
                    // Using an existing camera
                    createMarkerMutation.mutateAsync({
                      floorplan_id: selectedFloorplan.id,
                      page: currentPage,
                      marker_type: 'camera',
                      equipment_id: equipmentId,
                      position_x: newMarkerPosition.x,
                      position_y: newMarkerPosition.y,
                      label
                    });
                    
                    setMarkerDialogOpen(false);
                    setNewMarkerPosition(null);
                  }
                }
              }}
              onCancel={() => {
                setMarkerDialogOpen(false);
                setNewMarkerPosition(null);
                (window as any).__currentEditingMarker = null;
              }}
              position={newMarkerPosition}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Text annotation input dialog */}
      <Dialog open={!!textPosition} onOpenChange={(open) => !open && setTextPosition(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Text Annotation</DialogTitle>
            <DialogDescription>
              Enter the text you want to add to the floor plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="annotation-text">Text</Label>
              <Input
                id="annotation-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text annotation"
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="text-color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded"
                />
                <Input
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setTextPosition(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (textInput.trim()) {
                  handleTextSubmit(textInput.trim());
                }
              }}
              disabled={!textInput.trim()}
            >
              Add Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModernFloorplanViewer;