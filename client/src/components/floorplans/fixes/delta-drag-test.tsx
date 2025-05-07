import React, { useEffect, useState } from 'react';
import { runAllTests, dragTestCases, currentTransformMethod, improvedTransformMethod } from './marker-drag-scaling-test';

/**
 * Component to run drag scaling tests
 * Used for debugging and validating marker drag behavior
 */
export const DeltaDragTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    current: number;
    improved: number;
    totalTests: number;
  }>({
    current: 0,
    improved: 0,
    totalTests: dragTestCases.length
  });

  useEffect(() => {
    console.log("Running marker drag scaling tests...");
    
    // Count passing tests for each method
    let currentPassed = 0;
    let improvedPassed = 0;
    
    dragTestCases.forEach(test => {
      // Run both methods on each test case
      const currentResult = currentTransformMethod({
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
      
      const improvedResult = improvedTransformMethod({
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
      
      // Check if results match expected values (with small tolerance for floating point)
      const currentXDiff = Math.abs(currentResult.newMarkerX - test.expectedMarkerX);
      const currentYDiff = Math.abs(currentResult.newMarkerY - test.expectedMarkerY);
      const currentPasses = currentXDiff < 0.1 && currentYDiff < 0.1;
      
      const improvedXDiff = Math.abs(improvedResult.newMarkerX - test.expectedMarkerX);
      const improvedYDiff = Math.abs(improvedResult.newMarkerY - test.expectedMarkerY);
      const improvedPasses = improvedXDiff < 0.1 && improvedYDiff < 0.1;
      
      if (currentPasses) currentPassed++;
      if (improvedPasses) improvedPassed++;
    });
    
    // Update state with results
    setTestResults({
      current: currentPassed,
      improved: improvedPassed,
      totalTests: dragTestCases.length
    });
    
    // Also run the full test suite with detailed logging
    runAllTests();
  }, []);

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg shadow-lg">
      <h3 className="text-lg font-medium mb-2">Marker Drag Scaling Tests</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Testing marker movement at various zoom levels
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-md ${testResults.current === testResults.totalTests ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <div className="text-sm font-semibold">Current Method</div>
          <div className="text-xl font-bold">{testResults.current}/{testResults.totalTests}</div>
          <div className="text-xs">{testResults.current === testResults.totalTests ? 'All tests passing' : 'Some tests failing'}</div>
        </div>
        
        <div className={`p-3 rounded-md ${testResults.improved === testResults.totalTests ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <div className="text-sm font-semibold">Improved Method</div>
          <div className="text-xl font-bold">{testResults.improved}/{testResults.totalTests}</div>
          <div className="text-xs">{testResults.improved === testResults.totalTests ? 'All tests passing' : 'Some tests failing'}</div>
        </div>
      </div>
      
      <div className="bg-black/90 text-white p-3 rounded font-mono text-xs overflow-auto max-h-40">
        <pre className="whitespace-pre-wrap">Testing marker dragging at scales: 0.5x, 1x, 2x</pre>
        <pre className="whitespace-pre-wrap">Current implementation: {testResults.current === testResults.totalTests ? '✅ Working correctly' : '❌ Has scaling issues'}</pre>
        <pre className="whitespace-pre-wrap">Improved implementation: {testResults.improved === testResults.totalTests ? '✅ Working correctly' : '❌ Needs more work'}</pre>
        <pre className="whitespace-pre-wrap">See browser console for complete results</pre>
      </div>
    </div>
  );
};

export default DeltaDragTest;