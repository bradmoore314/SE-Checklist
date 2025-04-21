import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { Project } from "@shared/schema";
import SimpleFloorplanViewer from "@/components/floorplans/SimpleFloorplanViewer";
import { apiRequest } from "@/lib/queryClient";

export default function ProjectFloorplansPage() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id, 10);
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}`);
      return await res.json();
    },
    enabled: !!projectId && !isNaN(projectId),
  });

  // Set current site walk if coming directly to this page
  useEffect(() => {
    if (project && (!currentSiteWalk || currentSiteWalk.id !== project.id)) {
      setIsSwitching(true);
      setCurrentSiteWalk(project);
      setIsSwitching(false);
    }
  }, [project, currentSiteWalk, setCurrentSiteWalk]);

  if (isLoadingProject || isSwitching) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/floorplans">
            <Button variant="outline" className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to All Floorplans
            </Button>
          </Link>
          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle>Project Not Found</CardTitle>
              <CardDescription>The requested project could not be found</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The project with ID {projectId} does not exist or you don't have access to it.</p>
              <Link href="/floorplans">
                <Button>
                  Return to Floorplans
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-screen-xl">
      <div className="mb-6">
        <Link href="/floorplans">
          <Button variant="outline" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Floorplans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          {project.name} - Floorplans
        </h1>
        <p className="text-muted-foreground">
          {project.site_address || 'No address specified'}
        </p>
      </div>
      
      <SimpleFloorplanViewer projectId={project.id} />
    </div>
  );
}