import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { useProject } from "@/context/ProjectContext";
import { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Star, 
  Search, 
  Plus, 
  Loader2, 
  FolderOpen, 
  Trash2,
  LayoutGrid,
  List,
  User,
  Users,
  Filter,
  X
} from "lucide-react";
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
import { AutoDisabledForm } from "@/components/ui/auto-disabled-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    refreshProjects,
    currentProject
  } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewSiteWalkModal, setShowNewSiteWalkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("mine");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSeFilter, setSelectedSeFilter] = useState<string>("");
  
  // Function to prefetch floorplans for a project
  const prefetchFloorplans = (projectId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/projects', projectId, 'floorplans'],
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
        return await res.json();
      }
    });
  };

  // Preload floorplans for all projects when the page loads
  useEffect(() => {
    // Explicitly trigger a refetch of projects to ensure we have the latest data
    refreshProjects();
    
    // Also prefetch the projects data again using the query client
    queryClient.prefetchQuery({
      queryKey: ['/api/projects'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/projects');
        return await res.json();
      }
    });
    
    // Set a short timeout to ensure we have projects data before proceeding
    const timer = setTimeout(() => {
      if (allProjects && allProjects.length > 0) {
        // If we have a current project, prefetch its floorplans first
        if (currentProject) {
          prefetchFloorplans(currentProject.id);
        }
        
        // Then prefetch all projects to ensure they're loaded (we'll optimize later if needed)
        allProjects.forEach(project => {
          if (!currentProject || project.id !== currentProject.id) {
            prefetchFloorplans(project.id);
          }
        });
      }
    }, 100); // Short delay to ensure projects are loaded
    
    return () => clearTimeout(timer);
  }, [allProjects, currentProject, queryClient, refreshProjects]);
  
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
      
      // Set as current site walk and navigate to the dashboard
      setCurrentSiteWalk(newSiteWalk);
      setCurrentProject(newSiteWalk);
      setLocation(`/projects/${newSiteWalk.id}/dashboard`);
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
    // First prefetch floorplans for this project to ensure they're in the cache
    prefetchFloorplans(siteWalk.id);
    
    // Then set it as current project and navigate to the project details page
    setCurrentSiteWalk(siteWalk);
    setCurrentProject(siteWalk);
    setLocation(`/projects/${siteWalk.id}/dashboard`);
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

  // Get the current user from context
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  });
  
  // Full list of Sales Engineers
  const allSalesEngineers = [
    "Akon Ambe",
    "Alvin Thompson",
    "Brad Moore",
    "Brad To",
    "Bryan Lane",
    "Eric Muhlitner",
    "Ilya Dobrydnev",
    "Jacob Wilder",
    "Jeremy Thomas",
    "Joe Stine",
    "John Proutsos",
    "John Young",
    "Kevin Myers",
    "Kevin Purcell",
    "Max Globin",
    "Osiel Martinez",
    "Patrick Rose",
    "Rebeca Strasburger",
    "Stanley Bromberek",
    "Tony Cook"
  ].sort();
  
  // For backward compatibility, also include any SEs in existing projects that might not be in the list above
  const seNames = [...allSalesEngineers];
  
  // Add any SEs from projects that might not be in our predefined list
  allProjects
    .filter(p => p.se_name && !allSalesEngineers.includes(p.se_name as string))
    .forEach(p => {
      if (p.se_name && !seNames.includes(p.se_name as string)) {
        seNames.push(p.se_name as string);
      }
    });
  
  // Sort the final list
  seNames.sort();
  
  // Filter projects based on search term, active tab, and SE filter
  const filteredProjects = allProjects.filter((project: Project & {creator_name?: string}) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.site_address && project.site_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.creator_name && project.creator_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if project matches SE filter (if one is selected)
    const matchesSeFilter = !selectedSeFilter || 
      (project.se_name && project.se_name === selectedSeFilter);
    
    // Combined search and SE filter match
    const matchesFilters = matchesSearch && matchesSeFilter;
    
    // For "all" tab, return all projects that match search and filters
    if (activeTab === "all") {
      return matchesFilters;
    }
    
    // For "mine" tab, show only projects owned or collaborated on by the current user
    if (activeTab === "mine") {
      // The backend has already filtered projects to only show those the user has access to
      // but we double-check here just in case of any frontend-only filtering
      // We'll also consider recently created projects as the user's
      // This is a temporary solution until we have proper ownership tracking in the frontend
      const isRecentlyCreated = project.created_at && 
        new Date(project.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      // For now, we'll just trust that the backend is returning only projects the user has access to
      return matchesFilters && (true || isRecentlyCreated); // Always true; backend should handle access control
    }
    
    // For "pinned" tab, show only pinned projects
    if (activeTab === "pinned") {
      return matchesFilters && pinnedProjects.some(p => p.id === project.id);
    }
    
    // For "active" tab, show projects with active status (here we're just simulating)
    // In a real app, this would be based on a real status field
    if (activeTab === "active") {
      return matchesFilters && !project.name.toLowerCase().includes("completed");
    }
    
    // For "completed" tab, show completed projects
    if (activeTab === "completed") {
      return matchesFilters && project.name.toLowerCase().includes("completed");
    }
    
    return matchesFilters;
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
            <TabsTrigger value="mine" className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              Mine
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`${viewMode === 'grid' ? 'bg-background shadow-sm' : ''} rounded-md px-2 py-1`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${viewMode === 'list' ? 'bg-background shadow-sm' : ''} rounded-md px-2 py-1`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* SE Name Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-1 ${selectedSeFilter ? 'border-primary text-primary' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
                {selectedSeFilter ? `SE: ${selectedSeFilter}` : "Filter by SE"}
                {selectedSeFilter && (
                  <X 
                    className="h-3.5 w-3.5 ml-1 hover:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeFilter("");
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sales Engineer</h4>
                {seNames.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {seNames.map((name) => (
                      <Button
                        key={name}
                        variant={selectedSeFilter === name ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setSelectedSeFilter(name);
                        }}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No Sales Engineers assigned to projects</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
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
        viewMode === "grid" ? (
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
                    {(project as any).creator_name && (
                      <div className="mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Created by: {(project as any).creator_name}</span>
                      </div>
                    )}
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
        ) : (
          <div className="space-y-3">
            <div className="bg-muted rounded-md p-3 hidden md:grid grid-cols-12 font-medium text-sm">
              <div className="col-span-3">Project Name</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Creator</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {filteredProjects.map((project: Project) => (
              <Card key={project.id} className="overflow-hidden">
                <div 
                  className="grid md:grid-cols-12 gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => selectSiteWalk(project)}
                >
                  <div className="md:col-span-3 flex items-center">
                    <div className="font-medium">{project.name}</div>
                    {isPinned(project.id) && (
                      <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  
                  <div className="md:col-span-2 text-muted-foreground hidden md:block">
                    {project.client || '—'}
                  </div>
                  
                  <div className="md:col-span-2 text-muted-foreground hidden md:block">
                    {project.site_address || '—'}
                  </div>
                  
                  <div className="md:col-span-2 text-muted-foreground hidden md:block">
                    {formatDate(project.created_at)}
                  </div>
                  
                  <div className="md:col-span-2 text-muted-foreground hidden md:block">
                    {(project as any).creator_name || '—'}
                  </div>
                  
                  {/* Mobile-only details */}
                  <div className="md:hidden text-sm text-muted-foreground">
                    <div>{project.client && `Client: ${project.client}`}</div>
                    <div>{project.site_address && `Location: ${project.site_address}`}</div>
                    <div>Created: {formatDate(project.created_at)}</div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>By: {(project as any).creator_name || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-1 flex justify-end md:justify-end items-center">
                    <div className="flex space-x-1">
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
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* New Site Walk Modal */}
      <Dialog open={showNewSiteWalkModal} onOpenChange={setShowNewSiteWalkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              Create New Site Walk
            </DialogTitle>
          </DialogHeader>

          <AutoDisabledForm {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
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
                      <AddressAutocomplete 
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter site address"
                      />
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
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...field}
                        >
                          <option value="">Select SE Name</option>
                          {allSalesEngineers.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
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
          </AutoDisabledForm>
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
