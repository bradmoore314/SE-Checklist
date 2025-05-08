import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { Project } from "@shared/schema";
import { useLocation } from "wouter";
import CamerasTab from "@/components/equipment/CamerasTab";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function Cameras() {
  const { currentOpportunity, setCurrentOpportunity } = useOpportunity();
  const [, setLocation] = useLocation();
  
  // Fetch opportunities
  const { data: opportunities, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  // If current opportunity is not set, use the first one from the list
  useEffect(() => {
    if (!currentOpportunity && opportunities && opportunities.length > 0) {
      setCurrentOpportunity(opportunities[0]);
    }
  }, [currentOpportunity, opportunities, setCurrentOpportunity]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="material-icons text-4xl animate-spin text-primary mb-4">
            sync
          </div>
          <p className="text-neutral-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  // No opportunities state
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Opportunities Found</h2>
              <p className="text-neutral-600 mb-4">
                You don't have any opportunities yet. Create your first opportunity to get started.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center mx-auto">
                  <span className="material-icons mr-1">add</span>
                  Create New Opportunity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If currentOpportunity is not set but we have opportunities, this should not happen
  // due to the useEffect, but let's handle it anyway
  if (!currentOpportunity) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select an Opportunity</h2>
              <p className="text-neutral-600 mb-4">
                Please select an opportunity to continue.
              </p>
              <Link href="/projects">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md mx-auto">
                  View Opportunities
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
        <h1 className="text-2xl font-bold">Cameras</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="flex items-center"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Dashboard
        </Button>
      </div>
      <CamerasTab project={currentOpportunity} />
    </div>
  );
}