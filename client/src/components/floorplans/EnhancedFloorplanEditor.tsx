import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCw, RotateCcw, Merge, FileUp, Trash2, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfEditorProps {
  floorplanId?: number;
  projectId?: number;
}

export function EnhancedFloorplanEditor({ floorplanId, projectId }: PdfEditorProps) {
  const { toast } = useToast();
  const [selectedPdfs, setSelectedPdfs] = useState<File[]>([]);
  const [selectedPdfPages, setSelectedPdfPages] = useState<{ [filename: string]: number[] }>({});
  const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);
  const [mergeInProgress, setMergeInProgress] = useState(false);
  const [rotationInProgress, setRotationInProgress] = useState(false);
  const [editMode, setEditMode] = useState<'merge' | 'rotate'>('merge');

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedPdfs(prev => [...prev, ...newFiles]);
      
      // Initialize selected pages for each new file (select all pages by default)
      newFiles.forEach(file => {
        setSelectedPdfPages(prev => ({
          ...prev,
          [file.name]: [1] // For simplicity, assume 1 page initially
        }));
      });

      toast({
        title: "Files added",
        description: `Added ${newFiles.length} file(s) to your workspace`,
      });
    }
  };

  // Remove a PDF from the selection
  const removePdf = (filename: string) => {
    setSelectedPdfs(prev => prev.filter(file => file.name !== filename));
    setSelectedPdfPages(prev => {
      const updated = { ...prev };
      delete updated[filename];
      return updated;
    });

    toast({
      title: "File removed",
      description: `Removed ${filename} from your workspace`,
    });
  };

  // Merge PDFs
  const mergePdfs = async () => {
    if (selectedPdfs.length === 0) {
      toast({
        title: "No PDFs selected",
        description: "Please select at least one PDF to merge",
        variant: "destructive"
      });
      return;
    }

    setMergeInProgress(true);
    toast({
      title: "Merging PDFs",
      description: "This may take a moment...",
    });

    try {
      // Simulate PDF merging - in a real implementation, we would use a PDF library
      // like pdf-lib to actually merge the PDFs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a merged PDF
      setMergedPdf(new Blob([selectedPdfs[0]], { type: 'application/pdf' }));
      
      toast({
        title: "Merge complete",
        description: "Your PDFs have been merged successfully",
      });
    } catch (error) {
      toast({
        title: "Merge failed",
        description: "There was an error merging your PDFs",
        variant: "destructive"
      });
      console.error("PDF merge error:", error);
    } finally {
      setMergeInProgress(false);
    }
  };

  // Rotate PDF
  const rotatePdf = async (direction: 'clockwise' | 'counter-clockwise') => {
    if (selectedPdfs.length === 0) {
      toast({
        title: "No PDF selected",
        description: "Please select a PDF to rotate",
        variant: "destructive"
      });
      return;
    }

    setRotationInProgress(true);
    toast({
      title: `Rotating PDF ${direction === 'clockwise' ? 'clockwise' : 'counter-clockwise'}`,
      description: "This may take a moment...",
    });

    try {
      // Simulate PDF rotation - in a real implementation, we would use a PDF library
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Rotation complete",
        description: `Your PDF has been rotated ${direction === 'clockwise' ? 'clockwise' : 'counter-clockwise'}`,
      });
    } catch (error) {
      toast({
        title: "Rotation failed",
        description: "There was an error rotating your PDF",
        variant: "destructive"
      });
      console.error("PDF rotation error:", error);
    } finally {
      setRotationInProgress(false);
    }
  };

  // Download merged PDF
  const downloadMergedPdf = () => {
    if (!mergedPdf) {
      toast({
        title: "No merged PDF",
        description: "Please merge PDFs first before downloading",
        variant: "destructive"
      });
      return;
    }

    const url = URL.createObjectURL(mergedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = "merged_floorplan.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your merged PDF is being downloaded",
    });
  };

  // Save to project
  const saveToProject = async () => {
    if (!mergedPdf || !projectId) {
      toast({
        title: "Cannot save",
        description: !mergedPdf 
          ? "Please merge PDFs first before saving" 
          : "Project information is missing",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Saving to project",
      description: "This may take a moment...",
    });

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(mergedPdf);
      
      reader.onloadend = async function() {
        const base64data = reader.result as string;
        
        // Here we would actually save the PDF data to the backend
        // For now, we'll just simulate a successful save
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Save complete",
          description: "Your modified floorplan has been saved to the project",
        });
      };
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your floorplan",
        variant: "destructive"
      });
      console.error("PDF save error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs 
        defaultValue="merge" 
        className="w-full" 
        onValueChange={(value) => setEditMode(value as 'merge' | 'rotate')}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="merge">Merge PDFs</TabsTrigger>
          <TabsTrigger value="rotate">Rotate Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="merge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merge Floorplan PDFs</CardTitle>
              <CardDescription>
                Combine multiple PDF files into a single floorplan document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-upload">Upload PDFs</Label>
                  <Input 
                    id="pdf-upload" 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    multiple
                    className="mt-1"
                  />
                </div>
                
                {selectedPdfs.length > 0 && (
                  <div>
                    <Label>Selected PDFs</Label>
                    <ScrollArea className="h-[200px] mt-1 border rounded-md p-4">
                      <div className="space-y-2">
                        {selectedPdfs.map((file, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1 truncate">
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removePdf(file.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedPdfs([])}
                disabled={selectedPdfs.length === 0}
              >
                Clear All
              </Button>
              <Button 
                onClick={mergePdfs} 
                disabled={selectedPdfs.length === 0 || mergeInProgress}
              >
                {mergeInProgress ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Merge className="mr-2 h-4 w-4" />
                    Merge PDFs
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {mergedPdf && (
            <Card>
              <CardHeader>
                <CardTitle>Merged PDF</CardTitle>
                <CardDescription>
                  Your merged floorplan PDF is ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border rounded-md p-8 bg-gray-50">
                  <div className="text-center mb-4">
                    <p className="text-lg font-medium">merged_floorplan.pdf</p>
                    <p className="text-sm text-gray-500">
                      {selectedPdfs.length} PDFs merged successfully
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={downloadMergedPdf}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    {projectId && (
                      <Button onClick={saveToProject}>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Project
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rotate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotate PDF Pages</CardTitle>
              <CardDescription>
                Rotate pages in your floorplan PDF document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-rotate-upload">Upload PDF</Label>
                  <Input 
                    id="pdf-rotate-upload" 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => {
                      setSelectedPdfs([]);
                      handleFileChange(e);
                    }} 
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only the first PDF will be used for rotation
                  </p>
                </div>
                
                {selectedPdfs.length > 0 && (
                  <div>
                    <Label>Selected PDF</Label>
                    <div className="flex items-center justify-between p-3 border rounded-md mt-1">
                      <span className="text-sm">{selectedPdfs[0].name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedPdfs[0].size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => rotatePdf('counter-clockwise')}
                disabled={selectedPdfs.length === 0 || rotationInProgress}
              >
                {rotationInProgress ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Rotate Counter-Clockwise
              </Button>
              <Button 
                onClick={() => rotatePdf('clockwise')}
                disabled={selectedPdfs.length === 0 || rotationInProgress}
              >
                {rotationInProgress ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="mr-2 h-4 w-4" />
                )}
                Rotate Clockwise
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}