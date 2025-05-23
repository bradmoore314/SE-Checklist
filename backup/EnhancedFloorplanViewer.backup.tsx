import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Loader2, 
  Upload, 
  Plus, 
  X, 
  MapPin, 
  Video, 
  ArrowUpDown, 
  Phone, 
  StickyNote,
  ZoomIn,
  ZoomOut,
  Trash,
  Copy,
  MoreVertical,
  Edit
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import the equipment-specific modals
import AddAccessPointModal from '@/components/modals/AddAccessPointModal';
import AddCameraModal from '@/components/modals/AddCameraModal';
import AddElevatorModal from '@/components/modals/AddElevatorModal';
import AddIntercomModal from '@/components/modals/AddIntercomModal';

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

// Type definition for marker
interface FloorplanMarker {
  id: number;
  floorplan_id: number;
  page: number;
  marker_type: 'access_point' | 'camera' | 'elevator' | 'intercom' | 'note';
  equipment_id: number;
  position_x: number;
  position_y: number;
  label: string | null;
  created_at: string;
}

// Marker colors by type
const markerColors = {
  access_point: '#FF4D4F', // Red
  camera: '#1890FF',       // Blue
  elevator: '#722ED1',     // Purple
  intercom: '#13C2C2',     // Teal
  note: '#FAAD14'          // Yellow/Orange
};

// Marker icons by type
const MarkerIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'access_point':
      return <MapPin size={16} />;
    case 'camera':
      return <Video size={16} />;
    case 'elevator':
      return <ArrowUpDown size={16} />;
    case 'intercom':
      return <Phone size={16} />;
    case 'note':
      return <StickyNote size={16} />;
    default:
      return <MapPin size={16} />;
  }
};

interface EnhancedFloorplanViewerProps {
  projectId: number;
  onMarkersUpdated?: () => void;
}

