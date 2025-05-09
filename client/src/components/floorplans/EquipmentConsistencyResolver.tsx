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

  // Process consistency data when it's loaded
  useEffect(() => {
    if (consistencyData) {
      const inconsistentTypes: InconsistentEquipment[] = [];
      
      // Check each equipment type for inconsistencies
      if (consistencyData.access_points.total > consistencyData.access_points.markers) {
        inconsistentTypes.push({
          equipmentType: 'access_point',
          totalCount: consistencyData.access_points.total,
          markerCount: consistencyData.access_points.markers,
          unmappedEquipment: consistencyData.access_points.unmapped || []
        });
      }
      
      if (consistencyData.cameras.total > consistencyData.cameras.markers) {
        inconsistentTypes.push({
          equipmentType: 'camera',
          totalCount: consistencyData.cameras.total,
          markerCount: consistencyData.cameras.markers,
          unmappedEquipment: consistencyData.cameras.unmapped || []
        });
      }
      
      if (consistencyData.elevators.total > consistencyData.elevators.markers) {
        inconsistentTypes.push({
          equipmentType: 'elevator',
          totalCount: consistencyData.elevators.total,
          markerCount: consistencyData.elevators.markers,
          unmappedEquipment: consistencyData.elevators.unmapped || []
        });
      }
      
      if (consistencyData.intercoms.total > consistencyData.intercoms.markers) {
        inconsistentTypes.push({
          equipmentType: 'intercom',
          totalCount: consistencyData.intercoms.total,
          markerCount: consistencyData.intercoms.markers,
          unmappedEquipment: consistencyData.intercoms.unmapped || []
        });
      }
      
      setInconsistencies(inconsistentTypes);
    }
  }, [consistencyData]);

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

  // If inconsistencies found
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
      
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-700">Equipment Mismatch Detected</AlertTitle>
        <AlertDescription className="text-red-600 text-xs">
          Some equipment is in your tables but not placed on any floorplan.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        {inconsistencies.map((item) => (
          <AccordionItem key={item.equipmentType} value={item.equipmentType}>
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <span>{equipmentTypeNames[item.equipmentType]}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {item.totalCount - item.markerCount} unmapped
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 py-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {item.totalCount} total, only {item.markerCount} on floorplans
                </p>
                
                {item.unmappedEquipment.map((equipment) => (
                  <div 
                    key={`${item.equipmentType}-${equipment.id}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs"
                  >
                    <span className="font-medium truncate max-w-[150px]" title={equipment.location}>
                      {equipment.location}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-xs"
                      onClick={() => handleResolveEquipment(item.equipmentType, equipment.id)}
                      disabled={resolveEquipmentMutation.isPending}
                    >
                      {resolveEquipmentMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : 'Mark as Resolved'}
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}