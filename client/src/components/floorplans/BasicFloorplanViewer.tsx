import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Download } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AccessPointMarkerForm from './AccessPointMarkerForm';
import CameraMarkerForm from './CameraMarkerForm';

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
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFloorplanName, setNewFloorplanName] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  const [markerType, setMarkerType] = useState<'access_point' | 'camera'>('access_point');
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [markerDialogOpen, setMarkerDialogOpen] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch floorplans for this project
  const { data: floorplans, isLoading: isLoadingFloorplans } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      return await res.json();
    },
    enabled: !!projectId,
  });

  // Fetch markers for selected floorplan
  const { data: floorplanMarkers, isLoading: isLoadingMarkers } = useQuery<Marker[]>({
    queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/floorplans/${selectedFloorplan?.id}/markers`);
      return await res.json();
    },
    enabled: !!selectedFloorplan?.id,
  });

  // Upload a new floorplan
  const uploadFloorplanMutation = useMutation({
    mutationFn: async (data: { name: string, pdf_data: string, project_id: number }) => {
      const res = await apiRequest('POST', '/api/floorplans', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      setUploadDialogOpen(false);
      setPdfFile(null);
      setNewFloorplanName("");
      toast({
        title: "Success",
        description: "Floorplan uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload floorplan: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create a new marker
  const createMarkerMutation = useMutation({
    mutationFn: async (data: {
      floorplan_id: number;
      page: number;
      marker_type: 'access_point' | 'camera';
      equipment_id: number;
      position_x: number;
      position_y: number;
      label: string | null;
    }) => {
      const res = await apiRequest('POST', '/api/floorplan-markers', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      if (onMarkersUpdated) onMarkersUpdated();
      setMarkerDialogOpen(false);
      setNewMarkerPosition(null);
      toast({
        title: "Success",
        description: `${markerType === 'access_point' ? 'Access point' : 'Camera'} marker added successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add marker: ${error.message}`,
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
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      if (onMarkersUpdated) onMarkersUpdated();
      toast({
        title: "Success",
        description: "Marker deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete marker: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Select first floorplan if available and none selected
  useEffect(() => {
    if (floorplans && floorplans.length > 0 && !selectedFloorplan) {
      setSelectedFloorplan(floorplans[0]);
    }
  }, [floorplans, selectedFloorplan]);

  // Update markers when floorplanMarkers changes
  useEffect(() => {
    if (floorplanMarkers) {
      setMarkers(floorplanMarkers);
    }
  }, [floorplanMarkers]);

  // Convert base64 to blob URL for PDF display
  useEffect(() => {
    if (selectedFloorplan) {
      try {
        // Clean up previous blob URL
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }

        // Convert base64 to blob and create URL
        const byteCharacters = atob(selectedFloorplan.pdf_data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setPdfBlobUrl(url);
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
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    setNewMarkerPosition({ x, y });
    setMarkerDialogOpen(true);
  };

  // State for dragging markers
  const [draggedMarker, setDraggedMarker] = useState<number | null>(null);
  const [markerSize, setMarkerSize] = useState<{[key: number]: {width: number, height: number}}>({});
  // Default mode for the viewer - 'select' allows manipulation, 'add_access_point'/'add_camera' for adding markers
  const [viewerMode, setViewerMode] = useState<'select' | 'add_access_point' | 'add_camera'>('select');
  
  // Handle marker drag start
  const handleDragStart = (e: React.MouseEvent, markerId: number) => {
    if (isAddingMarker) return; // Don't allow dragging when in adding mode
    setDraggedMarker(markerId);
    e.stopPropagation();
  };
  
  // Handle marker drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedMarker || !containerRef.current) return;
    
    // Prevent default browser behavior
    e.preventDefault();
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate the new position as percentage
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    // Find marker
    const markerToUpdate = markers.find(m => m.id === draggedMarker);
    
    if (markerToUpdate) {
      // Update marker position directly
      fetch(`/api/floorplan-markers/${draggedMarker}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position_x: x,
          position_y: y
        })
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
    
    // Reset dragged marker
    setDraggedMarker(null);
  };
  
  // Cancel drag operation
  const handleDragEnd = () => {
    setDraggedMarker(null);
  };
  
  // Setup event listeners for drag operations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedMarker) {
        const container = containerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        
        // Calculate the new position as percentage
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        // Update marker position in UI immediately for smooth movement
        const markerElement = document.getElementById(`marker-${draggedMarker}`);
        if (markerElement) {
          markerElement.style.left = `${x}%`;
          markerElement.style.top = `${y}%`;
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (draggedMarker) {
        handleDrag(e as unknown as React.MouseEvent);
      }
    };
    
    if (draggedMarker) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedMarker]);
  
  // Resize marker
  const resizeMarker = (markerId: number, increase: boolean) => {
    // Get current size or set default
    const currentSize = markerSize[markerId] || { width: 6, height: 6 };
    
    // Calculate new size (min: 4, max: 12)
    const newWidth = Math.max(4, Math.min(12, increase ? currentSize.width + 1 : currentSize.width - 1));
    const newHeight = Math.max(4, Math.min(12, increase ? currentSize.height + 1 : currentSize.height - 1));
    
    // Update size in state
    setMarkerSize({
      ...markerSize,
      [markerId]: { width: newWidth, height: newHeight }
    });
  };
  
  // Duplicate marker
  const duplicateMarker = (marker: any) => {
    // Create new marker at a slightly offset position
    const newX = Math.min(100, marker.position_x + 2);
    const newY = Math.min(100, marker.position_y + 2);
    
    const duplicateData = {
      floorplan_id: marker.floorplan_id,
      page: marker.page,
      marker_type: marker.marker_type,
      equipment_id: marker.equipment_id,
      position_x: newX,
      position_y: newY,
      label: marker.label
    };
    
    apiRequest('POST', '/api/floorplan-markers', duplicateData)
      .then(() => {
        // Refresh markers
        queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
        if (onMarkersUpdated) onMarkersUpdated();
        toast({
          title: "Success",
          description: `Duplicated ${marker.marker_type === 'access_point' ? 'access point' : 'camera'} marker`,
        });
      })
      .catch(err => {
        console.error('Error duplicating marker:', err);
        toast({
          title: "Error",
          description: "Failed to duplicate marker",
          variant: "destructive",
        });
      });
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

  // Render markers on the PDF
  const renderMarkers = () => {
    return markers.map((marker) => {
      // Get marker size from state or use default - smaller size by default (2.5rem)
      const size = markerSize[marker.id] || { width: 2.5, height: 2.5 };
      
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
          title={marker.label || (marker.marker_type === 'access_point' ? 'Access Point' : 'Camera')}
          onMouseDown={(e) => {
            if (e.button === 0) { // Left click
              handleDragStart(e, marker.id);
            }
          }}
          onDoubleClick={() => editMarker(marker)}
          onContextMenu={(e) => handleMarkerRightClick(e, marker)}
        >
          {marker.id}
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
          className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100"
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
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {isLoadingFloorplans ? (
            <Button disabled variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading floorplans...
            </Button>
          ) : floorplans && floorplans.length > 0 ? (
            floorplans.map((floorplan) => (
              <Button
                key={floorplan.id}
                variant={selectedFloorplan?.id === floorplan.id ? "default" : "outline"}
                onClick={() => setSelectedFloorplan(floorplan)}
              >
                {floorplan.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No floorplans available</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Plus className="h-4 w-4" />
                Upload Floorplan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Floorplan</DialogTitle>
                <DialogDescription>
                  Upload a PDF floorplan to mark access points and cameras.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newFloorplanName}
                    onChange={(e) => setNewFloorplanName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., First Floor"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pdf" className="text-right">
                    PDF File
                  </Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleUploadFloorplan}
                  disabled={uploadFloorplanMutation.isPending}
                >
                  {uploadFloorplanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {selectedFloorplan && (
            <div className="border rounded-md p-1 flex gap-1 items-center bg-gray-50">
              {/* BlueBeam-like tool buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(false);
                  toast({
                    title: "Selection Tool Activated",
                    description: "You can now select, move, edit and resize markers",
                  });
                }}
                className={!isAddingMarker ? 'bg-gray-200' : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4v7" />
                  <path d="M4 11l9-9" />
                  <path d="M15 8h5v5" />
                  <path d="M20 13l-9 9" />
                </svg>
                <span className="ml-1">Select</span>
              </Button>
              
              <div className="h-6 border-l mx-1"></div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(true);
                  setMarkerType('access_point');
                  toast({
                    title: "Access Point Stamp Tool",
                    description: "Click on the floorplan to place an access point marker",
                  });
                }}
                className={isAddingMarker && markerType === 'access_point' ? 'bg-gray-200' : ''}
              >
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Access Point</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(true);
                  setMarkerType('camera');
                  toast({
                    title: "Camera Stamp Tool",
                    description: "Click on the floorplan to place a camera marker",
                  });
                }}
                className={isAddingMarker && markerType === 'camera' ? 'bg-gray-200' : ''}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>Camera</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {selectedFloorplan ? (
        <div className="border rounded-md p-4 max-w-full overflow-auto relative">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <h3 className="font-semibold text-blue-800 mb-1">Working with Floorplan Markers:</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li><span className="font-semibold">Add Markers:</span> Use the "Add Access Point" or "Add Camera" buttons above, then click on the floorplan</li>
              <li><span className="font-semibold">Move Markers:</span> Click and drag any marker to reposition it</li>
              <li><span className="font-semibold">Resize Markers:</span> Right-click a marker and select "Increase Size" or "Decrease Size"</li>
              <li><span className="font-semibold">Edit Properties:</span> Double-click a marker or right-click and select "Edit"</li>
              <li><span className="font-semibold">Duplicate or Delete:</span> Right-click a marker for more options</li>
            </ul>
          </div>
          
          <div 
            ref={containerRef}
            className="relative" 
            onClick={handlePdfContainerClick}
            style={{ minHeight: "500px" }}
          >
            {pdfBlobUrl ? (
              <div className="relative">
                {/* Use the object tag for maximum browser compatibility */}
                <object 
                  data={pdfBlobUrl}
                  type="application/pdf"
                  width="100%"
                  height="600"
                  className="border-0"
                >
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-red-500 mb-2">Your browser can't display PDF files directly</div>
                    <a 
                      href={pdfBlobUrl} 
                      download={`${selectedFloorplan.name}.pdf`}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Download PDF
                    </a>
                  </div>
                </object>
                
                {/* Layer for markers that sits on top of the PDF - fix position to main container */}
                <div 
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ 
                    width: '100%', 
                    height: '600px', // Match the height of the PDF object
                    position: 'absolute',
                    overflow: 'hidden',
                    pointerEvents: 'none'
                  }}
                >
                  {renderMarkers()}
                </div>
                
                {/* Transparent layer to catch clicks when in marker mode */}
                {isAddingMarker && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full" 
                    style={{ zIndex: 30 }}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <div className="text-sm text-muted-foreground">Loading PDF...</div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            {pdfBlobUrl && (
              <a 
                href={pdfBlobUrl} 
                download={`${selectedFloorplan.name}.pdf`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
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
                          apiRequest('PUT', `/api/floorplan-markers/${markerId}`, { label })
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
                          apiRequest('PUT', `/api/floorplan-markers/${markerId}`, { label })
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