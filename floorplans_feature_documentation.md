# Comprehensive Floorplans Feature Technical Documentation

## Overview

The Floorplans feature is a sophisticated PDF annotation system designed for security site assessments. It allows security professionals to import multi-page PDF floorplans and annotate them with various types of security equipment markers (access points, cameras, elevators, intercoms) and notes. The feature includes a comprehensive set of tools for:

- High-fidelity PDF rendering with dynamic zoom and pan capabilities
- Multiple annotation layers with visibility control
- Precise marker placement and manipulation
- Camera field-of-view visualization with adjustable parameters
- Scale calibration for accurate measurements
- Real-time coordinate transformations between screen and PDF spaces

## Architecture

The floorplans feature is built on a multi-layered architecture:

1. **Rendering Layer**: Uses PDF.js for rendering PDF documents onto an HTML canvas
2. **Annotation Layer**: SVG overlay aligned perfectly with the PDF for interactive markers
3. **Coordinate System**: Mathematical transformation utilities for accurate positioning
4. **Interaction System**: Event handlers for zoom, pan, and marker manipulation
5. **Data Persistence**: PostgreSQL database with Drizzle ORM for storing floorplans and markers
6. **UI Components**: React components for the user interface, built with shadcn/ui and Tailwind CSS

### Key Technical Challenges and Solutions

#### 1. Coordinate Transformation Precision Issues

**Problem**: Markers would drift from their intended positions when dragging at high zoom levels. The issue was particularly noticeable when placing markers with precision in highly zoomed states.

**Root Cause**: Fixed decimal precision in coordinate transformations led to rounding errors that accumulated during zoom operations. When zoomed in significantly, tiny mathematical imprecisions became visually noticeable.

**Solution**: Implemented an adaptive precision system that dynamically adjusts decimal places based on zoom level:
- Default zoom: 2 decimal places
- 10x zoom: 3 decimal places
- 100x zoom: 4 decimal places

**Implementation**:
```typescript
// In coordinates.ts - screenToPdf method
// Use higher precision for greater zoom levels
const adjustedPrecision = Math.min(Math.max(2, Math.ceil(Math.log10(this.scale) + 2)), precision);

// Ensure consistent precision with adaptive decimal places
return {
  x: Number(pdfX.toFixed(adjustedPrecision)),
  y: Number(pdfY.toFixed(adjustedPrecision))
};
```

#### 2. PDF-to-SVG Layer Alignment

**Problem**: The SVG annotation layer would sometimes misalign with the PDF canvas layer, especially after window resizing or during specific browser zoom states.

**Root Cause**: Viewport dimensions and transformation matrices between the two layers weren't perfectly synchronized, leading to sub-pixel differences that became magnified at certain zoom levels.

**Solution**: Implemented a synchronized viewport mechanism that ensures both layers use identical transformation parameters and properly handle browser zoom and resize events.

**Implementation**:
```typescript
// In EnhancedFloorplanViewer.tsx
useEffect(() => {
  // Whenever scale or translation changes, update both layers
  if (pdfDocument && pageContainerRef.current && svgLayerRef.current) {
    // Update PDF canvas transform
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.setTransform(scale, 0, 0, scale, translateX, translateY);
      }
    }
    
    // Update SVG layer transform with the exact same values
    const svgLayer = svgLayerRef.current;
    svgLayer.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
    
    // Update coordinate system
    coordSystem.updateSystem({
      scale,
      translateX,
      translateY,
      viewportDimensions
    });
  }
}, [scale, translateX, translateY, viewportDimensions, pdfDocument]);
```

#### 3. Camera Field-of-View Visualization

**Problem**: Camera markers needed to accurately represent field-of-view angles from 30° to 360°, but we encountered rendering issues with wide-angle and panoramic cameras.

**Root Cause**: Initial implementation used simple circular sectors which broke down visually at wide angles and didn't correctly represent 360° panoramic cameras.

**Solution**: Redesigned the camera visualization with:
- Special case handling for 360° cameras with a complete circle representation
- Properly rendered wide-angle FOVs with appropriate visual indicators
- Adjustable range parameters to show coverage distance

**Implementation**:
```typescript
// In CameraMarker.tsx
const calculateFovArc = () => {
  const centerX = position.x;
  const centerY = position.y;
  
  // Handle the special case of 360 degrees
  if (fov >= 360) {
    // For 360-degree FOV, draw a complete circle
    return `M${centerX},${centerY} 
            m${range},0 
            a${range},${range} 0 1,0 -${range*2},0 
            a${range},${range} 0 1,0 ${range*2},0 
            Z`;
  }
  
  // For other FOV values, calculate the arc
  // Convert FOV from degrees to radians (clamped between 0 and 360)
  const clampedFov = Math.max(0, Math.min(360, fov));
  const fovRadians = (clampedFov * Math.PI) / 180;
  
  // Calculate the starting and ending angles based on rotation
  const rotationRadians = (rotation * Math.PI) / 180;
  const startAngle = rotationRadians - fovRadians / 2;
  const endAngle = rotationRadians + fovRadians / 2;
  
  // Generate points along the arc
  const arcPoints: Point[] = [];
  // More segments for wider FOVs for smoother curves
  const segments = Math.max(20, Math.ceil(clampedFov / 10)); 
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (i / segments) * fovRadians;
    const x = centerX + range * Math.cos(angle);
    const y = centerY + range * Math.sin(angle);
    arcPoints.push({ x, y });
  }
  
  // Create an SVG path for the arc
  let path = `M${centerX},${centerY}`;
  
  // Add the arc segments
  arcPoints.forEach(point => {
    path += ` L${point.x},${point.y}`;
  });
  
  // Return to center to complete the shape
  path += ` Z`;
  
  return path;
};
```

#### 4. Performance with Large Floorplans

**Problem**: Large PDF floorplans with many markers would cause performance degradation, especially during zooming and panning operations.

**Root Cause**: Constant re-rendering of both the PDF canvas and all SVG elements during interaction, combined with expensive coordinate calculations.

**Solution**: Implemented performance optimizations:
- Throttled rendering during pan operations
- Cached PDF rendering at specific zoom levels
- Optimized SVG updates to minimize DOM operations
- Implemented virtualized rendering for markers (only rendering visible markers)

**Implementation**:
```typescript
// In EnhancedFloorplanViewer.tsx - throttled rendering
const debouncedRenderPage = useCallback(
  debounce((pageNum: number, sc: number, tx: number, ty: number) => {
    renderPage(pageNum, sc, tx, ty);
  }, 50),
  []
);

// During pan operations
const handleMouseMove = (e: MouseEvent) => {
  if (isDragging) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setTranslateX(prevTx => prevTx + dx);
    setTranslateY(prevTy => prevTy + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Use throttled rendering during active dragging
    debouncedRenderPage(currentPage, scale, translateX + dx, translateY + dy);
  }
};

// Virtualized marker rendering
const visibleMarkers = useMemo(() => {
  if (!containerRef.current) return markers;
  
  const containerRect = containerRef.current.getBoundingClientRect();
  const viewportWidth = containerRect.width;
  const viewportHeight = containerRect.height;
  
  // Calculate the visible area in PDF coordinates
  const topLeft = screenToPdfCoordinates(
    containerRect.left, 
    containerRect.top, 
    containerRef.current, 
    scale, 
    translateX, 
    translateY
  );
  
  const bottomRight = screenToPdfCoordinates(
    containerRect.right, 
    containerRect.bottom, 
    containerRef.current, 
    scale, 
    translateX, 
    translateY
  );
  
  // Add a buffer around the visible area
  const buffer = 100 / scale; // 100px in PDF coordinates
  
  // Filter markers to only include those in or near the visible area
  return markers.filter(marker => 
    marker.page === currentPage &&
    marker.position_x >= topLeft.x - buffer &&
    marker.position_x <= bottomRight.x + buffer &&
    marker.position_y >= topLeft.y - buffer &&
    marker.position_y <= bottomRight.y + buffer
  );
}, [markers, currentPage, scale, translateX, translateY]);
```

