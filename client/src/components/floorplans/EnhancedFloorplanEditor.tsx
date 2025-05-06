import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfEditorProps {
  floorplanId?: number;
  projectId?: number;
}

type StampType = {
  id: string;
  label: string;
  color: string;
  icon: string;
};

type Annotation = {
  id: number;
  type: 'stamp' | 'text';
  x: number;
  y: number;
  content?: string;
  color: string;
  stampId?: string;
  stampLabel?: string;
  stampIcon?: string;
  page: number;
};

export function EnhancedFloorplanEditor({ floorplanId, projectId }: PdfEditorProps) {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if it's a PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive"
        });
        return;
      }
      
      setPdfFile(file);
      
      // Create URL for the PDF
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      toast({
        title: "PDF loaded",
        description: `${file.name} loaded successfully.`
      });
      
      // For demo, set a random number of pages
      setTotalPages(Math.floor(Math.random() * 5) + 1);
    }
  };

  const handleDownload = async () => {
    if (!pdfFile) {
      toast({
        title: "No PDF loaded",
        description: "Please load a PDF file first.",
        variant: "destructive"
      });
      return;
    }

    // Create a download link for the PDF
    const a = document.createElement('a');
    a.href = pdfUrl as string;
    a.download = pdfFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "PDF downloaded",
      description: "PDF file has been downloaded."
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Floorplan Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload PDF
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
              </div>
              
              <Button
                onClick={handleDownload}
                variant="outline"
                disabled={!pdfFile}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            
            {pdfUrl && (
              <div className="mt-4 border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">PDF Preview</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                
                <div className="relative border rounded-md h-[600px] bg-gray-50 overflow-hidden">
                  <iframe 
                    src={`${pdfUrl}#page=${currentPage}`}
                    className="w-full h-full"
                    title="PDF Viewer"
                  />
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary rounded-md px-3 py-1 shadow text-sm">
                    <p>PDF annotation tools coming soon!</p>
                  </div>
                </div>
              </div>
            )}
            
            {!pdfUrl && (
              <div className="flex flex-col items-center justify-center border rounded-md p-8 mt-4 bg-muted/20">
                <p className="text-muted-foreground text-center mb-2">No PDF file loaded</p>
                <p className="text-sm text-muted-foreground text-center">
                  Upload a PDF file to get started with annotations
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}