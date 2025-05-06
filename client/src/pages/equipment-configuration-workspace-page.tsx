import React from 'react';
import { ConfigurationWorkspace } from '@/components/equipment/ConfigurationWorkspace';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';

export default function EquipmentConfigurationWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId ? parseInt(params.projectId) : undefined;
  
  // Fetch project data if project ID is available
  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    queryKey: projectId ? ['/api/projects', projectId] : null,
    enabled: !!projectId,
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b bg-background shadow-sm">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">
              {isLoadingProject ? 'Loading...' : projectId && projectData 
                ? `Equipment Configuration: ${projectData.name}` 
                : 'Equipment Configuration Workspace'}
            </h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="container max-w-7xl mx-auto h-full">
          <ConfigurationWorkspace />
        </div>
      </main>
    </div>
  );
}