/**
 * Testing module for marker drag scaling calculations
 * This file contains test cases for validating coordinate transformations at different zoom levels
 */

interface DragTestCase {
  name: string;
  scale: number;
  translateX: number;
  translateY: number;
  markerStartX: number;
  markerStartY: number;
  mouseStartX: number;
  mouseStartY: number;
  mouseMoveX: number;
  mouseMoveY: number;
  expectedMarkerX: number;
  expectedMarkerY: number;
}

/**
 * Test case runner for marker drag calculations
 * @param test The test case to run
 * @param transformCb The transformation callback function being tested
 */
export function runDragTest(
  test: DragTestCase,
  transformCb: (params: {
    scale: number;
    translateX: number;
    translateY: number;
    markerStartX: number;
    markerStartY: number;
    mouseStartX: number;
    mouseStartY: number;
    mouseMoveX: number;
    mouseMoveY: number;
  }) => { newMarkerX: number; newMarkerY: number }
) {
  console.log(`Running test: ${test.name}`);
  const result = transformCb({
    scale: test.scale,
    translateX: test.translateX,
    translateY: test.translateY,
    markerStartX: test.markerStartX,
    markerStartY: test.markerStartY,
    mouseStartX: test.mouseStartX,
    mouseStartY: test.mouseStartY,
    mouseMoveX: test.mouseMoveX,
    mouseMoveY: test.mouseMoveY,
  });

  const xDiff = Math.abs(result.newMarkerX - test.expectedMarkerX);
  const yDiff = Math.abs(result.newMarkerY - test.expectedMarkerY);
  const xPassed = xDiff < 0.1; // Allow tiny floating point differences
  const yPassed = yDiff < 0.1;
  const passed = xPassed && yPassed;

  console.log(
    `${passed ? '✅ PASSED' : '❌ FAILED'}: ${test.name}\n` +
    ` - Expected: (${test.expectedMarkerX}, ${test.expectedMarkerY})\n` +
    ` - Actual:   (${result.newMarkerX.toFixed(2)}, ${result.newMarkerY.toFixed(2)})\n` +
    ` - Diff:     (${xDiff.toFixed(2)}, ${yDiff.toFixed(2)})`
  );

  return passed;
}

/**
 * Test cases for drag operations at different zoom levels
 */
export const dragTestCases: DragTestCase[] = [
  {
    name: "100% zoom - no translation - drag right 100px",
    scale: 1,
    translateX: 0,
    translateY: 0,
    markerStartX: 100,
    markerStartY: 100,
    mouseStartX: 100,
    mouseStartY: 100,
    mouseMoveX: 200,
    mouseMoveY: 100,
    expectedMarkerX: 200,
    expectedMarkerY: 100,
  },
  {
    name: "200% zoom - no translation - drag right 100px (should move 50 PDF units)",
    scale: 2,
    translateX: 0,
    translateY: 0,
    markerStartX: 100,
    markerStartY: 100,
    mouseStartX: 200, // At 2x zoom, marker at 100,100 appears at 200,200
    mouseStartY: 200,
    mouseMoveX: 300, // Move 100px right on screen
    mouseMoveY: 200,
    expectedMarkerX: 150, // Should only move 50 PDF units at 2x zoom
    expectedMarkerY: 100,
  },
  {
    name: "50% zoom - no translation - drag right 100px (should move 200 PDF units)",
    scale: 0.5,
    translateX: 0,
    translateY: 0,
    markerStartX: 100,
    markerStartY: 100,
    mouseStartX: 50, // At 0.5x zoom, marker at 100,100 appears at 50,50
    mouseStartY: 50,
    mouseMoveX: 150, // Move 100px right on screen
    mouseMoveY: 50,
    expectedMarkerX: 300, // Should move 200 PDF units at 0.5x zoom
    expectedMarkerY: 100,
  },
  {
    name: "100% zoom - with translation - drag right 100px",
    scale: 1,
    translateX: 50,
    translateY: 50,
    markerStartX: 100,
    markerStartY: 100,
    mouseStartX: 150, // Marker at 100,100 with 50,50 translation appears at 150,150
    mouseStartY: 150,
    mouseMoveX: 250, // Move 100px right on screen
    mouseMoveY: 150,
    expectedMarkerX: 200, // Should move 100 PDF units
    expectedMarkerY: 100,
  },
  {
    name: "200% zoom - with translation - diagonal drag",
    scale: 2,
    translateX: 30,
    translateY: 40,
    markerStartX: 100,
    markerStartY: 100,
    mouseStartX: 230, // At 2x zoom (100*2) + translateX(30) = 230
    mouseStartY: 240, // At 2x zoom (100*2) + translateY(40) = 240
    mouseMoveX: 330, // Move 100px right and 80px down on screen
    mouseMoveY: 320,
    expectedMarkerX: 150, // Should move 50 PDF units at 2x zoom
    expectedMarkerY: 140, // Should move 40 PDF units at 2x zoom
  }
];

