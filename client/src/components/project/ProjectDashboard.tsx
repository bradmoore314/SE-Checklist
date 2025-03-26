import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface ProjectDashboardProps {
  project: Project;
}

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [progressValue, setProgressValue] = useState(0);
  
  // Simulate progress loading animation
  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(65), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch project summary from API
  const { data: summary, isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/reports/project-summary`],
    enabled: !!project.id,
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
        <div className="flex">
          <button className="text-neutral-500 hover:text-primary focus:outline-none mr-2 bg-white p-2 rounded-md border border-neutral-200">
            <span className="material-icons">edit</span>
          </button>
          <button className="text-neutral-500 hover:text-primary focus:outline-none mr-2 bg-white p-2 rounded-md border border-neutral-200">
            <span className="material-icons">share</span>
          </button>
          <button className="text-neutral-500 hover:text-primary focus:outline-none bg-white p-2 rounded-md border border-neutral-200">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-neutral-600 mb-1">Project Status</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-primary">In Progress</div>
              <div className="text-sm text-neutral-500">Updated {formatDate(project.updated_at)}</div>
            </div>
            <div className="mt-4">
              <Progress value={progressValue} className="h-2.5" />
              <div className="text-sm text-neutral-500 mt-1">{progressValue}% Complete</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-neutral-600 mb-1">Equipment Summary</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-4xl font-bold text-primary-dark">
                  {isLoading ? "..." : summary?.summary.accessPointCount || 0}
                </div>
                <div className="text-sm text-neutral-500">Access Points</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-light">
                  {isLoading ? "..." : summary?.summary.cameraCount || 0}
                </div>
                <div className="text-sm text-neutral-500">Cameras</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary">
                  {isLoading ? "..." : summary?.summary.elevatorCount || 0}
                </div>
                <div className="text-sm text-neutral-500">Elevators</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary-light">
                  {isLoading ? "..." : summary?.summary.intercomCount || 0}
                </div>
                <div className="text-sm text-neutral-500">Intercoms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-neutral-600 mb-1">Project Details</div>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <div className="text-sm text-neutral-500">SE Name:</div>
                <div className="text-sm font-medium">{project.se_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-neutral-500">BDM Name:</div>
                <div className="text-sm font-medium">{project.bdm_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-neutral-500">Site Address:</div>
                <div className="text-sm font-medium">{project.site_address || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-neutral-500">Created Date:</div>
                <div className="text-sm font-medium">{formatDate(project.created_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Return date in format: "March 15, 2023"
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
