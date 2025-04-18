import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { useProject } from "@/context/ProjectContext";
import { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Star, Search, Plus, Loader2, FolderOpen, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Create schema for new site walk form
const projectSchema = z.object({
  name: z.string().min(1, "Site walk name is required"),
  client: z.string().optional(),
  site_address: z.string().optional(),
  se_name: z.string().optional(),
  bdm_name: z.string().optional(),
  building_count: z.number().optional(),
});

type SiteWalkFormValues = z.infer<typeof projectSchema>;

export default function Projects() {
  const [, setLocation] = useLocation();
  const { setCurrentSiteWalk } = useSiteWalk();
  const { 
    setCurrentProject, 
    allProjects, 
    isLoadingProjects, 
    pinnedProjects,
    pinProject,
    unpinProject,
    refreshProjects
  } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewSiteWalkModal, setShowNewSiteWalkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Listen for custom event to open create project dialog
  useEffect(() => {
    const handleCreateProject = () => {
      setShowNewSiteWalkModal(true);
    };
    
    document.addEventListener("create-project", handleCreateProject);
    
    return () => {
      document.removeEventListener("create-project", handleCreateProject);
    };
  }, []);

  // Initialize form with default values
  const form = useForm<SiteWalkFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      client: "",
      site_address: "",
      se_name: "",
      bdm_name: "",
      building_count: 1,
    },
  });

  // Handle creating a new site walk
  const onSubmit = async (values: SiteWalkFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/projects", values);
      const newSiteWalk = await response.json();
      
      // Close modal
      setShowNewSiteWalkModal(false);
      
      // Reset form
      form.reset();
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      refreshProjects();
      
      // Show success toast
      toast({
        title: "Site Walk Created",
        description: `Site Walk "${newSiteWalk.name}" has been created successfully.`,
      });
      
      // Set as current site walk and navigate to dashboard
      setCurrentSiteWalk(newSiteWalk);
      setCurrentProject(newSiteWalk);
      setLocation("/");
    } catch (error) {
      toast({
        title: "Site Walk Creation Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle selecting a site walk
  const selectSiteWalk = (siteWalk: Project) => {
    setCurrentSiteWalk(siteWalk);
    setCurrentProject(siteWalk);
    setLocation("/");
  };
  
  // Toggle pinning/unpinning a project
  const togglePinned = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    
    if (pinnedProjects.some(p => p.id === project.id)) {
      unpinProject(project.id);
    } else {
      pinProject(project);
    }
  };

  // Handle deleting a site walk
  const deleteSiteWalk = async (e: React.MouseEvent, siteWalk: Project) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${siteWalk.name}"?`)) {
      try {
        await apiRequest("DELETE", `/api/projects/${siteWalk.id}`);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        refreshProjects();
        
        // Show success toast
        toast({
          title: "Site Walk Deleted",
          description: `Site Walk "${siteWalk.name}" has been deleted.`,
        });
      } catch (error) {
        toast({
          title: "Deletion Failed",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  // Filter projects based on search term and active tab
  const filteredProjects = allProjects.filter((project: Project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.site_address && project.site_address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If tab is "all", return all projects that match search
    if (activeTab === "all") {
      return matchesSearch;
    }
    
    // For "pinned" tab, show only pinned projects
    if (activeTab === "pinned") {
      return matchesSearch && pinnedProjects.some(p => p.id === project.id);
    }
    
    // For "active" tab, show projects with active status (here we're just simulating)
    // In a real app, this would be based on a real status field
    if (activeTab === "active") {
      return matchesSearch && !project.name.toLowerCase().includes("completed");
    }
    
    // For "completed" tab, show completed projects
    if (activeTab === "completed") {
      return matchesSearch && project.name.toLowerCase().includes("completed");
    }
    
    return matchesSearch;
  });
  
  // Check if a project is pinned
  const isPinned = (projectId: number) => pinnedProjects.some(p => p.id === projectId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Site Walks</h2>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setShowNewSiteWalkModal(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Site Walk
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search site walks"
            className="pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4 mx-auto" />
            <p className="text-neutral-600">Loading site walks...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <FolderOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Site Walks Found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? "No site walks match your search criteria."
                : activeTab !== "all"
                  ? `You don't have any site walks in the "${activeTab}" category.`
                  : "You haven't created any site walks yet."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mx-auto"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => selectSiteWalk(project)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={isPinned(project.id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}
                      onClick={(e) => togglePinned(e, project)}
                      title={isPinned(project.id) ? "Unpin project" : "Pin project"}
                    >
                      <Star className={`h-4 w-4 ${isPinned(project.id) ? "fill-yellow-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative group"
                      title="AI Review"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setLocation(`/projects/${project.id}/quote-review`);
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-1.5 rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all">
                        <span className="material-icons text-sm">auto_awesome</span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-500"
                      title="Delete"
                      onClick={(e) => deleteSiteWalk(e, project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-neutral-500 mb-4">
                  {project.client && (
                    <div className="mb-1 truncate" title={project.client}>
                      Client: {project.client}
                    </div>
                  )}
                  {project.site_address && (
                    <div className="mb-1 truncate" title={project.site_address}>
                      Location: {project.site_address}
                    </div>
                  )}
                  <div className="mb-1">
                    Created: {formatDate(project.created_at)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.replace_readers && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Replace Readers
                    </span>
                  )}
                  {project.pull_wire && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Pull Wire
                    </span>
                  )}
                  {project.install_locks && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Install Locks
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Site Walk Modal */}
      <Dialog open={showNewSiteWalkModal} onOpenChange={setShowNewSiteWalkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              Create New Site Walk
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Site Walk Name *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site walk name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Client
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="site_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Site Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="se_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        SE Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SE name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bdm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        BDM Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter BDM name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="building_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Building Count
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewSiteWalkModal(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  Create Site Walk
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
