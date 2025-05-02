import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Layers, ZoomIn, Move, Ruler, ChevronsLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EnhancedFloorplanViewer } from '@/components/floorplans/EnhancedFloorplanViewer';
// Using a basic heading structure instead of PageHeader

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
  order: number;
}

/**
 * Enhanced Floorplans Page with professional PDF annotation 
 * capabilities similar to Bluebeam
 */
function EnhancedFloorplansPage() {
  const params = useParams<{ projectId: string, floorplanId: string }>();
  const { toast } = useToast();
  const projectId = parseInt(params.projectId);
  const floorplanId = parseInt(params.floorplanId);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<string>('pan');
  const [viewerKey, setViewerKey] = useState(0);
  
  // Fetch floorplan data
  const { 
    data: floorplan, 
    isLoading: isLoadingFloorplan 
  } = useQuery<FloorplanData>({
    queryKey: ['/api/floorplans', floorplanId],
    enabled: !isNaN(floorplanId)
  });
  
  // Fetch layers for organization
  const { 
    data: layers, 
    isLoading: isLoadingLayers 
  } = useQuery<LayerData[]>({
    queryKey: ['/api/floorplans', floorplanId, 'layers'],
    enabled: !isNaN(floorplanId)
  });
  
  // Handle tool selection
  const handleToolSelect = (tool: string) => {
    setToolMode(tool);
  };
  
  // Reload the viewer (for debugging or reset)
  const handleReloadViewer = () => {
    setViewerKey(prev => prev + 1);
  };
  
  if (isLoadingFloorplan || isLoadingLayers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
          {/* Enhanced viewer with PDF coordinate system */}
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