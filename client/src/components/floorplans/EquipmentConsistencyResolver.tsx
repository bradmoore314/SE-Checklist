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
      
      // Handle 404 or other errors more gracefully
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // If we get a 404, the equipment may have been deleted - treat this as a "success"
        if (res.status === 404) {
          console.log(`Equipment not found: ${equipmentType} ID ${equipmentId}. It may have been deleted.`);
          return { success: true, message: "Equipment not found or already resolved" };
        }
        throw new Error(errorData.error || 'Failed to resolve equipment inconsistency');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'equipment-consistency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan'] });
      
      // Set temporary success message (only show in non-auto mode)
      if (!isAutoResolving) {
        setShowResolutionSuccessMessage(true);
        setTimeout(() => {
          setShowResolutionSuccessMessage(false);
        }, 3000);
      }
      
      // Refresh data with a slight delay to prevent rapid refetching
      setTimeout(() => {
        refetchConsistencyData();
      }, 300);
      
      // Call onResolved callback if provided
      if (onResolved) {
        onResolved();
      }
    },
    onError: (error) => {
      // Don't show toast errors during auto-resolving to avoid spamming the user
      if (!isAutoResolving) {
        toast({
          title: "Error resolving equipment inconsistency",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      }
      
      console.error("Failed to resolve equipment:", error);
      
      // Reset auto-resolving state on error
      setIsAutoResolving(false);
    }
  });

  // Track whether we're currently resolving an issue to prevent loops
  const [isAutoResolving, setIsAutoResolving] = useState(false);
  
  // Track the last time we performed a resolution to implement debounce
  const [lastResolutionTime, setLastResolutionTime] = useState(0);
  
  // Process consistency data when it's loaded
  // AND automatically resolve any inconsistencies with debouncing
  useEffect(() => {
    // Skip if data is loading, already resolving, or we're in a pending mutation
    if (!consistencyData || isAutoResolving || resolveEquipmentMutation.isPending) {
      return;
    }
    
    // Implement a debounce to prevent too many rapid API calls
    const now = Date.now();
    const debounceMs = 1000; // 1 second between auto-resolve attempts
    
    if (now - lastResolutionTime < debounceMs) {
      return; // Skip this update cycle if we resolved recently
    }
    
    try {
      const inconsistentTypes: InconsistentEquipment[] = [];
      let hasUnresolvedItems = false;
      
      // Helper function to safely process each equipment type
      const processEquipmentType = (
        data: any, 
        type: 'access_point' | 'camera' | 'elevator' | 'intercom'
      ) => {
        // Skip if data is missing or malformed
        if (!data || typeof data.total !== 'number' || typeof data.markers !== 'number') {
          return;
        }
        
        if (data.total > data.markers) {
          // Ensure unmapped is an array (even if null/undefined)
          const unmapped = Array.isArray(data.unmapped) ? data.unmapped : [];
          
          inconsistentTypes.push({
            equipmentType: type,
            totalCount: data.total,
            markerCount: data.markers,
            unmappedEquipment: unmapped
          });
          
          // Found inconsistencies to be resolved
          if (unmapped.length > 0) {
            hasUnresolvedItems = true;
          }
        }
      };
      
      // Safely process each type (guard against missing properties)
      if (consistencyData.access_points) {
        processEquipmentType(consistencyData.access_points, 'access_point');
      }
      
      if (consistencyData.cameras) {
        processEquipmentType(consistencyData.cameras, 'camera');
      }
      
      if (consistencyData.elevators) {
        processEquipmentType(consistencyData.elevators, 'elevator');
      }
      
      if (consistencyData.intercoms) {
        processEquipmentType(consistencyData.intercoms, 'intercom');
      }
      
      setInconsistencies(inconsistentTypes);
      
      // If there are unresolved items, auto-resolve the first one
      if (hasUnresolvedItems) {
        // Find the first type with unmapped equipment
        for (const type of inconsistentTypes) {
          if (type.unmappedEquipment.length > 0) {
            // Set the flag to prevent concurrent resolutions
            setIsAutoResolving(true);
            // Record the time of this resolution attempt for debouncing
            setLastResolutionTime(now);
            
            // Resolve the first unmapped equipment
            resolveEquipmentMutation.mutate({ 
              equipmentType: type.equipmentType, 
              equipmentId: type.unmappedEquipment[0].id 
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error processing equipment consistency data:", error);
    }
  }, [consistencyData, isAutoResolving, resolveEquipmentMutation.isPending, lastResolutionTime]);
  
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