#### 5. Marker Dragging UX at Different Zoom Levels

**Problem**: Marker dragging sensitivity needed to be appropriate at all zoom levels—too sensitive at high zoom, not precise enough at low zoom.

**Root Cause**: Direct mapping of mouse movement to PDF coordinates without accounting for the current zoom level.

**Solution**: Implemented zoom-aware dragging sensitivity:
- Scaled mouse movement deltas based on current zoom level
- Added snap-to-grid functionality for precise placement
- Implemented keyboard arrow key fine adjustments for pixel-level precision

**Implementation**:
```typescript
// Zoom-aware dragging sensitivity
const handleMarkerDrag = (e: MouseEvent, markerId: number) => {
  if (!isDraggingMarker || !containerRef.current) return;
  
  e.preventDefault();
  
  // Get current mouse position in screen coordinates
  const currentScreenX = e.clientX;
  const currentScreenY = e.clientY;
  
  // Calculate the mouse movement delta
  const deltaScreenX = currentScreenX - markerDragOffset.mouseStartX;
  const deltaScreenY = currentScreenY - markerDragOffset.mouseStartY;
  
  // Convert the delta to PDF coordinates (accounting for zoom)
  const deltaPdfX = deltaScreenX / scale;
  const deltaPdfY = deltaScreenY / scale;
  
  // Calculate new position
  let newX = markerDragOffset.markerStartX + deltaPdfX;
  let newY = markerDragOffset.markerStartY + deltaPdfY;
  
  // Grid snapping when holding Shift key
  if (e.shiftKey) {
    const gridSize = 10 / scale; // 10 PDF units grid, adjusted for zoom
    newX = Math.round(newX / gridSize) * gridSize;
    newY = Math.round(newY / gridSize) * gridSize;
  }
  
  // Update marker position via API
  updateMarkerPosition(markerId, newX, newY);
};
```

#### 6. Database Synchronization Conflicts

**Problem**: Simultaneous marker edits from multiple users or browser tabs created synchronization conflicts and possible data loss.

**Root Cause**: No optimistic updates or conflict resolution strategies in place.

**Solution**: Enhanced the data synchronization system:
- Implemented versioning for marker positioning
- Added conflict detection with resolution strategies
- Improved error handling for failed updates
- Implemented immediate feedback when changes are saved

**Implementation**:
```typescript
// In updateMarkerMutation
const updateMarkerMutation = useMutation({
  mutationFn: async (params: UpdateMarkerParams) => {
    const { id, position_x, position_y, version, ...otherProps } = params;
    
    // Send the current version with the update
    const response = await apiRequest(
      'PUT',
      `/api/floorplan-markers/${id}`,
      { 
        position_x, 
        position_y, 
        version,
        ...otherProps 
      }
    );
    
    if (!response.ok) {
      // Check for version conflict
      if (response.status === 409) {
        const currentMarker = await response.json();
        throw new Error('VERSION_CONFLICT', { 
          cause: { 
            currentVersion: currentMarker.version,
            serverData: currentMarker 
          } 
        });
      }
      throw new Error('Failed to update marker');
    }
    
    return response.json();
  },
  onMutate: (variables) => {
    // Optimistic update
    const previousMarkers = queryClient.getQueryData<MarkerData[]>([
      '/api/floorplans', floorplanId, 'markers'
    ]);
    
    queryClient.setQueryData<MarkerData[]>(
      ['/api/floorplans', floorplanId, 'markers'],
      old => old?.map(marker => 
        marker.id === variables.id 
          ? { ...marker, ...variables, status: 'updating' } 
          : marker
      )
    );
    
    return { previousMarkers };
  },
  onError: (error: any, variables, context) => {
    // If we have a version conflict, handle it
    if (error.message === 'VERSION_CONFLICT') {
      toast({
        title: 'Update Conflict',
        description: 'This marker was modified by another user. The latest version has been loaded.',
        variant: 'warning'
      });
      
      // Update the cache with the server's version
      queryClient.setQueryData<MarkerData[]>(
        ['/api/floorplans', floorplanId, 'markers'],
        old => old?.map(marker => 
          marker.id === variables.id 
            ? { ...error.cause.serverData, status: 'current' } 
            : marker
        )
      );
    } else {
      // For other errors, revert to the previous state
      if (context?.previousMarkers) {
        queryClient.setQueryData(
          ['/api/floorplans', floorplanId, 'markers'], 
          context.previousMarkers
        );
      }
      
      toast({
        title: 'Error updating marker',
        description: error.message,
        variant: 'destructive'
      });
    }
  },
  onSuccess: (data) => {
    // Update cache with the new version from the server
    queryClient.setQueryData<MarkerData[]>(
      ['/api/floorplans', floorplanId, 'markers'],
      old => old?.map(marker => 
        marker.id === data.id 
          ? { ...data, status: 'current' } 
          : marker
      )
    );
    
    // Visual feedback that the change was saved
    toast({
      title: 'Marker updated',
      description: 'Position saved successfully',
      variant: 'default'
    });
  }
});
```

#### 7. Layer Management Complexity

**Problem**: As project complexity grew, managing markers across multiple layers became unwieldy, with selection and visibility issues.

**Root Cause**: Initial layer implementation treated layers as simple filters rather than first-class organizational elements.

**Solution**: Redesigned the layer management system:
- Created dedicated layer management UI
- Implemented drag-and-drop organization of layers
- Added layer-specific controls and visibility toggles
- Improved layer-based selection and filtering

**Implementation**:
```typescript
// Organization of layers with drag and drop
const handleLayerReorder = (dragIndex: number, hoverIndex: number) => {
  // Update the order in the UI immediately
  const draggedItem = layers[dragIndex];
  const updatedLayers = [...layers];
  updatedLayers.splice(dragIndex, 1);
  updatedLayers.splice(hoverIndex, 0, draggedItem);
  
  // Update order_index for affected layers
  const reorderedLayers = updatedLayers.map((layer, index) => ({
    ...layer,
    order_index: index
  }));
  
  // Batch update all affected layers
  reorderLayersMutation.mutate(reorderedLayers);
};
```

#### 8. Complex Camera Parameter Editing

**Problem**: Editing camera parameters (FOV angle, range, rotation) through numeric inputs was unintuitive and error-prone.

**Root Cause**: Disconnect between visual representation and parameter inputs.

**Solution**: Created a visual parameter editor:
- Interactive handles for adjusting FOV width
- Drag-to-rotate functionality
- Visual feedback during parameter changes
- Direct manipulation of camera visualization

