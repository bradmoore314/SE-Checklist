import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Check, RefreshCcw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EquipmentConsistencyResolverProps {
  projectId: number;
  onResolved?: () => void;
}

interface InconsistentEquipment {
  equipmentType: 'access_point' | 'camera' | 'elevator' | 'intercom';
  totalCount: number; 
  markerCount: number;
  unmappedEquipment: Array<{
    id: number;
    location: string;
  }>;
}

/**
 * Component to detect and resolve inconsistencies between equipment in tables 
 * and equipment placed on floorplans.
 * 
 * Used to fix the scenario where there are more pieces of equipment in the database
 * tables than are represented as markers on floorplans.
 */
export function EquipmentConsistencyResolver({ projectId, onResolved }: EquipmentConsistencyResolverProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [inconsistencies, setInconsistencies] = useState<InconsistentEquipment[]>([]);
  const [showResolutionSuccessMessage, setShowResolutionSuccessMessage] = useState(false);

  // Equipment type display names
  const equipmentTypeNames = {
    'access_point': 'Card Readers',
    'camera': 'Cameras',
    'elevator': 'Elevators',
    'intercom': 'Intercoms'
  };

  // Query to fetch equipment consistency data
  const { 
    data: consistencyData,
    isLoading: isLoadingConsistencyData,
    refetch: refetchConsistencyData
  } = useQuery({
    queryKey: ['/api/projects', projectId, 'equipment-consistency'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/equipment-consistency`);
      if (!res.ok) {
        throw new Error('Failed to fetch equipment consistency data');
      }
      return await res.json();
    },
    enabled: !!projectId
  });
  
  // Mutation to mark equipment as resolved
  const resolveEquipmentMutation = useMutation({
    mutationFn: async ({ equipmentType, equipmentId }: { equipmentType: string, equipmentId: number }) => {
      const res = await apiRequest('POST', `/api/enhanced-floorplan/resolve-equipment`, {
        projectId,
        equipmentType, 
        equipmentId
      });
      if (!res.ok) {
        throw new Error('Failed to resolve equipment inconsistency');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'equipment-consistency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan'] });
      
      // Set temporary success message
      setShowResolutionSuccessMessage(true);
      setTimeout(() => {
        setShowResolutionSuccessMessage(false);
      }, 3000);
      
      // Refresh data
      refetchConsistencyData();
      
      // Call onResolved callback if provided
      if (onResolved) {
        onResolved();
      }
    },
    onError: (error) => {
      toast({
        title: "Error resolving equipment inconsistency",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Track whether we're currently resolving an issue to prevent loops
  const [isAutoResolving, setIsAutoResolving] = useState(false);
  
  // Process consistency data when it's loaded
  // AND automatically resolve any inconsistencies
  useEffect(() => {
    if (consistencyData && !isAutoResolving && !resolveEquipmentMutation.isPending) {
      const inconsistentTypes: InconsistentEquipment[] = [];
      let hasUnresolvedItems = false;
      
      // Check each equipment type for inconsistencies
      if (consistencyData.access_points.total > consistencyData.access_points.markers) {
        const unmapped = consistencyData.access_points.unmapped || [];
        inconsistentTypes.push({
          equipmentType: 'access_point',
          totalCount: consistencyData.access_points.total,
          markerCount: consistencyData.access_points.markers,
          unmappedEquipment: unmapped
        });
        
        // Found inconsistencies to be resolved
        if (unmapped.length > 0) {
          hasUnresolvedItems = true;
        }
      }
      
      if (consistencyData.cameras.total > consistencyData.cameras.markers) {
        const unmapped = consistencyData.cameras.unmapped || [];
        inconsistentTypes.push({
          equipmentType: 'camera',
          totalCount: consistencyData.cameras.total,
          markerCount: consistencyData.cameras.markers,
          unmappedEquipment: unmapped
        });
        
        // Found inconsistencies to be resolved
        if (unmapped.length > 0) {
          hasUnresolvedItems = true;
        }
      }
      
      if (consistencyData.elevators.total > consistencyData.elevators.markers) {
        const unmapped = consistencyData.elevators.unmapped || [];
        inconsistentTypes.push({
          equipmentType: 'elevator',
          totalCount: consistencyData.elevators.total,
          markerCount: consistencyData.elevators.markers,
          unmappedEquipment: unmapped
        });
        
        // Found inconsistencies to be resolved
        if (unmapped.length > 0) {
          hasUnresolvedItems = true;
        }
      }
      
      if (consistencyData.intercoms.total > consistencyData.intercoms.markers) {
        const unmapped = consistencyData.intercoms.unmapped || [];
        inconsistentTypes.push({
          equipmentType: 'intercom',
          totalCount: consistencyData.intercoms.total,
          markerCount: consistencyData.intercoms.markers,
          unmappedEquipment: unmapped
        });
        
        // Found inconsistencies to be resolved
        if (unmapped.length > 0) {
          hasUnresolvedItems = true;
        }
      }
      
      setInconsistencies(inconsistentTypes);
      
      // If there are unresolved items, auto-resolve the first one
      if (hasUnresolvedItems) {
        // Find the first type with unmapped equipment
        for (const type of inconsistentTypes) {
          if (type.unmappedEquipment.length > 0) {
            setIsAutoResolving(true);
            resolveEquipmentMutation.mutate({ 
              equipmentType: type.equipmentType, 
              equipmentId: type.unmappedEquipment[0].id 
            });
            break;
          }
        }
      }
    }
  }, [consistencyData, isAutoResolving, resolveEquipmentMutation.isPending]);
  
  // Reset auto-resolving flag when mutation completes
  useEffect(() => {
    if (!resolveEquipmentMutation.isPending && isAutoResolving) {
      setIsAutoResolving(false);
      
      // Set success message
      setShowResolutionSuccessMessage(true);
      setTimeout(() => {
        setShowResolutionSuccessMessage(false);
      }, 3000);
    }
  }, [resolveEquipmentMutation.isPending]);

  // Handle checking for inconsistencies
  const handleCheckConsistency = () => {
    setIsChecking(true);
    refetchConsistencyData()
      .finally(() => {
        setIsChecking(false);
      });
  };

  // Handle resolving a single equipment item
  const handleResolveEquipment = (equipmentType: string, equipmentId: number) => {
    resolveEquipmentMutation.mutate({ equipmentType, equipmentId });
  };

  // If loading, show a loading spinner
  if (isLoadingConsistencyData && !isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Checking equipment consistency...</p>
      </div>
    );
  }

  // If no inconsistencies found
  if (inconsistencies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Equipment Consistency</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCheckConsistency}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-1" />
            )}
            {isChecking ? 'Checking...' : 'Check'}
          </Button>
        </div>
        
        {showResolutionSuccessMessage ? (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Success</AlertTitle>
            <AlertDescription className="text-green-600 text-xs">
              Equipment inconsistency resolved successfully.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center p-2 rounded-md bg-green-50 border border-green-200">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <p className="text-xs text-green-700">All equipment is properly mapped to floorplans.</p>
          </div>
        )}
      </div>
    );
  }

  // If inconsistencies found and being auto-resolved
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Equipment Consistency</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCheckConsistency}
          disabled={isChecking || resolveEquipmentMutation.isPending}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-1" />
          )}
          {isChecking ? 'Checking...' : 'Refresh'}
        </Button>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        <AlertTitle className="text-blue-700">Auto-Syncing Equipment</AlertTitle>
        <AlertDescription className="text-blue-600 text-xs">
          Automatically syncing unmapped equipment to floorplans...
        </AlertDescription>
      </Alert>

      <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700 mb-2">
          <span className="font-medium">Auto-syncing equipment</span> - Placing equipment on floorplans automatically
        </p>
        
        {inconsistencies.map((item) => (
          <div 
            key={item.equipmentType} 
            className="mb-2 last:mb-0"
          >
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-blue-900">{equipmentTypeNames[item.equipmentType]}</span>
              <div className="flex items-center">
                <span className="text-xs text-blue-700 mr-2">
                  {item.markerCount}/{item.totalCount} mapped
                </span>
                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400" 
                style={{ width: `${Math.floor((item.markerCount / item.totalCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}