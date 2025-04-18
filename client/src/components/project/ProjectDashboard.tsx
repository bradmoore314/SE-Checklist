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
import { Link } from "wouter";

interface SiteWalkDashboardProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export default function ProjectDashboard({ project, onProjectUpdate }: SiteWalkDashboardProps) {
  const [progressValue, setProgressValue] = useState(project.progress_percentage || 0);
  const [progressNotes, setProgressNotes] = useState(project.progress_notes || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    se_name: project.se_name || "",
    bdm_name: project.bdm_name || "",
    site_address: project.site_address || ""
  });
  const { toast } = useToast();
  
  // Update progress value when project changes
  useEffect(() => {
    setProgressValue(project.progress_percentage || 0);
    setProgressNotes(project.progress_notes || "");
  }, [project]);

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
      interiorAccessPointCount: number;
      perimeterAccessPointCount: number;
      cameraCount: number;
      indoorCameraCount: number;
      outdoorCameraCount: number;
      elevatorCount: number;
      elevatorBankCount: number;
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
    // Refetch on window focus and every 2 seconds to ensure up-to-date data
    refetchOnWindowFocus: true,
    refetchInterval: 2000,
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
        <div className="flex items-center">
          <Link href={`/projects/${project.id}/floorplans`}>
            <Button variant="outline" className="mr-3 flex items-center gap-1">
              <span className="material-icons text-base">map</span>
              <span>View Floorplans</span>
            </Button>
          </Link>
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
            <div className="text-gray-700 font-medium mb-1">Activity Status</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold" style={{ color: 'var(--red-accent)' }}>
                {progressValue < 25 ? "Just Started" : 
                 progressValue < 50 ? "In Progress" : 
                 progressValue < 75 ? "Almost Done" : 
                 progressValue < 100 ? "Final Review" : "Complete"}
              </div>
              <div className="text-sm text-gray-500">Updated {formatDate(project.updated_at)}</div>
            </div>
            <div className="mt-4">
              <label htmlFor="progress-slider" className="text-sm font-medium text-gray-700 mb-2 block">
                Progress: {progressValue}%
              </label>
              <div className="relative pt-1 w-full">
                <div className="overflow-hidden h-2.5 mb-1 text-xs flex rounded-lg bg-gray-200">
                  <div 
                    style={{ 
                      width: `${progressValue}%`,
                      backgroundColor: 'var(--red-accent)'
                    }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-lg transition-all duration-300"
                  ></div>
                </div>
                <input 
                  id="progress-slider"
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={progressValue} 
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setProgressValue(newValue);
                    // Update the project with the new progress value
                    updateSiteWalkMutation.mutate({ progress_percentage: newValue });
                  }}
                  className="w-full h-2.5 absolute top-1 appearance-none cursor-pointer opacity-0"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="progress-notes" className="text-sm font-medium text-gray-700 mb-2 block">
                Progress Notes
              </label>
              <textarea
                id="progress-notes"
                value={progressNotes}
                onChange={(e) => {
                  setProgressNotes(e.target.value);
                }}
                onBlur={() => {
                  // Only update when user finishes editing
                  if (progressNotes !== project.progress_notes) {
                    updateSiteWalkMutation.mutate({ progress_notes: progressNotes });
                  }
                }}
                placeholder="Add notes about the current status..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              />
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
                <div className="text-xs text-gray-500 mt-1">
                  Interior: {isLoading ? "..." : summaryData?.summary?.interiorAccessPointCount || 0} | 
                  Perimeter: {isLoading ? "..." : summaryData?.summary?.perimeterAccessPointCount || 0}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.cameraCount || 0}
                </div>
                <div className="text-sm text-gray-600">Cameras</div>
                <div className="text-xs text-gray-500 mt-1">
                  Indoor: {isLoading ? "..." : summaryData?.summary?.indoorCameraCount || 0} | 
                  Outdoor: {isLoading ? "..." : summaryData?.summary?.outdoorCameraCount || 0}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.elevatorCount || 0}
                </div>
                <div className="text-sm text-gray-600">Elevators</div>
                <div className="text-xs text-gray-500 mt-1">
                  Total Banks: {isLoading ? "..." : summaryData?.summary?.elevatorBankCount || 0}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--red-accent)' }}>
                  {isLoading ? "..." : summaryData?.summary?.intercomCount || 0}
                </div>
                <div className="text-sm text-gray-600">Intercoms</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <label htmlFor="equipment-notes" className="text-sm font-medium text-gray-700 mb-2 block">
                Equipment Notes
              </label>
              <textarea
                id="equipment-notes"
                value={project.equipment_notes || ""}
                onChange={(e) => {
                  updateSiteWalkMutation.mutate({ equipment_notes: e.target.value });
                }}
                placeholder="Add notes about equipment..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-gray-700 font-medium mb-1">Scope Info</div>
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
                <div className="text-sm text-gray-600">Building Count:</div>
                <div className="text-sm font-medium text-gray-800">{project.building_count || 1}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">Created Date:</div>
                <div className="text-sm font-medium text-gray-800">{formatDate(project.created_at)}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <label htmlFor="scope-notes" className="text-sm font-medium text-gray-700 mb-2 block">
                Scope Notes
              </label>
              <textarea
                id="scope-notes"
                value={project.scope_notes || ""}
                onChange={(e) => {
                  updateSiteWalkMutation.mutate({ scope_notes: e.target.value });
                }}
                placeholder="Add notes about the scope..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              />
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
