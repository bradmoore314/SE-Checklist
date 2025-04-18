import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import ModernFloorplanViewer from "@/components/floorplans/ModernFloorplanViewer";
import PageHeader from "@/components/ui/page-header";

const ModernFloorplansPage: React.FC = () => {
  // Get project ID from route
  const [, params] = useRoute<{ projectId: string }>("/projects/:projectId/modern-floorplans");
  const projectId = params?.projectId ? parseInt(params.projectId, 10) : 0;
  
  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}`);
      return await res.json();
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
        <h1 className="text-2xl font-bold text-muted-foreground">Project Not Found</h1>
        <p className="text-muted-foreground">The project you are looking for does not exist or you do not have access to it.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Modern Floor Plan Management"
        description={`Advanced floor plan viewer for ${project.name}`}
      />
      
      <ModernFloorplanViewer 
        projectId={projectId} 
        onMarkersUpdated={() => {
          // This is called when markers are updated
          // Could refresh other data if needed
        }}
      />
    </div>
  );
};

export default ModernFloorplansPage;