import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is configured - must match package version 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface FloorplanThumbnailProps {
  floorplanData: string;
  alt: string;
  page?: number;
}

/**
 * FloorplanThumbnail component renders a thumbnail preview of a floorplan
 * It supports both PDF and image formats
 */
const FloorplanThumbnail = ({ floorplanData, alt, page = 1 }: FloorplanThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPdf, setIsPdf] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Clean up any previous image URL
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }

    const renderThumbnail = async () => {
      try {
        // Determine if the data is PDF or image based on base64 header
        const isPdfFormat = floorplanData.startsWith('JVBERi0') || // PDF header in base64
                           (floorplanData.includes('data:application/pdf') && 
                            !floorplanData.includes('data:image'));
        
        setIsPdf(isPdfFormat);

        if (isPdfFormat) {
          // Handle PDF rendering
          if (!canvasRef.current) return;

          // Create binary data from base64
          const binary = atob(floorplanData.includes('base64,') 
            ? floorplanData.split('base64,')[1] 
            : floorplanData);
          
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          // Load the PDF
          const loadingTask = pdfjsLib.getDocument({ data: bytes });
          const pdf = await loadingTask.promise;
          
          // Get the first page (as thumbnail)
          const pdfPage = await pdf.getPage(Math.min(page, pdf.numPages));
          
          // Prepare canvas for rendering
          const viewport = pdfPage.getViewport({ scale: 0.5 }); // Reduced scale for thumbnail
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Render PDF page to canvas
          await pdfPage.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        } else {
          // Handle image formats
          const base64Data = floorplanData.includes('base64,') 
            ? floorplanData 
            : `data:image/png;base64,${floorplanData}`;
          
          setImageUrl(base64Data);
        }
      } catch (error) {
        console.error('Error rendering floorplan thumbnail:', error);
        setError(true);
      }
    };

    renderThumbnail();

    // Cleanup function
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [floorplanData, page]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
        <span className="material-icons text-4xl">broken_image</span>
      </div>
    );
  }

  return isPdf ? (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-contain" 
      aria-label={alt}
    />
  ) : (
    imageUrl ? (
      <img 
        src={imageUrl} 
        alt={alt} 
        className="w-full h-full object-contain"
      />
    ) : (
      <div className="flex items-center justify-center w-full h-full">
        <span className="material-icons text-gray-400 animate-pulse">image</span>
      </div>
    )
  );
};

export default FloorplanThumbnail;