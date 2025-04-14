import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { 
  Project, 
  AccessPoint, 
  Camera, 
  Elevator, 
  Intercom,
  Image as EquipmentImage 
} from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, FileDown, Printer, Brain } from "lucide-react";
import { SiteWalkAnalysis } from "@/components/ai/SiteWalkAnalysis";

interface EquipmentWithImages extends AccessPoint {
  images: EquipmentImage[];
}

interface CameraWithImages extends Camera {
  images: EquipmentImage[];
}

interface ElevatorWithImages extends Elevator {
  images: EquipmentImage[];
}

interface IntercomWithImages extends Intercom {
  images: EquipmentImage[];
}

interface SiteSummary {
  project: Project;
  summary: {
    accessPointCount: number;
    interiorAccessPointCount: number;
    perimeterAccessPointCount: number;
    cameraCount: number;
    indoorCameraCount: number;
    outdoorCameraCount: number;
    elevatorCount: number;
    elevatorBankCount: number;
    intercomCount: number;
    totalEquipmentCount: number;
  };
  equipment: {
    accessPoints: EquipmentWithImages[];
    cameras: CameraWithImages[];
    elevators: ElevatorWithImages[];
    intercoms: IntercomWithImages[];
  };
}

export default function SiteWalkSummary() {
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const [, setLocation] = useLocation();
  
  // Fetch site walks
  const { data: siteWalks, isLoading: loadingSiteWalks } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // If current site walk is not set, use the first one from the list
  useEffect(() => {
    if (!currentSiteWalk && siteWalks && siteWalks.length > 0) {
      setCurrentSiteWalk(siteWalks[0]);
    }
  }, [currentSiteWalk, siteWalks, setCurrentSiteWalk]);

  // Fetch site walk summary
  const { data: summary, isLoading: loadingSummary } = useQuery<SiteSummary>({
    queryKey: [`/api/projects/${currentSiteWalk?.id}/reports/project-summary`],
    enabled: !!currentSiteWalk?.id,
  });

  const isLoading = loadingSiteWalks || loadingSummary;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="material-icons text-4xl animate-spin text-primary mb-4">
            sync
          </div>
          <p className="text-neutral-600">Loading site walk summary...</p>
        </div>
      </div>
    );
  }

  // No site walks state
  if (!siteWalks || siteWalks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Site Walks Found</h2>
              <p className="text-neutral-600 mb-4">
                You don't have any security site walks yet. Create your first site walk to get started.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center mx-auto">
                  <span className="material-icons mr-1">add</span>
                  Create New Site Walk
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If currentSiteWalk is not set but we have site walks, this should not happen
  // due to the useEffect, but let's handle it anyway
  if (!currentSiteWalk) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select a Site Walk</h2>
              <p className="text-neutral-600 mb-4">
                Please select a site walk to continue.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md mx-auto">
                  View Site Walks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="material-icons text-4xl text-amber-500 mb-4">
            error_outline
          </div>
          <p className="text-neutral-600">Unable to load site walk summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Site Walk Summary</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="flex items-center"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{summary.project.name} - Equipment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  {summary.summary.accessPointCount}
                </div>
                <div className="text-neutral-600">Card Access Points</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Interior: {summary.summary.interiorAccessPointCount} | Perimeter: {summary.summary.perimeterAccessPointCount}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  {summary.summary.cameraCount}
                </div>
                <div className="text-neutral-600">Cameras</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Indoor: {summary.summary.indoorCameraCount} | Outdoor: {summary.summary.outdoorCameraCount}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  {summary.summary.elevatorCount}
                </div>
                <div className="text-neutral-600">Elevators & Turnstiles</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Banks: {summary.summary.elevatorBankCount}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  {summary.summary.intercomCount}
                </div>
                <div className="text-neutral-600">Intercoms</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold mb-2" style={{ color: 'var(--red-accent)' }}>
                  {summary.summary.totalEquipmentCount}
                </div>
                <div className="text-neutral-600">Total Equipment</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Site Walk Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-neutral-600 mb-1">Client</h3>
              <p className="font-medium">{summary.project.client || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-neutral-600 mb-1">Site Address</h3>
              <p className="font-medium">{summary.project.site_address || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-neutral-600 mb-1">Security Engineer</h3>
              <p className="font-medium">{summary.project.se_name || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-neutral-600 mb-1">Business Development Manager</h3>
              <p className="font-medium">{summary.project.bdm_name || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Points Summary */}
      {summary.equipment.accessPoints.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Card Access Points</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary.equipment.accessPoints.map((ap) => (
                <div key={ap.id} className="border rounded-md p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg">{ap.location}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Reader Type</p>
                          <p>{ap.reader_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Lock Type</p>
                          <p>{ap.lock_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Monitoring Type</p>
                          <p>{ap.monitoring_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Quick Config</p>
                          <p>{ap.quick_config || "N/A"}</p>
                        </div>
                        {ap.notes && (
                          <div className="col-span-2">
                            <p className="text-neutral-600 text-sm mb-1">Notes</p>
                            <p className="whitespace-pre-wrap">{ap.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {ap.images && ap.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({ap.images.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {ap.images.map((img) => (
                            <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                              <img 
                                src={img.image_data} 
                                alt={`Image for ${ap.location}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cameras Summary */}
      {summary.equipment.cameras.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cameras</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary.equipment.cameras.map((camera) => (
                <div key={camera.id} className="border rounded-md p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg">{camera.location}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Camera Type</p>
                          <p>{camera.camera_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Mounting Type</p>
                          <p>{camera.mounting_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Resolution</p>
                          <p>{camera.resolution || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Field of View</p>
                          <p>{camera.field_of_view || "N/A"}</p>
                        </div>
                        {camera.notes && (
                          <div className="col-span-2">
                            <p className="text-neutral-600 text-sm mb-1">Notes</p>
                            <p className="whitespace-pre-wrap">{camera.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {camera.images && camera.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({camera.images.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {camera.images.map((img) => (
                            <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                              <img 
                                src={img.image_data} 
                                alt={`Image for ${camera.location}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Elevators Summary */}
      {summary.equipment.elevators.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Elevators & Turnstiles</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary.equipment.elevators.map((elevator) => (
                <div key={elevator.id} className="border rounded-md p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg">{elevator.location}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Elevator Type</p>
                          <p>{elevator.elevator_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Floor Count</p>
                          <p>{elevator.floor_count || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Location</p>
                          <p>{elevator.location || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Type</p>
                          <p>{elevator.elevator_type || "N/A"}</p>
                        </div>
                        {elevator.notes && (
                          <div className="col-span-2">
                            <p className="text-neutral-600 text-sm mb-1">Notes</p>
                            <p className="whitespace-pre-wrap">{elevator.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {elevator.images && elevator.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({elevator.images.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {elevator.images.map((img) => (
                            <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                              <img 
                                src={img.image_data} 
                                alt={`Image for ${elevator.location}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intercoms Summary */}
      {summary.equipment.intercoms.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Intercoms</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {summary.equipment.intercoms.map((intercom) => (
                <div key={intercom.id} className="border rounded-md p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-lg">{intercom.location}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Intercom Type</p>
                          <p>{intercom.intercom_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-sm mb-1">Location</p>
                          <p>{intercom.location || "N/A"}</p>
                        </div>
                        {intercom.notes && (
                          <div className="col-span-2">
                            <p className="text-neutral-600 text-sm mb-1">Notes</p>
                            <p className="whitespace-pre-wrap">{intercom.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {intercom.images && intercom.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({intercom.images.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {intercom.images.map((img) => (
                            <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                              <img 
                                src={img.image_data} 
                                alt={`Image for ${intercom.location}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      <SiteWalkAnalysis projectId={currentSiteWalk.id} />

      {/* Export Options */}
      <div className="flex gap-2">
        <Button className="flex items-center">
          <FileDown className="h-4 w-4 mr-1" />
          Export Complete Report
        </Button>
        
        <Button variant="outline" className="flex items-center">
          <Printer className="h-4 w-4 mr-1" />
          Print Report
        </Button>
      </div>
    </div>
  );
}