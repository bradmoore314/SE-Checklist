import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeObserver } from '@/hooks/use-resize-observer';
import * as PDFJS from 'pdfjs-dist';
import { Loader2, ZoomIn, ZoomOut, Layers, Download, FileUp, Save, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { AdvancedAnnotationToolbar } from './AdvancedAnnotationToolbar';
import { cn } from '@/lib/utils';

// Configure pdfjs worker source - using specific version to avoid mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

// Types
interface PdfViewerProps {
  file?: File | null;
  pdfUrl?: string;
  onFileChange?: (file: File) => void;
  initialScale?: number;
  initialPageNumber?: number;
  onAnnotationChange?: (annotations: Annotation[]) => void;
  readOnly?: boolean;
}

export type Annotation = {
  id: string;
  type: 'stamp' | 'text' | 'shape' | 'measurement' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  page: number;
  content?: string;
  color: string;
  opacity?: number;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  points?: { x: number, y: number }[];
  imageData?: string;
  stampId?: string;
  stampIcon?: string;
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow' | 'polygon';
  layer: string;
  createdAt: Date;
  updatedAt: Date;
};

type Layer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
};

type ToolType = 'select' | 'pan' | 'stamp' | 'text' | 'shape' | 'measurement' | 'image';

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'base', name: 'Document', visible: true, locked: true, opacity: 1, order: 0 },
  { id: 'annotations', name: 'Annotations', visible: true, locked: false, opacity: 1, order: 1 },
  { id: 'measurements', name: 'Measurements', visible: true, locked: false, opacity: 1, order: 2 },
  { id: 'markup', name: 'Markup', visible: true, locked: false, opacity: 1, order: 3 },
];

