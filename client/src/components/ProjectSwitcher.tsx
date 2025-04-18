import { useState } from "react";
import { Project } from "@shared/schema";
import { useProject } from "@/context/ProjectContext";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, Pin, PinOff, Clock, Star, Search, Plus, Folder, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectSwitcher() {
  const { currentProject, setCurrentProject, pinnedProjects, recentProjects, allProjects, pinProject, unpinProject } = useProject();
  const { setCurrentSiteWalk } = useSiteWalk();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Function to select a project
  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentSiteWalk(project);
    setIsOpen(false);
  };

  // Function to handle pinning/unpinning a project
  const togglePin = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    
    if (pinnedProjects.some(p => p.id === project.id)) {
      unpinProject(project.id);
    } else {
      pinProject(project);
    }
  };

  // Filter projects based on search term and active tab
  const getFilteredProjects = () => {
    const filtered = allProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.site_address && project.site_address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "pinned") return matchesSearch && pinnedProjects.some(p => p.id === project.id);
      if (activeTab === "recent") return matchesSearch && recentProjects.some(p => p.id === project.id);
      
      return matchesSearch;
    });

    return filtered;
  };

  // Check if a project is pinned
  const isPinned = (projectId: number) => pinnedProjects.some(p => p.id === projectId);
  
  // Function to go to projects page
  const goToProjects = () => {
    setLocation("/projects");
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-[200px] sm:w-[260px] gap-2 px-3 py-5"
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="truncate font-medium">
                {currentProject ? currentProject.name : "Select Project"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-[300px]">
          <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {pinnedProjects.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Pin className="h-3 w-3" /> Pinned Projects
                </DropdownMenuLabel>
                {pinnedProjects.slice(0, 5).map(project => (
                  <DropdownMenuItem 
                    key={`pinned-${project.id}`}
                    onClick={() => selectProject(project)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate flex items-center gap-1">
                      {currentProject?.id === project.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className={currentProject?.id === project.id ? "font-medium" : ""}>
                        {project.name}
                      </span>
                    </div>
                    <PinOff 
                      className="h-4 w-4 opacity-70 hover:opacity-100" 
                      onClick={(e) => togglePin(e, project)}
                    />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            
            {recentProjects.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Recent Projects
                </DropdownMenuLabel>
                {recentProjects.slice(0, 5).map(project => (
                  <DropdownMenuItem 
                    key={`recent-${project.id}`}
                    onClick={() => selectProject(project)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate flex items-center gap-1">
                      {currentProject?.id === project.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className={currentProject?.id === project.id ? "font-medium" : ""}>
                        {project.name}
                      </span>
                    </div>
                    {!isPinned(project.id) ? (
                      <Pin 
                        className="h-4 w-4 opacity-70 hover:opacity-100" 
                        onClick={(e) => togglePin(e, project)}
                      />
                    ) : (
                      <PinOff 
                        className="h-4 w-4 opacity-70 hover:opacity-100" 
                        onClick={(e) => togglePin(e, project)}
                      />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuItem 
            className="cursor-pointer flex gap-1 items-center" 
            onClick={() => setProjectModalOpen(true)}
          >
            <Search className="h-4 w-4 mr-1" />
            Search All Projects
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer flex gap-1 items-center" 
            onClick={goToProjects}
          >
            <ListFilter className="h-4 w-4 mr-1" />
            Manage Projects
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer flex gap-1 items-center" 
            onClick={() => {
              setLocation("/projects");
              setIsOpen(false);
              // Use a small delay to allow the page to change before showing the create dialog
              setTimeout(() => document.dispatchEvent(new CustomEvent("create-project")), 100);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Full Project Browser Modal */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium mb-4">
              Project Browser
            </DialogTitle>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pinned">Pinned</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-2">
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getFilteredProjects().map(project => (
                  <div
                    key={`modal-${project.id}`}
                    className={`p-3 rounded-lg border cursor-pointer flex flex-col 
                      ${currentProject?.id === project.id ? 'border-primary/50 bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => {
                      selectProject(project);
                      setProjectModalOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate flex-1" title={project.name}>
                        {project.name}
                      </h3>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => togglePin(e, project)}
                        title={isPinned(project.id) ? "Unpin project" : "Pin project"}
                      >
                        {isPinned(project.id) ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-1 text-sm text-muted-foreground">
                      {project.client && (
                        <div className="truncate" title={project.client}>
                          {project.client}
                        </div>
                      )}
                      {project.site_address && (
                        <div className="truncate" title={project.site_address}>
                          {project.site_address}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getFilteredProjects().length === 0 && (
                  <div className="col-span-2 py-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No projects match your search' : 'No projects available'}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProjectModalOpen(false);
                setLocation("/projects");
              }}
            >
              Manage All Projects
            </Button>
            <Button
              onClick={() => {
                setProjectModalOpen(false);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}