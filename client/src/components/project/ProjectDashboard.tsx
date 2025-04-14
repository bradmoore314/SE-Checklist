import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface SiteWalkDashboardProps {
  project: Project;
}

export default function ProjectDashboard({ project }: SiteWalkDashboardProps) {
  const [progressValue, setProgressValue] = useState(0);
  
  // Simulate progress loading animation
  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(65), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch site walk summary from API
  const { data: summaryData, isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/reports/project-summary`],
    enabled: !!project.id,
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Site Walk Dashboard</h2>
        <div className="flex">
          <button className="text-white hover:text-white focus:outline-none mr-2 p-2 rounded-md border" 
                  style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
            <span className="material-icons">edit</span>
          </button>
          <button className="text-white hover:text-white focus:outline-none mr-2 p-2 rounded-md border" 
                  style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
            <span className="material-icons">share</span>
          </button>
          <button className="text-white hover:text-white focus:outline-none p-2 rounded-md border" 
                  style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Site Walk Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border rounded-lg shadow-sm" 
              style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
          <CardContent className="p-6">
            <div className="text-white mb-1">Site Walk Status</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold" style={{ color: 'var(--red-accent)' }}>In Progress</div>
              <div className="text-sm text-gray-400">Updated {formatDate(project.updated_at)}</div>
            </div>
            <div className="mt-4">
              <Progress value={progressValue} className="h-2.5" 
                        style={{ backgroundColor: 'var(--medium-grey)' }} />
              <div className="text-sm text-gray-400 mt-1">{progressValue}% Complete</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border rounded-lg shadow-sm" 
              style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
          <CardContent className="p-6">
            <div className="text-white mb-1">Equipment Summary</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-4xl font-bold text-white">
                  {isLoading ? "..." : summaryData?.summary?.accessPointCount || 0}
                </div>
                <div className="text-sm text-gray-400">Access Points</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  {isLoading ? "..." : summaryData?.summary?.cameraCount || 0}
                </div>
                <div className="text-sm text-gray-400">Cameras</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  {isLoading ? "..." : summaryData?.summary?.elevatorCount || 0}
                </div>
                <div className="text-sm text-gray-400">Elevators</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  {isLoading ? "..." : summaryData?.summary?.intercomCount || 0}
                </div>
                <div className="text-sm text-gray-400">Intercoms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border rounded-lg shadow-sm" 
              style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}>
          <CardContent className="p-6">
            <div className="text-white mb-1">Site Walk Details</div>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">SE Name:</div>
                <div className="text-sm font-medium text-white">{project.se_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">BDM Name:</div>
                <div className="text-sm font-medium text-white">{project.bdm_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">Site Address:</div>
                <div className="text-sm font-medium text-white">{project.site_address || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">Created Date:</div>
                <div className="text-sm font-medium text-white">{formatDate(project.created_at)}</div>
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
