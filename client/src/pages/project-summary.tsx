import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { Project } from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

interface SiteSummary {
  project: Project;
  summary: {
    accessPointCount: number;
    cameraCount: number;
    elevatorCount: number;
    intercomCount: number;
    totalEquipmentCount: number;
  }
}

export default function ProjectSummary() {
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
                <div className="text-5xl font-bold text-primary mb-2">
                  {summary.summary.accessPointCount}
                </div>
                <div className="text-neutral-600">Card Access Points</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {summary.summary.cameraCount}
                </div>
                <div className="text-neutral-600">Cameras</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {summary.summary.elevatorCount}
                </div>
                <div className="text-neutral-600">Elevators & Turnstiles</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {summary.summary.intercomCount}
                </div>
                <div className="text-neutral-600">Intercoms</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">
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

      <div className="flex gap-2">
        <Link href="/door-schedules">
          <Button className="flex items-center">
            <span className="material-icons mr-1">assessment</span>
            Door Schedule
          </Button>
        </Link>
        
        <Link href="/camera-schedules">
          <Button className="flex items-center">
            <span className="material-icons mr-1">bar_chart</span>
            Camera Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
}