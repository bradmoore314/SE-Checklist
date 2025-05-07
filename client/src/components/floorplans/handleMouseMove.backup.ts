// Backup of the original handleMouseMove function from EnhancedFloorplanViewer.tsx

const handleMouseMove = (e: React.MouseEvent) => {
  if (!containerRef.current) return;
  
  if (isDragging && toolMode === 'pan') {
    // Panning the view
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setTranslateX(prev => prev + deltaX);
    setTranslateY(prev => prev + deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Set cursor for panning
    containerRef.current.style.cursor = 'grabbing';
  } else if (isDraggingMarker && selectedMarker) {
    // Moving a selected marker using our coordinate system
    
    // Convert screen coordinates to PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Apply the offset calculated during drag start
    // The offset already accounts for the scale factor when it was calculated
    const newX = mousePdf.x - markerDragOffset.x;
    const newY = mousePdf.y - markerDragOffset.y;
    
    // Limited logging to avoid console spam
    if (Math.random() < 0.05) { // Only log ~5% of moves
      console.log(`=== DRAG MOVE ===`);
      console.log(`Mouse PDF coords: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
      console.log(`Offset: (${markerDragOffset.x.toFixed(2)}, ${markerDragOffset.y.toFixed(2)})`);
      console.log(`New position: (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
      console.log(`Current transform: scale=${scale.toFixed(2)}, translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
    }
    
    // Update local state for smooth visual feedback
    setSelectedMarker(prev => {
      if (!prev) return null;
      return {
        ...prev,
        position_x: newX,
        position_y: newY
      };
    });
    
    // Set cursor for dragging marker
    containerRef.current.style.cursor = 'grabbing';
  } else if (isResizingMarker && selectedMarker) {
    // Resizing a selected marker using our coordinate system
    
    // Get PDF coordinates directly using our coordinate system
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    // Log occasionally for debugging
    if (Math.random() < 0.1) { // Log ~10% of resize operations
      console.log(`=== RESIZE EVENT ===`);
      console.log(`Mouse screen: (${e.clientX}, ${e.clientY})`);
      console.log(`Mouse PDF: (${mousePdf.x.toFixed(2)}, ${mousePdf.y.toFixed(2)})`);
      console.log(`Current transform: scale=${scale.toFixed(2)}, translate=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
    }
    
    // Store PDF coordinates for clarity in the remaining code
    const pdfX = mousePdf.x;
    const pdfY = mousePdf.y;
    
    // Calculate new dimensions based on marker type
    setSelectedMarker(prev => {
      if (!prev) return null;
      
      const newProperties: Partial<MarkerData> = {};
      
      // For markers with width/height properties
      if (['rectangle', 'ellipse', 'image'].includes(prev.marker_type)) {
        newProperties.width = Math.abs(pdfX - prev.position_x);
        newProperties.height = Math.abs(pdfY - prev.position_y);
      }
      
      // For line markers
      if (prev.marker_type === 'line') {
        newProperties.end_x = pdfX;
        newProperties.end_y = pdfY;
      }
      
      return {
        ...prev,
        ...newProperties
      };
    });
  } else if (isAddingMarker && tempMarker) {
    // Sizing a shape marker using our coordinate system
    
    // Get mouse position in PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    setTempMarker(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        end_x: mousePdf.x,
        end_y: mousePdf.y,
        width: Math.abs(mousePdf.x - (prev.position_x || 0)),
        height: Math.abs(mousePdf.y - (prev.position_y || 0))
      };
    });
  } else if (isDrawing && (toolMode === 'polyline' || toolMode === 'polygon')) {
    // Get mouse position using our coordinate system
    if (!containerRef.current) return;
    
    // Convert screen coordinates to PDF coordinates
    const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
    
    const lastPoint = drawingPoints[drawingPoints.length - 1];
    
    // Only update if mouse moved significantly (avoid excessive updates)
    const distance = Math.sqrt(
      Math.pow(mousePdf.x - lastPoint.x, 2) + 
      Math.pow(mousePdf.y - lastPoint.y, 2)
    );
    
    if (distance > 5 / scale) { // 5px in screen space
      setDrawingPoints([...drawingPoints.slice(0, -1), { x: mousePdf.x, y: mousePdf.y }]);
    }
  }
};