import { useEffect, useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { Project } from "@shared/schema";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import ProjectConfiguration from "@/components/project/ProjectConfiguration";
import EquipmentTabs from "@/components/equipment/EquipmentTabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { AlertTriangle, Plus, Clock, Pin, Star, Search, FileText, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const { 
    currentProject, 
    setCurrentProject, 
    allProjects, 
    isLoadingProjects, 
    pinnedProjects, 
    recentProjects,
    pinProject,
    unpinProject
  } = useProject();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Keep the site walk context in sync with the project context
  useEffect(() => {
    if (currentProject && (!currentSiteWalk || currentSiteWalk.id !== currentProject.id)) {
      setCurrentSiteWalk(currentProject);
    }
  }, [currentProject, currentSiteWalk, setCurrentSiteWalk]);
  
  // If current site walk is not set, use the first one from the list
  useEffect(() => {
    if (!currentSiteWalk && allProjects && allProjects.length > 0) {
      setCurrentSiteWalk(allProjects[0]);
      setCurrentProject(allProjects[0]);
    }
  }, [currentSiteWalk, allProjects, setCurrentSiteWalk, setCurrentProject]);

  // Handle selecting a project
  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentSiteWalk(project);
  };
  
  // Toggle pinning/unpinning a project
  const togglePinned = (project: Project) => {
    if (pinnedProjects.some(p => p.id === project.id)) {
      unpinProject(project.id);
    } else {
      pinProject(project);
    }
  };

  // Loading state
  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="material-icons text-4xl animate-spin text-primary mb-4">
            sync
          </div>
          <p className="text-neutral-600">Loading site walks...</p>
        </div>
      </div>
    );
  }

  // No site walks state
  if (!allProjects || allProjects.length === 0) {
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
                  <Plus className="mr-1 h-4 w-4" />
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

  // When a project is selected, show the project dashboard with configuration and overview tabs
  if (currentSiteWalk) {
    return (
      <>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="overview">Project Overview</TabsTrigger>
              <TabsTrigger value="projects">All Projects</TabsTrigger>
            </TabsList>
            <Button 
              onClick={() => setLocation("/projects")}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              <span>Manage Site Walks</span>
            </Button>
          </div>

          <TabsContent value="overview" className="m-0">
            <ProjectDashboard 
              project={currentSiteWalk} 
              onProjectUpdate={(updated) => {
                setCurrentSiteWalk(updated);
                setCurrentProject(updated);
              }} 
            />
            <ProjectConfiguration 
              project={currentSiteWalk}
              onProjectUpdate={(updated) => {
                setCurrentSiteWalk(updated);
                setCurrentProject(updated);
              }}
            />
            <EquipmentTabs project={currentSiteWalk} />
          </TabsContent>

          <TabsContent value="projects" className="m-0">
            <div className="space-y-8">
              {/* Pinned Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Pinned Site Walks
                  </h2>
                </div>
                
                {pinnedProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="py-6">
                        <p className="text-neutral-500 mb-4">
                          You don't have any pinned site walks yet.
                        </p>
                        <p className="text-sm text-neutral-400">
                          Pin your important site walks for quick access by clicking the star icon.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pinnedProjects.map(project => (
                      <Card 
                        key={`pinned-${project.id}`}
                        className={`hover:shadow-md transition-shadow cursor-pointer ${
                          currentSiteWalk.id === project.id ? 'border-primary' : ''
                        }`}
                        onClick={() => selectProject(project)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium truncate" title={project.name}>
                              {project.name}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-yellow-500 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinned(project);
                              }}
                            >
                              <Star className="h-5 w-5 fill-yellow-500" />
                            </Button>
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
              </div>

              {/* Recent Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Site Walks
                  </h2>
                </div>
                
                {recentProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="py-6">
                        <p className="text-neutral-500">
                          You haven't accessed any site walks recently.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentProjects.map(project => (
                      <Card 
                        key={`recent-${project.id}`}
                        className={`hover:shadow-md transition-shadow cursor-pointer ${
                          currentSiteWalk.id === project.id ? 'border-primary' : ''
                        }`}
                        onClick={() => selectProject(project)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium truncate" title={project.name}>
                              {project.name}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-neutral-400 hover:text-yellow-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePinned(project);
                              }}
                            >
                              {pinnedProjects.some(p => p.id === project.id) ? (
                                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <Star className="h-5 w-5" />
                              )}
                            </Button>
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
              </div>
              
              {/* Quick Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5 text-emerald-500" />
                        Create New Site Walk
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pb-3">
                      Start a new security site walk assessment with client and location information.
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => setLocation("/projects")}
                      >
                        <Plus className="mr-2 h-4 w-4" /> New Site Walk
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Generate Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pb-3">
                      Create door schedules, camera layouts, and full site walk summary reports.
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setLocation("/project-summary")}>
                        View Reports <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5 text-purple-500" />
                        Browse All Site Walks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pb-3">
                      View and manage all your existing site walks in one place.
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setLocation("/projects")}>
                        Manage Site Walks <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  }

  // Fallback in case none of the above conditions are met
  return null;
}
