import React, { useState, useRef, useEffect } from 'react';

/**
 * CoordinateTransformVisualizer
 * 
 * A visual demonstration component to help understand coordinate transforms
 * between screen coordinates and PDF coordinates during drag operations.
 * 
 * This is for educational purposes only and not part of the actual application.
 */
const CoordinateTransformVisualizer: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [markerPos, setMarkerPos] = useState({ x: 100, y: 100 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Screen to PDF coordinate conversion
  const screenToPdf = (screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;
    
    // Convert container coordinates to PDF coordinates
    const pdfX = (containerX - translateX) / scale;
    const pdfY = (containerY - translateY) / scale;
    
    return { x: pdfX, y: pdfY };
  };
  
  // PDF to screen coordinate conversion
  const pdfToScreen = (pdfX: number, pdfY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Convert PDF coordinates to container coordinates
    const containerX = pdfX * scale + translateX;
    const containerY = pdfY * scale + translateY;
    
    // Convert container coordinates to screen coordinates
    const screenX = containerX + rect.left;
    const screenY = containerY + rect.top;
    
    return { x: screenX, y: screenY };
  };

  // Handle mouse down on marker
  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Convert mouse position to PDF coordinates
    const mousePdf = screenToPdf(e.clientX, e.clientY);
    
    // Calculate offset between mouse and marker in PDF coordinates
    const offsetX = mousePdf.x - markerPos.x;
    const offsetY = mousePdf.y - markerPos.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };
  
  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    // Always update mouse position for visualization
    setMousePos({ x: e.clientX, y: e.clientY });
    
    if (isDragging) {
      // Convert mouse position to PDF coordinates
      const mousePdf = screenToPdf(e.clientX, e.clientY);
      
      // Calculate new marker position by applying the offset
      const newMarkerX = mousePdf.x - dragOffset.x;
      const newMarkerY = mousePdf.y - dragOffset.y;
      
      // Update marker position
      setMarkerPos({ x: newMarkerX, y: newMarkerY });
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate mouse position in PDF coordinates before zoom
    const mousePdfBefore = screenToPdf(e.clientX, e.clientY);
    
    // Update scale based on wheel direction
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(5, scale * delta));
    
    // Calculate new translate values to keep mouse position fixed in PDF
    const newTranslateX = mouseX - mousePdfBefore.x * newScale;
    const newTranslateY = mouseY - mousePdfBefore.y * newScale;
    
    // Update state
    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  };
  
  // Set up event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, scale, translateX, translateY]);
  
  // Convert current marker position to screen coordinates for display
  const markerScreen = pdfToScreen(markerPos.x, markerPos.y);
  
  // For visualization - calculate cursor position in PDF space
  const cursorPdf = screenToPdf(mousePos.x, mousePos.y);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Coordinate Transform Visualizer</h1>
      
      <div className="flex items-center space-x-4">
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => setScale(prev => Math.min(5, prev + 0.1))}
        >
          Zoom In
        </button>
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => setScale(prev => Math.max(0.2, prev - 0.1))}
        >
          Zoom Out
        </button>
        <button 
          className="px-3 py-1 bg-gray-500 text-white rounded"
          onClick={() => { setScale(1); setTranslateX(0); setTranslateY(0); }}
        >
          Reset
        </button>
        <span className="text-sm">Current Scale: {scale.toFixed(2)}x</span>
      </div>
      
      <div 
        ref={containerRef}
        className="relative border-2 border-gray-300 w-full h-[400px] overflow-hidden"
        onWheel={handleWheel}
      >
        <div 
          className="absolute inset-0 bg-gray-100"
          style={{ 
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid for reference */}
          <div className="absolute inset-0 grid" style={{ 
            backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            width: '1000px',
            height: '1000px'
          }}/>
          
          {/* Add some reference objects */}
          <div className="absolute bg-blue-200 border border-blue-500 w-40 h-20" 
            style={{ left: '200px', top: '150px' }}>
            PDF Object
          </div>
        </div>
        
        {/* Draggable marker */}
        <div 
          className="absolute bg-red-500 rounded-full w-10 h-10 flex items-center justify-center text-white cursor-move"
          style={{ 
            left: `${markerScreen.x - 20}px`, 
            top: `${markerScreen.y - 20}px`,
            transform: `scale(${1/scale})`,
            transformOrigin: 'center center'
          }}
          onMouseDown={handleMarkerMouseDown}
        >
          M
        </div>
      </div>
      
      {/* Coordinate information display */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-2 bg-gray-100 rounded">
          <h3 className="font-bold">PDF Coordinates</h3>
          <p>Marker: ({markerPos.x.toFixed(1)}, {markerPos.y.toFixed(1)})</p>
          <p>Cursor: ({cursorPdf.x.toFixed(1)}, {cursorPdf.y.toFixed(1)})</p>
          <p>Drag Offset: ({dragOffset.x.toFixed(1)}, {dragOffset.y.toFixed(1)})</p>
        </div>
        
        <div className="p-2 bg-gray-100 rounded">
          <h3 className="font-bold">Screen Coordinates</h3>
          <p>Marker: ({markerScreen.x.toFixed(1)}, {markerScreen.y.toFixed(1)})</p>
          <p>Cursor: ({mousePos.x.toFixed(1)}, {mousePos.y.toFixed(1)})</p>
          <p>Transform: translate({translateX.toFixed(1)}px, {translateY.toFixed(1)}px) scale({scale.toFixed(2)})</p>
        </div>
      </div>
      
      <div className="bg-yellow-100 p-3 rounded-md border border-yellow-300">
        <h3 className="font-bold">Drag Fix Explanation</h3>
        <p className="text-sm">
          When dragging at high zoom levels, we need to ensure the drag offset is calculated properly
          in PDF coordinates. The offset stays consistent in PDF space regardless of zoom level.
        </p>
      </div>
    </div>
  );
};

export default CoordinateTransformVisualizer;