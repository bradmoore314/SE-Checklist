import { Project } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SiteWalkDashboardProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export default function ProjectDashboard({ project, onProjectUpdate }: SiteWalkDashboardProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    se_name: project.se_name || "",
    bdm_name: project.bdm_name || "",
    site_address: project.site_address || ""
  });
  const { toast } = useToast();
  
  // Simulate progress loading animation
  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(65), 300);
    return () => clearTimeout(timer);
  }, []);

  // Update the edit form when the project changes
  useEffect(() => {
    setEditForm({
      name: project.name,
      se_name: project.se_name || "",
      bdm_name: project.bdm_name || "",
      site_address: project.site_address || ""
    });
  }, [project]);

  // Define an interface for the summary data
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
  
  // Mutation to update the site walk
  const updateSiteWalkMutation = useMutation({
    mutationFn: async (updatedData: Partial<Project>) => {
      const response = await apiRequest("PUT", `/api/projects/${project.id}`, updatedData);
      return await response.json();
    },
    onSuccess: (updatedProject: Project) => {
      // Update the project in the context
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      // Show success toast
      toast({
        title: "Site Walk Updated",
        description: "Site walk details have been successfully updated.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      // Close modal
      setShowEditModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch site walk summary from API
  const { data: summaryData, isLoading } = useQuery<SiteSummary>({
    queryKey: [`/api/projects/${project.id}/reports/project-summary`],
    enabled: !!project.id,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteWalkMutation.mutate(editForm);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Site Walk Dashboard</h2>
        <div className="flex">
          <button className="text-gray-600 hover:bg-gray-100 focus:outline-none mr-2 p-2 rounded-md border" 
                  style={{ borderColor: 'var(--medium-grey)' }}
                  onClick={() => setShowEditModal(true)}>
            <span className="material-icons">edit</span>
          </button>
          <button className="text-gray-600 hover:bg-gray-100 focus:outline-none mr-2 p-2 rounded-md border" 
                  style={{ borderColor: 'var(--medium-grey)' }}>
            <span className="material-icons">share</span>
          </button>
          <button className="text-gray-600 hover:bg-gray-100 focus:outline-none p-2 rounded-md border" 
                  style={{ borderColor: 'var(--medium-grey)' }}>
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Edit Site Walk Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              Edit Site Walk Details
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                Site Walk Name
              </Label>
              <Input 
                id="name" 
                name="name" 
                value={editForm.name} 
                onChange={handleInputChange} 
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="se_name" className="text-sm font-medium text-neutral-700">
                SE Name
              </Label>
              <Input 
                id="se_name" 
                name="se_name" 
                value={editForm.se_name} 
                onChange={handleInputChange} 
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bdm_name" className="text-sm font-medium text-neutral-700">
                BDM Name
              </Label>
              <Input 
                id="bdm_name" 
                name="bdm_name" 
                value={editForm.bdm_name} 
                onChange={handleInputChange} 
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_address" className="text-sm font-medium text-neutral-700">
                Site Address
              </Label>
              <Input 
                id="site_address" 
                name="site_address" 
                value={editForm.site_address} 
                onChange={handleInputChange} 
                className="w-full"
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={updateSiteWalkMutation.isPending}
              >
                {updateSiteWalkMutation.isPending ? "Updating..." : "Update Site Walk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Site Walk Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-gray-700 font-medium mb-1">Site Walk Status</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold" style={{ color: 'var(--red-accent)' }}>In Progress</div>
              <div className="text-sm text-gray-500">Updated {formatDate(project.updated_at)}</div>
            </div>
            <div className="mt-4">
              <Progress value={progressValue} className="h-2.5" 
                        style={{ backgroundColor: 'var(--medium-grey)' }} />
              <div className="text-sm text-gray-500 mt-1">{progressValue}% Complete</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-gray-700 font-medium mb-1">Equipment Summary</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.accessPointCount || 0}
                </div>
                <div className="text-sm text-gray-600">Access Points</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.cameraCount || 0}
                </div>
                <div className="text-sm text-gray-600">Cameras</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.elevatorCount || 0}
                </div>
                <div className="text-sm text-gray-600">Elevators</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.intercomCount || 0}
                </div>
                <div className="text-sm text-gray-600">Intercoms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-gray-700 font-medium mb-1">Site Walk Details</div>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">SE Name:</div>
                <div className="text-sm font-medium text-gray-800">{project.se_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">BDM Name:</div>
                <div className="text-sm font-medium text-gray-800">{project.bdm_name || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">Site Address:</div>
                <div className="text-sm font-medium text-gray-800">{project.site_address || "Not specified"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">Created Date:</div>
                <div className="text-sm font-medium text-gray-800">{formatDate(project.created_at)}</div>
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
