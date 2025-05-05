import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Layers, ZoomIn, Move, Ruler, ChevronsLeft, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EnhancedFloorplanViewer } from '@/components/floorplans/EnhancedFloorplanViewer';
import { SimpleEnhancedViewer } from '@/components/floorplans/SimpleEnhancedViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  order: number;
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<string>('pan');
  const [viewerKey, setViewerKey] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [floorplanName, setFloorplanName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
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
  const handleToolSelect = (tool: string) => {
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
  
  // Upload floorplan
  const uploadFloorplan = async () => {
    if (!pdfFile || !floorplanName) {
      toast({
        title: "Error",
        description: "Please provide both a file and a name for the floorplan.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
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
        reader.onerror = (e) => reject(e);
      });
      
      reader.readAsDataURL(pdfFile);
      
      const base64 = await base64Promise;
      
      // Use the correct API endpoint
      const response = await apiRequest('POST', '/api/floorplans', {
        name: floorplanName,
        pdf_data: base64,
        project_id: projectId
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Upload Successful",
        description: "Floorplan has been successfully uploaded."
      });
      
      // Reset the form
      setPdfFile(null);
      setFloorplanName('');
      setShowUploadDialog(false);
      
      // Refresh the floorplans list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
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
          <Button onClick={() => setShowUploadDialog(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload Floorplan
          </Button>
        </div>
        
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
                <Label htmlFor="pdfFile">PDF File</Label>
                <Input 
                  id="pdfFile" 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">Upload a PDF file of your floorplan (max 10MB)</p>
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
              <Link key={floorplan.id} href={`/projects/${projectId}/enhanced-floorplans/${floorplan.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-100 mb-4 flex items-center justify-center rounded-md">
                      <span className="material-icons text-4xl text-gray-400">map</span>
                    </div>
                    <h3 className="font-semibold text-lg truncate">{floorplan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {floorplan.page_count} page{floorplan.page_count !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <span className="material-icons text-4xl text-gray-400 mb-4">description</span>
            <h3 className="text-lg font-medium text-gray-900">No Floorplans Available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a PDF floorplan to get started with enhanced annotation tools.
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{floorplan.name}</h1>
        <p className="text-gray-500">Enhanced PDF Floorplan Viewer with Bluebeam-like annotation capabilities</p>
      </div>
      
      <div className="flex flex-col flex-1 mt-4 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={toolMode === 'pan' ? 'default' : 'outline'}
              onClick={() => handleToolSelect('pan')}
            >
              <Move className="h-4 w-4 mr-2" />
              Pan
            </Button>
            <Button
              size="sm"
              variant={toolMode === 'zoom' ? 'default' : 'outline'}
              onClick={() => handleToolSelect('zoom')}
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom
            </Button>
            <Button
              size="sm"
              variant={toolMode === 'measure' ? 'default' : 'outline'}
              onClick={() => handleToolSelect('measure')}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Measure
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReloadViewer}
            >
              Reload Viewer
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
            >
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
        
        <div className="flex-1 border rounded-lg overflow-hidden">
          {/* Enhanced viewer with PDF coordinate system and Bluebeam-like features */}
          <EnhancedFloorplanViewer
            key={viewerKey}
            floorplan={floorplan}
            currentPage={currentPage}
            toolMode={toolMode}
            layers={layers || []}
            onPageChange={setCurrentPage}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous Page
            </Button>
            <div className="flex items-center">
              <span className="text-sm">
                Page {currentPage} of {floorplan.page_count}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= floorplan.page_count}
              onClick={() => setCurrentPage(prev => Math.min(floorplan.page_count, prev + 1))}
            >
              Next Page
            </Button>
          </div>
          
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ChevronsLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedFloorplansPage;