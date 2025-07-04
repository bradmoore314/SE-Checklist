import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { 
  Project, 
  AccessPoint, 
  Camera, 
  Elevator, 
  Intercom
} from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, FileDown, Printer, Brain } from "lucide-react";
import { OpportunityAnalysis } from "@/components/ai/OpportunityAnalysis";
import AgendaContainer from "@/components/ai/AgendaContainer";
import UnifiedExport from "@/components/UnifiedExport";

interface EquipmentImage {
  id: number;
  equipment_id: number;
  equipment_type: string;
  image_data?: string;
  thumbnail_data?: string;
  blob_url?: string;
  blob_name?: string;
  storage_type?: string;
  created_at?: string;
}

// Helper function to check if an image has valid source data
const hasValidImageData = (img: EquipmentImage): boolean => {
  return !!(img.blob_url || img.image_data || img.thumbnail_data);
}

// Helper function to get image source based on available data
const getImageSrc = (img: EquipmentImage): string | null => {
  try {
    if (img.blob_url) {
      return img.blob_url;
    } else if (img.image_data) {
      return `data:image/jpeg;base64,${img.image_data}`;
    } else if (img.thumbnail_data) {
      return `data:image/jpeg;base64,${img.thumbnail_data}`;
    } else {
      console.log('No image data available for image ID:', img.id);
      return null;
    }
  } catch (error) {
    console.error('Error getting image source:', error);
    return null;
  }
}

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

export default function Summary() {
  const { currentOpportunity, setCurrentOpportunity } = useOpportunity();
  const [, setLocation] = useLocation();
  
  // Fetch site walks
  const { data: siteWalks, isLoading: loadingSiteWalks } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // If current opportunity is not set, use the first one from the list
  useEffect(() => {
    if (!currentOpportunity && siteWalks && siteWalks.length > 0) {
      setCurrentOpportunity(siteWalks[0]);
    }
  }, [currentOpportunity, siteWalks, setCurrentOpportunity]);

  // Fetch opportunity summary
  const { data: summary, isLoading: loadingSummary } = useQuery<SiteSummary>({
    queryKey: [`/api/projects/${currentOpportunity?.id}/reports/project-summary`],
    enabled: !!currentOpportunity?.id,
    // Refetch on window focus and every 2 seconds to ensure up-to-date data
    refetchOnWindowFocus: true,
    refetchInterval: 2000,
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
          <p className="text-neutral-600">Loading summary...</p>
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
              <h2 className="text-2xl font-bold mb-2">No Opportunities Found</h2>
              <p className="text-neutral-600 mb-4">
                You don't have any opportunities yet. Create your first opportunity to get started.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center mx-auto">
                  <span className="material-icons mr-1">add</span>
                  Create New Opportunity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If currentOpportunity is not set but we have site walks, this should not happen
  // due to the useEffect, but let's handle it anyway
  if (!currentOpportunity) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select an Opportunity</h2>
              <p className="text-neutral-600 mb-4">
                Please select an opportunity to continue.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md mx-auto">
                  View Opportunities
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
          <p className="text-neutral-600">Unable to load summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Summary</h1>
        <div className="flex gap-2">
          <UnifiedExport 
            projectId={currentOpportunity.id} 
            projectName={summary.project.name} 
          />
          <UnifiedExport projectId={currentOpportunity.id} />
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="flex items-center"
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back to Dashboard
          </Button>
        </div>
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
          <CardTitle>Project Information</CardTitle>
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
              <UnifiedExport 
                data={summary.equipment.accessPoints}
                filename={`${summary.project.name}_Access_Points`}
                title={`${summary.project.name} - Access Points`}
                size="sm"
              />
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
                        {ap.quick_config && ap.quick_config !== "N/A" && (
                          <div>
                            <p className="text-neutral-600 text-sm mb-1">Quick Config</p>
                            <p>{ap.quick_config}</p>
                          </div>
                        )}
                        {ap.notes && (
                          <div className="col-span-2">
                            <p className="text-neutral-600 text-sm mb-1">Notes</p>
                            <p className="whitespace-pre-wrap">{ap.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {ap.images && ap.images.filter(hasValidImageData).length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({ap.images.filter(hasValidImageData).length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {ap.images.filter(hasValidImageData).map((img) => {
                            const imgSrc = getImageSrc(img);
                            if (!imgSrc) return null;
                            return (
                              <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                                <img 
                                  src={imgSrc} 
                                  alt={`Image for ${ap.location}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
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
              <UnifiedExport 
                data={summary.equipment.cameras}
                filename={`${summary.project.name}_Cameras`}
                title={`${summary.project.name} - Cameras`}
                size="sm"
              />
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
                    {camera.images && camera.images.filter(hasValidImageData).length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({camera.images.filter(hasValidImageData).length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {camera.images.filter(hasValidImageData).map((img) => {
                            const imgSrc = getImageSrc(img);
                            if (!imgSrc) return null;
                            return (
                              <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                                <img 
                                  src={imgSrc} 
                                  alt={`Image for ${camera.location}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
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
              <UnifiedExport 
                data={summary.equipment.elevators}
                filename={`${summary.project.name}_Elevators`}
                title={`${summary.project.name} - Elevators & Turnstiles`}
                size="sm"
              />
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
                    {elevator.images && elevator.images.filter(hasValidImageData).length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({elevator.images.filter(hasValidImageData).length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {elevator.images.filter(hasValidImageData).map((img) => {
                            const imgSrc = getImageSrc(img);
                            if (!imgSrc) return null;
                            return (
                              <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                                <img 
                                  src={imgSrc} 
                                  alt={`Image for ${elevator.location}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
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
              <UnifiedExport 
                data={summary.equipment.intercoms}
                filename={`${summary.project.name}_Intercoms`}
                title={`${summary.project.name} - Intercoms`}
                size="sm"
              />
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
                    {intercom.images && intercom.images.filter(hasValidImageData).length > 0 && (
                      <div className="flex-shrink-0">
                        <p className="text-neutral-600 text-sm mb-2">Images ({intercom.images.filter(hasValidImageData).length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {intercom.images.filter(hasValidImageData).map((img) => {
                            const imgSrc = getImageSrc(img);
                            if (!imgSrc) return null;
                            return (
                              <div key={img.id} className="w-24 h-24 relative border rounded overflow-hidden">
                                <img 
                                  src={imgSrc} 
                                  alt={`Image for ${intercom.location}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
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
      <OpportunityAnalysis projectId={currentOpportunity.id} />
      
      {/* Meeting Agenda Generator */}
      <AgendaContainer projectId={currentOpportunity.id} />

      {/* Export Options */}
      <div className="flex gap-2">
        <UnifiedExport 
          projectId={currentOpportunity.id} 
          variant="default"
          size="default"
        />
      </div>
    </div>
  );
}