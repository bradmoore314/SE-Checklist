import { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

// Ensure PDF.js worker is configured - must match package version 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface FloorplanData {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
}

interface SimpleEnhancedViewerProps {
  floorplan: FloorplanData;
  currentPage: number;
  onPageChange?: (page: number) => void;
}

export const SimpleEnhancedViewer = ({ 
  floorplan, 
  currentPage,
  onPageChange
}: SimpleEnhancedViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.0);
  const [initialRender, setInitialRender] = useState(true);
  
  // Initialize PDF.js when component mounts
  useEffect(() => {
    const loadPdf = async () => {
      if (!floorplan?.pdf_data) return;
      
      try {
        setIsLoading(true);
        
        // Load the PDF data
        const pdfData = atob(floorplan.pdf_data);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        
        // If the current page is invalid, set it to 1
        if (currentPage <= 0 || currentPage > pdf.numPages) {
          if (onPageChange) {
            onPageChange(1);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };
    
    loadPdf();
  }, [floorplan, currentPage, onPageChange]);
  
  // Render PDF page when it changes
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || currentPage <= 0 || currentPage > pdfDoc.numPages) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get page
        const page = await pdfDoc.getPage(currentPage);
        
        // Set canvas dimensions based on viewport
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render the page
        await page.render({
          canvasContext: context!,
          viewport
        }).promise;
        
        setIsLoading(false);
        
        // If this is the initial render, fit the PDF to the container
        if (initialRender && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const newScale = (containerWidth - 40) / viewport.width; // 40px for padding
          
          if (newScale !== scale) {
            setScale(newScale);
            setInitialRender(false);
          } else {
            setInitialRender(false);
          }
        }
      } catch (error) {
        console.error('Error rendering PDF page:', error);
        setIsLoading(false);
      }
    };
    
    renderPage();
  }, [pdfDoc, currentPage, scale, initialRender]);
  
  // Zoom in/out handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-gray-100 flex flex-col">
      <div className="p-2 bg-white border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={handleZoomIn}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Zoom +
          </button>
          <button 
            onClick={handleZoomOut}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Zoom -
          </button>
          <span className="px-2 py-1 text-sm">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="text-sm">
          Page {currentPage} of {pdfDoc?.numPages || 0}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="shadow-md"
          />
        </div>
      </div>
    </div>
  );
};