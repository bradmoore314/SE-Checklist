import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ProjectQuestionsAnalysis from "@/components/reports/ProjectQuestionsAnalysis";
import { getQueryFn } from "@/lib/queryClient";

const QuoteReviewPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch project data
  const { data: project, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!projectId
  });
  
  // Navigate back to projects page
  const handleBack = () => {
    navigate("/projects");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project data...</span>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>Failed to load project information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Could not load the project details. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{project.name} - Quote Review</h1>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Summary
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Basic project details and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                    <p className="text-base">{project.client || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Site Address</h3>
                    <p className="text-base">{project.site_address || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">BDM</h3>
                    <p className="text-base">{project.bdm_name || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Sales Engineer</h3>
                    <p className="text-base">{project.se_name || "Not assigned"}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Configuration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {project.takeover && <Badge variant="outline">Takeover</Badge>}
                    {project.pull_wire && <Badge variant="outline">Pull Wire</Badge>}
                    {project.replace_readers && <Badge variant="outline">Replace Readers</Badge>}
                    {project.need_credentials && <Badge variant="outline">Need Credentials</Badge>}
                    {project.install_locks && <Badge variant="outline">Install Locks</Badge>}
                    {project.visitor && <Badge variant="outline">Visitor Management</Badge>}
                    {project.ble && <Badge variant="outline">BLE</Badge>}
                    {project.floorplan && <Badge variant="outline">Floorplan Available</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Equipment Summary</CardTitle>
                <CardDescription>Count of security equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Access Points</span>
                      <span className="font-medium">{project.accessPointsCount || 0}</span>
                    </div>
                    <progress 
                      className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary" 
                      value={project.accessPointsCount || 0} 
                      max={project.totalEquipment || 1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Cameras</span>
                      <span className="font-medium">{project.camerasCount || 0}</span>
                    </div>
                    <progress 
                      className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-blue-500" 
                      value={project.camerasCount || 0} 
                      max={project.totalEquipment || 1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Elevators</span>
                      <span className="font-medium">{project.elevatorsCount || 0}</span>
                    </div>
                    <progress 
                      className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-yellow-500" 
                      value={project.elevatorsCount || 0} 
                      max={project.totalEquipment || 1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Intercoms</span>
                      <span className="font-medium">{project.intercomsCount || 0}</span>
                    </div>
                    <progress 
                      className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-green-500" 
                      value={project.intercomsCount || 0} 
                      max={project.totalEquipment || 1}
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Equipment</span>
                    <span className="font-bold">{project.totalEquipment || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-6">
          <ProjectQuestionsAnalysis projectId={parseInt(projectId)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteReviewPage;