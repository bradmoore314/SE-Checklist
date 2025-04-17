import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { AccessPoint } from '@shared/schema';

interface AccessPointMarkerFormProps {
  projectId: number;
  onSubmit: (equipmentId: number, label: string | null, accessPointData?: any) => void;
  onCancel: () => void;
  position: { x: number, y: number } | null;
  existingMarker?: { id: number; equipment_id: number };
}

const AccessPointMarkerForm: React.FC<AccessPointMarkerFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
  position,
  existingMarker
}) => {
  // Fetch existing access points
  const { data: accessPoints, isLoading } = useQuery<AccessPoint[]>({
    queryKey: ['/api/projects', projectId, 'access-points'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/access-points`);
      return await res.json();
    },
    enabled: !!projectId,
  });
  
  // Fetch lookup data for proper options
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ['/api/lookup'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/lookup');
      return await res.json();
    },
  });
  
  // Fetch specific access point if we're editing an existing marker
  const { data: existingAccessPoint, isLoading: isLoadingExisting } = useQuery<AccessPoint>({
    queryKey: ['/api/access-points', existingMarker?.equipment_id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/access-points/${existingMarker?.equipment_id}`);
      return await res.json();
    },
    enabled: !!existingMarker?.equipment_id,
  });

  // Form state
  const [createNew, setCreateNew] = useState<boolean>(!existingMarker);
  const [selectedAccessPointId, setSelectedAccessPointId] = useState<number>(existingMarker?.equipment_id || 0);
  
  // Access point details state - prepopulated if editing
  const [location, setLocation] = useState<string>(existingAccessPoint?.location || "");
  const [quickConfig, setQuickConfig] = useState<string>(existingAccessPoint?.quick_config || "");
  const [readerType, setReaderType] = useState<string>(existingAccessPoint?.reader_type || "KR-100");
  const [lockType, setLockType] = useState<string>(existingAccessPoint?.lock_type || "Standard");
  const [monitoringType, setMonitoringType] = useState<string>(existingAccessPoint?.monitoring_type || "Prop Monitoring");
  const [lockProvider, setLockProvider] = useState<string>(existingAccessPoint?.lock_provider || "Kastle");
  const [interiorPerimeter, setInteriorPerimeter] = useState<string>(existingAccessPoint?.interior_perimeter || "Interior");
  const [notes, setNotes] = useState<string>(existingAccessPoint?.notes || "");

  // Update form fields if existing access point data loads
  React.useEffect(() => {
    if (existingAccessPoint) {
      setLocation(existingAccessPoint.location || "");
      setQuickConfig(existingAccessPoint.quick_config || "");
      setReaderType(existingAccessPoint.reader_type || "KR-100");
      setLockType(existingAccessPoint.lock_type || "Standard");
      setMonitoringType(existingAccessPoint.monitoring_type || "Prop Monitoring");
      setLockProvider(existingAccessPoint.lock_provider || "Kastle");
      setInteriorPerimeter(existingAccessPoint.interior_perimeter || "Interior");
      setNotes(existingAccessPoint.notes || "");
    }
  }, [existingAccessPoint]);

  const handleSubmit = () => {
    if (createNew) {
      // For new access points, pass all the form data to create a complete record
      const accessPointData = {
        location,
        quick_config: quickConfig,
        reader_type: readerType,
        lock_type: lockType,
        monitoring_type: monitoringType,
        lock_provider: lockProvider,
        interior_perimeter: interiorPerimeter,
        notes,
        project_id: projectId
      };
      
      // Pass 0 for equipmentId to signal creating a new one, along with the form data
      onSubmit(0, location, accessPointData);
    } else if (existingMarker) {
      // If we're editing an existing marker, pass the updated data
      const updatedData = {
        location,
        quick_config: quickConfig,
        reader_type: readerType,
        lock_type: lockType,
        monitoring_type: monitoringType,
        lock_provider: lockProvider,
        interior_perimeter: interiorPerimeter,
        notes
      };
      
      // Pass the existing equipment ID and the form data for updates
      onSubmit(existingMarker.equipment_id, location, updatedData);
    } else {
      // Using an existing access point without modifications
      onSubmit(selectedAccessPointId, null);
    }
  };

  // If we're loading an existing marker's details, show a loading state
  if (existingMarker && isLoadingExisting) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading access point details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="font-medium">
            {existingMarker 
              ? `Editing Access Point Marker #${existingMarker.id}` 
              : `Adding Access Point Marker at Position ${position?.x}%, ${position?.y}%`}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {!existingMarker && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="marker-type">Marker Type</Label>
            <Select
              value={createNew ? "new" : "existing"}
              onValueChange={(value) => setCreateNew(value === "new")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Access Point</SelectItem>
                <SelectItem value="existing">Use Existing Access Point</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {createNew || existingMarker ? (
          // Form for new access point or editing existing one
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location/Name</Label>
                <Input
                  id="location"
                  placeholder="e.g., Main Entrance Door"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-config">Quick Config</Label>
                  <Select 
                    value={quickConfig} 
                    onValueChange={setQuickConfig}
                  >
                    <SelectTrigger id="quick-config">
                      <SelectValue placeholder="Select configuration" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLookups ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : lookupData?.quickConfigOptions ? (
                        lookupData.quickConfigOptions.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Default Config">Default Config</SelectItem>
                          <SelectItem value="In/Out Reader">In/Out Reader</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interior-perimeter">Interior/Perimeter</Label>
                  <Select 
                    value={interiorPerimeter} 
                    onValueChange={setInteriorPerimeter}
                  >
                    <SelectTrigger id="interior-perimeter">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Perimeter">Perimeter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reader-type">Reader Type</Label>
                  <Select 
                    value={readerType} 
                    onValueChange={setReaderType}
                  >
                    <SelectTrigger id="reader-type">
                      <SelectValue placeholder="Select reader type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLookups ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : lookupData?.readerTypes ? (
                        lookupData.readerTypes.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="KR-1">KR-1</SelectItem>
                          <SelectItem value="KR-2">KR-2</SelectItem>
                          <SelectItem value="KR-RP40">KR-RP40</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lock-type">Lock Type</Label>
                  <Select 
                    value={lockType} 
                    onValueChange={setLockType}
                  >
                    <SelectTrigger id="lock-type">
                      <SelectValue placeholder="Select lock type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLookups ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : lookupData?.lockTypes ? (
                        lookupData.lockTypes.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Magnetic Lock">Magnetic Lock</SelectItem>
                          <SelectItem value="Strike">Strike</SelectItem>
                          <SelectItem value="Provided by Others">Provided by Others</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monitoring-type">Monitoring Type</Label>
                <Select 
                  value={monitoringType} 
                  onValueChange={setMonitoringType}
                >
                  <SelectTrigger id="monitoring-type">
                    <SelectValue placeholder="Select monitoring type" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLookups ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : lookupData?.monitoringTypes ? (
                      lookupData.monitoringTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="DPS Only">DPS Only</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lock-provider">Lock Provider</Label>
                <Select 
                  value={lockProvider} 
                  onValueChange={setLockProvider}
                >
                  <SelectTrigger id="lock-provider">
                    <SelectValue placeholder="Select lock provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLookups ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : lookupData?.lockProviderOptions ? (
                      lookupData.lockProviderOptions.map((provider: string) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Kastle">Kastle</SelectItem>
                        <SelectItem value="PPI">PPI</SelectItem>
                        <SelectItem value="Client">Client</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this access point"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        ) : (
          // Form for selecting existing access point
          <div className="flex flex-col gap-2">
            <Label htmlFor="existing-access-point">Select Existing Access Point</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading access points...</span>
              </div>
            ) : accessPoints && accessPoints.length > 0 ? (
              <Select
                value={selectedAccessPointId.toString()}
                onValueChange={(value) => setSelectedAccessPointId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an access point" />
                </SelectTrigger>
                <SelectContent>
                  {accessPoints.map((ap) => (
                    <SelectItem key={ap.id} value={ap.id.toString()}>
                      {ap.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">No access points found. Create a new one instead.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {existingMarker ? "Update Marker" : "Add Marker"}
        </Button>
      </div>
    </div>
  );
};

export default AccessPointMarkerForm;