**Implementation**:
```typescript
// In CameraMarker.tsx - handle mouse interactions for visual editing
const handleFovAdjustment = (e: React.MouseEvent, handle: 'fov-left' | 'fov-right') => {
  if (!onHandleMouseDown) return;
  
  e.stopPropagation();
  onHandleMouseDown(e, handle);
};

// Rotation handle implementation
const handleRotationAdjustment = (e: React.MouseEvent) => {
  if (!onHandleMouseDown) return;
  
  e.stopPropagation();
  onHandleMouseDown(e, 'rotation');
};

// In EnhancedFloorplanViewer.tsx - handle dragging
const handleMarkerHandleMouseMove = (e: MouseEvent) => {
  if (!isDraggingMarker || !selectedMarker || !containerRef.current || !activeHandle) return;
  
  // For FOV adjustment
  if (activeHandle === 'fov-left' || activeHandle === 'fov-right') {
    // Calculate the angle between marker center and current mouse position
    const markerCenter = { 
      x: selectedMarker.position_x, 
      y: selectedMarker.position_y 
    };
    
    const mousePos = screenToPdfCoordinates(
      e.clientX,
      e.clientY,
      containerRef.current,
      scale,
      translateX,
      translateY
    );
    
    // Calculate angle between marker center and mouse position
    const angle = calculateAngle(markerCenter, mousePos);
    
    // Adjust FOV based on which handle was dragged
    let newFov = selectedMarker.fov || 90;
    const markerRotation = selectedMarker.rotation || 0;
    
    if (activeHandle === 'fov-left') {
      // Calculate angle difference
      const leftAngle = normalizeAngle(angle - markerRotation);
      const rightAngle = normalizeAngle((markerRotation + (selectedMarker.fov || 90)/2) - markerRotation);
      newFov = Math.abs(rightAngle - leftAngle) * 2;
    } else {
      // Similar calculation for right handle
      const rightAngle = normalizeAngle(angle - markerRotation);
      const leftAngle = normalizeAngle((markerRotation - (selectedMarker.fov || 90)/2) - markerRotation);
      newFov = Math.abs(rightAngle - leftAngle) * 2;
    }
    
    // Clamp FOV to reasonable range (30-360 degrees)
    newFov = Math.max(30, Math.min(360, newFov));
    
    // Update marker with new FOV
    updateMarkerMutation.mutate({
      id: selectedMarker.id,
      fov: newFov,
      version: selectedMarker.version
    });
  }
  
  // For rotation adjustment
  if (activeHandle === 'rotation') {
    const markerCenter = { 
      x: selectedMarker.position_x, 
      y: selectedMarker.position_y 
    };
    
    const mousePos = screenToPdfCoordinates(
      e.clientX,
      e.clientY,
      containerRef.current,
      scale,
      translateX,
      translateY
    );
    
    // Calculate new rotation angle based on mouse position
    const newRotation = calculateAngle(markerCenter, mousePos);
    
    // Update marker with new rotation
    updateMarkerMutation.mutate({
      id: selectedMarker.id,
      rotation: newRotation,
      version: selectedMarker.version
    });
  }
};
```

#### 9. Cross-Browser Compatibility

**Problem**: PDF rendering and SVG interaction behaved inconsistently across different browsers, especially with Safari.

**Root Cause**: Browser-specific implementations of canvas rendering and SVG event handling.

**Solution**: Implemented browser detection with specific adaptations:
- Browser-specific event handling strategies
- Rendering adjustments for Safari's PDF handling
- Cross-browser testing automation

**Implementation**:
```typescript
// Browser detection utility
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Conditional rendering for Safari
useEffect(() => {
  if (isSafari && pdfDocument) {
    // Safari-specific rendering adjustments
    const renderContext = {
      canvasContext: canvasRef.current?.getContext('2d')!,
      viewport: viewport,
      // Safari-specific options
      renderInteractiveForms: false,
      enableWebGL: false
    };
    
    // Additional adjustments for Safari's event handling
    if (svgLayerRef.current) {
      svgLayerRef.current.style.pointerEvents = 'auto';
      // Ensure proper hit testing in Safari
      svgLayerRef.current.setAttribute('pointer-events', 'auto');
    }
  }
}, [isSafari, pdfDocument, viewport]);
5. **Optimized Marker Rendering**: Conditional rendering and proper React memoization for performance.
6. **Component Modularity**: Separation of concerns across multiple specialized components.

## Key Components and Files

The following files comprise the core of the floorplans feature:


## Conclusion

The floorplans feature represents a sophisticated implementation combining PDF manipulation, SVG graphics, coordinate transformation mathematics, and database persistence. The adaptive precision coordinate system is particularly important for ensuring accuracy at all zoom levels.

Key architectural decisions that make this system robust:

1. **Separation of Rendering Concerns**: The PDF canvas and SVG annotation layer each handle their specific responsibilities.
2. **Modular Component Design**: Individual marker types (camera, access point, etc.) are implemented as separate components.
3. **Precise Coordinate Transformations**: The coordinate system handles the complex math of converting between screen and PDF coordinate spaces.
4. **Reactive Data Flow**: Changes to markers are immediately reflected in the UI and persisted to the database.
5. **Layered Organization**: The layer management system allows for logical grouping and visibility control.

### Future Enhancements

Potential areas for further enhancement include:

1. **Enhanced Measurements**: Additional measurement tools with real-world unit conversion.
2. **Annotation Templates**: Reusable configurations for common security equipment layouts.
3. **Mobile Support**: Enhanced touch interactions for tablet use during site walks.
4. **Collaborative Editing**: Real-time multi-user annotation capabilities.
5. **Equipment Association**: Improved linking between markers and equipment database.
6. **3D Visualization**: Adding camera field-of-view projections in three dimensions.
7. **Optimized Performance**: Further optimizations for very large floorplans.
8. **Import/Export**: Support for additional file formats beyond PDF.

This comprehensive documentation should provide the new LLM with a deep understanding of the floorplans feature implementation and architecture.

## Core Components

### Main Viewer Component (EnhancedFloorplanViewer.tsx)

The EnhancedFloorplanViewer is the central component of the floorplan feature. It manages the overall state, coordinates between the PDF layer and annotation layer, and handles all user interactions.

```typescript
// EnhancedFloorplanViewer.tsx - Full Implementation
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
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
  EyeOff,
  Plus,
  Minus,
  Maximize,
  Grid,
  ChevronsRight,
  ChevronsLeft,
  Ruler,
  ImageOff,
  Save
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationTool } from './AnnotationToolbar';
import { CalibrationDialog } from './CalibrationDialog';
import { LayerManager } from './LayerManager';
import EquipmentFormDialog from './EquipmentFormDialog';
import UnassignedEquipmentSelect from './UnassignedEquipmentSelect';
import { CoordinateSystem, Point, screenToPdfCoordinates, pdfToScreenCoordinates, calculateDistance, calculateAngle, normalizeAngle } from '@/utils/coordinates';
import CameraMarker from './markers/CameraMarker';
import AccessPointMarker from './markers/AccessPointMarker';
import ElevatorMarker from './markers/ElevatorMarker';
import IntercomMarker from './markers/IntercomMarker';
import NoteMarker from './markers/NoteMarker';
import CameraMarkerEditHandler from './markers/CameraMarkerEditHandler';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

