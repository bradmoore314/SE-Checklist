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

  // Render markers on the PDF
  const renderMarkers = () => {
    return markers.map((marker) => (
      <div
        key={marker.id}
        className={`absolute rounded-full flex items-center justify-center cursor-pointer z-50
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
        <div className="border rounded-md p-4 max-w-full overflow-auto relative">
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
                
                {/* Layer for markers that sits on top of the PDF */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
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
                  page: 1, // We're using a simpler viewer without pages
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
                  page: 1, // We're using a simpler viewer without pages
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

export default BasicFloorplanViewer;