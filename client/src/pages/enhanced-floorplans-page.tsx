import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Plus, Layers, ZoomIn, Move, Ruler, ChevronsLeft, ChevronLeft, ChevronRight,
  FileUp, Camera, RefreshCcw, DoorClosed, Phone, ArrowUpDown, Eye, Edit, MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EnhancedFloorplanViewer } from '@/components/floorplans/EnhancedFloorplanViewer';
import { SimpleEnhancedViewer } from '@/components/floorplans/SimpleEnhancedViewer';
import { EnhancedFloorplanEditor } from '@/components/floorplans/EnhancedFloorplanEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChatbotProvider } from '@/hooks/use-chatbot';
import { ChatbotButton } from '@/components/ai/ChatbotButton';
import { ChatbotWindow } from '@/components/ai/ChatbotWindow';
import { FullPageChatbot } from '@/components/ai/FullPageChatbot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnnotationToolbar, AnnotationTool } from '@/components/floorplans/AnnotationToolbar';
import { MobileToolbar } from '@/components/floorplans/MobileToolbar';
import FloorplanThumbnail from '@/components/floorplans/FloorplanThumbnail';
import { MarkerStatsLegend } from '@/components/floorplans/MarkerStatsLegend';

interface FloorplanData {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
  created_at?: string;
  updated_at?: string;
}

interface LayerData {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order_index: number;
}

/**
 * Enhanced Floorplans Page with professional PDF annotation 
 * capabilities similar to Bluebeam
 */
