import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProjectCollaborator, PERMISSION } from "@shared/schema";

export interface AddCollaboratorData {
  user_id?: number;
  email?: string;
  permission: string;
}

export interface UpdateCollaboratorData {
  permission?: string;
}

export function useProjectCollaborators(projectId: number) {
  const { toast } = useToast();

  // Get all collaborators for a project
  const { 
    data: collaborators = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/projects', projectId, 'collaborators'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/projects/${projectId}/collaborators`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch collaborators');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching collaborators:', error);
        toast({
          title: 'Error',
          description: `Failed to load collaborators: ${(error as Error).message}`,
          variant: 'destructive'
        });
        throw error;
      }
    },
    enabled: !!projectId,
  });

  // Add a collaborator to the project
  const addCollaboratorMutation = useMutation({
    mutationFn: async (data: AddCollaboratorData) => {
      const res = await apiRequest('POST', `/api/projects/${projectId}/collaborators`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add collaborator');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the collaborators query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add collaborator: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update a collaborator's permission
  const updateCollaboratorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UpdateCollaboratorData }) => {
      const res = await apiRequest('PUT', `/api/projects/collaborators/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update collaborator');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
      toast({
        title: 'Success',
        description: 'Collaborator updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update collaborator: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Remove a collaborator from the project
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/projects/collaborators/${id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove collaborator');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
      toast({
        title: 'Success',
        description: 'Collaborator removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove collaborator: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Check the current user's permission for the project
  const { 
    data: projectPermission,
    isLoading: isPermissionLoading 
  } = useQuery({
    queryKey: ['/api/projects', projectId, 'permission'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/projects/${projectId}/permission`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch permission');
        }
        const data = await res.json();
        return data.permission;
      } catch (error) {
        console.error('Error fetching permission:', error);
        return null;
      }
    },
    enabled: !!projectId,
  });

  const canManageCollaborators = projectPermission === PERMISSION.ADMIN;

  return {
    collaborators,
    isLoading,
    error,
    refetch,
    addCollaborator: addCollaboratorMutation.mutate,
    updateCollaborator: updateCollaboratorMutation.mutate,
    removeCollaborator: removeCollaboratorMutation.mutate,
    isAddingCollaborator: addCollaboratorMutation.isPending,
    isUpdatingCollaborator: updateCollaboratorMutation.isPending,
    isRemovingCollaborator: removeCollaboratorMutation.isPending,
    canManageCollaborators,
    isPermissionLoading,
    projectPermission
  };
}

// Hook to fetch all projects for the current user
export function useUserProjects() {
  const { toast } = useToast();

  const {
    data: userProjects = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/user/projects'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user/projects');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch projects');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching user projects:', error);
        toast({
          title: 'Error',
          description: `Failed to load projects: ${(error as Error).message}`,
          variant: 'destructive'
        });
        throw error;
      }
    }
  });

  return {
    userProjects,
    isLoading,
    error,
    refetch
  };
}