/**
 * Current transform method (may have scaling issues)
 */
export function currentTransformMethod({
  scale,
  translateX,
  translateY,
  markerStartX,
  markerStartY,
  mouseStartX,
  mouseStartY,
  mouseMoveX,
  mouseMoveY,
}: {
  scale: number;
  translateX: number;
  translateY: number;
  markerStartX: number;
  markerStartY: number;
  mouseStartX: number;
  mouseStartY: number;
  mouseMoveX: number;
  mouseMoveY: number;
}): { newMarkerX: number; newMarkerY: number } {
  // Current implementation that doesn't account for scale properly
  const screenDeltaX = mouseMoveX - mouseStartX;
  const screenDeltaY = mouseMoveY - mouseStartY;
  
  // Simply apply movement 1:1 regardless of scale
  const newMarkerX = markerStartX + screenDeltaX;
  const newMarkerY = markerStartY + screenDeltaY;
  
  return { newMarkerX, newMarkerY };
}

/**
 * Improved transform method with scale-aware movement
 */
export function improvedTransformMethod({
  scale,
  translateX,
  translateY,
  markerStartX,
  markerStartY,
  mouseStartX,
  mouseStartY,
  mouseMoveX,
  mouseMoveY,
}: {
  scale: number;
  translateX: number;
  translateY: number;
  markerStartX: number;
  markerStartY: number;
  mouseStartX: number;
  mouseStartY: number;
  mouseMoveX: number;
  mouseMoveY: number;
}): { newMarkerX: number; newMarkerY: number } {
  // Calculate screen delta (how far the mouse moved in screen space)
  const screenDeltaX = mouseMoveX - mouseStartX;
  const screenDeltaY = mouseMoveY - mouseStartY;
  
  // Convert screen delta to PDF space (accounting for zoom scale)
  // If we're at 2x zoom, the marker should move half as far in PDF units
  const pdfDeltaX = screenDeltaX / scale;
  const pdfDeltaY = screenDeltaY / scale;
  
  // Apply the scaled deltas to get the new marker position
  const newMarkerX = markerStartX + pdfDeltaX;
  const newMarkerY = markerStartY + pdfDeltaY;
  
  return { newMarkerX, newMarkerY };
}

export function runAllTests() {
  console.log("=== RUNNING MARKER DRAG SCALING TESTS ===");
  console.log("\n== TESTING CURRENT METHOD ==");
  
  let currentMethodPassed = 0;
  dragTestCases.forEach(test => {
    if (runDragTest(test, currentTransformMethod)) {
      currentMethodPassed++;
    }
  });
  
  console.log(`\nCurrent Method Results: ${currentMethodPassed}/${dragTestCases.length} tests passed`);
  
  console.log("\n== TESTING IMPROVED METHOD ==");
  
  let improvedMethodPassed = 0;
  dragTestCases.forEach(test => {
    if (runDragTest(test, improvedTransformMethod)) {
      improvedMethodPassed++;
    }
  });
  
  console.log(`\nImproved Method Results: ${improvedMethodPassed}/${dragTestCases.length} tests passed`);
  
  if (improvedMethodPassed > currentMethodPassed) {
    console.log("\n✅ IMPROVEMENT CONFIRMED: The improved method performs better!");
  } else if (improvedMethodPassed === currentMethodPassed) {
    console.log("\n⚠️ NO DIFFERENCE: Both methods perform equally.");
  } else {
    console.log("\n❌ REGRESSION: The current method performs better!");
  }
  
  console.log("\n=== MARKER DRAG SCALING TESTS COMPLETE ===");
}