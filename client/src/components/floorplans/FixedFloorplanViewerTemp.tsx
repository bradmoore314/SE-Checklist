import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/hooks/use-device';
import { Loader2, ZoomIn, ZoomOut, Plus, Trash } from 'lucide-react';
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

// Props for the component
interface FixedFloorplanViewerProps {
  projectId: number;
  onMarkersUpdated?: () => void;
}

const FixedFloorplanViewerTemp: React.FC<FixedFloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [pdfScale, setPdfScale] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFloorplanName, setNewFloorplanName] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
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

  // Handle PDF document load success
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to first page
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
                  <CardHeader className="flex flex-row items-center justify-between">
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
                  <CardContent className="p-0 relative overflow-auto">
                    <div
                      style={{
                        transform: `scale(${pdfScale})`,
                        transformOrigin: 'top left',
                        background: 'white'
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