const EnhancedFloorplanViewer = ({ projectId, onMarkersUpdated }: EnhancedFloorplanViewerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for floorplan management
  const [newFloorplanName, setNewFloorplanName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // State for marker management
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [markerDialogOpen, setMarkerDialogOpen] = useState(false);
  const [markerType, setMarkerType] = useState<'access_point' | 'camera' | 'elevator' | 'intercom' | 'note'>('access_point');
  const [newMarkerPosition, setNewMarkerPosition] = useState<{x: number, y: number} | null>(null);
  const [markerLabel, setMarkerLabel] = useState('');
  const [draggedMarker, setDraggedMarker] = useState<number | null>(null);
  const [markerSize, setMarkerSize] = useState<Record<number, {width: number, height: number}>>({});
  const [resizingMarker, setResizingMarker] = useState<number | null>(null);
  const [initialResizeData, setInitialResizeData] = useState<{
    size: {width: number, height: number},
    mousePos: {x: number, y: number}
  } | null>(null);
  
  // State for equipment-specific modals
  const [showAccessPointModal, setShowAccessPointModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showElevatorModal, setShowElevatorModal] = useState(false);
  const [showIntercomModal, setShowIntercomModal] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  
  // Fetch floorplans for this project
  const { 
    data: floorplans = [], 
    isLoading: isLoadingFloorplans,
    refetch: refetchFloorplans 
  } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      return await res.json();
    },
    enabled: !!projectId,
  });
  
  // Get the selected floorplan
  const selectedFloorplan = floorplans.find((f: Floorplan) => f.id === selectedFloorplanId) || null;
  
  // Fetch markers for the selected floorplan
  const { 
    data: markers = [], 
    isLoading: isLoadingMarkers,
    refetch: refetchMarkers
  } = useQuery<FloorplanMarker[]>({
    queryKey: ['/api/floorplans', selectedFloorplanId, 'markers'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/floorplans/${selectedFloorplanId}/markers`);
      return await res.json();
    },
    enabled: !!selectedFloorplanId,
  });
  
  // Create a new floorplan
  const uploadFloorplanMutation = useMutation({
    mutationFn: async (floorplanData: any) => {
      const res = await apiRequest('POST', '/api/floorplans', floorplanData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Floorplan Uploaded",
        description: "The floorplan has been successfully uploaded.",
      });
      
      // Reset form
      setNewFloorplanName('');
      setPdfFile(null);
      
      // Close the dialog
      setUploadDialogOpen(false);
      
      // Refetch floorplans
      refetchFloorplans();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: `Error uploading floorplan: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Create a new marker
  const createMarkerMutation = useMutation({
    mutationFn: async (markerData: any) => {
      const res = await apiRequest('POST', '/api/floorplan-markers', markerData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Marker Added",
        description: `New ${markerType} marker has been added.`,
      });
      
      // Close the dialog
      setMarkerDialogOpen(false);
      
      // Reset form
      setMarkerLabel('');
      setMarkerType('access_point');
      
      // Refetch markers
      refetchMarkers();
      
      // Callback
      if (onMarkersUpdated) onMarkersUpdated();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Marker",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete a marker
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      const res = await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Marker Deleted",
        description: "The marker has been removed.",
      });
      
      // Refetch markers
      refetchMarkers();
      
      // Callback
      if (onMarkersUpdated) onMarkersUpdated();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete a floorplan
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      const res = await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Floorplan Deleted",
        description: "The floorplan has been removed.",
      });
      
      // Reset selected floorplan
      setSelectedFloorplanId(null);
      
      // Refetch floorplans
      refetchFloorplans();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Set first floorplan as selected if none is selected
  useEffect(() => {
    if (floorplans.length > 0 && !selectedFloorplanId) {
      setSelectedFloorplanId(floorplans[0].id);
    }
  }, [floorplans, selectedFloorplanId]);
  
  // Create blob URL for PDF display
  useEffect(() => {
    if (selectedFloorplan && selectedFloorplan.pdf_data) {
      try {
        // Clean up previous blob URL
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }

        // Check if the pdf_data is already a data URL
        if (selectedFloorplan.pdf_data.startsWith('data:application/pdf;base64,')) {
          // Extract the base64 part
          const base64Data = selectedFloorplan.pdf_data.split(',')[1];
          processPdfBase64(base64Data);
        } else {
          // Assume it's just a base64 string without the data URL prefix
          processPdfBase64(selectedFloorplan.pdf_data);
        }
      } catch (err) {
        console.error('Error creating blob URL:', err);
        setPdfBlobUrl(null);
        toast({
          title: "Error",
          description: "Failed to process PDF data",
          variant: "destructive",
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [selectedFloorplan]);
  
  // Helper function to process base64 PDF data
  const processPdfBase64 = (base64Data: string) => {
    try {
      // Convert base64 string to binary
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Create blob from binary data
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (err) {
      console.error('Error processing PDF data:', err);
      setPdfBlobUrl(null);
      toast({
        title: "Error",
        description: "Failed to decode PDF data. Make sure it's a valid PDF file.",
        variant: "destructive",
      });
    }
  };
  
  // Handle file change for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  // Handle floorplan upload
  const handleUploadFloorplan = async () => {
    if (!pdfFile || !newFloorplanName) {
      toast({
        title: "Error",
        description: "Please provide a name and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Make sure we're uploading a PDF file
    if (!pdfFile.type.includes('pdf')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file (application/pdf)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show that we're processing the file
      toast({
        title: "Processing",
        description: `Converting ${pdfFile.name} (${Math.round(pdfFile.size / 1024)} KB)`,
      });

      // Convert PDF to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (e.target && e.target.result) {
            const result = e.target.result.toString();
            // Make sure we have a data URL
            if (!result.startsWith('data:')) {
              throw new Error('Invalid file format');
            }
            
            const base64 = result.split(',')[1];
            if (!base64) {
              throw new Error('Failed to extract base64 data');
            }
            
            await uploadFloorplanMutation.mutateAsync({
              name: newFloorplanName,
              pdf_data: base64,
              project_id: projectId
            });
          }
        } catch (err) {
          console.error('Error processing file:', err);
          toast({
            title: "Upload Error",
            description: `Error processing the PDF: ${err instanceof Error ? err.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Failed to read the PDF file",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(pdfFile);
    } catch (err) {
      console.error('Upload preparation error:', err);
      toast({
        title: "Error",
        description: `Failed to prepare the file for upload: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  // Handle PDF container click for marker placement
  const handlePdfContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !containerRef.current) return;

    // Prevent event bubbling
    e.stopPropagation();
    
    const container = containerRef.current;
    
    // Get PDF container for more accurate positioning
    // Specifically targeting the PDF container with ID to ensure we're getting the right element
    const pdfContainer = container.querySelector('#pdf-container') as HTMLElement;
    if (!pdfContainer) {
      console.error('PDF container not found. Using parent container rect instead.');
      return;
    }
    
    const pdfRect = pdfContainer.getBoundingClientRect();
    
    // Calculate position as percentage of the PDF container
    const x = ((e.clientX - pdfRect.left) / pdfRect.width) * 100;
    const y = ((e.clientY - pdfRect.top) / pdfRect.height) * 100;
    
    // Ensure the coordinates are within bounds (0-100%) and round to integers
    const boundedX = Math.round(Math.max(0, Math.min(100, x)));
    const boundedY = Math.round(Math.max(0, Math.min(100, y)));
    
    console.log('Click position:', { x: boundedX, y: boundedY });
    setNewMarkerPosition({ x: boundedX, y: boundedY });
    
    // Always open the marker type selection dialog first
    setMarkerDialogOpen(true);
  };
  
  // Handle marker drag
  const handleDragStart = (e: React.MouseEvent, markerId: number) => {
    if (isAddingMarker) return; // Don't allow dragging when in adding mode
    setDraggedMarker(markerId);
    e.stopPropagation();
  };
  
  // Handle marker position update after drag
  const updateMarkerPosition = (markerId: number, x: number, y: number) => {
    const markerToUpdate = markers.find((m: FloorplanMarker) => m.id === markerId);
    
    if (markerToUpdate) {
      apiRequest('PUT', `/api/floorplan-markers/${markerId}`, {
        position_x: x,
        position_y: y,
        // Add these required fields
        floorplan_id: markerToUpdate.floorplan_id,
        page: markerToUpdate.page,
        marker_type: markerToUpdate.marker_type,
        equipment_id: markerToUpdate.equipment_id,
        label: markerToUpdate.label
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update marker position');
        }
        return response.json();
      })
      .then(() => {
        // Refresh markers
        queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      })
      .catch(err => {
        console.error('Error updating marker position:', err);
        toast({
          title: "Error",
          description: "Failed to update marker position",
          variant: "destructive",
        });
      });
    }
  };
  
  // Handle marker resize start
  const handleResizeStart = (e: React.MouseEvent, markerId: number) => {
    if (isAddingMarker) return; // Don't allow resizing when in adding mode
    
    e.stopPropagation();
    e.preventDefault();
    
    setResizingMarker(markerId);
    
    // Get the current marker size
    const currentSize = markerSize[markerId] || { width: 32, height: 32 };
    
    // Store the initial mouse position and size
    setInitialResizeData({
      size: currentSize,
      mousePos: { x: e.clientX, y: e.clientY }
    });
  };
  
  // Update marker size in state
  const updateMarkerSize = (markerId: number, width: number, height: number) => {
    setMarkerSize(prev => ({
      ...prev,
      [markerId]: { width, height }
    }));
  };
  
  // Setup event listeners for drag operations with debounce for better performance
  useEffect(() => {
    if (!draggedMarker) return;
    
    // Keep track of the last position to prevent excessive updates
    let lastPosition = { x: 0, y: 0 };
    let isInitialized = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      // Get the PDF container for accurate positioning
      const pdfContainer = container.querySelector('#pdf-container') as HTMLElement;
      if (!pdfContainer) {
        console.error('PDF container not found during drag');
        return;
      }
      
      const pdfRect = pdfContainer.getBoundingClientRect();
      
      // Calculate position as percentage of the PDF container
      const x = ((e.clientX - pdfRect.left) / pdfRect.width) * 100;
      const y = ((e.clientY - pdfRect.top) / pdfRect.height) * 100;
      
      // Ensure coordinates are within bounds (0-100%) and round to integers
      const boundedX = Math.round(Math.max(0, Math.min(100, x)));
      const boundedY = Math.round(Math.max(0, Math.min(100, y)));
      
      console.log('Drag position:', { x: boundedX, y: boundedY });
      
      // Initialize last position with the first mouse move event
      if (!isInitialized) {
        lastPosition = { x: boundedX, y: boundedY };
        isInitialized = true;
      }
      
      // Update marker position in UI immediately for smooth movement
      const markerElement = document.getElementById(`marker-${draggedMarker}`);
      if (markerElement) {
        markerElement.style.left = `${boundedX}%`;
        markerElement.style.top = `${boundedY}%`;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggedMarker || !containerRef.current) return;
      
      const container = containerRef.current;
      
      // Get the PDF container for accurate positioning
      const pdfContainer = container.querySelector('#pdf-container') as HTMLElement;
      if (!pdfContainer) {
        console.error('PDF container not found during drag end');
        setDraggedMarker(null);
        return;
      }
      
      const pdfRect = pdfContainer.getBoundingClientRect();
      
      // Calculate position as percentage of the PDF container
      const x = ((e.clientX - pdfRect.left) / pdfRect.width) * 100;
      const y = ((e.clientY - pdfRect.top) / pdfRect.height) * 100;
      
      // Ensure coordinates are within bounds (0-100%) and round to integers
      const boundedX = Math.round(Math.max(0, Math.min(100, x)));
      const boundedY = Math.round(Math.max(0, Math.min(100, y)));
      
      console.log('Drop position:', { x: boundedX, y: boundedY });
      
      // Check if there was actual movement before updating in the backend
      if (Math.abs(boundedX - lastPosition.x) > 0 || Math.abs(boundedY - lastPosition.y) > 0) {
        // Update marker position in backend
        updateMarkerPosition(draggedMarker, boundedX, boundedY);
      }
      
      // Reset dragged marker
      setDraggedMarker(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedMarker, containerRef.current]);
  
  // Setup event listeners for resize operations
  useEffect(() => {
    if (!resizingMarker || !initialResizeData) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Get change in mouse position from the initial position
      const deltaX = e.clientX - initialResizeData.mousePos.x;
      const deltaY = e.clientY - initialResizeData.mousePos.y;
      
      // Calculate new size with minimum of 20px
      const newWidth = Math.max(20, initialResizeData.size.width + deltaX);
      const newHeight = Math.max(20, initialResizeData.size.height + deltaY);
      
      // Update the marker size in the UI for immediate feedback
      const markerElement = document.getElementById(`marker-${resizingMarker}`);
      if (markerElement) {
        markerElement.style.width = `${newWidth}px`;
        markerElement.style.height = `${newHeight}px`;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!resizingMarker || !initialResizeData) return;
      
      // Calculate final size
      const deltaX = e.clientX - initialResizeData.mousePos.x;
      const deltaY = e.clientY - initialResizeData.mousePos.y;
      
      const newWidth = Math.max(20, initialResizeData.size.width + deltaX);
      const newHeight = Math.max(20, initialResizeData.size.height + deltaY);
      
      // Update the marker size in state
      updateMarkerSize(resizingMarker, newWidth, newHeight);
      
      // Reset resizing state
      setResizingMarker(null);
      setInitialResizeData(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingMarker, initialResizeData]);
  
  // Create a new marker
  const handleAddMarker = () => {
    if (!selectedFloorplanId || !newMarkerPosition) return;
    
    createMarkerMutation.mutate({
      floorplan_id: selectedFloorplanId,
      page: 1, // Default to first page
      marker_type: markerType,
      equipment_id: 0, // Create a new equipment entry
      position_x: newMarkerPosition.x,
      position_y: newMarkerPosition.y,
      label: markerLabel || null
    });
  };
  
  // Zoom controls
  const zoomIn = () => setPdfScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setPdfScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setPdfScale(1);
  
  if (isLoadingFloorplans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading floorplans...</span>
      </div>
    );
  }
  
  return (
    <div className="floorplan-viewer">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          {/* Floorplan Selector */}
          <Select 
            value={selectedFloorplanId?.toString() || ''} 
            onValueChange={(value) => setSelectedFloorplanId(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a floorplan" />
            </SelectTrigger>
            <SelectContent>
              {floorplans.map((floorplan: Floorplan) => (
                <SelectItem key={floorplan.id} value={floorplan.id.toString()}>
                  {floorplan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Upload New Button */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Floorplan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Floorplan</DialogTitle>
                <DialogDescription>
                  Upload a PDF file of the floorplan. You'll be able to mark locations of equipment on this plan.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="floorplan-name">Floorplan Name</Label>
                  <Input
                    id="floorplan-name"
                    placeholder="e.g., 1st Floor, Lobby, etc."
                    value={newFloorplanName}
                    onChange={(e) => setNewFloorplanName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="pdf-file">PDF File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pdf-file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                  {pdfFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUploadFloorplan} 
                  disabled={!pdfFile || !newFloorplanName || uploadFloorplanMutation.isPending}
                >
                  {uploadFloorplanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Floorplan Button */}
          {selectedFloorplanId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Floorplan</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this floorplan? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteFloorplanMutation.mutate(selectedFloorplanId)}
                    disabled={deleteFloorplanMutation.isPending}
                  >
                    {deleteFloorplanMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Floorplan'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Equipment Marker Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isAddingMarker ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingMarker(!isAddingMarker)}
            disabled={!selectedFloorplanId}
          >
            {isAddingMarker ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add Marker
              </>
            )}
          </Button>
          
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={zoomOut} disabled={!selectedFloorplanId}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom} disabled={!selectedFloorplanId}>
              {Math.round(pdfScale * 100)}%
            </Button>
            <Button variant="outline" size="icon" onClick={zoomIn} disabled={!selectedFloorplanId}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floorplan Display Area */}
      {selectedFloorplan ? (
        <div className="border rounded-lg overflow-auto relative" style={{ height: 'calc(100vh - 250px)' }}>
          <div
            ref={containerRef}
            className="relative floorplan-container"
            onClick={handlePdfContainerClick}
            style={{ 
              cursor: isAddingMarker ? 'crosshair' : 'default',
              transform: `scale(${pdfScale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease-out'
            }}
          >
            {pdfBlobUrl ? (
              <div className="relative" id="pdf-container">
                {/* PDF Iframe */}
                <iframe
                  src={pdfBlobUrl}
                  className="w-full"
                  style={{ 
                    height: '800px',
                    pointerEvents: isAddingMarker ? 'none' : 'auto' 
                  }}
                  title="Floorplan PDF"
                />
                
                {/* Overlay div to catch clicks when in marker adding mode */}
                {isAddingMarker && (
                  <div 
                    className="absolute inset-0 z-10 cursor-crosshair" 
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
                
                {/* Markers Layer - Positioned absolutely over the PDF */}
                <div className="absolute inset-0 z-20">
                  {/* Render markers inside the PDF container */}
                  {!isLoadingMarkers && markers.map((marker: FloorplanMarker, index: number) => (
              marker.marker_type === 'note' ? (
                // Note marker as text with yellow background and red border
                <div
                  id={`marker-${marker.id}`}
                  key={marker.id}
                  className="absolute cursor-move active:cursor-grabbing"
                  style={{
                    left: `${marker.position_x}%`,
                    top: `${marker.position_y}%`,
                    width: `${markerSize[marker.id]?.width || 150}px`,
                    minHeight: `${markerSize[marker.id]?.height || 40}px`,
                    backgroundColor: '#FFFF00', // Yellow background
                    color: '#FF0000', // Red text
                    border: '2px solid #FF0000', // Red border
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    zIndex: (draggedMarker === marker.id || resizingMarker === marker.id) ? 1000 : 100,
                    transition: (draggedMarker === marker.id || resizingMarker === marker.id) ? 'none' : 'all 0.2s ease-out',
                    pointerEvents: isAddingMarker ? 'none' : 'auto',
                    touchAction: 'none',
                    position: 'relative', // Needed for the resize handle
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                  onMouseDown={(e) => handleDragStart(e, marker.id)}
                >
                  {marker.label || 'Note'}
                  
                  {/* Resize handle for notes */}
                  <div 
                    className="absolute bottom-0 right-0 w-6 h-6 bg-white border-2 border-red-500 cursor-se-resize transform translate-x-1/4 translate-y-1/4 z-20 flex items-center justify-center"
                    onMouseDown={(e) => handleResizeStart(e, marker.id)}
                    title="Resize note"
                  >
                    <ArrowUpDown className="h-4 w-4 text-red-500" />
                  </div>
                  
                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full p-1 shadow-sm">
                      <MoreVertical size={12} className="text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deleteMarkerMutation.mutate(marker.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        createMarkerMutation.mutate({
                          floorplan_id: marker.floorplan_id,
                          page: marker.page,
                          marker_type: marker.marker_type,
                          equipment_id: -1, // Notes don't have associated equipment
                          position_x: Math.min(100, marker.position_x + 2),
                          position_y: Math.min(100, marker.position_y + 2),
                          label: marker.label ? `${marker.label} (Copy)` : null
                        });
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // Edit note label
                        setMarkerDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                // Regular equipment markers as numbered circles
                <div
                  id={`marker-${marker.id}`}
                  key={marker.id}
                  className="absolute rounded-full flex items-center justify-center cursor-move active:cursor-grabbing hover:scale-105"
                  style={{
                    left: `${marker.position_x}%`,
                    top: `${marker.position_y}%`,
                    width: '36px',
                    height: '36px',
                    backgroundColor: markerColors[marker.marker_type as keyof typeof markerColors],
                    color: 'white',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    zIndex: (draggedMarker === marker.id || resizingMarker === marker.id) ? 1000 : 100,
                    transition: (draggedMarker === marker.id || resizingMarker === marker.id) ? 'none' : 'all 0.2s ease-out',
                    border: '2px solid white',
                    pointerEvents: isAddingMarker ? 'none' : 'auto',
                    touchAction: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    position: 'absolute' // Use absolute to ensure proper positioning
                  }}
                  onMouseDown={(e) => handleDragStart(e, marker.id)}
                >
                  {/* Numbered marker */}
                  {index + 1}
                  
                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute top-0 right-0 -mt-1 -mr-1 bg-white rounded-full p-0.5 shadow-sm">
                      <MoreVertical size={12} className="text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deleteMarkerMutation.mutate(marker.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // Duplicate marker logic
                        createMarkerMutation.mutate({
                          floorplan_id: marker.floorplan_id,
                          page: marker.page,
                          marker_type: marker.marker_type,
                          equipment_id: marker.equipment_id,
                          position_x: Math.min(100, marker.position_x + 2),
                          position_y: Math.min(100, marker.position_y + 2),
                          label: marker.label ? `${marker.label} (Copy)` : null
                        });
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // Edit marker logic (placeholder)
                        toast({
                          title: "Info",
                          description: "Edit functionality coming soon",
                        });
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border rounded-lg h-64">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium">No Floorplans Available</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a floorplan to get started.
            </p>
            <Button 
              className="mt-4" 
              variant="default" 
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Floorplan
            </Button>
          </div>
        </div>
      )}
      
      {/* Marker Legend */}
      {selectedFloorplan && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Marker Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors.access_point }}></div>
              <span className="text-sm">Access Points ({markers.filter((m: FloorplanMarker) => m.marker_type === 'access_point').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors.camera }}></div>
              <span className="text-sm">Cameras ({markers.filter((m: FloorplanMarker) => m.marker_type === 'camera').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors.elevator }}></div>
              <span className="text-sm">Elevators ({markers.filter((m: FloorplanMarker) => m.marker_type === 'elevator').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors.intercom }}></div>
              <span className="text-sm">Intercoms ({markers.filter((m: FloorplanMarker) => m.marker_type === 'intercom').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors.note }}></div>
              <span className="text-sm">Notes ({markers.filter((m: FloorplanMarker) => m.marker_type === 'note').length})</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Marker Type Selection Dialog */}
      <Dialog open={markerDialogOpen} onOpenChange={setMarkerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Marker</DialogTitle>
            <DialogDescription>
              Choose the type of equipment to add at this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="marker-type">Marker Type</Label>
              <Tabs 
                defaultValue="access_point" 
                value={markerType} 
                onValueChange={(value) => setMarkerType(value as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-5 mb-2">
                  <TabsTrigger value="access_point">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Access</span>
                  </TabsTrigger>
                  <TabsTrigger value="camera">
                    <Video className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Camera</span>
                  </TabsTrigger>
                  <TabsTrigger value="elevator">
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Elevator</span>
                  </TabsTrigger>
                  <TabsTrigger value="intercom">
                    <Phone className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Intercom</span>
                  </TabsTrigger>
                  <TabsTrigger value="note">
                    <StickyNote className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Note</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setMarkerDialogOpen(false);
                setNewMarkerPosition(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setMarkerDialogOpen(false);
                // Open the appropriate modal based on the selected type
                if (markerType === 'access_point') {
                  setShowAccessPointModal(true);
                } else if (markerType === 'camera') {
                  setShowCameraModal(true);
                } else if (markerType === 'elevator') {
                  setShowElevatorModal(true);
                } else if (markerType === 'intercom') {
                  setShowIntercomModal(true);
                } else if (markerType === 'note') {
                  setNoteDialogOpen(true);
                }
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Note Marker Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note Marker</DialogTitle>
            <DialogDescription>
              Add a note or label to the floorplan at this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-label">Note Label</Label>
              <Input
                id="note-label"
                placeholder="e.g., Emergency Exit, Storage Room"
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNoteDialogOpen(false);
                setNewMarkerPosition(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!selectedFloorplanId || !newMarkerPosition) return;
                
                createMarkerMutation.mutate({
                  floorplan_id: selectedFloorplanId,
                  page: 1, // Default to first page
                  marker_type: 'note',
                  equipment_id: -1, // Notes don't have associated equipment
                  position_x: newMarkerPosition.x,
                  position_y: newMarkerPosition.y,
                  label: markerLabel || 'Note'
                });
                
                setNoteDialogOpen(false);
              }}
              disabled={createMarkerMutation.isPending || !markerLabel}
            >
              {createMarkerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Equipment-specific Modals */}
      {/* Access Point Modal */}
      {showAccessPointModal && newMarkerPosition && selectedFloorplan && (
        <AddAccessPointModal
          isOpen={showAccessPointModal}
          projectId={projectId}
          onSave={(accessPoint) => {
            // Create a marker that points to this new access point
            createMarkerMutation.mutate({
              floorplan_id: selectedFloorplan.id,
              page: 1, // Default to first page
              marker_type: 'access_point',
              equipment_id: accessPoint.id,
              position_x: newMarkerPosition.x,
              position_y: newMarkerPosition.y,
              label: accessPoint.location
            });
            
            setShowAccessPointModal(false);
            setNewMarkerPosition(null);
          }}
          onClose={() => {
            setShowAccessPointModal(false);
            setNewMarkerPosition(null);
          }}
        />
      )}
      
      {/* Camera Modal */}
      {showCameraModal && newMarkerPosition && selectedFloorplan && (
        <AddCameraModal
          isOpen={showCameraModal}
          projectId={projectId}
          onSave={(camera) => {
            // Create a marker that points to this new camera
            createMarkerMutation.mutate({
              floorplan_id: selectedFloorplan.id,
              page: 1, // Default to first page
              marker_type: 'camera',
              equipment_id: camera.id,
              position_x: newMarkerPosition.x,
              position_y: newMarkerPosition.y,
              label: camera.location
            });
            
            setShowCameraModal(false);
            setNewMarkerPosition(null);
          }}
          onClose={() => {
            setShowCameraModal(false);
            setNewMarkerPosition(null);
          }}
        />
      )}
      
      {/* Elevator Modal */}
      {showElevatorModal && newMarkerPosition && selectedFloorplan && (
        <AddElevatorModal
          isOpen={showElevatorModal}
          projectId={projectId}
          onSave={(elevator) => {
            // Create a marker that points to this new elevator
            createMarkerMutation.mutate({
              floorplan_id: selectedFloorplan.id,
              page: 1, // Default to first page
              marker_type: 'elevator',
              equipment_id: elevator.id,
              position_x: newMarkerPosition.x,
              position_y: newMarkerPosition.y,
              label: elevator.location
            });
            
            setShowElevatorModal(false);
            setNewMarkerPosition(null);
          }}
          onClose={() => {
            setShowElevatorModal(false);
            setNewMarkerPosition(null);
          }}
        />
      )}
      
      {/* Intercom Modal */}
      {showIntercomModal && newMarkerPosition && selectedFloorplan && (
        <AddIntercomModal
          isOpen={showIntercomModal}
          projectId={projectId}
          onSave={(intercom) => {
            // Create a marker that points to this new intercom
            createMarkerMutation.mutate({
              floorplan_id: selectedFloorplan.id,
              page: 1, // Default to first page
              marker_type: 'intercom',
              equipment_id: intercom.id,
              position_x: newMarkerPosition.x,
              position_y: newMarkerPosition.y,
              label: intercom.location
            });
            
            setShowIntercomModal(false);
            setNewMarkerPosition(null);
          }}
          onClose={() => {
            setShowIntercomModal(false);
            setNewMarkerPosition(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedFloorplanViewer;