import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

export default function DebugFloorplanTest() {
  const { user, bypassAuth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [floorplans, setFloorplans] = useState<any[]>([]);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);
  const [accessPoints, setAccessPoints] = useState<any[]>([]);
  const [selectedAccessPointId, setSelectedAccessPointId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number>(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [markerType, setMarkerType] = useState<string>("access_point");
  const [markers, setMarkers] = useState<any[]>([]);

  // Perform dev login
  const performLogin = async () => {
    setIsLoading(true);
    try {
      const success = await bypassAuth();
      if (success) {
        toast({
          title: "Login successful",
          description: "You've been logged in with development credentials"
        });
        fetchData();
      } else {
        toast({
          title: "Login failed",
          description: "Failed to log in with development credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch floorplans
      const floorplansRes = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      if (floorplansRes.ok) {
        const floorplansData = await floorplansRes.json();
        setFloorplans(floorplansData);
        if (floorplansData.length > 0 && !selectedFloorplanId) {
          setSelectedFloorplanId(floorplansData[0].id);
        }
      }
      
      // Fetch access points
      const accessPointsRes = await apiRequest('GET', `/api/projects/${projectId}/access-points`);
      if (accessPointsRes.ok) {
        const accessPointsData = await accessPointsRes.json();
        setAccessPoints(accessPointsData);
        if (accessPointsData.length > 0 && !selectedAccessPointId) {
          setSelectedAccessPointId(accessPointsData[0].id);
        }
      }
      
      // Fetch markers if we have a floorplan selected
      if (selectedFloorplanId) {
        fetchMarkers(selectedFloorplanId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Fetch Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMarkers = async (floorplanId: number) => {
    try {
      const markersRes = await apiRequest('GET', `/api/floorplans/${floorplanId}/markers`);
      if (markersRes.ok) {
        const markersData = await markersRes.json();
        setMarkers(markersData);
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  // Create a marker
  const createMarker = async () => {
    if (!selectedFloorplanId || !selectedAccessPointId) {
      toast({
        title: "Missing Selection",
        description: "Please select a floorplan and access point",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First make sure we're logged in
      await bypassAuth();
      
      const markerData = {
        floorplan_id: selectedFloorplanId,
        page: 1,
        marker_type: markerType,
        equipment_id: selectedAccessPointId,
        position_x: posX,
        position_y: posY,
        label: `Marker ${Date.now()}`
      };
      
      console.log('Creating marker with data:', markerData);
      
      // Create the marker
      const response = await apiRequest('POST', '/api/floorplan-markers', markerData);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Marker created:', result);
      
      toast({
        title: "Success",
        description: "Marker created successfully"
      });
      
      // Refresh markers
      fetchMarkers(selectedFloorplanId);
    } catch (error) {
      console.error('Error creating marker:', error);
      toast({
        title: "Error",
        description: `Failed to create marker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a marker
  const deleteMarker = async (markerId: number) => {
    setIsLoading(true);
    try {
      // First make sure we're logged in
      await bypassAuth();
      
      const response = await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to delete marker (${response.status})`);
      }
      
      toast({
        title: "Success",
        description: "Marker deleted successfully"
      });
      
      // Refresh markers
      if (selectedFloorplanId) {
        fetchMarkers(selectedFloorplanId);
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
      toast({
        title: "Error",
        description: `Failed to delete marker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle floorplan change
  const handleFloorplanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedFloorplanId(id);
    fetchMarkers(id);
  };

  // Login on component mount if not already logged in
  useEffect(() => {
    if (!user) {
      performLogin();
    } else {
      fetchData();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug Floorplan Marker Test</CardTitle>
          <CardDescription>
            Test creating and managing floorplan markers directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 mb-6">
            <div>
              <p>User Status: {user ? `Logged in as ${user.username}` : 'Not logged in'}</p>
              {!user && (
                <Button onClick={performLogin} className="mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in now"
                  )}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project ID</Label>
                <Input 
                  id="project"
                  type="number" 
                  value={projectId}
                  onChange={(e) => setProjectId(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchData} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Data"
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="floorplan">Select Floorplan</Label>
              <select
                id="floorplan"
                className="w-full p-2 border rounded mt-1"
                value={selectedFloorplanId || ''}
                onChange={handleFloorplanChange}
              >
                <option value="">Select a floorplan</option>
                {floorplans.map((floorplan) => (
                  <option key={floorplan.id} value={floorplan.id}>
                    {floorplan.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="accessPoint">Select Access Point</Label>
              <select
                id="accessPoint"
                className="w-full p-2 border rounded mt-1"
                value={selectedAccessPointId || ''}
                onChange={(e) => setSelectedAccessPointId(parseInt(e.target.value))}
              >
                <option value="">Select an access point</option>
                {accessPoints.map((ap) => (
                  <option key={ap.id} value={ap.id}>
                    {ap.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="markerType">Marker Type</Label>
              <select
                id="markerType"
                className="w-full p-2 border rounded mt-1"
                value={markerType}
                onChange={(e) => setMarkerType(e.target.value)}
              >
                <option value="access_point">Access Point</option>
                <option value="camera">Camera</option>
                <option value="elevator">Elevator</option>
                <option value="intercom">Intercom</option>
                <option value="note">Note</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="posX">Position X (%)</Label>
              <Input 
                id="posX"
                type="number" 
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value))}
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="posY">Position Y (%)</Label>
              <Input 
                id="posY"
                type="number" 
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value))}
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button onClick={createMarker} disabled={isLoading || !selectedFloorplanId || !selectedAccessPointId}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Marker"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Markers</CardTitle>
          <CardDescription>
            {markers.length} marker{markers.length === 1 ? '' : 's'} for the selected floorplan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {markers.length === 0 ? (
            <p className="text-muted-foreground">No markers available</p>
          ) : (
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-left">Equipment ID</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.map((marker) => (
                    <tr key={marker.id} className="border-b">
                      <td className="p-2">{marker.id}</td>
                      <td className="p-2">{marker.marker_type}</td>
                      <td className="p-2">({marker.position_x}%, {marker.position_y}%)</td>
                      <td className="p-2">{marker.equipment_id}</td>
                      <td className="p-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMarker(marker.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}