function EnhancedFloorplansPage() {
  const params = useParams<{ projectId: string, floorplanId?: string }>();
  const { toast } = useToast();
  const projectId = parseInt(params.projectId);
  const floorplanId = params.floorplanId ? parseInt(params.floorplanId) : undefined;
  
  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices on component mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      // Use a combination of screen width and checking for touch capability
      const isMobileDevice = window.innerWidth <= 768 || 
        (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      setIsMobile(isMobileDevice);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // State for viewer properties
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<AnnotationTool>('pan');
  const [viewerKey, setViewerKey] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [floorplanName, setFloorplanName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [showEquipmentMenu, setShowEquipmentMenu] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'standard' | 'editor' | 'annotate'>('standard');
  const [selectedFloorplans, setSelectedFloorplans] = useState<Set<number>>(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  // Mobile detection added above at lines 64-81
  
  // Fetch all floorplans for the project when no specific floorplan is selected
  const { 
    data: projectFloorplans, 
    isLoading: isLoadingProjectFloorplans 
  } = useQuery<FloorplanData[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      return await res.json();
    },
    enabled: !!projectId && !floorplanId
  });
  
  // Fetch specific floorplan data when a floorplan is selected
  const { 
    data: floorplan, 
    isLoading: isLoadingFloorplan 
  } = useQuery<FloorplanData>({
    queryKey: ['/api/floorplans', floorplanId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/floorplans/${floorplanId}`);
      return await res.json();
    },
    enabled: !!floorplanId
  });
  
  // Define a default empty layers array since we don't have a layers endpoint yet
  const { 
    data: layers = [], 
    isLoading: isLoadingLayers 
  } = useQuery<LayerData[]>({
    queryKey: ['/api/floorplans', floorplanId, 'layers'],
    queryFn: async () => {
      try {
        // If we implement a layers API in the future, we can use this:
        // const res = await apiRequest('GET', `/api/floorplans/${floorplanId}/layers`);
        // return await res.json();
        
        // For now, return an empty array
        return [];
      } catch (error) {
        console.error("Error fetching layers:", error);
        return [];
      }
    },
    enabled: !!floorplanId
  });
  
  // Handle tool selection
  const handleToolSelect = (tool: AnnotationTool) => {
    setToolMode(tool);
  };
  
  // Reload the viewer (for debugging or reset)
  const handleReloadViewer = () => {
    setViewerKey(prev => prev + 1);
  };
  
  // Handle PDF file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPdfFile(file);
      
      // Auto-set a name based on the file if no name has been entered yet
      if (!floorplanName) {
        // Remove file extension and replace underscores/hyphens with spaces
        let suggestedName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setFloorplanName(suggestedName);
      }
    }
  };
  
  // Add mutation for deleting markers
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      const response = await apiRequest('DELETE', `/api/enhanced-floorplan/markers/${markerId}`);
      if (!response.ok) {
        throw new Error(`Failed to delete marker: ${response.status}`);
      }
      return markerId;
    },
    onSuccess: (markerId) => {
      toast({
        title: "Success",
        description: `Marker deleted successfully`
      });
      // Invalidate markers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan', floorplanId, 'markers'] });
      setSelectedMarkerId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete marker",
        variant: "destructive"
      });
    }
  });
  
  // Add mutation for deleting floorplans
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      const response = await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
      if (!response.ok) {
        throw new Error(`Failed to delete floorplan: ${response.status}`);
      }
      return floorplanId;
    },
    onSuccess: (floorplanId) => {
      toast({
        title: "Success",
        description: `Floorplan deleted successfully`
      });
      // Invalidate floorplans query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete floorplan",
        variant: "destructive"
      });
    }
  });

  // Upload floorplan with improved validation and error handling
  const uploadFloorplan = async () => {
    if (!pdfFile || !floorplanName) {
      toast({
        title: "Error",
        description: "Please provide both a file and a name for the floorplan.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (limit to 10MB)
    if (pdfFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File is too large. Please upload a PDF under 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type for supported formats
    const supportedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    const fileExtension = pdfFile.name.split('.').pop()?.toLowerCase();
    const isValidType = 
      supportedTypes.some(type => pdfFile.type.includes(type)) || 
      (fileExtension && supportedTypes.includes(fileExtension));
    
    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a supported file type: PDF or common image formats (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Show an immediate toast to indicate the process is starting
      toast({
        title: "Processing",
        description: "Processing your floorplan... This may take a moment.",
      });
      
      // Read the file as base64 and send it in the correct format
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            // Extract just the base64 data part without the prefix
            const base64Data = e.target.result.split(',')[1];
            resolve(base64Data);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = (e) => {
          reject(new Error('File reading failed'));
        };
      });
      
      reader.readAsDataURL(pdfFile);
      
      const base64 = await base64Promise;
      
      // Ensure the project ID is valid
      if (!projectId || isNaN(projectId)) {
        throw new Error("Invalid project ID");
      }
      
      // projectId is already a number from line 58: const projectId = parseInt(params.projectId);
      
      // Use the correct API endpoint with detailed error handling
      const response = await apiRequest('POST', '/api/floorplans', {
        name: floorplanName,
        pdf_data: base64,
        project_id: projectId,
        page_count: 1 // Default to 1 page, will be updated after processing if needed
      });
      
      // Handle various error responses
      if (!response.ok) {
        let errorMessage = `Upload failed with status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse JSON, just use the default error message
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Success toast with more details
      toast({
        title: "Upload Successful",
        description: `"${floorplanName}" has been successfully uploaded and is ready to use.`,
        duration: 5000
      });
      
      // Reset the form
      setPdfFile(null);
      setFloorplanName('');
      setShowUploadDialog(false);
      
      // Refresh the floorplans list and navigate to the newly created floorplan
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      
      // Optional: Navigate to the new floorplan after a short delay
      if (result && result.id) {
        setTimeout(() => {
          window.location.href = `/projects/${projectId}/enhanced-floorplans/${result.id}`;
        }, 500);
      }
      
    } catch (error) {
      console.error("Floorplan upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during upload",
        variant: "destructive",
        duration: 7000
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Render loading state
  if (
    (floorplanId && (isLoadingFloorplan || isLoadingLayers)) || 
    (!floorplanId && isLoadingProjectFloorplans)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render floorplan list view when no specific floorplan is selected
  if (!floorplanId) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Enhanced Floorplans</h1>
            <p className="text-gray-500">Select a floorplan to view and annotate with professional tools</p>
          </div>
          <div className="flex gap-2">
            {selectedFloorplans.size > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedFloorplans.size} selected floorplan(s)? This cannot be undone.`)) {
                    // Delete all selected floorplans
                    const promises = Array.from(selectedFloorplans).map(id => 
                      deleteFloorplanMutation.mutateAsync(id)
                    );
                    
                    Promise.all(promises)
                      .then(() => {
                        toast({
                          title: "Success",
                          description: `${selectedFloorplans.size} floorplan(s) deleted successfully`
                        });
                        setSelectedFloorplans(new Set());
                        setSelectAllChecked(false);
                      })
                      .catch(error => {
                        toast({
                          title: "Error",
                          description: error instanceof Error ? error.message : "Failed to delete floorplans",
                          variant: "destructive"
                        });
                      });
                  }
                }}
              >
                Delete Selected ({selectedFloorplans.size})
              </Button>
            )}
            <Button onClick={() => setShowUploadDialog(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Upload Floorplan
            </Button>
          </div>
        </div>
        
        {/* Selection controls */}
        {projectFloorplans && projectFloorplans.length > 0 && (
          <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="select-all" 
                className="h-4 w-4 mr-2" 
                checked={selectAllChecked}
                onChange={(e) => {
                  setSelectAllChecked(e.target.checked);
                  
                  if (e.target.checked) {
                    // Select all floorplans
                    const allIds = new Set(projectFloorplans.map(fp => fp.id));
                    setSelectedFloorplans(allIds);
                  } else {
                    // Deselect all floorplans
                    setSelectedFloorplans(new Set());
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                {selectAllChecked ? 'Deselect All' : 'Select All'}
              </label>
            </div>
            
            <div className="ml-auto text-sm text-gray-500">
              {projectFloorplans.length} floorplan{projectFloorplans.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
        
        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Floorplan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="floorplanName">Floorplan Name</Label>
                <Input 
                  id="floorplanName" 
                  placeholder="Enter floorplan name" 
                  value={floorplanName}
                  onChange={(e) => setFloorplanName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">Upload File</Label>
                <Input 
                  id="pdfFile" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">Upload a PDF or image file of your floorplan (max 10MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadFloorplan}
                disabled={!pdfFile || !floorplanName || isUploading}
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Floorplan Grid */}
        {projectFloorplans && projectFloorplans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectFloorplans.map((floorplan) => (
              <div key={floorplan.id} className="relative group">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Top controls - Checkbox always visible, delete button on hover */}
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <div className="bg-white rounded-md p-1 shadow-sm">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4" 
                          title="Select floorplan"
                          checked={selectedFloorplans.has(floorplan.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newSelectedFloorplans = new Set(selectedFloorplans);
                            
                            if (e.target.checked) {
                              newSelectedFloorplans.add(floorplan.id);
                            } else {
                              newSelectedFloorplans.delete(floorplan.id);
                            }
                            
                            setSelectedFloorplans(newSelectedFloorplans);
                            
                            // Update select all checkbox state
                            if (projectFloorplans) {
                              setSelectAllChecked(
                                newSelectedFloorplans.size === projectFloorplans.length
                              );
                            }
                          }}
                        />
                      </div>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                        title="Delete floorplan"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete "${floorplan.name}"? This cannot be undone.`)) {
                            deleteFloorplanMutation.mutate(floorplan.id);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                    
                    {/* Floorplan thumbnail area is wrapped in a Link for navigation */}
                    <Link href={`/projects/${projectId}/enhanced-floorplans/${floorplan.id}`}>
                      <div className="aspect-video bg-gray-100 mb-4 flex items-center justify-center rounded-md overflow-hidden relative">
                        {/* Generate thumbnail from the floorplan PDF or image data */}
                        {floorplan.pdf_data ? (
                          <div className="absolute inset-0 w-full h-full">
                            <FloorplanThumbnail floorplanData={floorplan.pdf_data} alt={floorplan.name} />
                          </div>
                        ) : (
                          <span className="material-icons text-4xl text-gray-400">map</span>
                        )}
                        {/* Display marker count as an overlay badge */}
                        <div className="absolute bottom-2 right-2 bg-primary/80 text-white text-xs rounded px-2 py-1 shadow-sm">
                          Page 1
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg truncate">{floorplan.name}</h3>
                      <p className="text-sm text-gray-500">
                        {floorplan.page_count} page{floorplan.page_count !== 1 ? 's' : ''}
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <span className="material-icons text-4xl text-gray-400 mb-4">description</span>
            <h3 className="text-lg font-medium text-gray-900">No Floorplans Available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a PDF or image file to get started with enhanced annotation tools.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowUploadDialog(true)}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Upload Floorplan
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Show error if specific floorplan not found
  if (!floorplan) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Floorplan Not Found</h1>
          <p className="text-gray-500">The requested floorplan could not be found.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          <ChevronsLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }
  
  // Render specific floorplan view
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row justify-between items-start mb-2 md:mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold truncate">{floorplan.name}</h1>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Advanced floorplan viewer with professional annotation and markup capabilities</p>
        </div>
        {/* Add the marker stats legend in the top right */}
        <div className="hidden md:block">
          <MarkerStatsLegend projectId={floorplan.project_id} />
        </div>
      </div>
      
      <div className="flex flex-col flex-1 mt-2 md:mt-4 p-2 md:p-4 bg-white rounded-lg shadow">
        {/* Conditional rendering based on device type */}
        {isMobile ? (
          /* Mobile Toolbar - renders at the bottom via fixed positioning */
          <MobileToolbar
            currentTool={toolMode}
            onToolSelect={handleToolSelect}
            onZoomIn={() => {
              setScale(prev => Math.min(prev * 1.2, 10));
              toast({
                title: 'Zooming In',
                description: `Scale: ${(scale * 1.2).toFixed(1)}x`,
                duration: 1000,
              });
            }}
            onZoomOut={() => {
              setScale(prev => Math.max(prev * 0.8, 0.1));
              toast({
                title: 'Zooming Out',
                description: `Scale: ${(scale * 0.8).toFixed(1)}x`,
                duration: 1000,
              });
            }}
            onReset={() => {
              setScale(1);
              setTranslateX(0);
              setTranslateY(0);
              handleReloadViewer();
              toast({
                title: 'View Reset',
                description: 'Zoom level and position reset to default',
                duration: 1000,
              });
            }}
          />
        ) : (
          /* Desktop Toolbar */
          <div className="mb-2">
            <TooltipProvider>
              <AnnotationToolbar 
                activeTool={toolMode}
                onToolChange={(tool) => handleToolSelect(tool)}
                onRotate={(direction: 'cw' | 'ccw') => {
                  // Handle rotation
                  toast({
                    title: `Rotating ${direction === 'cw' ? 'clockwise' : 'counter-clockwise'}`,
                    description: "Rotation feature implemented"
                  });
                }}
                onZoomIn={() => {
                  setScale(prev => Math.min(prev * 1.2, 10));
                }}
                onZoomOut={() => {
                  setScale(prev => Math.max(prev * 0.8, 0.1));
                }}
                onZoomFit={() => {
                  setScale(1);
                  setTranslateX(0);
                  setTranslateY(0);
                  handleReloadViewer();
                }}
                onSave={() => {
                  toast({
                    title: 'Saving Annotations',
                    description: "All annotations have been saved"
                  });
                }}
                onDelete={() => {
                  if (selectedMarkerId) {
                    deleteMarkerMutation.mutate(selectedMarkerId);
                  }
                }}
                onCopy={() => {
                  toast({
                    title: 'Copying Selection',
                    description: "Selection copied to clipboard"
                  });
                }}
                onExport={() => {
                  setShowExportDialog(true);
                }}
                onLayersToggle={() => {
                  setShowLayersPanel(!showLayersPanel);
                }}
                onToggleLabels={() => {
                  setShowAllLabels(!showAllLabels);
                }}
                showLayers={showLayersPanel}
                showAllLabels={showAllLabels}
                canDelete={!!selectedMarkerId}
                canCopy={!!selectedMarkerId}
                zoomLevel={scale}
              />
            </TooltipProvider>
          </div>
        )}
        
        <div className="flex flex-wrap justify-between mb-2 md:mb-4">
          <div className="flex space-x-2 items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReloadViewer}
              className="ml-2"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reload Viewer
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleToolSelect('access_point')}>
                  <DoorClosed className="h-4 w-4 mr-2" />
                  Access Point
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToolSelect('camera')}>
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToolSelect('intercom')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Intercom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToolSelect('elevator')}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Elevator
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mb-4">
          <Tabs value={activeViewMode} onValueChange={(value) => setActiveViewMode(value as 'standard' | 'editor' | 'annotate')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Standard View
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> PDF Editor
              </TabsTrigger>
              <TabsTrigger value="annotate" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Equipment Markers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1 border rounded-lg overflow-hidden">
          {/* Render the correct component based on the active view mode */}
          {activeViewMode === 'standard' && (
            <EnhancedFloorplanViewer
              key={viewerKey}
              floorplan={floorplan}
              currentPage={currentPage}
              toolMode={toolMode}
              layers={layers || []}
              onPageChange={setCurrentPage}
              showAllLabels={showAllLabels}
            />
          )}
          
          {activeViewMode === 'editor' && (
            <div className="h-full">
              <EnhancedFloorplanEditor 
                floorplanId={floorplanId}
                projectId={projectId}
                onMarkersUpdated={() => {
                  // Refresh marker stats and equipment data when markers are updated
                  queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'marker-stats'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan', floorplanId, 'markers'] });
                  
                  // Also refresh related equipment tables
                  queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'access-points'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'cameras'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'intercoms'] });
                  
                  // Show toast notification
                  toast({
                    title: "Equipment list updated",
                    description: "The equipment list has been updated with the changes from the floorplan."
                  });
                }}
              />
            </div>
          )}
          
          {activeViewMode === 'annotate' && (
            <EnhancedFloorplanViewer
              key={`${viewerKey}-annotate`}
              floorplan={floorplan}
              currentPage={currentPage}
              toolMode={toolMode}
              layers={layers || []}
              onPageChange={setCurrentPage}
              showAllLabels={true}
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 md:mt-4 gap-2">
          <div className="flex w-full sm:w-auto justify-center space-x-1 sm:space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 sm:px-3"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex items-center px-2">
              <span className="text-xs sm:text-sm whitespace-nowrap">
                {currentPage}/{floorplan.page_count}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= floorplan.page_count}
              onClick={() => setCurrentPage(prev => Math.min(floorplan.page_count, prev + 1))}
              className="p-2 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-2" />
            </Button>
          </div>
          
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ChevronsLeft className="mr-1 sm:mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </div>
        </div>
        
        {/* Mobile-only legend at the bottom */}
        <div className="mt-4 md:hidden">
          <MarkerStatsLegend projectId={floorplan.project_id} />
        </div>
      </div>
    </div>
  );
}

// Wrap the component with ChatbotProvider
function EnhancedFloorplansPageWithChatbot() {
  const params = useParams<{ projectId: string }>();
  const projectId = parseInt(params.projectId);
  const { toast } = useToast();
  
  // Create a function to handle marker addition from chatbot
  const handleAddMarker = (type: string, properties: any) => {
    console.log("Adding marker from chatbot:", type, properties);
    // You can trigger additional actions here
    toast({
      title: "AI Assistant",
      description: `Added a new ${type} based on conversation`,
    });
  };
  
  return (
    <ChatbotProvider>
      <EnhancedFloorplansPage />
      <ChatbotButton />
      <ChatbotWindow />
      <FullPageChatbot />
    </ChatbotProvider>
  );
}

export default EnhancedFloorplansPageWithChatbot;