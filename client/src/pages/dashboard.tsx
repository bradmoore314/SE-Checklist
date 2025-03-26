import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/context/ProjectContext";
import { Project } from "@shared/schema";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import ProjectConfiguration from "@/components/project/ProjectConfiguration";
import EquipmentTabs from "@/components/equipment/EquipmentTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { currentProject, setCurrentProject } = useProject();
  
  // Fetch projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // If current project is not set, use the first one from the list
  useEffect(() => {
    if (!currentProject && projects && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="material-icons text-4xl animate-spin text-primary mb-4">
            sync
          </div>
          <p className="text-neutral-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // No projects state
  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Projects Found</h2>
              <p className="text-neutral-600 mb-4">
                You don't have any security projects yet. Create your first project to get started.
              </p>
              <Link href="/projects/new">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center mx-auto">
                  <span className="material-icons mr-1">add</span>
                  Create New Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If currentProject is not set but we have projects, this should not happen
  // due to the useEffect, but let's handle it anyway
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select a Project</h2>
              <p className="text-neutral-600 mb-4">
                Please select a project to continue.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md mx-auto">
                  View Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Project dashboard with configuration and equipment tabs
  return (
    <>
      <ProjectDashboard project={currentProject} />
      <ProjectConfiguration 
        project={currentProject}
        onProjectUpdate={setCurrentProject}
      />
      <EquipmentTabs project={currentProject} />
    </>
  );
}
