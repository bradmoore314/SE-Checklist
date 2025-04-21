import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { Project } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function FloorplansPage() {
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const { toast } = useToast();

  // Fetch all projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    select: (data) => {
      // Sort projects by creation date
      return [...data].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime(); // newest first
      });
    }
  });

  return (
    <div className="container mx-auto py-6 max-w-screen-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            Floorplans
          </h1>
          <p className="text-muted-foreground">
            View and manage all floorplans across your site walks
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/projects">
            <Button variant="outline">
              View All Site Walks
            </Button>
          </Link>
          
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Site Walk
            </Button>
          </Link>
        </div>
      </div>
      
      {currentSiteWalk ? (
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <span className="material-icons mr-2 text-green-600">check_circle</span>
              Current Site Walk
            </CardTitle>
            <CardDescription>
              You are currently working with the site walk below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">{currentSiteWalk.name}</p>
                <p className="text-sm text-muted-foreground">{currentSiteWalk.site_address || 'No address specified'}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/projects/${currentSiteWalk.id}/floorplans`}>
                  <Button variant="default">
                    View Floorplans
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentSiteWalk(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <span className="material-icons mr-2 text-amber-600">info</span>
              No Site Walk Selected
            </CardTitle>
            <CardDescription>
              Select a site walk below to view and manage its floorplans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You need to select a site walk to view, create or edit floorplans. Use the list below to select a site walk.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select a Site Walk</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search site walks..." 
            className="pl-8"
          />
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className={`hover:shadow-md transition-all ${
                currentSiteWalk?.id === project.id 
                  ? 'border-primary bg-primary/5' 
                  : ''
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.site_address || 'No address specified'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSiteWalk(project)}
                  >
                    Select
                  </Button>
                  <Link href={`/projects/${project.id}/floorplans`}>
                    <Button size="sm">
                      View Floorplans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-lg mb-4 text-muted-foreground">No site walks found</p>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Site Walk
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}