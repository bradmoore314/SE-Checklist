import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

// Simple types just for this component
interface Floorplan {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
}

export default function SimpleFloorplanViewer({ projectId }: { projectId: number }) {
  const { toast } = useToast();
  const [newFloorplanName, setNewFloorplanName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);

  // Fetch floorplans for this project
  const { data: floorplans = [], isLoading: isLoadingFloorplans, refetch } = useQuery<Floorplan[]>({
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
      toast({
        title: "Success",
        description: "Floorplan deleted successfully",
      });
      refetch();
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

  // Mutation for uploading floorplans
  const uploadFloorplanMutation = useMutation({
    mutationFn: async (floorplan: { name: string, pdf_data: string, project_id: number }) => {
      const res = await apiRequest('POST', '/api/floorplans', floorplan);
      return await res.json();
    },
    onSuccess: () => {
      // Reset form
      setNewFloorplanName('');
      setPdfFile(null);
      
      // Refetch floorplans
      refetch();
      
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

  // Render the PDF when floorplan is selected
  const renderSelectedFloorplan = () => {
    if (!selectedFloorplanId) return null;
    
    const floorplan = floorplans.find(f => f.id === selectedFloorplanId);
    if (!floorplan) return null;
    
    const pdfDataUrl = `data:application/pdf;base64,${floorplan.pdf_data}`;
    
    return (
      <div className="border rounded-md p-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{floorplan.name}</h3>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the "${floorplan.name}" floorplan? This cannot be undone.`)) {
                deleteFloorplanMutation.mutate(floorplan.id);
                setSelectedFloorplanId(null);
              }
            }}
            disabled={deleteFloorplanMutation.isPending}
          >
            {deleteFloorplanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
        
        <div className="border rounded w-full overflow-hidden" style={{ height: '800px' }}>
          <iframe 
            src={pdfDataUrl}
            width="100%"
            height="100%"
            className="border-0"
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Floorplans</h2>
      <p className="mb-4 text-muted-foreground">Upload PDF floorplans for your site walk.</p>
      
      {/* Upload form */}
      <div className="p-4 border rounded-md bg-muted/10">
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
          
          <Button 
            onClick={handleUploadFloorplan} 
            disabled={uploadFloorplanMutation.isPending || !pdfFile || !newFloorplanName}
            className="w-full h-8 text-xs"
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
        </div>
      </div>
      
      {/* Floorplan list */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Available Floorplans</h3>
        
        {isLoadingFloorplans ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : floorplans.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No floorplans uploaded yet. Upload your first floorplan above.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {floorplans.map(floorplan => (
              <Button
                key={floorplan.id}
                variant={selectedFloorplanId === floorplan.id ? "default" : "outline"}
                className="text-sm p-4 h-auto justify-start"
                onClick={() => setSelectedFloorplanId(
                  selectedFloorplanId === floorplan.id ? null : floorplan.id
                )}
              >
                {floorplan.name}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Render selected floorplan */}
      {renderSelectedFloorplan()}
    </div>
  );
}