import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/hooks/use-device';
import { 
  Loader2, 
  ZoomIn, 
  ZoomOut, 
  Plus, 
  Trash, 
  Ruler, 
  Grid, 
  Layers, 
  Move, 
  PenTool,
  CircleDot,
  Square,
  Type,
  Map
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document, Page } from 'react-pdf';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import '@/lib/pdf-worker';

// Import PDF-specific styles
import '@/styles/pdf.css';

// Type definition for floorplan
interface Floorplan {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
  created_at: string;
  updated_at: string;
}

// Enhanced marker types for Bluebeam-like functionality
type MarkerType = 
  | 'access_point' 
  | 'camera' 
  | 'elevator' 
  | 'intercom' 
  | 'note'
  | 'measurement'
  | 'area'
  | 'circle'
  | 'rectangle'
  | 'text';

// Tool modes for different editing operations
type ToolMode = 
  | 'select' 
  | 'pan' 
  | 'add_marker' 
  | 'calibrate'
  | 'measure_distance'
  | 'measure_area'
  | 'add_text';

// Calibration data to store scale information
interface CalibrationData {
  realWorldDistance: number;  // Distance in real-world units (e.g., feet)
  pdfDistance: number;        // Distance in PDF points
  unit: 'feet' | 'meters' | 'inches';
  pageNumber: number;
  startPoint: { x: number, y: number };
  endPoint: { x: number, y: number };
}

// Layer information for organizing markers
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  markerTypes: MarkerType[];
}

// Enhanced marker definition with additional Bluebeam-like properties
interface FloorplanMarker {
  id: number;
  floorplan_id: number;
  page: number;
  marker_type: MarkerType;
  equipment_id: number;
  position_x: number;
  position_y: number;
  label: string | null;
  created_at: string;
  // New properties for enhanced markers
  layer_id?: string;
  author?: string;
  width?: number;
  height?: number;
  rotation?: number;
  // For measurements
  end_x?: number;
  end_y?: number;
  // For multi-point shapes like polygons
  points?: { x: number, y: number }[];
  // For text annotations
  text_content?: string;
  font_size?: number;
  // For styling
  color?: string;
  fill_color?: string;
  line_width?: number;
  opacity?: number;
  // For collaboration
  comments?: { author: string, text: string, timestamp: string }[];
}

// Props for the component
interface FixedFloorplanViewerProps {
  projectId: number;
  onMarkersUpdated?: () => void;
}

