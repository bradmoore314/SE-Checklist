import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for device data
export interface AccessPoint {
  id: number;
  location: string;
  project_id: number;
  // Add other access point fields as needed
}

export interface Camera {
  id: number;
  location: string;
  project_id: number;
  // Add other camera fields as needed
}

export interface Elevator {
  id: number;
  location: string;
  project_id: number;
  elevator_type: string;
  // Add other elevator fields as needed
}

export interface Intercom {
  id: number;
  location: string;
  project_id: number;
  // Add other intercom fields as needed
}

// Hook for managing devices
export function useDevice() {
  const { toast } = useToast();

  // Fetch all access points
  const { data: accessPoints = [] } = useQuery<AccessPoint[]>({
    queryKey: ['/api/access-points'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/access-points');
      if (!response.ok) {
        throw new Error('Failed to fetch access points');
      }
      return response.json();
    }
  });

  // Fetch all cameras
  const { data: cameras = [] } = useQuery<Camera[]>({
    queryKey: ['/api/cameras'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cameras');
      if (!response.ok) {
        throw new Error('Failed to fetch cameras');
      }
      return response.json();
    }
  });

  // Fetch all elevators
  const { data: elevators = [] } = useQuery<Elevator[]>({
    queryKey: ['/api/elevators'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/elevators');
      if (!response.ok) {
        throw new Error('Failed to fetch elevators');
      }
      return response.json();
    }
  });

  // Fetch all intercoms
  const { data: intercoms = [] } = useQuery<Intercom[]>({
    queryKey: ['/api/intercoms'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/intercoms');
      if (!response.ok) {
        throw new Error('Failed to fetch intercoms');
      }
      return response.json();
    }
  });

  // Create a new access point
  const createAccessPointMutation = useMutation({
    mutationFn: async (data: Omit<AccessPoint, 'id'>) => {
      const response = await apiRequest('POST', '/api/access-points', data);
      if (!response.ok) {
        throw new Error('Failed to create access point');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-points'] });
      toast({
        title: "Success",
        description: "Access point created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create access point',
        variant: "destructive",
      });
    }
  });

  // Create a new camera
  const createCameraMutation = useMutation({
    mutationFn: async (data: Omit<Camera, 'id'>) => {
      const response = await apiRequest('POST', '/api/cameras', data);
      if (!response.ok) {
        throw new Error('Failed to create camera');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cameras'] });
      toast({
        title: "Success",
        description: "Camera created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create camera',
        variant: "destructive",
      });
    }
  });

  // Create a new elevator
  const createElevatorMutation = useMutation({
    mutationFn: async (data: Omit<Elevator, 'id'>) => {
      const response = await apiRequest('POST', '/api/elevators', data);
      if (!response.ok) {
        throw new Error('Failed to create elevator');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/elevators'] });
      toast({
        title: "Success",
        description: "Elevator created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create elevator',
        variant: "destructive",
      });
    }
  });

  // Create a new intercom
  const createIntercomMutation = useMutation({
    mutationFn: async (data: Omit<Intercom, 'id'>) => {
      const response = await apiRequest('POST', '/api/intercoms', data);
      if (!response.ok) {
        throw new Error('Failed to create intercom');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/intercoms'] });
      toast({
        title: "Success",
        description: "Intercom created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create intercom',
        variant: "destructive",
      });
    }
  });

  // Wrapper functions to simplify the API
  const createAccessPoint = async (data: Omit<AccessPoint, 'id'>) => {
    return await createAccessPointMutation.mutateAsync(data);
  };

  const createCamera = async (data: Omit<Camera, 'id'>) => {
    return await createCameraMutation.mutateAsync(data);
  };

  const createElevator = async (data: Omit<Elevator, 'id'>) => {
    return await createElevatorMutation.mutateAsync(data);
  };

  const createIntercom = async (data: Omit<Intercom, 'id'>) => {
    return await createIntercomMutation.mutateAsync(data);
  };

  return {
    // Device data
    accessPoints,
    cameras,
    elevators,
    intercoms,
    
    // Creation methods
    createAccessPoint,
    createCamera,
    createElevator,
    createIntercom,
    
    // Mutation objects (useful for accessing loading states, etc.)
    createAccessPointMutation,
    createCameraMutation,
    createElevatorMutation,
    createIntercomMutation,
  };
}