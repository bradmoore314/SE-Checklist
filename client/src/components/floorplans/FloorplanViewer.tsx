import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AccessPointMarkerForm from './AccessPointMarkerForm';
import CameraMarkerForm from './CameraMarkerForm';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

const FloorplanViewer: React.FC<FloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFloorplanName, setNewFloorplanName] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  const [markerType, setMarkerType] = useState<'access_point' | 'camera'>('access_point');
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [markerDialogOpen, setMarkerDialogOpen] = useState<boolean>(false);
  const [newMarkerLabel, setNewMarkerLabel] = useState<string>("");
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
      setNewMarkerLabel("");
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
      setMarkers(floorplanMarkers.filter(marker => marker.page === pageNumber));
    }
  }, [floorplanMarkers, pageNumber]);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
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

    // Convert PDF to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        const base64 = e.target.result.toString().split(',')[1];
        await uploadFloorplanMutation.mutateAsync({
          name: newFloorplanName,
          pdf_data: base64,
          project_id: projectId
        });
      }
    };
    reader.readAsDataURL(pdfFile);
  };

  // Handle PDF click for marker placement
  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate position as percentage of container
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    setNewMarkerPosition({ x, y });
    setMarkerDialogOpen(true);
  };

  // Handle marker creation
  const handleCreateMarker = () => {
    if (!selectedFloorplan || !newMarkerPosition) return;
    
    createMarkerMutation.mutateAsync({
      floorplan_id: selectedFloorplan.id,
      page: pageNumber,
      marker_type: markerType,
      equipment_id: 0, // This will trigger the backend to create a new equipment item
      position_x: newMarkerPosition.x,
      position_y: newMarkerPosition.y,
      label: newMarkerLabel || null
    });
  };

  // Render markers on the PDF
  const renderMarkers = () => {
    return markers.map((marker) => (
      <div
        key={marker.id}
        className={`absolute rounded-full flex items-center justify-center cursor-pointer 
                   ${marker.marker_type === 'access_point' ? 'bg-red-500' : 'bg-blue-500'}
                   text-white font-bold text-xs w-6 h-6 hover:w-7 hover:h-7 transition-all`}
        style={{
          left: `${marker.position_x}%`,
          top: `${marker.position_y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        title={marker.label || (marker.marker_type === 'access_point' ? 'Access Point' : 'Camera')}
        onClick={() => {
          if (window.confirm(`Delete this ${marker.marker_type.replace('_', ' ')} marker?`)) {
            deleteMarkerMutation.mutate(marker.id);
          }
        }}
      >
        {marker.id}
      </div>
    ));
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
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(true);
                  setMarkerType('access_point');
                  toast({
                    title: "Access Point Marker Mode",
                    description: "Click on the floorplan to place an access point marker",
                  });
                }}
                className={isAddingMarker && markerType === 'access_point' ? 'bg-red-100' : ''}
              >
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                Add Access Point
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingMarker(true);
                  setMarkerType('camera');
                  toast({
                    title: "Camera Marker Mode",
                    description: "Click on the floorplan to place a camera marker",
                  });
                }}
                className={isAddingMarker && markerType === 'camera' ? 'bg-blue-100' : ''}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                Add Camera
              </Button>
              {isAddingMarker && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingMarker(false);
                    toast({
                      title: "Marker Mode Disabled",
                      description: "You can now view and interact with the floorplan",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      {selectedFloorplan ? (
        <div className="border rounded-md p-4 max-w-full overflow-auto">
          <div 
            ref={containerRef} 
            className="relative" 
            onClick={handlePdfClick}
          >
            <Document
              file={`data:application/pdf;base64,${selectedFloorplan.pdf_data}`}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            
            {renderMarkers()}
          </div>
          
          {numPages && numPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
                disabled={pageNumber >= (numPages || 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
            <DialogTitle>Add Access Point</DialogTitle>
            <DialogDescription>
              Configure the access point details for this marker.
            </DialogDescription>
          </DialogHeader>
          {newMarkerPosition && (
            <AccessPointMarkerForm
              projectId={projectId}
              onSubmit={(equipmentId, label) => {
                if (!selectedFloorplan || !newMarkerPosition) return;
                
                createMarkerMutation.mutateAsync({
                  floorplan_id: selectedFloorplan.id,
                  page: pageNumber,
                  marker_type: 'access_point',
                  equipment_id: equipmentId,
                  position_x: newMarkerPosition.x,
                  position_y: newMarkerPosition.y,
                  label
                });
              }}
              onCancel={() => {
                setMarkerDialogOpen(false);
                setNewMarkerPosition(null);
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
            <DialogTitle>Add Camera</DialogTitle>
            <DialogDescription>
              Configure the camera details for this marker.
            </DialogDescription>
          </DialogHeader>
          {newMarkerPosition && (
            <CameraMarkerForm
              projectId={projectId}
              onSubmit={(equipmentId, label) => {
                if (!selectedFloorplan || !newMarkerPosition) return;
                
                createMarkerMutation.mutateAsync({
                  floorplan_id: selectedFloorplan.id,
                  page: pageNumber,
                  marker_type: 'camera',
                  equipment_id: equipmentId,
                  position_x: newMarkerPosition.x,
                  position_y: newMarkerPosition.y,
                  label
                });
              }}
              onCancel={() => {
                setMarkerDialogOpen(false);
                setNewMarkerPosition(null);
              }}
              position={newMarkerPosition}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorplanViewer;