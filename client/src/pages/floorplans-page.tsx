import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * This page is now a redirect to the Enhanced Floorplans page
 * We're keeping this component for backward compatibility
 */
const FloorplansPage = () => {
  const [, params] = useRoute('/projects/:projectId/floorplans');
  const [, setLocation] = useLocation();
  
  // Redirect to the enhanced floorplans page
  useEffect(() => {
    if (params && params.projectId) {
      setLocation(`/projects/${params.projectId}/enhanced-floorplans`);
    }
  }, [params, setLocation]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Redirecting to Enhanced Floorplans...</span>
    </div>
  );
};

export default FloorplansPage;