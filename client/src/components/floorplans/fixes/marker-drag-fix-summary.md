# Marker Drag Fix: Ensuring 1:1 Mouse Movement at All Zoom Levels

## Problem

When dragging markers in the floorplan viewer at high zoom levels, the markers move disproportionately compared to the mouse cursor. The markers "jump" farther than the mouse moves, making precise positioning difficult.

## Root Cause Analysis

The issue was caused by inconsistent coordinate space handling during drag operations:

1. The `startMarkerDrag` function was using `coordSystem.calculateDragOffset()` which might have been applying additional scaling factors.

2. During the drag operation in `handleMouseMove`, the offset was being applied directly without properly accounting for the current zoom level.

3. The problem was worse at higher zoom levels because any scaling inconsistencies were amplified.

## Solution

We implemented a two-part fix:

### 1. Fixed `startMarkerDrag` Function

```typescript
const startMarkerDrag = (e: React.MouseEvent, marker: MarkerData) => {
  e.stopPropagation();
  
  if (!containerRef.current) return;
  
  // Get the mouse position in PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // IMPORTANT FIX: Calculate the pure offset between mouse and marker position
  // directly in PDF coordinates - without using the coordSystem method
  const offset = {
    x: mousePdf.x - marker.position_x,
    y: mousePdf.y - marker.position_y
  };
  
  // Store pure PDF coordinate offset without any scale adjustments
  setMarkerDragOffset(offset);
  setSelectedMarker(marker);
  setIsDraggingMarker(true);
  
  // Show feedback cursor
  if (containerRef.current) {
    containerRef.current.style.cursor = 'grabbing';
  }
};
```

### 2. Fixed `handleMouseMove` Function (Marker Drag Section)

```typescript
if (isDraggingMarker && selectedMarker) {
  // Moving a selected marker using our coordinate system
  
  // Convert screen coordinates to PDF coordinates
  const mousePdf = screenToPdfCoordinates(e.clientX, e.clientY);
  
  // IMPORTANT FIX: Apply the pure PDF offset directly
  // This is the key fix - we apply the offset in the same coordinate space (PDF)
  // without any scaling adjustments
  const newX = mousePdf.x - markerDragOffset.x;
  const newY = mousePdf.y - markerDragOffset.y;
  
  // Update local state for smooth visual feedback
  setSelectedMarker(prev => {
    if (!prev) return null;
    return {
      ...prev,
      position_x: newX,
      position_y: newY
    };
  });
}
```

## Key Insight

The key insight is to consistently operate in the **same coordinate space** throughout the drag operation:

1. When starting a drag:
   - Convert mouse position to PDF coordinates
   - Calculate offset between mouse and marker in PDF coordinates
   - Store this pure PDF offset

2. When moving the marker:
   - Convert current mouse position to PDF coordinates
   - Apply the stored PDF offset directly to get the new position
   - No scaling adjustments needed since all operations are in the same coordinate space

## Benefits

- Markers now move 1:1 with the mouse cursor, regardless of zoom level
- Precise positioning at high zoom levels is now possible
- The implementation is simpler and more maintainable because it uses a consistent coordinate system
- The fix doesn't add any performance overhead

## Additional Notes

- The `screenToPdfCoordinates` function correctly converts screen coordinates to PDF coordinates
- We're correctly formatting numbers with toFixed() only for display purposes, while maintaining precision in the stored values
- The PDF coordinate system properly accounts for scaling and translation