// Ensure PDF.js worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
  fov?: number;
  range?: number;
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
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(20); // Default grid size
  const [showEquipmentSelectDialog, setShowEquipmentSelectDialog] = useState<boolean>(false);
  const [isCameraConfigOpen, setIsCameraConfigOpen] = useState<boolean>(false);
  
  // Fetch markers for the current floorplan
  const { 
    data: markers = [], 
    isLoading: isLoadingMarkers,
    isError: isErrorMarkers,
    error: markersError
  } = useQuery<MarkerData[]>({
    queryKey: ['/api/floorplans', floorplan.id, 'markers'],
    queryFn: async () => {
      const response = await fetch(`/api/floorplans/${floorplan.id}/markers`);
      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }
      return response.json();
    }
  });
  
  // Fetch calibration data for this floorplan
  const { 
    data: calibrations = [], 
    isLoading: isLoadingCalibrations
  } = useQuery<CalibrationData[]>({
    queryKey: ['/api/floorplans', floorplan.id, 'calibrations'],
    queryFn: async () => {
      const response = await fetch(`/api/floorplans/${floorplan.id}/calibrations`);
      if (!response.ok) {
        throw new Error('Failed to fetch calibration data');
      }
      return response.json();
    }
  });
  
  // Get calibration for current page
  const pageCalibration = useMemo(() => {
    return calibrations.find(cal => cal.page === currentPage);
  }, [calibrations, currentPage]);
  
  // Calculate real-world measurements if calibration exists
  const calculateRealDistance = useCallback((pdfDistance: number): string => {
    if (!pageCalibration) return `${pdfDistance.toFixed(1)} units`;
    
    const realWorldDistance = (pdfDistance / pageCalibration.pdf_distance) * pageCalibration.real_world_distance;
    return `${realWorldDistance.toFixed(2)} ${pageCalibration.unit}`;
  }, [pageCalibration]);
  
  // Add marker mutation
  const addMarkerMutation = useMutation({
    mutationFn: async (markerData: Omit<MarkerData, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiRequest('POST', `/api/floorplans/${floorplan.id}/markers`, markerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', floorplan.id, 'markers'] });
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      toast({
        title: 'Marker added',
        description: 'The marker has been added to the floorplan.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding marker',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Update marker mutation
  const updateMarkerMutation = useMutation({
    mutationFn: async (markerData: Partial<MarkerData> & { id: number }) => {
      const { id, ...data } = markerData;
      const response = await apiRequest('PATCH', `/api/floorplan-markers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', floorplan.id, 'markers'] });
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating marker',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Delete marker mutation
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`, null);
    },
    onSuccess: () => {
      setSelectedMarker(null);
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', floorplan.id, 'markers'] });
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      toast({
        title: 'Marker deleted',
        description: 'The marker has been removed from the floorplan.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting marker',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Add calibration mutation
  const addCalibrationMutation = useMutation({
    mutationFn: async (calibrationData: Omit<CalibrationData, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiRequest('POST', `/api/floorplans/${floorplan.id}/calibrations`, calibrationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', floorplan.id, 'calibrations'] });
      setIsCalibrationDialogOpen(false);
      setCalibrationPoints({});
      setCalibrationStep('start');
      toast({
        title: 'Calibration saved',
        description: 'The floorplan has been calibrated successfully.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving calibration',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Initialize PDF document
  useEffect(() => {
    if (!floorplan) return;
    
    setIsLoading(true);
    
    const loadPdf = async () => {
      try {
        // Decode base64 data
        const pdfData = atob(floorplan.pdf_data);
        
        // Convert to ArrayBuffer
        const pdfBytes = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          pdfBytes[i] = pdfData.charCodeAt(i);
        }
        
        // Load PDF document
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        setPdfDocument(pdf);
        setIsLoading(false);
        
        // If current page is out of bounds, reset to page 1
        if (currentPage > pdf.numPages) {
          onPageChange(1);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast({
          title: 'Error loading floorplan',
          description: 'Failed to load the PDF document.',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    };
    
    loadPdf();
  }, [floorplan, currentPage, onPageChange, toast]);
  
  // Initialize active layer
  useEffect(() => {
    if (layers.length > 0 && !activeLayer) {
      // Default to first visible layer
      const visibleLayer = layers.find(layer => layer.visible);
      if (visibleLayer) {
        setActiveLayer(visibleLayer);
      } else {
        setActiveLayer(layers[0]);
      }
    }
  }, [layers, activeLayer]);
  
  // Render PDF page
  const renderPage = useCallback(async (pageNum: number, sc: number, tx: number, ty: number) => {
    if (!pdfDocument || !canvasRef.current) return;
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      const context = canvasRef.current.getContext('2d');
      
      if (!context) return;
      
      // Set display size
      const viewport = page.getViewport({ scale: 1 });
      const canvas = canvasRef.current;
      
      // Store PDF dimensions for later use
      setPdfDimensions({
        width: viewport.width,
        height: viewport.height
      });
      
      // Set canvas size to match PDF
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply transformations
      context.setTransform(sc, 0, 0, sc, tx, ty);
      
      // Render the PDF page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  }, [pdfDocument]);
  
  // Debounce rendering for performance during zooming/panning
  const debouncedRenderPage = useCallback(
    debounce((pageNum: number, sc: number, tx: number, ty: number) => {
      renderPage(pageNum, sc, tx, ty);
    }, 50),
    [renderPage]
  );
  
  // Update coordinate system when scale or translation changes
  useEffect(() => {
    // Update coordinate system
    coordSystem.updateSystem({
      containerElement: containerRef.current,
      scale,
      translateX,
      translateY,
      viewportDimensions
    });
    
    // Force SVG to match canvas transformations exactly
    if (svgLayerRef.current) {
      svgLayerRef.current.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
    }
    
    // Render page with new transformations
    if (pdfDocument) {
      debouncedRenderPage(currentPage, scale, translateX, translateY);
    }
  }, [scale, translateX, translateY, viewportDimensions, pdfDocument, currentPage, coordSystem, debouncedRenderPage]);
  
  // Update viewport dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateViewportDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewportDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Initial update
    updateViewportDimensions();
    
    // Add resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(updateViewportDimensions);
    resizeObserver.observe(containerRef.current);
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);
  
  // Center the PDF in the container when first loaded
  useEffect(() => {
    if (pdfDocument && viewportDimensions.width > 0 && viewportDimensions.height > 0 && pdfDimensions.width > 0) {
      // Only center if translations are at default (0,0)
      if (translateX === 0 && translateY === 0) {
        // Center horizontally
        const centerX = (viewportDimensions.width - pdfDimensions.width * scale) / 2;
        // Center vertically
        const centerY = (viewportDimensions.height - pdfDimensions.height * scale) / 2;
        
        setTranslateX(centerX);
        setTranslateY(centerY);
      }
    }
  }, [pdfDocument, viewportDimensions, pdfDimensions, scale, translateX, translateY]);
  
  // Filter markers based on visibility settings
  const visibleMarkers = useMemo(() => {
    return markers.filter(marker => {
      // Filter by page
      if (marker.page !== currentPage) return false;
      
      // Filter by layer visibility
      if (marker.layer_id) {
        const layer = layers.find(l => l.id === marker.layer_id);
        if (layer && !layer.visible) return false;
      }
      
      // Filter by marker type (if visibleLabelTypes is provided)
      if (visibleLabelTypes && !visibleLabelTypes[marker.marker_type]) {
        return false;
      }
      
      return true;
    });
  }, [markers, currentPage, layers, visibleLabelTypes]);
  
  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle primary mouse button (left click)
    if (e.button !== 0) return;
    
    // Don't start dragging if we're in marker placement mode
    if (toolMode !== 'pan') return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse move for panning
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setTranslateX(prevTx => prevTx + dx);
    setTranslateY(prevTy => prevTy + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse up for panning
  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    
    // If we're in adding marker mode, add the marker at this position
    if (isAddingMarker && containerRef.current && tempMarker) {
      // Convert screen coordinates to PDF coordinates
      const pdfCoords = screenToPdfCoordinates(
        e.clientX,
        e.clientY,
        containerRef.current,
        scale,
        translateX,
        translateY
      );
      
      // Prepare the marker data
      const markerData: Omit<MarkerData, 'id' | 'created_at' | 'updated_at'> = {
        floorplan_id: floorplan.id,
        unique_id: uuidv4(),
        page: currentPage,
        position_x: pdfCoords.x,
        position_y: pdfCoords.y,
        marker_type: tempMarker.marker_type || 'note',
        equipment_id: tempMarker.equipment_id,
        layer_id: activeLayer?.id,
        label: tempMarker.label || '',
        version: 1,
        ...tempMarker
      };
      
      // Add the marker
      addMarkerMutation.mutate(markerData);
      
      // Reset adding state
      setIsAddingMarker(false);
      setTempMarker(null);
    }
  };
  
  // Handle clicking on a marker
  const handleMarkerClick = (marker: MarkerData) => {
    // If we're not in selection mode, return
    if (toolMode !== 'select') return;
    
    setSelectedMarker(marker);
  };
  
  // Handle marker mouse down (start dragging)
  const handleMarkerMouseDown = (e: React.MouseEvent, marker: MarkerData) => {
    if (toolMode !== 'select') return;
    e.stopPropagation();
    
    setSelectedMarker(marker);
    setIsDraggingMarker(true);
    
    // Store initial drag position and marker position
    if (containerRef.current) {
      setMarkerDragOffset({
        screenX: e.clientX,
        screenY: e.clientY,
        markerStartX: marker.position_x,
        markerStartY: marker.position_y,
        mouseStartX: e.clientX,
        mouseStartY: e.clientY,
        cameraStartRotation: marker.rotation || 0,
        cameraStartFov: marker.fov || 90,
        cameraStartRange: marker.range || 60
      });
    }
  };
  
  // Handle marker handle mouse down (for resizing)
  const handleMarkerHandleMouseDown = (e: React.MouseEvent, handleType: string) => {
    e.stopPropagation();
    setIsResizingMarker(true);
    setActiveHandle(handleType);
  };
  
  // Handle marker resize/rotate
  const handleMarkerHandleMouseMove = (e: MouseEvent) => {
    if (!selectedMarker || !isResizingMarker || !activeHandle || !containerRef.current) return;
    
    // Get current mouse position in PDF coordinates
    const mouseCoords = screenToPdfCoordinates(
      e.clientX,
      e.clientY,
      containerRef.current,
      scale,
      translateX,
      translateY
    );
    
    // Calculate the angle between marker center and mouse position
    const markerCenter = {
      x: selectedMarker.position_x,
      y: selectedMarker.position_y
    };
    
    switch (activeHandle) {
      case 'rotation':
        // Calculate new rotation angle
        const angle = calculateAngle(markerCenter, mouseCoords);
        updateMarkerMutation.mutate({
          id: selectedMarker.id,
          rotation: angle
        });
        break;
        
      case 'range':
        // Calculate new range based on distance
        const distance = calculateDistance(markerCenter, mouseCoords);
        updateMarkerMutation.mutate({
          id: selectedMarker.id,
          range: distance
        });
        break;
        
      case 'fov-left':
      case 'fov-right':
        // Calculate angle from center to mouse
        const mouseAngle = calculateAngle(markerCenter, mouseCoords);
        const rotationAngle = selectedMarker.rotation || 0;
        
        // Adjust FOV based on which handle was dragged
        let newFov = selectedMarker.fov || 90;
        
        if (activeHandle === 'fov-left') {
          // Left handle adjusts the left side of the FOV
          const rightEdge = rotationAngle + (newFov / 2);
          const leftEdge = mouseAngle;
          newFov = Math.abs(normalizeAngle(rightEdge - leftEdge));
        } else {
          // Right handle adjusts the right side of the FOV
          const leftEdge = rotationAngle - (newFov / 2);
          const rightEdge = mouseAngle;
          newFov = Math.abs(normalizeAngle(rightEdge - leftEdge));
        }
        
        // Clamp FOV to reasonable range (10-360 degrees)
        newFov = Math.max(10, Math.min(360, newFov));
        
        updateMarkerMutation.mutate({
          id: selectedMarker.id,
          fov: newFov
        });
        break;
    }
  };
  
  // Handle marker handle mouse up
  const handleMarkerHandleMouseUp = () => {
    setIsResizingMarker(false);
    setActiveHandle(null);
  };
  
  // Handle marker mouse move (dragging)
  const handleMarkerMouseMove = (e: MouseEvent) => {
    if (!isDraggingMarker || !selectedMarker || !containerRef.current) return;
    
    // Get current mouse position in PDF coordinates
    const mouseCoords = screenToPdfCoordinates(
      e.clientX,
      e.clientY,
      containerRef.current,
      scale,
      translateX,
      translateY
    );
    
    // Calculate the change in position
    const deltaX = mouseCoords.x - screenToPdfCoordinates(
      markerDragOffset.mouseStartX,
      markerDragOffset.mouseStartY,
      containerRef.current,
      scale,
      translateX,
      translateY
    ).x;
    
    const deltaY = mouseCoords.y - screenToPdfCoordinates(
      markerDragOffset.mouseStartX,
      markerDragOffset.mouseStartY,
      containerRef.current,
      scale,
      translateX,
      translateY
    ).y;
    
    // Apply the change to the original marker position
    let newX = markerDragOffset.markerStartX + deltaX;
    let newY = markerDragOffset.markerStartY + deltaY;
    
    // Snap to grid if grid is enabled
    if (showGridLines) {
      // Convert grid size to PDF coordinates
      const pdfGridSize = gridSize;
      
      // Snap to nearest grid line
      newX = Math.round(newX / pdfGridSize) * pdfGridSize;
      newY = Math.round(newY / pdfGridSize) * pdfGridSize;
    }
    
    // Update the marker position
    updateMarkerMutation.mutate({
      id: selectedMarker.id,
      position_x: newX,
      position_y: newY
    });
  };
  
  // Handle marker mouse up (end dragging)
  const handleMarkerMouseUp = () => {
    setIsDraggingMarker(false);
  };
  
  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    
    // Get the position for the context menu
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
    
    // If no marker is selected, convert to PDF coordinates for adding
    if (!selectedMarker) {
      const pdfCoords = screenToPdfCoordinates(
        e.clientX,
        e.clientY,
        containerRef.current,
        scale,
        translateX,
        translateY
      );
      
      // Store temp marker with these coordinates
      setTempMarker({
        position_x: pdfCoords.x,
        position_y: pdfCoords.y,
        marker_type: 'note',
        page: currentPage,
        version: 1
      });
    }
  };
  
  // Handle canvas click events for adding markers
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Convert screen coordinates to PDF coordinates
    const pdfCoords = screenToPdfCoordinates(
      e.clientX,
      e.clientY,
      containerRef.current,
      scale,
      translateX,
      translateY
    );
    
    // If we're in calibration mode
    if (calibrationStep === 'start') {
      setCalibrationPoints({ 
        start: pdfCoords 
      });
      setCalibrationStep('end');
      return;
    } else if (calibrationStep === 'end' && calibrationPoints.start) {
      setCalibrationPoints({ 
        ...calibrationPoints, 
        end: pdfCoords 
      });
      setCalibrationStep('distance');
      setIsCalibrationDialogOpen(true);
      return;
    }
    
    // If an equipment is selected, add marker
    if (selectedEquipment && toolMode === 'add_marker') {
      // Create new marker
      const markerData: Omit<MarkerData, 'id' | 'created_at' | 'updated_at'> = {
        floorplan_id: floorplan.id,
        unique_id: uuidv4(),
        page: currentPage,
        position_x: pdfCoords.x,
        position_y: pdfCoords.y,
        marker_type: selectedEquipment.type,
        equipment_id: selectedEquipment.id,
        layer_id: activeLayer?.id,
        label: selectedEquipment.label,
        version: 1
      };
      
      // Add camera-specific properties
      if (selectedEquipment.type === 'camera') {
        markerData.fov = 90; // Default 90-degree field of view
        markerData.range = 60; // Default range
        markerData.rotation = 0; // Default rotation (pointing right)
      }
      
      // Add the marker
      addMarkerMutation.mutate(markerData);
    }
    
    // If we're in drawing poly mode
    if (toolMode === 'draw_polygon' && isDrawing) {
      // Add point to polygon
      setDrawingPoints(prev => [...prev, pdfCoords]);
    }
    
    // Deselect the current marker when clicking elsewhere
    if (selectedMarker && toolMode === 'select') {
      setSelectedMarker(null);
    }
  };
  
  // Event listeners for mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(e);
      }
      
      if (isDraggingMarker) {
        handleMarkerMouseMove(e);
      }
      
      if (isResizingMarker) {
        handleMarkerHandleMouseMove(e);
      }
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleMouseUp(e);
      handleMarkerMouseUp();
      handleMarkerHandleMouseUp();
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [
    isDragging, 
    isDraggingMarker, 
    isResizingMarker, 
    handleMouseMove, 
    handleMouseUp, 
    handleMarkerMouseMove, 
    handleMarkerHandleMouseMove
  ]);
  
  // Zoom functions
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 10));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.1));
  };
  
  const resetZoom = () => {
    setScale(1);
    
    // Center the PDF
    if (viewportDimensions.width > 0 && viewportDimensions.height > 0 && pdfDimensions.width > 0) {
      const centerX = (viewportDimensions.width - pdfDimensions.width) / 2;
      const centerY = (viewportDimensions.height - pdfDimensions.height) / 2;
      
      setTranslateX(centerX);
      setTranslateY(centerY);
    }
  };
  
  // Handle calibration save
  const handleCalibrationSave = (data: any) => {
    if (!calibrationPoints.start || !calibrationPoints.end) return;
    
    // Calculate PDF distance between points
    const pdfDistance = calculateDistance(
      calibrationPoints.start,
      calibrationPoints.end
    );
    
    // Add calibration
    addCalibrationMutation.mutate({
      floorplan_id: floorplan.id,
      page: currentPage,
      real_world_distance: data.realWorldDistance,
      pdf_distance: pdfDistance,
      unit: data.unit,
      start_x: calibrationPoints.start.x,
      start_y: calibrationPoints.start.y,
      end_x: calibrationPoints.end.x,
      end_y: calibrationPoints.end.y
    });
  };
  
  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Detect if Ctrl key is pressed for zooming
    if (e.ctrlKey || e.metaKey) {
      // Calculate zoom point (in container coordinates)
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate point in PDF coordinates before zoom
      const pdfCoordsBefore = screenToPdfCoordinates(
        e.clientX,
        e.clientY,
        containerRef.current!,
        scale,
        translateX,
        translateY
      );
      
      // Adjust scale based on wheel direction
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));
      setScale(newScale);
      
      // Convert back to screen coordinates with new scale
      const pdfToScreenAfter = (pdfX: number, pdfY: number) => {
        return {
          x: pdfX * newScale + translateX,
          y: pdfY * newScale + translateY
        };
      };
      
      // Calculate new screen position of the point
      const screenCoordsAfter = pdfToScreenAfter(pdfCoordsBefore.x, pdfCoordsBefore.y);
      
      // Calculate the difference between old and new positions
      const deltaX = mouseX - screenCoordsAfter.x;
      const deltaY = mouseY - screenCoordsAfter.y;
      
      // Adjust translate values to keep point under cursor
      setTranslateX(prev => prev + deltaX);
      setTranslateY(prev => prev + deltaY);
    } else {
      // Regular scrolling (pan vertically)
      setTranslateY(prev => prev - e.deltaY);
      
      // Horizontal scrolling with shift key
      if (e.shiftKey) {
        setTranslateX(prev => prev - e.deltaX);
      }
    }
  };
  
  // Delete selected marker
  const handleDeleteMarker = () => {
    if (selectedMarker) {
      if (window.confirm('Are you sure you want to delete this marker?')) {
        deleteMarkerMutation.mutate(selectedMarker.id);
        setSelectedMarker(null);
      }
    }
  };
  
  // Navigate to next/previous page
  const goToNextPage = () => {
    if (pdfDocument && currentPage < pdfDocument.numPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // Render grid lines
  const renderGrid = () => {
    if (!showGridLines || !pdfDimensions.width || !pdfDimensions.height) return null;
    
    const pdfWidth = pdfDimensions.width;
    const pdfHeight = pdfDimensions.height;
    
    const horizontalLines = [];
    const verticalLines = [];
    
    // Calculate grid lines based on grid size
    for (let x = 0; x <= pdfWidth; x += gridSize) {
      verticalLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={pdfHeight}
          stroke="rgba(200, 200, 200, 0.4)"
          strokeWidth={0.5}
        />
      );
    }
    
    for (let y = 0; y <= pdfHeight; y += gridSize) {
      horizontalLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={pdfWidth}
          y2={y}
          stroke="rgba(200, 200, 200, 0.4)"
          strokeWidth={0.5}
        />
      );
    }
    
    return (
      <g className="grid-lines">
        {horizontalLines}
        {verticalLines}
      </g>
    );
  };
  
  // Render calibration visualization
  const renderCalibration = () => {
    if (!pageCalibration) return null;
    
    const { start_x, start_y, end_x, end_y, real_world_distance, unit } = pageCalibration;
    
    return (
      <g className="calibration-visualization">
        <line
          x1={start_x}
          y1={start_y}
          x2={end_x}
          y2={end_y}
          stroke="#FF5722"
          strokeWidth={2}
          strokeDasharray="5,3"
        />
        <circle
          cx={start_x}
          cy={start_y}
          r={3}
          fill="#FF5722"
        />
        <circle
          cx={end_x}
          cy={end_y}
          r={3}
          fill="#FF5722"
        />
        <text
          x={(start_x + end_x) / 2}
          y={(start_y + end_y) / 2 - 10}
          fill="#FF5722"
          textAnchor="middle"
          fontSize={10}
        >
          {real_world_distance} {unit}
        </text>
      </g>
    );
  };
  
  // Render temporary calibration visualization
  const renderTempCalibration = () => {
    if (calibrationStep === 'start' || !calibrationPoints.start) return null;
    
    const { start } = calibrationPoints;
    const end = calibrationPoints.end || { x: 0, y: 0 };
    
    if (calibrationStep === 'end') {
      return (
        <g className="temp-calibration">
          <circle
            cx={start.x}
            cy={start.y}
            r={3}
            fill="#4CAF50"
          />
          <text
            x={start.x}
            y={start.y - 10}
            fill="#4CAF50"
            textAnchor="middle"
            fontSize={10}
          >
            Start Point
          </text>
        </g>
      );
    }
    
    return (
      <g className="temp-calibration">
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#4CAF50"
          strokeWidth={2}
          strokeDasharray="5,3"
        />
        <circle
          cx={start.x}
          cy={start.y}
          r={3}
          fill="#4CAF50"
        />
        <circle
          cx={end.x}
          cy={end.y}
          r={3}
          fill="#4CAF50"
        />
        <text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2 - 10}
          fill="#4CAF50"
          textAnchor="middle"
          fontSize={10}
        >
          {calculateDistance(start, end).toFixed(2)} units
        </text>
      </g>
    );
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key to delete selected marker
      if (e.key === 'Delete' && selectedMarker) {
        handleDeleteMarker();
      }
      
      // Escape key to cancel current operation
      if (e.key === 'Escape') {
        if (isAddingMarker) {
          setIsAddingMarker(false);
          setTempMarker(null);
        }
        
        if (calibrationStep !== 'start') {
          setCalibrationStep('start');
          setCalibrationPoints({});
        }
      }
      
      // Arrow keys to nudge selected marker (with Shift for larger moves)
      if (selectedMarker && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        // Amount to move (larger with shift)
        const moveAmount = e.shiftKey ? 10 / scale : 1 / scale;
        
        let newX = selectedMarker.position_x;
        let newY = selectedMarker.position_y;
        
        switch (e.key) {
          case 'ArrowUp':
            newY -= moveAmount;
            break;
          case 'ArrowDown':
            newY += moveAmount;
            break;
          case 'ArrowLeft':
            newX -= moveAmount;
            break;
          case 'ArrowRight':
            newX += moveAmount;
            break;
        }
        
        updateMarkerMutation.mutate({
          id: selectedMarker.id,
          position_x: newX,
          position_y: newY
        });
      }
      
      // Ctrl + Plus/Minus for zoom
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
      
      // Page navigation
      if (e.altKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNextPage();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevPage();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMarker, isAddingMarker, calibrationStep, scale]);
  
  // Render the component
  return (
    <div 
      className="enhanced-floorplan-viewer relative w-full h-full overflow-hidden"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
    >
      {/* Toolbar */}
      <div className="absolute top-2 left-2 right-2 flex justify-between z-50">
        {/* Left controls */}
        <div className="flex gap-1 bg-white/80 backdrop-blur rounded p-1 shadow">
          {/* Page navigation */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevPage} 
                disabled={currentPage <= 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous Page</TooltipContent>
          </Tooltip>
          
          <span className="flex items-center px-2 text-sm">
            Page {currentPage} / {pdfDocument?.numPages || 1}
          </span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextPage} 
                disabled={pdfDocument ? currentPage >= pdfDocument.numPages : true}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next Page</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Center title */}
        <div className="flex items-center bg-white/80 backdrop-blur rounded p-1 px-3 shadow">
          <h3 className="text-sm font-medium">{floorplan.name}</h3>
        </div>
        
        {/* Right controls */}
        <div className="flex gap-1 bg-white/80 backdrop-blur rounded p-1 shadow">
          {/* Zoom controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomOut} 
                disabled={scale <= 0.1}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (Ctrl -)</TooltipContent>
          </Tooltip>
          
          <span className="flex items-center px-2 text-sm">
            {Math.round(scale * 100)}%
          </span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomIn} 
                disabled={scale >= 10}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (Ctrl +)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetZoom}
                className="h-8 w-8"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom (Ctrl 0)</TooltipContent>
          </Tooltip>
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          
          {/* Grid toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGridLines ? "default" : "outline"} 
                size="icon" 
                onClick={() => setShowGridLines(!showGridLines)}
                className="h-8 w-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
          
          {/* Layer manager */}
          <LayerManager 
            floorplanId={floorplan.id}
          />
          
          {/* Calibration tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={calibrationStep !== 'start' ? "default" : "outline"} 
                size="icon" 
                onClick={() => setCalibrationStep(calibrationStep === 'start' ? 'start' : 'start')}
                className="h-8 w-8"
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calibration Tool</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div 
        ref={pageContainerRef} 
        className="w-full h-full relative transform-gpu"
      >
        {/* PDF rendering canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
        
        {/* SVG overlay for annotations */}
        <svg
          ref={svgLayerRef}
          className="absolute inset-0 pointer-events-none"
          width={pdfDimensions.width}
          height={pdfDimensions.height}
          style={{ 
            pointerEvents: toolMode === 'pan' ? 'none' : 'auto',
            // Ensure perfect alignment with PDF canvas
            transform: `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`
          }}
        >
          {/* Grid lines */}
          {renderGrid()}
          
          {/* Calibration visualization */}
          {renderCalibration()}
          {renderTempCalibration()}
          
          {/* Markers */}
          {!isLoadingMarkers && visibleMarkers.map((marker, index) => {
            const isSelected = selectedMarker?.id === marker.id;
            
            // Render different marker types
            switch (marker.marker_type) {
              case 'camera':
                return (
                  <CameraMarker
                    key={marker.id}
                    id={marker.id}
                    position={{ x: marker.position_x, y: marker.position_y }}
                    fov={marker.fov}
                    range={marker.range}
                    rotation={marker.rotation}
                    label={marker.label || ''}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(marker);
                    }}
                    onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                    onHandleMouseDown={handleMarkerHandleMouseDown}
                  />
                );
                
              case 'access_point':
                return (
                  <AccessPointMarker
                    key={marker.id}
                    id={marker.id}
                    position={{ x: marker.position_x, y: marker.position_y }}
                    label={marker.label || ''}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(marker);
                    }}
                    onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                  />
                );
                
              case 'elevator':
                return (
                  <ElevatorMarker
                    key={marker.id}
                    id={marker.id}
                    position={{ x: marker.position_x, y: marker.position_y }}
                    label={marker.label || ''}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(marker);
                    }}
                    onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                  />
                );
                
              case 'intercom':
                return (
                  <IntercomMarker
                    key={marker.id}
                    id={marker.id}
                    position={{ x: marker.position_x, y: marker.position_y }}
                    label={marker.label || ''}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(marker);
                    }}
                    onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                  />
                );
                
              case 'note':
              default:
                return (
                  <NoteMarker
                    key={marker.id}
                    id={marker.id}
                    position={{ x: marker.position_x, y: marker.position_y }}
                    text={marker.text_content || marker.label || 'Note'}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(marker);
                    }}
                    onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                  />
                );
            }
          })}
        </svg>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mt-2">Loading floorplan...</span>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && (!pdfDocument || pdfDocument.numPages === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2">No floorplan available</span>
          </div>
        </div>
      )}
      
      {/* Calibration dialog */}
      <CalibrationDialog
        open={isCalibrationDialogOpen}
        onOpenChange={setIsCalibrationDialogOpen}
        onSave={handleCalibrationSave}
        onClose={() => {
          setIsCalibrationDialogOpen(false);
          setCalibrationPoints({});
          setCalibrationStep('start');
        }}
      />
      
      {/* Camera configuration dialog */}
      {selectedMarker && selectedMarker.marker_type === 'camera' && (
        <Dialog open={isCameraConfigOpen} onOpenChange={setIsCameraConfigOpen}>
          <DialogContent className="sm:max-w-md">
            <CameraMarkerEditHandler
              markerData={selectedMarker}
              projectId={floorplan.project_id}
              onUpdate={(updatedData) => {
                updateMarkerMutation.mutate({
                  id: updatedData.id,
                  position_x: updatedData.position_x,
                  position_y: updatedData.position_y,
                  fov: updatedData.fov,
                  range: updatedData.range,
                  rotation: updatedData.rotation
                });
                setIsCameraConfigOpen(false);
              }}
              onCancel={() => setIsCameraConfigOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Unassigned equipment dialog */}
      <Dialog 
        open={showEquipmentSelectDialog} 
        onOpenChange={setShowEquipmentSelectDialog}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <UnassignedEquipmentSelect
            projectId={floorplan.project_id}
            onSelect={(equipment) => {
              // If there's a pending temp marker, use its position
              if (tempMarker) {
                // Create new marker with the selected equipment
                const markerData: Omit<MarkerData, 'id' | 'created_at' | 'updated_at'> = {
                  floorplan_id: floorplan.id,
                  unique_id: uuidv4(),
                  page: currentPage,
                  position_x: tempMarker.position_x!,
                  position_y: tempMarker.position_y!,
                  marker_type: equipment.type,
                  equipment_id: equipment.id,
                  layer_id: activeLayer?.id,
                  label: equipment.label,
                  version: 1
                };
                
                // Add camera-specific properties
                if (equipment.type === 'camera') {
                  markerData.fov = 90;
                  markerData.range = 60;
                  markerData.rotation = 0;
                }
                
                // Add the marker
                addMarkerMutation.mutate(markerData);
              }
              
              setShowEquipmentSelectDialog(false);
              setTempMarker(null);
            }}
            onCancel={() => {
              setShowEquipmentSelectDialog(false);
              setTempMarker(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

### Camera Marker Visualization (CameraMarker.tsx)

The CameraMarker component renders a camera icon with adjustable field-of-view visualization.

```typescript
// Calculate the FOV arc points
const calculateFovArc = () => {
  const centerX = position.x;
  const centerY = position.y;
  
  // Handle the special case of 360 degrees
  if (fov >= 360) {
    // For 360-degree FOV, draw a complete circle
    return `M${centerX},${centerY} 
            m${range},0 
            a${range},${range} 0 1,0 -${range*2},0 
            a${range},${range} 0 1,0 ${range*2},0 
            Z`;
  }
  
  // For other FOV values, calculate the arc
  // Convert FOV from degrees to radians (clamped between 0 and 360)
  const clampedFov = Math.max(0, Math.min(360, fov));
  const fovRadians = (clampedFov * Math.PI) / 180;
  
  // Calculate the starting and ending angles based on rotation
  const rotationRadians = (rotation * Math.PI) / 180;
  const startAngle = rotationRadians - fovRadians / 2;
  const endAngle = rotationRadians + fovRadians / 2;
  
  // Generate points along the arc
  const arcPoints: Point[] = [];
  // More segments for wider FOVs for smoother curves
  const segments = Math.max(20, Math.ceil(clampedFov / 10)); 
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (i / segments) * fovRadians;
    const x = centerX + range * Math.cos(angle);
    const y = centerY + range * Math.sin(angle);
    arcPoints.push({ x, y });
  }
  
  // Create an SVG path for the arc
  let path = `M${centerX},${centerY}`;
  
  // Add the arc segments
  arcPoints.forEach(point => {
    path += ` L${point.x},${point.y}`;
  });
  
  // Return to center to complete the shape
  path += ` Z`;
  
  return path;
};
```

### Coordinate Transformation System (coordinates.ts)

The coordinate transformation system is crucial for accurate marker placement and manipulation, providing bidirectional mapping between screen coordinates and PDF coordinates.

```typescript
/**
 * Convert screen coordinates to PDF coordinates
 * 
 * @param screenX - X coordinate in screen space
 * @param screenY - Y coordinate in screen space
 * @param debug - Whether to log debug information
 * @param precision - Decimal places to preserve (default: 4)
 * @returns Point in PDF coordinates
 */
screenToPdf(screenX: number, screenY: number, debug: boolean = false, precision: number = 4): Point {
  if (!this.containerElement) return { x: 0, y: 0 };
  
  // Get container-relative coordinates
  const rect = this.containerElement.getBoundingClientRect();
  const containerX = screenX - rect.left;
  const containerY = screenY - rect.top;
  
  // Transform to PDF coordinates
  const pdfX = (containerX - this.translateX) / this.scale;
  const pdfY = (containerY - this.translateY) / this.scale;
  
  if (debug) {
    console.log(`Screen(${screenX}, ${screenY}) → PDF(${pdfX.toFixed(precision)}, ${pdfY.toFixed(precision)}) @ scale ${this.scale.toFixed(2)}`);
  }
  
  // Use higher precision for greater zoom levels
  const adjustedPrecision = Math.min(Math.max(2, Math.ceil(Math.log10(this.scale) + 2)), precision);
  
  // Ensure consistent precision with adaptive decimal places
  return {
    x: Number(pdfX.toFixed(adjustedPrecision)),
    y: Number(pdfY.toFixed(adjustedPrecision))
  };
}
```

### Layer Management System (LayerManager.tsx)

The layer management system allows users to organize annotations into logical groups with visibility controls.

```typescript
export function LayerManager({ floorplanId }: LayerManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('#3B82F6'); // Default blue color
  const [editingLayer, setEditingLayer] = useState<FloorplanLayer | null>(null);
  
  const { toast } = useToast();

  // Fetch layers
  const { 
    data: layers = [], 
    isLoading,
    isError, 
    error 
  } = useQuery<FloorplanLayer[]>({
    queryKey: ['/api/enhanced-floorplan', floorplanId, 'layers'],
    queryFn: async () => {
      const response = await fetch(`/api/enhanced-floorplan/${floorplanId}/layers`);
      if (!response.ok) {
        throw new Error('Failed to fetch layers');
      }
      return response.json();
    },
    enabled: !!floorplanId
  });
```

## Database Schema

The floorplans feature uses several PostgreSQL tables to store floorplan data, layers, calibration information, and markers. The database schema is designed to support versioning, multi-page documents, and a wide variety of annotation types.

### Floorplan Tables (schema.ts)

```typescript
// Floorplans
export const floorplans = pgTable("floorplans", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  pdf_data: text("pdf_data").notNull(),  // Base64 encoded PDF
  page_count: integer("page_count").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define marker types enum for better type safety
export const MARKER_TYPE = {
  ACCESS_POINT: 'access_point',
  CAMERA: 'camera',
  ELEVATOR: 'elevator',
  INTERCOM: 'intercom',
  NOTE: 'note',
  MEASUREMENT: 'measurement',
  AREA: 'area',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  TEXT: 'text',
  CALLOUT: 'callout',
  ARROW: 'arrow',
  CLOUD: 'cloud',
  POLYGON: 'polygon',
  STAMP: 'stamp',
} as const;

// Layers for organizing annotations
export const floorplanLayers = pgTable("floorplan_layers", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  visible: boolean("visible").notNull().default(true),
  order_index: integer("order_index").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Calibration data for scale management
export const floorplanCalibrations = pgTable("floorplan_calibrations", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").notNull(),
  real_world_distance: real("real_world_distance").notNull(),
  pdf_distance: real("pdf_distance").notNull(),
  unit: text("unit").notNull(), // feet, meters, inches
  start_x: real("start_x").notNull(),
  start_y: real("start_y").notNull(),
  end_x: real("end_x").notNull(),
  end_y: real("end_y").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Enhanced Floorplan Markers with PDF coordinate system
export const floorplanMarkers = pgTable("floorplan_markers", {
  id: serial("id").primaryKey(),
  unique_id: uuid("unique_id").notNull().defaultRandom(), // Unique ID for version tracking
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").notNull(),
  marker_type: text("marker_type").notNull(), // Using MarkerType
  equipment_id: integer("equipment_id"), // Now optional - not all markers are equipment
  layer_id: integer("layer_id"), // Reference to the layer
  
  // PDF coordinate system (in PDF points, 1/72 inch)
  position_x: real("position_x").notNull(),
  position_y: real("position_y").notNull(),
  
  // Camera-specific properties
  fov: real("fov").default(90), // Field of view in degrees (90° default)
  range: real("range").default(60), // Range/radius of the field of view (60 PDF units default)
  
  // Version control
  version: integer("version").notNull().default(1),
  parent_id: integer("parent_id"), // For tracking changes - references previous version
});
```