const FixedFloorplanViewerTemp: React.FC<FixedFloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Basic state
  const [pdfScale, setPdfScale] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFloorplanName, setNewFloorplanName] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Enhanced Bluebeam-like features state
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [selectedMarkerType, setSelectedMarkerType] = useState<MarkerType>('access_point');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(20); // Grid size in pixels
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [calibrationMode, setCalibrationMode] = useState<boolean>(false);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [calibrationStep, setCalibrationStep] = useState<number>(0);
  const [calibrationPoints, setCalibrationPoints] = useState<{ start?: { x: number, y: number }, end?: { x: number, y: number } }>({});
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState<boolean>(false);
  const [realWorldDistance, setRealWorldDistance] = useState<number>(0);
  const [distanceUnit, setDistanceUnit] = useState<'feet' | 'meters' | 'inches'>('feet');
  
  // Layers for organizing markers
  const [layers, setLayers] = useState<Layer[]>([
    { 
      id: 'security', 
      name: 'Security Equipment', 
      visible: true, 
      color: '#3b82f6', 
      markerTypes: ['access_point', 'camera', 'intercom'] 
    },
    { 
      id: 'infrastructure', 
      name: 'Building Infrastructure', 
      visible: true, 
      color: '#10b981', 
      markerTypes: ['elevator'] 
    },
    { 
      id: 'notes', 
      name: 'Notes & Comments', 
      visible: true, 
      color: '#f59e0b', 
      markerTypes: ['note', 'text'] 
    },
    { 
      id: 'measurements', 
      name: 'Measurements', 
      visible: true, 
      color: '#ef4444', 
      markerTypes: ['measurement', 'area', 'circle', 'rectangle'] 
    }
  ]);
  
  // Fetch floorplans for this project
  const { 
    data: floorplans = [], 
    isLoading: isLoadingFloorplans 
  } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      if (!response.ok) {
        throw new Error('Failed to fetch floorplans');
      }
      return response.json();
    }
  });

  // Delete floorplan mutation
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      const response = await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete floorplan: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Floorplan Deleted',
        description: 'The floorplan has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      setSelectedFloorplanId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Upload floorplan mutation
  const uploadFloorplanMutation = useMutation({
    mutationFn: async ({ name, projectId, file }: { name: string; projectId: number; file: File }) => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('projectId', projectId.toString());
      formData.append('file', file);

      const response = await fetch('/api/floorplans/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload floorplan: ${errorText}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Floorplan Uploaded',
        description: 'The floorplan has been uploaded successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      setUploadDialogOpen(false);
      setNewFloorplanName('');
      setPdfFile(null);
      setSelectedFloorplanId(data.id);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set the first floorplan as selected when floorplans load and none is selected
  useEffect(() => {
    if (floorplans.length > 0 && !selectedFloorplanId) {
      setSelectedFloorplanId(floorplans[0].id);
    }
  }, [floorplans, selectedFloorplanId]);

  // Set canvas size to match PDF
  const updateCanvasSize = () => {
    if (canvasRef.current && pdfContainerRef.current) {
      const container = pdfContainerRef.current;
      canvasRef.current.width = container.offsetWidth;
      canvasRef.current.height = container.offsetHeight;
    }
  };

  // Handle PDF document load success
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to first page
    
    // Set up canvas after PDF loads
    setTimeout(updateCanvasSize, 100);
  };

  // Handle PDF document load error
  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    toast({
      title: 'Error',
      description: 'Failed to load the PDF document',
      variant: 'destructive',
    });
  };

  // Handle window resize to update canvas size
  useEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Handle floorplan upload
  const handleUploadFloorplan = () => {
    if (!pdfFile) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!newFloorplanName) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the floorplan',
        variant: 'destructive',
      });
      return;
    }

    uploadFloorplanMutation.mutate({
      name: newFloorplanName,
      projectId,
      file: pdfFile,
    });
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 2.5));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Convert screen coordinates to PDF coordinates
  const screenToPdfCoordinates = (screenX: number, screenY: number): { x: number, y: number } => {
    if (!pdfContainerRef.current) {
      return { x: 0, y: 0 };
    }
    
    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    const relativeX = screenX - containerRect.left;
    const relativeY = screenY - containerRect.top;
    
    // Apply inverse of scale to get PDF coordinates
    return {
      x: relativeX / pdfScale,
      y: relativeY / pdfScale
    };
  };
  
  // Helper for grid snapping
  const snapToGridPoint = (x: number, y: number): { x: number, y: number } => {
    if (!snapToGrid) return { x, y };
    
    // Snap to nearest grid point
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };
  
  // Handle PDF click for various tools
  const handlePdfClick = (e: React.MouseEvent) => {
    // Get PDF coordinates from screen coordinates
    const coords = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Apply grid snapping if enabled
    const finalCoords = snapToGrid ? snapToGridPoint(coords.x, coords.y) : coords;
    
    // Handle different tool modes
    switch (toolMode) {
      case 'calibrate':
        handleCalibrationClick(finalCoords);
        break;
      case 'add_marker':
        handleAddMarker(finalCoords);
        break;
      case 'measure_distance':
        // To be implemented
        toast({
          title: "Coming Soon",
          description: "Distance measurement tool will be implemented soon."
        });
        break;
      case 'measure_area':
        // To be implemented
        toast({
          title: "Coming Soon",
          description: "Area measurement tool will be implemented soon."
        });
        break;
      case 'add_text':
        // To be implemented
        toast({
          title: "Coming Soon",
          description: "Text annotation tool will be implemented soon."
        });
        break;
      // For select and pan modes, we'll implement those separately
    }
  };
  
  // Handle calibration process
  const handleCalibrationClick = (coords: { x: number, y: number }) => {
    if (calibrationStep === 0) {
      // First point
      setCalibrationPoints({ start: coords });
      setCalibrationStep(1);
    } else if (calibrationStep === 1) {
      // Second point
      setCalibrationPoints(prev => ({ ...prev, end: coords }));
      setCalibrationStep(2);
    }
  };
  
  // Handle adding a marker
  const handleAddMarker = (coords: { x: number, y: number }) => {
    if (!selectedFloorplan) return;
    
    // Find the layer for this marker type
    const layerForMarker = layers.find(layer => 
      layer.markerTypes.includes(selectedMarkerType)
    );
    
    // Prepare marker data
    const newMarker: Partial<FloorplanMarker> = {
      floorplan_id: selectedFloorplan.id,
      page: currentPage,
      marker_type: selectedMarkerType,
      position_x: coords.x,
      position_y: coords.y,
      layer_id: layerForMarker?.id,
      // Equipment ID would come from a database or UI selection
      equipment_id: 0,
      // Add default size based on marker type
      width: selectedMarkerType === 'note' ? 100 : 20,
      height: selectedMarkerType === 'note' ? 100 : 20,
    };
    
    // TODO: Add API call to create marker
    toast({
      title: "Marker Added",
      description: `Added ${selectedMarkerType} marker at position (${Math.round(coords.x)}, ${Math.round(coords.y)})`
    });
    
    // For now this is a placeholder; in the full implementation we'd call:
    // createMarkerMutation.mutate(newMarker);
  };
  
  // Calculate real-world measurements based on calibration
  const calculateRealWorldMeasurement = (pdfDistance: number): number => {
    if (!calibrationData) return pdfDistance;
    
    // Convert PDF distance to real-world distance based on calibration
    return (pdfDistance * calibrationData.realWorldDistance) / calibrationData.pdfDistance;
  };

  // Get the selected floorplan
  const selectedFloorplan = floorplans.find(f => f.id === selectedFloorplanId) || null;

  // Loading state
  if (isLoadingFloorplans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading floorplans...</span>
      </div>
    );
  }

  // Render the component
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {floorplans.length === 0 ? (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>No Floorplans Found</CardTitle>
            <CardDescription>
              Upload a floorplan PDF to get started
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Floorplan
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle>Floorplans</CardTitle>
                  <CardDescription>
                    Select a floorplan to view
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {floorplans.map((floorplan) => (
                      <div 
                        key={floorplan.id}
                        className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                          floorplan.id === selectedFloorplanId ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedFloorplanId(floorplan.id)}
                      >
                        <span>{floorplan.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this floorplan?')) {
                              deleteFloorplanMutation.mutate(floorplan.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Floorplan
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="w-full md:w-3/4">
              {selectedFloorplan ? (
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{selectedFloorplan.name}</CardTitle>
                      <CardDescription>
                        {numPages > 0 ? `Page ${currentPage} of ${numPages}` : 'Loading...'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleZoomOut}
                        disabled={pdfScale <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{Math.round(pdfScale * 100)}%</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleZoomIn}
                        disabled={pdfScale >= 2.5}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {/* Bluebeam-style toolbar */}
                  <div className="border-t border-b p-2 bg-slate-50">
                    <div className="flex flex-wrap gap-2">
                      <TooltipProvider>
                        {/* Tool selection group */}
                        <div className="flex items-center mr-4">
                          <ToggleGroup type="single" value={toolMode} onValueChange={(value) => value && setToolMode(value as ToolMode)}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="select" aria-label="Select tool">
                                  <Move className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Select tool</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="pan" aria-label="Pan tool">
                                  <Map className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Pan tool</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="add_marker" aria-label="Add marker">
                                  <CircleDot className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add marker</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="calibrate" aria-label="Calibrate">
                                  <Ruler className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Calibrate scale</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="measure_distance" aria-label="Measure distance">
                                  <PenTool className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Measure distance</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="measure_area" aria-label="Measure area">
                                  <Square className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Measure area</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ToggleGroupItem value="add_text" aria-label="Add text">
                                  <Type className="h-4 w-4" />
                                </ToggleGroupItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add text</p>
                              </TooltipContent>
                            </Tooltip>
                          </ToggleGroup>
                        </div>
                        
                        {/* Grid and snap controls */}
                        <div className="flex items-center gap-2 mr-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={showGrid ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowGrid(!showGrid)}
                              >
                                <Grid className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Toggle grid</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {showGrid && (
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id="snap-to-grid"
                                checked={snapToGrid}
                                onCheckedChange={(checked) => setSnapToGrid(!!checked)}
                              />
                              <Label htmlFor="snap-to-grid" className="text-xs">
                                Snap to grid
                              </Label>
                            </div>
                          )}
                        </div>
                        
                        {/* Layer visibility */}
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Toggle layer dialog in future implementation
                                  toast({
                                    title: "Layers",
                                    description: "Layer management dialog will be implemented soon."
                                  });
                                }}
                              >
                                <Layers className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage layers</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Display active layers as badges */}
                          <div className="flex flex-wrap gap-1">
                            {layers.filter(layer => layer.visible).map(layer => (
                              <Badge key={layer.id} variant="outline" style={{ borderColor: layer.color, color: layer.color }}>
                                {layer.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TooltipProvider>
                    </div>
                    
                    {/* Conditional secondary toolbar based on selected tool */}
                    {toolMode === 'add_marker' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <span className="text-sm font-medium">Marker type:</span>
                        <Select
                          value={selectedMarkerType}
                          onValueChange={(value) => setSelectedMarkerType(value as MarkerType)}
                        >
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="Select marker type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="access_point">Access Point</SelectItem>
                            <SelectItem value="camera">Camera</SelectItem>
                            <SelectItem value="elevator">Elevator</SelectItem>
                            <SelectItem value="intercom">Intercom</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground ml-2">
                          Click on the document to add a marker
                        </span>
                      </div>
                    )}
                    
                    {toolMode === 'calibrate' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <span className="text-sm font-medium">Calibration:</span>
                        {calibrationStep === 0 && (
                          <span className="text-sm text-muted-foreground">
                            Click two points to define a known distance
                          </span>
                        )}
                        {calibrationStep === 1 && (
                          <span className="text-sm text-blue-500">
                            Click a second point to complete the measurement
                          </span>
                        )}
                        {calibrationStep === 2 && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Distance"
                              className="w-24 h-8"
                              value={realWorldDistance || ''}
                              onChange={(e) => setRealWorldDistance(parseFloat(e.target.value))}
                            />
                            <Select
                              value={distanceUnit}
                              onValueChange={(value) => setDistanceUnit(value as 'feet' | 'meters' | 'inches')}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="feet">Feet</SelectItem>
                                <SelectItem value="meters">Meters</SelectItem>
                                <SelectItem value="inches">Inches</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                if (!realWorldDistance) {
                                  toast({
                                    title: "Error",
                                    description: "Please enter a valid distance",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // Calculate calibration
                                if (calibrationPoints.start && calibrationPoints.end) {
                                  const dx = calibrationPoints.end.x - calibrationPoints.start.x;
                                  const dy = calibrationPoints.end.y - calibrationPoints.start.y;
                                  const pdfDistance = Math.sqrt(dx * dx + dy * dy);
                                  
                                  setCalibrationData({
                                    realWorldDistance,
                                    pdfDistance,
                                    unit: distanceUnit,
                                    pageNumber: currentPage,
                                    startPoint: calibrationPoints.start,
                                    endPoint: calibrationPoints.end
                                  });
                                  
                                  toast({
                                    title: "Calibration Set",
                                    description: `Scale set to 1:${(pdfDistance / realWorldDistance).toFixed(2)} (${distanceUnit})`,
                                  });
                                  
                                  // Reset calibration mode
                                  setCalibrationStep(0);
                                  setCalibrationPoints({});
                                  setToolMode('select');
                                }
                              }}
                            >
                              Set Scale
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setCalibrationStep(0);
                                setCalibrationPoints({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* PDF Viewer with Canvas Overlay */}
                  <CardContent className="p-0 relative overflow-auto">
                    <div
                      ref={pdfContainerRef}
                      className="relative"
                      style={{
                        transformOrigin: 'top left',
                        background: 'white'
                      }}
                    >
                      {/* Grid overlay if enabled */}
                      {showGrid && (
                        <div 
                          className="absolute inset-0 pointer-events-none" 
                          style={{
                            backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
                            backgroundSize: `${gridSize * pdfScale}px ${gridSize * pdfScale}px`,
                            zIndex: 10
                          }}
                        />
                      )}
                      
                      <div
                        style={{
                          transform: `scale(${pdfScale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <Document
                          file={`data:application/pdf;base64,${selectedFloorplan.pdf_data}`}
                          onLoadSuccess={handleDocumentLoadSuccess}
                          onLoadError={handleDocumentLoadError}
                          className="react-pdf__Document bg-white"
                          options={{
                            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                            cMapPacked: true,
                          }}
                        >
                          <Page
                            pageNumber={currentPage}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="react-pdf__Page"
                          />
                        </Document>
                        
                        {/* Calibration line overlay */}
                        {calibrationStep > 0 && calibrationPoints.start && (
                          <div 
                            className="absolute top-0 left-0 pointer-events-none" 
                            style={{ zIndex: 20 }}
                          >
                            <svg 
                              width="100%" 
                              height="100%" 
                              style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0,
                                overflow: 'visible'
                              }}
                            >
                              {calibrationPoints.start && (
                                <circle 
                                  cx={calibrationPoints.start.x} 
                                  cy={calibrationPoints.start.y} 
                                  r={4} 
                                  fill="rgba(59, 130, 246, 0.5)" 
                                  stroke="#3b82f6" 
                                  strokeWidth="2" 
                                />
                              )}
                              
                              {calibrationPoints.end && (
                                <>
                                  <circle 
                                    cx={calibrationPoints.end.x} 
                                    cy={calibrationPoints.end.y} 
                                    r={4} 
                                    fill="rgba(59, 130, 246, 0.5)" 
                                    stroke="#3b82f6" 
                                    strokeWidth="2" 
                                  />
                                  <line 
                                    x1={calibrationPoints.start.x} 
                                    y1={calibrationPoints.start.y} 
                                    x2={calibrationPoints.end.x} 
                                    y2={calibrationPoints.end.y} 
                                    stroke="#3b82f6" 
                                    strokeWidth="2" 
                                    strokeDasharray="5,5" 
                                  />
                                </>
                              )}
                            </svg>
                          </div>
                        )}
                        
                        {/* Canvas overlay for drawing */}
                        <canvas 
                          ref={canvasRef}
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{ zIndex: 15 }}
                        />
                        
                        {/* Markers will be added here */}
                      </div>
                    </div>
                  </CardContent>
                  
                  {numPages > 1 && (
                    <CardFooter className="flex justify-center gap-4 p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <Select
                        value={currentPage.toString()}
                        onValueChange={(value) => setCurrentPage(parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder={currentPage.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(numPages)].map((_, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= numPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                      >
                        Next
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <Card className="text-center p-6">
                  <CardContent>
                    <p className="text-muted-foreground">Please select a floorplan to view</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Floorplan</DialogTitle>
            <DialogDescription>
              Upload a PDF floorplan to add to this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for this floorplan"
                value={newFloorplanName}
                onChange={(e) => setNewFloorplanName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFloorplan} 
              disabled={uploadFloorplanMutation.isPending}
            >
              {uploadFloorplanMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FixedFloorplanViewerTemp;