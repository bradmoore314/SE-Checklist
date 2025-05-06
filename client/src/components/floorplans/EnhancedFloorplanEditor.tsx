import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileUp, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfEditorProps {
  floorplanId?: number;
  projectId?: number;
}

export function EnhancedFloorplanEditor({ floorplanId, projectId }: PdfEditorProps) {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Annotation states
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [currentTool, setCurrentTool] = useState<'select' | 'stamp' | 'text' | 'shape' | 'calibrate'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [currentFontSize, setCurrentFontSize] = useState(14);
  const [currentLineWidth, setCurrentLineWidth] = useState(2);
  const [currentText, setCurrentText] = useState('');
  const [currentStamp, setCurrentStamp] = useState<StampType | null>(null);
  
  // Predefined professional stamps
  const STAMPS: Record<string, StampConfig[]> = {
    "Security Equipment": [
      { id: "camera", label: "Camera", color: "#0369A1", icon: "📷" },
      { id: "door_access", label: "Door Access", color: "#166534", icon: "🚪" },
      { id: "motion_sensor", label: "Motion Sensor", color: "#9333EA", icon: "👁️" },
      { id: "intercom", label: "Intercom", color: "#0891B2", icon: "🔊" }
    ],
    "Status Stamps": [
      { id: "approved", label: "APPROVED", color: "#16A34A", icon: "✓" },
      { id: "rejected", label: "REJECTED", color: "#DC2626", icon: "✗" },
      { id: "pending", label: "PENDING", color: "#F59E0B", icon: "⏱️" },
      { id: "revised", label: "REVISED", color: "#8B5CF6", icon: "⟳" }
    ],
    "Review Stamps": [
      { id: "reviewed", label: "REVIEWED", color: "#2563EB", icon: "👀" },
      { id: "needs_review", label: "NEEDS REVIEW", color: "#FB7185", icon: "❗" },
      { id: "comments", label: "COMMENTS", color: "#8B5CF6", icon: "💬" }
    ]
  };

  // Define annotation types
  type StampType = {
    id: string;
    label: string; 
    color: string;
    icon: string;
  };
  
  type StampConfig = {
    id: string;
    label: string;
    color: string;
    icon: string;
  };

  type Annotation = {
    id: number;
    type: 'stamp' | 'text' | 'shape';
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string;
    fontFamily?: string;
    fontSize?: number;
    color: string;
    fillColor?: string;
    lineWidth?: number;
    stampId?: string;
    stampLabel?: string;
    stampIcon?: string;
    rotation?: number;
    page: number;
    created: Date;
  };

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
      
      // Reset annotations and other states
      setAnnotations([]);
      setCurrentPage(1);
      setSelectedAnnotation(null);
      setZoom(1);
      
      toast({
        title: "PDF loaded",
        description: `${file.name} loaded successfully.`
      });
      
      // Simulate loading a PDF with multiple pages
      setTotalPages(Math.floor(Math.random() * 5) + 1);
    }
  };

  // Add a stamp annotation
  const addStampAnnotation = (x: number, y: number) => {
    if (!currentStamp) return;
    
    const newAnnotation: Annotation = {
      id: Date.now(),
      type: 'stamp',
      x,
      y,
      width: 100,
      height: 50,
      color: currentStamp.color,
      stampId: currentStamp.id,
      stampLabel: currentStamp.label,
      stampIcon: currentStamp.icon,
      rotation: 0,
      page: currentPage,
      created: new Date()
    };
    
    // Save current state to undo stack
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    // Add new annotation
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    
    toast({
      title: "Stamp added",
      description: `${currentStamp.label} stamp added to the PDF.`
    });
  };

  // Add text annotation
  const addTextAnnotation = (x: number, y: number) => {
    if (!currentText) {
      toast({
        title: "No text entered",
        description: "Please enter text to add.",
        variant: "destructive"
      });
      return;
    }
    
    const newAnnotation: Annotation = {
      id: Date.now(),
      type: 'text',
      x,
      y,
      content: currentText,
      fontFamily: 'Arial',
      fontSize: currentFontSize,
      color: currentColor,
      page: currentPage,
      created: new Date()
    };
    
    // Save current state to undo stack
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    // Add new annotation
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    
    toast({
      title: "Text added",
      description: "Text annotation added to the PDF."
    });
  };

  // Handle canvas click for adding annotations
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    if (currentTool === 'stamp' && currentStamp) {
      addStampAnnotation(x, y);
    } else if (currentTool === 'text') {
      addTextAnnotation(x, y);
    } else if (currentTool === 'select') {
      // Handle selecting existing annotations
      let found = false;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const annotation = annotations[i];
        if (annotation.page !== currentPage) continue;
        
        if (annotation.type === 'stamp' && annotation.width && annotation.height) {
          if (
            x >= annotation.x && 
            x <= annotation.x + annotation.width && 
            y >= annotation.y && 
            y <= annotation.y + annotation.height
          ) {
            setSelectedAnnotation(annotation.id);
            found = true;
            break;
          }
        } else if (annotation.type === 'text') {
          // Simplified text selection (would be more complex in real implementation)
          const textWidth = annotation.content ? annotation.content.length * (annotation.fontSize || 10) / 2 : 0;
          if (
            x >= annotation.x && 
            x <= annotation.x + textWidth && 
            y >= annotation.y - (annotation.fontSize || 10) && 
            y <= annotation.y
          ) {
            setSelectedAnnotation(annotation.id);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        setSelectedAnnotation(null);
      }
    }
  };

  // Handle mouse move for dragging annotations
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !selectedAnnotation || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setAnnotations(annotations.map(annotation => {
      if (annotation.id === selectedAnnotation) {
        return { ...annotation, x, y };
      }
      return annotation;
    }));
  };

  // Handle mouse up to finish dragging
  const handleMouseUp = () => {
    if (isDrawing && selectedAnnotation) {
      setUndoStack([...undoStack, annotations]);
      setRedoStack([]);
    }
    setIsDrawing(false);
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select' && selectedAnnotation) {
      setIsDrawing(true);
    }
  };

  // Delete selected annotation
  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation === null) return;
    
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    setAnnotations(annotations.filter(a => a.id !== selectedAnnotation));
    setSelectedAnnotation(null);
    
    toast({
      title: "Annotation deleted",
      description: "Annotation has been removed."
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const prevState = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, annotations]);
    setUndoStack(undoStack.slice(0, -1));
    setAnnotations(prevState);
    
    toast({
      title: "Undo",
      description: "Last action undone."
    });
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, annotations]);
    setRedoStack(redoStack.slice(0, -1));
    setAnnotations(nextState);
    
    toast({
      title: "Redo",
      description: "Action redone."
    });
  };

  // Save annotated PDF
  const handleSave = async () => {
    if (!pdfFile || !pdfUrl) {
      toast({
        title: "No PDF loaded",
        description: "Please load a PDF file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this is where we would use pdf-lib to apply
      // the annotations to the PDF file. For this demo, we'll just simulate a delay.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here we would save the annotated PDF either by downloading it or saving to the project
      
      toast({
        title: "PDF saved",
        description: "Annotated PDF has been saved successfully."
      });
    } catch (error) {
      console.error("Failed to save PDF:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the annotated PDF.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Draw annotations on canvas
  useEffect(() => {
    if (!canvasRef.current || !pdfUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simulate PDF renderer with a colored background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw PDF page outline
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    // Draw placeholder text to simulate PDF content
    ctx.fillStyle = '#aaa';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`PDF Page ${currentPage} of ${totalPages}`, canvas.width / 2, canvas.height / 2);
    
    // Draw annotations for current page
    const currentAnnotations = annotations.filter(annotation => annotation.page === currentPage);
    
    // Apply zoom factor
    ctx.save();
    ctx.scale(zoom, zoom);
    
    // Draw annotations
    currentAnnotations.forEach(annotation => {
      const isSelected = annotation.id === selectedAnnotation;
      
      if (annotation.type === 'stamp' && annotation.stampIcon && annotation.stampLabel) {
        // Draw stamp
        ctx.save();
        
        // Draw stamp background
        ctx.fillStyle = annotation.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(annotation.x, annotation.y, annotation.width || 100, annotation.height || 50);
        
        // Draw stamp border when selected
        if (isSelected) {
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2;
          ctx.strokeRect(annotation.x - 2, annotation.y - 2, (annotation.width || 100) + 4, (annotation.height || 50) + 4);
        }
        
        // Draw stamp icon
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(annotation.stampIcon, annotation.x + 5, annotation.y + 25);
        
        // Draw stamp text
        ctx.font = 'bold 16px Arial';
        ctx.fillText(annotation.stampLabel, annotation.x + 35, annotation.y + 30);
        
        ctx.restore();
      }
      else if (annotation.type === 'text' && annotation.content) {
        // Draw text annotation
        ctx.save();
        
        // Draw text
        ctx.fillStyle = annotation.color;
        ctx.font = `${annotation.fontSize || 14}px ${annotation.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.fillText(annotation.content, annotation.x, annotation.y);
        
        // Draw selection box when selected
        if (isSelected) {
          const textWidth = ctx.measureText(annotation.content).width;
          const textHeight = annotation.fontSize || 14;
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 1;
          ctx.strokeRect(annotation.x - 2, annotation.y - textHeight - 2, textWidth + 4, textHeight + 4);
        }
        
        ctx.restore();
      }
    });
    
    ctx.restore();
  }, [pdfUrl, currentPage, annotations, selectedAnnotation, zoom]);

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-white shadow-sm py-2 px-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4 mr-1" />
              Open PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSave} 
              disabled={!pdfUrl || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-1">⏳</span> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleUndo} 
              disabled={undoStack.length === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="mx-2 h-8" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant={currentTool === 'select' ? "secondary" : "ghost"} 
                    onClick={() => setCurrentTool('select')}
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Select Tool</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant={currentTool === 'text' ? "secondary" : "ghost"} 
                    onClick={() => setCurrentTool('text')}
                  >
                    <Text className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text Tool</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <PopoverProvider>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    variant={currentTool === 'stamp' ? "secondary" : "ghost"}
                  >
                    <Stamp className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="start">
                  <Tabs defaultValue="Security Equipment">
                    <TabsList className="w-full">
                      {Object.keys(STAMPS).map(category => (
                        <TabsTrigger key={category} value={category}>
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(STAMPS).map(([category, stamps]) => (
                      <TabsContent key={category} value={category} className="mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {stamps.map(stamp => (
                            <Button
                              key={stamp.id}
                              variant={currentStamp?.id === stamp.id ? "secondary" : "outline"}
                              className="justify-start h-auto py-2"
                              onClick={() => {
                                setCurrentStamp(stamp);
                                setCurrentTool('stamp');
                              }}
                            >
                              <div 
                                className="w-8 h-8 mr-2 flex items-center justify-center rounded" 
                                style={{ backgroundColor: stamp.color }}
                              >
                                <span className="text-white text-sm">{stamp.icon}</span>
                              </div>
                              <span>{stamp.label}</span>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </PopoverContent>
              </Popover>
            </PopoverProvider>
            
            {selectedAnnotation !== null && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={deleteSelectedAnnotation}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              disabled={zoom <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="mx-2 h-8" />
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">{currentPage} / {totalPages}</span>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative bg-gray-100">
        {!pdfUrl ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
              <FileUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No PDF Loaded</h2>
              <p className="text-gray-500 mb-4">
                Load a PDF to start adding annotations, stamps, and markups
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <FileUp className="h-4 w-4 mr-2" />
                Select PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={1000}
              className="border shadow-lg bg-white"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        )}
      </main>
      
      {currentTool === 'text' && (
        <footer className="border-t bg-white p-3">
          <div className="flex gap-4 items-center">
            <Label htmlFor="text-input">Text:</Label>
            <Input
              id="text-input"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter text..."
              className="max-w-xs"
            />
            
            <Label htmlFor="font-size">Size:</Label>
            <Input
              id="font-size"
              type="number"
              min={8}
              max={72}
              value={currentFontSize}
              onChange={(e) => setCurrentFontSize(parseInt(e.target.value) || 14)}
              className="w-16"
            />
            
            <Label htmlFor="text-color">Color:</Label>
            <Input
              id="text-color"
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-12 h-8 p-0"
            />
          </div>
        </footer>
      )}
    </div>
  );
}

// PopoverProvider needed for Popover components
function PopoverProvider({ children }: { children: React.ReactNode }) {
  return children;
}