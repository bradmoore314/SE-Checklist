/**
 * React hooks for project management with unified storage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => storage.getProjects(),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => storage.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (project: any) => storage.saveProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & any) => 
      storage.saveProject({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    },
  });
}

export function useCameras(projectId: number) {
  return useQuery({
    queryKey: ['cameras', projectId],
    queryFn: () => storage.getCameras(projectId),
    enabled: !!projectId,
  });
}

export function useCreateCamera() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (camera: any) => storage.saveCamera(camera),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cameras', data.project_id] });
      toast({
        title: 'Success',
        description: 'Camera created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create camera',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & any) => 
      storage.saveCamera({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cameras', data.project_id] });
      toast({
        title: 'Success',
        description: 'Camera updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update camera',
        variant: 'destructive',
      });
    },
  });
}

export function useAccessPoints(projectId: number) {
  return useQuery({
    queryKey: ['access-points', projectId],
    queryFn: () => storage.getAccessPoints(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAccessPoint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (accessPoint: any) => storage.saveAccessPoint(accessPoint),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['access-points', data.project_id] });
      toast({
        title: 'Success',
        description: 'Access point created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create access point',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, projectId }: { file: File; projectId: number }) =>
      storage.saveFile(file, projectId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      imageData, 
      projectId, 
      equipmentType, 
      equipmentId 
    }: { 
      imageData: string; 
      projectId: number; 
      equipmentType: string; 
      equipmentId: number; 
    }) => storage.saveImage(imageData, projectId, equipmentType, equipmentId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });
}

export function useStorageStatus() {
  return useQuery({
    queryKey: ['storage-status'],
    queryFn: () => storage.isOnline(),
    refetchInterval: 10000, // Check every 10 seconds
  });
}