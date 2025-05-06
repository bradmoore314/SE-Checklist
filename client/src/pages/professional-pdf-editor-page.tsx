import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdvancedPdfViewer, Annotation } from '@/components/floorplans/AdvancedPdfViewer';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Save, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FloorplanData {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
  created_at: string;
  updated_at: string;
}

interface SaveAnnotationsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  saving: boolean;
}

function SaveAnnotationsDialog({ open, onClose, onSave, saving }: SaveAnnotationsDialogProps) {
  const [name, setName] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Floorplan</DialogTitle>
          <DialogDescription>
            Enter a name for this annotated floorplan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Floor 1 Annotated"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(name)} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfessionalPdfEditorPage() {
  const { projectId, floorplanId } = useParams<{ projectId: string, floorplanId?: string }>();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Query for fetching floorplan data if floorplanId is provided
  const { data: floorplan, isLoading: isLoadingFloorplan } = useQuery<FloorplanData>({
    queryKey: floorplanId ? ['/api/enhanced-floorplan', parseInt(floorplanId)] : null,
    enabled: !!floorplanId,
  });

  // Effect to update annotations when floorplan data is loaded
  useEffect(() => {
    if (floorplan?.pdf_data) {
      // In a real implementation, we would also load saved annotations
      // For now, just loading the PDF data
    }
  }, [floorplan]);

  // Handle annotations change
  const handleAnnotationsChange = (newAnnotations: Annotation[]) => {
    setAnnotations(newAnnotations);
  };

  // Handle file upload
  const handleFileChange = (newFile: File) => {
    setFile(newFile);
    // Reset annotations when a new file is loaded
    setAnnotations([]);
  };

  // Save floorplan mutation
  const saveMutation = useMutation({
    mutationFn: async ({ name, pdfData, annotations }: { name: string, pdfData: string, annotations: Annotation[] }) => {
      // If floorplanId exists, update existing floorplan, otherwise create new
      const url = floorplanId 
        ? `/api/enhanced-floorplan/${floorplanId}` 
        : '/api/enhanced-floorplan';
      
      const method = floorplanId ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, url, {
        project_id: parseInt(projectId),
        name,
        pdf_data: pdfData,
        annotations: JSON.stringify(annotations)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save floorplan');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Floorplan ${floorplanId ? 'updated' : 'created'} successfully`,
      });
      
      // Close dialog
      setSaveDialogOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan'] });
      
      // If we created a new floorplan, redirect to the floorplans page
      if (!floorplanId) {
        // In a real implementation, we would redirect to the newly created floorplan
        // For now, just reload the page
        window.location.href = `/projects/${projectId}/floorplans`;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save floorplan: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSaving(false);
    }
  });

  // Handle save dialog confirm
  const handleSaveConfirm = async (name: string) => {
    if (!name.trim()) return;
    
    setSaving(true);
    
    try {
      // If we have a file, convert it to base64
      let pdfData = '';
      
      if (file) {
        const reader = new FileReader();
        pdfData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (floorplan?.pdf_data) {
        // Use existing PDF data if no new file was uploaded
        pdfData = floorplan.pdf_data;
      } else {
        throw new Error('No PDF data available');
      }
      
      // Save the floorplan
      saveMutation.mutate({ name, pdfData, annotations });
    } catch (error) {
      console.error('Error preparing PDF data:', error);
      toast({
        title: "Error",
        description: "Failed to prepare PDF data for saving",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-4 space-y-4">
        {/* Breadcrumb navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/projects/${projectId}`}>Project</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/projects/${projectId}/floorplans`}>Floorplans</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                {floorplanId 
                  ? (isLoadingFloorplan ? 'Loading...' : floorplan?.name || 'Editor') 
                  : 'New Floorplan'
                }
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Main header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/projects/${projectId}/floorplans`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {floorplanId 
                ? (isLoadingFloorplan 
                    ? <Skeleton className="h-8 w-48" /> 
                    : floorplan?.name || 'Floorplan Editor') 
                : 'New Floorplan'
              }
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(true)}
              disabled={(!file && !floorplan?.pdf_data)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        {/* PDF Editor */}
        <Card className="h-[calc(100vh-240px)]">
          <CardContent className="p-0 h-full">
            <AdvancedPdfViewer
              file={file}
              pdfUrl={floorplan?.pdf_data}
              onFileChange={handleFileChange}
              onAnnotationChange={handleAnnotationsChange}
              initialPageNumber={1}
              initialScale={1.0}
            />
          </CardContent>
        </Card>
        
        {/* Save dialog */}
        <SaveAnnotationsDialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={handleSaveConfirm}
          saving={saving}
        />
      </div>
    </MainLayout>
  );
}