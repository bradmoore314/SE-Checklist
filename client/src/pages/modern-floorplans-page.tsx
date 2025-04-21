import React, { useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import ModernFloorplanViewer from '@/components/floorplans/ModernFloorplanViewer';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ModernFloorplansPage = () => {
  const [, params] = useRoute('/projects/:projectId/modern-floorplans');
  const { currentProject, setCurrentProject, allProjects } = useProject();
  const { toast } = useToast();
  
  // Try to get project ID from route params first
  const projectIdFromParams = params ? parseInt(params.projectId) : null;
  
  // Use current project ID if we have one and no route params
  const projectId = projectIdFromParams || (currentProject ? currentProject.id : null);

  // When projectId is available and different from currentProject, update the current project
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      const project = allProjects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projectId, currentProject, allProjects, setCurrentProject]);

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}`);
      return await res.json();
    },
    enabled: !!projectId,
  });

  const refreshEquipment = () => {
    // When markers are updated, we might need to refresh other data
    toast({
      title: "Markers Updated",
      description: "Equipment markers have been updated on the floorplan.",
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Site Walk Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The site walk you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Floorplans
          </span> - {project.name}
        </h1>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      <div className="mb-8">
        <p className="text-muted-foreground mb-4">
          Upload PDF floorplans and mark the locations of equipment on them. You can add different types of markers for access points, cameras, elevators, and intercoms.
        </p>
        
        <div className="rounded-lg border bg-card">
          <ModernFloorplanViewer 
            projectId={projectId as number} 
            onMarkersUpdated={refreshEquipment}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernFloorplansPage;