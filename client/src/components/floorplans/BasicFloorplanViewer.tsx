import React, { useState, useRef, useEffect } from 'react';
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
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Download, Hand, MousePointer, Camera } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AccessPointMarkerForm from './AccessPointMarkerForm';
import CameraMarkerForm from './CameraMarkerForm';

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

const BasicFloorplanViewer: React.FC<FloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  // State variables for floorplans
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newFloorplanName, setNewFloorplanName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for marker interaction
  const [markerDialogOpen, setMarkerDialogOpen] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  const [markerType, setMarkerType] = useState<'access_point' | 'camera'>('access_point');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  
  // State for dragging markers
  const [draggedMarker, setDraggedMarker] = useState<number | null>(null);
  const [markerSize, setMarkerSize] = useState<{[key: number]: {width: number, height: number}}>({});
  // Default mode for the viewer - 'select' allows manipulation, 'add_access_point'/'add_camera' for adding markers
  const [viewerMode, setViewerMode] = useState<'select' | 'add_access_point' | 'add_camera'>('select');
  
  // Fetch floorplans for this project
  const { data: floorplans = [], isLoading: isLoadingFloorplans, refetch: refetchFloorplans } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      return await res.json();
    },
  });
  
  // Mutation for deleting floorplans
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
    },
    onSuccess: () => {
      // Clear selected floorplan if it was deleted
      setSelectedFloorplan(null);
      
      // Clear PDF blob URL
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      
      // Refetch floorplans
      refetchFloorplans();
      
      toast({
        title: "Success",
        description: "Floorplan deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting floorplan:', error);
      toast({
        title: "Error",
        description: "Failed to delete floorplan",
        variant: "destructive",
      });
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
    enabled: !!selectedFloorplan,
  });
  
  // Mutation for uploading floorplans
  const uploadFloorplanMutation = useMutation({
    mutationFn: async (floorplan: { name: string, pdf_data: string, project_id: number }) => {
      const res = await apiRequest('POST', '/api/floorplans', floorplan);
      return await res.json();
    },
    onSuccess: () => {
      // Refetch floorplans
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      
      // Reset form
      setNewFloorplanName('');
      setPdfFile(null);
      
      toast({
        title: "Success",
        description: "Floorplan uploaded successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error uploading floorplan:', error);
      toast({
        title: "Error",
        description: "Failed to upload floorplan",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for creating new markers
  const createMarkerMutation = useMutation({
    mutationFn: async (marker: Omit<Marker, 'id' | 'created_at'>) => {
      const res = await apiRequest('POST', '/api/floorplan-markers', marker);
      return await res.json();
    },
    onSuccess: () => {
      // Refetch markers
      if (selectedFloorplan) {
        queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan.id, 'markers'] });
      }
      
      toast({
        title: "Success",
        description: "Marker added successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating marker:', error);
      toast({
        title: "Error",
        description: "Failed to create marker",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting markers
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`);
    },
    onSuccess: () => {
      // Refetch markers
      if (selectedFloorplan) {
        queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan.id, 'markers'] });
      }
      
      toast({
        title: "Success",
        description: "Marker deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting marker:', error);
      toast({
        title: "Error",
        description: "Failed to delete marker",
        variant: "destructive",
      });
    },
  });
  
  // Set default floorplan if available - with better dependency tracking to avoid infinite loops
  useEffect(() => {
    // Only set if we have floorplans but none selected
    if (floorplans && floorplans.length > 0 && !selectedFloorplan) {
      setSelectedFloorplan(floorplans[0]);
    }
  }, [floorplans.length > 0, selectedFloorplan === null]);

  // Update markers when floorplanMarkers changes
  useEffect(() => {
    if (floorplanMarkers) {
      setMarkers(floorplanMarkers);
    }
  }, [JSON.stringify(floorplanMarkers)]);

  // Convert base64 to blob URL for PDF display
  useEffect(() => {
    // Skip if no floorplan or no pdf_data
    if (!selectedFloorplan || !selectedFloorplan.pdf_data) {
      setPdfBlobUrl(null);
      return;
    }
    
    // Reference selected floorplan id to prevent rerendering on each state update
    const floorplanId = selectedFloorplan.id;
    
    try {
      // Clean up previous blob URL
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }

      // Convert base64 to blob directly without using fetch
      try {
        // Decode the base64 string
        const byteCharacters = atob(selectedFloorplan.pdf_data);
        const byteNumbers = new Array(byteCharacters.length);
        
        // Convert to byte array
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create object URL from blob
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (err) {
        console.error('Error converting PDF data:', err);
        setPdfBlobUrl(null);
        toast({
          title: "Error",
          description: "Failed to load PDF data",
          variant: "destructive",
        });
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
    
    // Cleanup function
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [selectedFloorplan?.id]);

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

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate position as percentage of container
    // Round to integer as the server expects integer values
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    setNewMarkerPosition({ x, y });
    setMarkerDialogOpen(true);
  };
  
  // Handle marker drag start
  const handleDragStart = (e: React.MouseEvent, markerId: number) => {
    if (isAddingMarker) return; // Don't allow dragging when in adding mode
    setDraggedMarker(markerId);
    e.stopPropagation();
  };
  
  // Keep track of marker's current position during drag
  const [dragPosition, setDragPosition] = useState<{ x: number, y: number } | null>(null);
  
  // This function has been optimized and moved into the mousemove handler in the useEffect
  // We keep a stub here in case it's called elsewhere
  const handleDrag = (e: React.MouseEvent) => {
    // The actual drag logic is now handled in the mousemove event inside useEffect
    // This prevents redundant state updates and improves performance
  };
  
  // Save marker position when drag ends
  const handleDragEnd = () => {
    if (draggedMarker && dragPosition) {
      // Find marker
      const markerToUpdate = markers.find(m => m.id === draggedMarker);
      
      if (markerToUpdate) {
        // Update marker position in database
        apiRequest('PUT', `/api/floorplan-markers/${draggedMarker}`, {
          position_x: dragPosition.x,
          position_y: dragPosition.y,
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
        .catch(err => {
          console.error('Error updating marker position:', err);
          toast({
            title: "Error",
            description: "Failed to update marker position",
            variant: "destructive",
          });
          
          // Refresh markers to get back to the correct positions
          queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
        });
      }
    }
    
    // Reset states
    setDraggedMarker(null);
    setDragPosition(null);
  };
  
  // Setup event listeners for drag operations with performance optimizations
  useEffect(() => {
    if (!draggedMarker) return;
    
    let animationFrameId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedMarker || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Calculate the new position as percentage
      // Round to integer as the server expects integer values
      const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
      
      // Store the latest position
      lastX = x;
      lastY = y;
      
      // Use requestAnimationFrame for smoother updates (throttles updates to screen refresh rate)
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(() => {
          // Update marker position in UI immediately for smooth movement
          const markerElement = document.getElementById(`marker-${draggedMarker}`);
          if (markerElement) {
            markerElement.style.left = `${lastX}%`;
            markerElement.style.top = `${lastY}%`;
          }
          
          // Also update the dragPosition state for when we save
          setDragPosition({ x: lastX, y: lastY });
          
          // Reset the animation frame ID
          animationFrameId = null;
        });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (draggedMarker) {
        // Cancel any pending animation frame
        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        
        // First ensure the drag position is updated with the final position
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const finalX = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
          const finalY = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
          setDragPosition({ x: finalX, y: finalY });
        }
        
        // Then finalize the drag operation and save to database
        handleDragEnd();
      }
    };
    
    // Add event listeners when a marker is being dragged
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [draggedMarker, containerRef]);
  
  // Resize marker with granular control (20 steps)
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
  const duplicateMarker = (marker: any) => {
    // Create new marker at a slightly offset position
    // Round to integer as the server expects integer values
    const newX = Math.round(Math.min(100, marker.position_x + 2));
    const newY = Math.round(Math.min(100, marker.position_y + 2));
    
    // Always set equipment_id to 0 to force creation of a new equipment item
    // This ensures that duplicating a marker also creates a new access point or camera
    const duplicateData = {
      floorplan_id: marker.floorplan_id,
      page: marker.page,
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
  const editMarker = (marker: any) => {
    setNewMarkerPosition({ x: marker.position_x, y: marker.position_y });
    setMarkerType(marker.marker_type as 'access_point' | 'camera');
    setMarkerDialogOpen(true);
    
    // Pass the existing marker info
    const existingMarkerInfo = { 
      id: marker.id, 
      equipment_id: marker.equipment_id 
    };
    
    // Store this temporarily for the form
    (window as any).__currentEditingMarker = existingMarkerInfo;
  };
  
  // Marker context menu
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    markerId: number;
    marker: any;
  } | null>(null);
  
  // Handle right-click on marker
  const handleMarkerRightClick = (e: React.MouseEvent, marker: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      markerId: marker.id,
      marker: marker
    });
  };
  
  // Hide context menu
  useEffect(() => {
    const hideContextMenu = () => setContextMenu(null);
    document.addEventListener('click', hideContextMenu);
    
    return () => {
      document.removeEventListener('click', hideContextMenu);
    };
  }, []);

  // Toggle marker addition mode
  const toggleMarkerMode = (mode: 'select' | 'add_access_point' | 'add_camera') => {
    setViewerMode(mode);
    setIsAddingMarker(mode !== 'select');
    setMarkerType(mode === 'add_camera' ? 'camera' : 'access_point');
  };

  // Cache for equipment data - avoid redundant loading
  const [equipmentCache, setEquipmentCache] = useState<{[key: string]: any}>({});
  
  // Load equipment details for markers
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
  
  // Extract number from location string (e.g., "Access Point 3" -> "3")
  const getMarkerNumber = (label: string | null) => {
    if (!label) return "";
    
    // Try to extract a number from the end of the label
    const match = label.match(/(\d+)$/);
    return match ? match[1] : "";
  };
  
  // Render markers on the PDF with sequential numbering
  const renderMarkers = () => {
    // Sort and group markers by type for sequential numbering
    const accessPoints = markers
      .filter(m => m.marker_type === 'access_point')
      .sort((a, b) => a.id - b.id);
      
    const cameras = markers
      .filter(m => m.marker_type === 'camera')
      .sort((a, b) => a.id - b.id);
    
    // Create a mapping of marker IDs to their sequential numbers
    const markerSequence: Record<number, number> = {};
    
    // Assign sequential numbers to access points
    accessPoints.forEach((marker, index) => {
      markerSequence[marker.id] = index + 1;
    });
    
    // Assign sequential numbers to cameras
    cameras.forEach((marker, index) => {
      markerSequence[marker.id] = index + 1;
    });
    
    return markers.map((marker) => {
      // Get marker size from state or use default
      const size = markerSize[marker.id] || { width: 2.5, height: 2.5 };
      
      // Get equipment number from label if available or use sequential number
      const markerLabel = marker.label || '';
      const labelNumber = getMarkerNumber(markerLabel);
      
      // Use the sequence number if we have one, otherwise fallback to label number
      const sequenceNumber = markerSequence[marker.id] || '';
      const displayNumber = labelNumber || sequenceNumber;
      
      // Prefix based on type
      const prefix = marker.marker_type === 'access_point' ? 'AP' : 'C';
      
      return (
        <div
          id={`marker-${marker.id}`}
          key={marker.id}
          className={`absolute rounded-full flex items-center justify-center cursor-move z-50
                     ${marker.marker_type === 'access_point' ? 'bg-red-500' : 'bg-blue-500'}
                     text-white font-bold text-xs select-none shadow-md hover:shadow-lg
                     pointer-events-auto`} // Make sure the marker can receive mouse events
          style={{
            left: `${marker.position_x}%`,
            top: `${marker.position_y}%`,
            width: `${size.width}rem`,
            height: `${size.height}rem`,
            transform: 'translate(-50%, -50%)',
            transition: draggedMarker === marker.id ? 'none' : 'all 0.2s ease'
          }}
          title={marker.label || `${marker.marker_type === 'access_point' ? 'Access Point' : 'Camera'} #${sequenceNumber}`}
          onMouseDown={(e) => {
            if (e.button === 0) { // Left click
              handleDragStart(e, marker.id);
            }
          }}
          onDoubleClick={() => editMarker(marker)}
          onContextMenu={(e) => handleMarkerRightClick(e, marker)}
        >
          {displayNumber ? `${prefix}${displayNumber}` : prefix}
        </div>
      );
    });
  };
  
  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu || !contextMenu.visible) return null;
    
    return (
      <div 
        className="absolute bg-white shadow-lg rounded-md p-1 z-50 border"
        style={{
          left: contextMenu.x,
          top: contextMenu.y
        }}
      >
        <div className="text-xs font-semibold px-2 py-1 border-b">
          {contextMenu.marker.marker_type === 'access_point' ? 'Access Point' : 'Camera'} #{contextMenu.markerId}
        </div>
        <button 
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            editMarker(contextMenu.marker);
            setContextMenu(null);
          }}
        >
          Edit
        </button>
        <button 
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            resizeMarker(contextMenu.markerId, true);
            setContextMenu(null);
          }}
        >
          Increase Size
        </button>
        <button 
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            resizeMarker(contextMenu.markerId, false);
            setContextMenu(null);
          }}
        >
          Decrease Size
        </button>
        <button 
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            duplicateMarker(contextMenu.marker);
            setContextMenu(null);
          }}
        >
          Duplicate
        </button>
        <button 
          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 text-red-500"
          onClick={() => {
            deleteMarkerMutation.mutate(contextMenu.markerId);
            setContextMenu(null);
          }}
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Floorplans</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload and manage floorplans for your site walk. Add markers for access points and cameras.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {floorplans && floorplans.map((floorplan) => (
            <Button
              key={floorplan.id}
              variant={selectedFloorplan?.id === floorplan.id ? "default" : "outline"}
              onClick={() => setSelectedFloorplan(floorplan)}
              className="text-sm"
            >
              {floorplan.name}
            </Button>
          ))}
          
          {isLoadingFloorplans && (
            <Button variant="outline" disabled className="text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Upload form */}
          <div className="p-4 border rounded-md bg-muted/10 flex-1">
            <h3 className="text-sm font-medium mb-2">Upload New Floorplan</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="floorplan-name" className="text-xs">Name</Label>
                <Input
                  id="floorplan-name"
                  value={newFloorplanName}
                  onChange={(e) => setNewFloorplanName(e.target.value)}
                  placeholder="First Floor"
                  className="h-8 text-sm"
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="floorplan-file" className="text-xs">PDF File</Label>
                <Input
                  id="floorplan-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="h-8 text-xs"
                  autoComplete="off"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadFloorplan} 
                  disabled={uploadFloorplanMutation.isPending || !pdfFile || !newFloorplanName}
                  className="flex-1 h-8 text-xs"
                >
                  {uploadFloorplanMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-2" />
                      Upload Floorplan
                    </>
                  )}
                </Button>
                
                {selectedFloorplan && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the "${selectedFloorplan.name}" floorplan? This cannot be undone.`)) {
                        deleteFloorplanMutation.mutate(selectedFloorplan.id);
                      }
                    }}
                    disabled={deleteFloorplanMutation.isPending}
                    className="h-8 text-xs"
                  >
                    {deleteFloorplanMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Toolbar for marker controls - Moved up here per user request */}
          <div className="p-4 border rounded-md bg-muted/10 flex-1">
            <h3 className="text-sm font-medium mb-2">Add Items to Floorplan</h3>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Click a button below, then click on the floorplan to place the marker.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={viewerMode === 'select' ? "default" : "outline"}
                  onClick={() => toggleMarkerMode('select')}
                  className="text-xs flex items-center gap-1"
                  title="Select and move markers"
                >
                  <Hand className="h-3 w-3" />
                  Select Tool
                </Button>
                
                <Button
                  size="sm"
                  variant={viewerMode === 'add_access_point' ? "default" : "outline"}
                  onClick={() => toggleMarkerMode('add_access_point')}
                  className="text-xs flex items-center gap-1"
                  title="Add access point marker"
                >
                  <MousePointer className="h-3 w-3" />
                  Add Access Point
                </Button>
                
                <Button
                  size="sm"
                  variant={viewerMode === 'add_camera' ? "default" : "outline"}
                  onClick={() => toggleMarkerMode('add_camera')}
                  className="text-xs flex items-center gap-1"
                  title="Add camera marker"
                >
                  <Camera className="h-3 w-3" />
                  Add Camera
                </Button>
                
                <div className="text-xs text-muted-foreground flex items-center">
                  {isAddingMarker ? (
                    <span className="text-xs text-primary animate-pulse font-medium">
                      Click on floorplan to place
                    </span>
                  ) : (
                    <span>
                      Markers: {markers?.length || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Viewer Section */}
      {selectedFloorplan ? (
        <div className="border rounded-md p-4">
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-semibold">{selectedFloorplan.name}</h3>
            <p className="text-sm text-muted-foreground">
              Click on the floorplan to add markers for equipment.
            </p>
          </div>
          
          <div 
            ref={containerRef}
            onClick={handlePdfContainerClick}
            style={{ minHeight: "500px" }}
          >
            {pdfBlobUrl ? (
              <div className="relative">
                {/* Use an iframe for PDF display */}
                <div className="relative border rounded w-full" style={{ height: '800px' }}>
                  <iframe 
                    src={pdfBlobUrl}
                    width="100%"
                    height="100%"
                    className="border-0 absolute inset-0"
                    style={{ zIndex: 10 }}
                  />
                  
                  {/* Layer for markers that sits on top of the PDF - fixed to PDF content */}
                  <div 
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      position: 'absolute',
                      overflow: 'visible', // Change to visible so markers are always shown
                      pointerEvents: 'none',
                      zIndex: 20
                    }}
                    id="markers-container"
                  >
                    {renderMarkers()}
                  </div>
                  
                  {/* Transparent layer to catch clicks when in marker mode */}
                  {isAddingMarker && (
                    <div 
                      className="absolute top-0 left-0 w-full" 
                      style={{ zIndex: 30, height: '800px' }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <div className="text-sm text-muted-foreground">Loading PDF...</div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-center gap-4">
            {pdfBlobUrl && (
              <>
                <a 
                  href={pdfBlobUrl} 
                  download={`${selectedFloorplan.name}.pdf`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                  Download Original PDF
                </a>
                
                <Button 
                  size="sm" 
                  onClick={() => {
                    // Create a combined PDF with markers
                    const container = document.getElementById('markers-container')?.parentElement;
                    if (!container) return;
                    
                    // Tell the user we're generating the PDF
                    toast({
                      title: "Generating PDF",
                      description: "Creating annotated PDF with markers...",
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
                          link.download = `${selectedFloorplan.name}_with_markers.png`;
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
                  }}
                  className="text-xs flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Export with Markers
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          {isLoadingFloorplans ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <p className="text-muted-foreground">
              No floorplans available. Upload a floorplan to get started.
            </p>
          )}
        </div>
      )}
      
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
                            page: 1,
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
                          page: 1, // We're using a simpler viewer without pages
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
                      page: 1,
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
                            // Include required fields
                            floorplan_id: selectedFloorplan.id,
                            page: 1,
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
                          page: 1, // We're using a simpler viewer without pages
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
                      page: 1,
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
      
      {/* Render the context menu */}
      {renderContextMenu()}
    </div>
  );
};

export default BasicFloorplanViewer;