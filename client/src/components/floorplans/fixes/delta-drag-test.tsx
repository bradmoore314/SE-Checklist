import React, { useEffect } from 'react';
import { runAllTests } from './marker-drag-scaling-test';

/**
 * Component to run drag scaling tests
 * Used for debugging and validating marker drag behavior
 */
export const DeltaDragTest: React.FC = () => {
  useEffect(() => {
    console.log("Running marker drag scaling tests...");
    runAllTests();
  }, []);

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Marker Drag Scaling Tests</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Check the console for test results
      </p>
      <div className="bg-black/90 text-white p-4 rounded font-mono text-xs overflow-auto max-h-96">
        <pre className="whitespace-pre-wrap">Running tests...</pre>
        <pre className="whitespace-pre-wrap">See browser console for complete results</pre>
      </div>
    </div>
  );
};

export default DeltaDragTest;