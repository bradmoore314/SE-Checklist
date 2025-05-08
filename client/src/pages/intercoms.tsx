import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSiteWalk } from "@/contexts/SiteWalkContext";
import { Project } from "@shared/schema";
import { useLocation } from "wouter";
import IntercomsTab from "@/components/equipment/IntercomsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function Intercoms() {
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const [, setLocation] = useLocation();
  
  // Fetch site walks
  const { data: siteWalks, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // If current site walk is not set, use the first one from the list
  useEffect(() => {
    if (!currentSiteWalk && siteWalks && siteWalks.length > 0) {
      setCurrentSiteWalk(siteWalks[0]);
    }
  }, [currentSiteWalk, siteWalks, setCurrentSiteWalk]);

  // Loading state
  if (isLoading) {
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
  if (!siteWalks || siteWalks.length === 0) {
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
                  <span className="material-icons mr-1">add</span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Intercoms</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="flex items-center"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Dashboard
        </Button>
      </div>
      <IntercomsTab project={currentSiteWalk} />
    </div>
  );
}