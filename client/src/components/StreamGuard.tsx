import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface StreamGuardProps {
  projectId: number;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

/**
 * Guard component that checks if streams exist for a project
 * If no streams exist, it renders the fallback component (create form)
 * Otherwise, it renders the children
 */
export function StreamGuard({ projectId, children, fallback }: StreamGuardProps) {
  const [hasStreams, setHasStreams] = useState<boolean | null>(null);
  
  // Query to check if streams exist
  const { data: streams, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/streams`],
    enabled: !!projectId,
  });
  
  useEffect(() => {
    if (!isLoading && streams) {
      setHasStreams(Array.isArray(streams) && streams.length > 0);
    }
  }, [streams, isLoading]);
  
  if (isLoading || hasStreams === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If no streams, show the fallback component (create form)
  if (!hasStreams) {
    return <>{fallback}</>;
  }
  
  // Otherwise show the regular component
  return <>{children}</>;
}