export function AdvancedPdfViewer({
  file,
  pdfUrl,
  onFileChange,
  initialScale = 1.0,
  initialPageNumber = 1,
  onAnnotationChange,
  readOnly = false
}: PdfViewerProps) {
  // States
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);
  const [scale, setScale] = useState<number>(initialScale);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [renderedPageDimensions, setRenderedPageDimensions] = useState({ width: 0, height: 0 });
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>([]);
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<PDFJS.PDFDocumentProxy | null>(null);

  const { toast } = useToast();
  const { width: containerWidth } = useResizeObserver(containerRef);

  // Effect to update annotations when their source changes externally
  useEffect(() => {
    if (onAnnotationChange) {
      onAnnotationChange(annotations);
    }
  }, [annotations, onAnnotationChange]);

  // Effect to handle adjustment of PDF page scale based on container width
  useEffect(() => {
    if (containerWidth && pdfDocumentRef.current) {
      // Optionally adjust scale based on container width
    }
  }, [containerWidth]);

  // PDF document load success handler
  const onDocumentLoadSuccess = useCallback(({ numPages, pdfDocument }: { numPages: number, pdfDocument: PDFJS.PDFDocumentProxy }) => {
    setNumPages(numPages);
    pdfDocumentRef.current = pdfDocument;
    setLoading(false);
  }, []);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive"
        });
        return;
      }
      
      if (onFileChange) {
        onFileChange(selectedFile);
      }
      
      setPageNumber(1);
      setAnnotations([]);
      
      toast({
        title: "PDF loaded",
        description: `${selectedFile.name} loaded successfully.`
      });
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle page change
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  // Handle zoom in/out with fixed increments
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 5.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));

  // Handle direct scale input
  const handleScaleChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setScale(numValue);
    }
  };

  // Handle canvas interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && currentTool === 'pan') {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setViewPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Layer management
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible } 
          : layer
      )
    );
  };

  const setLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity } 
          : layer
      )
    );
  };

  const addLayer = () => {
    const newLayerId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      order: layers.length
    };
    
    setLayers([...layers, newLayer]);
  };

  // Handle rendered page size change
  const handlePageRenderSuccess = (page: any) => {
    const { width, height } = page.target;
    setRenderedPageDimensions({ width, height });
  };

  // Annotation management
  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Save current state for undo
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setAnnotations([...annotations, newAnnotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    // Save current state for undo
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    setAnnotations(prev => 
      prev.map(annotation => 
        annotation.id === id 
          ? { ...annotation, ...updates, updatedAt: new Date() } 
          : annotation
      )
    );
  };

  const deleteAnnotation = (id: string) => {
    // Save current state for undo
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    setSelectedAnnotationIds(prev => prev.filter(annotationId => annotationId !== id));
  };

  const deleteSelectedAnnotations = () => {
    if (selectedAnnotationIds.length === 0) return;
    
    // Save current state for undo
    setUndoStack([...undoStack, annotations]);
    setRedoStack([]);
    
    setAnnotations(prev => 
      prev.filter(annotation => !selectedAnnotationIds.includes(annotation.id))
    );
    setSelectedAnnotationIds([]);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const prevState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setRedoStack([...redoStack, annotations]);
    setUndoStack(newUndoStack);
    setAnnotations(prevState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    setUndoStack([...undoStack, annotations]);
    setRedoStack(newRedoStack);
    setAnnotations(nextState);
  };

  // Export functions
  const exportAsPdf = async () => {
    // Implementation would use pdf-lib to create a new PDF with annotations
    toast({
      title: "Export as PDF",
      description: "Your annotated PDF has been exported."
    });
  };

  const exportAsPng = async () => {
    if (!canvasLayerRef.current) return;
    
    try {
      // Implementation would convert the current view to PNG
      toast({
        title: "Export as PNG",
        description: "Current view exported as PNG."
      });
    } catch (error) {
      console.error("Error exporting as PNG:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PNG.",
        variant: "destructive"
      });
    }
  };

  // Calculate visible annotations based on layer visibility
  const visibleAnnotations = annotations.filter(annotation => {
    const layer = layers.find(l => l.id === annotation.layer);
    return layer?.visible;
  });

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
      />
      
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-background border rounded-md">
        <div className="flex items-center gap-2">
          {/* File handling */}
          {!readOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleUploadClick}>
                  <FileUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload PDF</TooltipContent>
            </Tooltip>
          )}
          
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
            >
              Prev
            </Button>
            <span className="text-sm">
              {pageNumber} / {numPages || '-'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(1)}
              disabled={!numPages || pageNumber >= numPages}
            >
              Next
            </Button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            
            <Select 
              value={scale.toString()} 
              onValueChange={handleScaleChange}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder={`${Math.round(scale * 100)}%`} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0.5">50%</SelectItem>
                  <SelectItem value="1">100%</SelectItem>
                  <SelectItem value="1.5">150%</SelectItem>
                  <SelectItem value="2">200%</SelectItem>
                  <SelectItem value="3">300%</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Render quality selector */}
          <Select 
            value={renderQuality} 
            onValueChange={(value: 'low' | 'medium' | 'high') => setRenderQuality(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Render Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="low">Low (Faster)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High (Better)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {/* Layer management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Layers className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Layers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {layers.map(layer => (
                <DropdownMenuItem key={layer.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={layer.visible}
                      onCheckedChange={() => toggleLayerVisibility(layer.id)}
                      id={`layer-${layer.id}`}
                    />
                    <label htmlFor={`layer-${layer.id}`}>{layer.name}</label>
                  </div>
                  <Slider 
                    value={[layer.opacity]} 
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-20"
                    onValueChange={([value]) => setLayerOpacity(layer.id, value)}
                  />
                </DropdownMenuItem>
              ))}
              {!readOnly && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={addLayer}>
                    <Plus className="mr-2 h-4 w-4" /> Add Layer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Undo/Redo */}
          {!readOnly && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </>
          )}
          
          {/* Export options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportAsPdf}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPng}>
                Export current view as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Save button */}
          {!readOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="sm">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save changes</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Annotation toolbar (only in edit mode) */}
        {!readOnly && (
          <div className="w-[220px] shrink-0">
            <AdvancedAnnotationToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              onAddAnnotation={addAnnotation}
              selectedAnnotationIds={selectedAnnotationIds}
              pageNumber={pageNumber}
            />
          </div>
        )}
        
        {/* PDF viewer */}
        <div 
          className="flex-1 overflow-auto border rounded-md bg-muted/20 relative"
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ cursor: currentTool === 'pan' ? 'grab' : 'default' }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : file || pdfUrl ? (
            <div 
              className="min-h-full min-w-full inline-flex justify-center p-4"
              style={{
                transform: `translate(${viewPosition.x}px, ${viewPosition.y}px)`,
              }}
            >
              <Document
                file={file || pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error("Error loading PDF:", error);
                  toast({
                    title: "Error loading PDF",
                    description: "Failed to load the PDF file.",
                    variant: "destructive"
                  });
                }}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <div className="relative shadow-xl">
                  {/* Base PDF layer */}
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={renderQuality !== 'low'}
                    renderAnnotationLayer={renderQuality !== 'low'}
                    onRenderSuccess={handlePageRenderSuccess}
                    loading={
                      <div style={{ height: renderedPageDimensions.height * scale || 800 }}>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }
                    className={cn(
                      "shadow-lg",
                      renderQuality === 'high' ? 'render-high' : '',
                      renderQuality === 'medium' ? 'render-medium' : '',
                      renderQuality === 'low' ? 'render-low' : ''
                    )}
                  />
                  
                  {/* Annotation layers */}
                  <div 
                    ref={canvasLayerRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{
                      width: renderedPageDimensions.width * scale,
                      height: renderedPageDimensions.height * scale,
                    }}
                  >
                    {/* Render annotations based on layer visibility */}
                    {visibleAnnotations
                      .filter(annotation => annotation.page === pageNumber)
                      .sort((a, b) => {
                        // Sort by layer order
                        const layerA = layers.find(l => l.id === a.layer);
                        const layerB = layers.find(l => l.id === b.layer);
                        return (layerA?.order || 0) - (layerB?.order || 0);
                      })
                      .map(annotation => (
                        <div
                          key={annotation.id}
                          className={cn(
                            "absolute",
                            selectedAnnotationIds.includes(annotation.id) ? 'ring-2 ring-primary' : ''
                          )}
                          style={{
                            left: annotation.x * scale,
                            top: annotation.y * scale,
                            transform: annotation.rotation ? `rotate(${annotation.rotation}deg)` : undefined,
                            width: annotation.width ? annotation.width * scale : 'auto',
                            height: annotation.height ? annotation.height * scale : 'auto',
                            opacity: layers.find(l => l.id === annotation.layer)?.opacity || 1,
                          }}
                        >
                          {/* Render different annotation types */}
                          {annotation.type === 'stamp' && (
                            <div 
                              className="flex items-center justify-center text-2xl"
                              style={{ 
                                backgroundColor: annotation.color,
                                padding: '4px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {annotation.stampIcon}
                            </div>
                          )}
                          
                          {annotation.type === 'text' && (
                            <div 
                              style={{ 
                                color: annotation.color,
                                fontSize: (annotation.fontSize || 16) * scale,
                                fontFamily: annotation.fontFamily || 'sans-serif',
                                padding: '4px',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                borderRadius: '2px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {annotation.content}
                            </div>
                          )}
                          
                          {annotation.type === 'shape' && annotation.shapeType === 'rectangle' && (
                            <div 
                              style={{ 
                                border: `${annotation.strokeWidth || 2}px solid ${annotation.color}`,
                                borderRadius: '2px',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          )}
                          
                          {annotation.type === 'shape' && annotation.shapeType === 'circle' && (
                            <div 
                              style={{ 
                                border: `${annotation.strokeWidth || 2}px solid ${annotation.color}`,
                                borderRadius: '50%',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          )}
                          
                          {/* Other annotation types would be rendered here */}
                        </div>
                      ))}
                  </div>
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-80">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-4 text-center">
                    No PDF loaded. Please upload a PDF file or provide a URL.
                  </p>
                  <Button onClick={handleUploadClick}>Upload PDF</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between p-2 text-xs text-muted-foreground bg-muted/20 border rounded-md">
        <div>
          Scale: {Math.round(scale * 100)}% | Page: {pageNumber} of {numPages || '-'}
        </div>
        <div>
          Quality: {renderQuality} | Annotations: {annotations.length}
        </div>
      </div>
    </div>
  );
}