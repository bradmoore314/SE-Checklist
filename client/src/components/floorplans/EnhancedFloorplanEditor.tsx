import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PdfEditor } from "@/components/pdf/PdfEditor";
import { FileUp, Map, Edit, Eye } from "lucide-react";

interface FloorplanData {
  id: number;
  name: string;
  file_url: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * EnhancedFloorplanEditor Component
 * 
 * This component combines our existing floorplan functionality with the new PDF
 * editing capabilities from the open-source PDF Editor.
 * 
 * Features:
 * - View and manage floorplans
 * - Edit PDFs (merge, rotate)
 * - Annotate floorplans
 * - Place equipment markers
 */
export function EnhancedFloorplanEditor() {
  const { projectId, floorplanId } = useParams();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("view");
  const [isLoading, setIsLoading] = useState(true);
  const [floorplans, setFloorplans] = useState<FloorplanData[]>([]);
  const [currentFloorplan, setCurrentFloorplan] = useState<FloorplanData | null>(null);
  
  // Fetch floorplans for the project
  useEffect(() => {
    if (!projectId) return;
    
    const fetchFloorplans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/floorplans`);
        if (!response.ok) {
          throw new Error('Failed to fetch floorplans');
        }
        
        const data = await response.json();
        setFloorplans(data);
        
        // If floorplanId is provided, load that specific floorplan
        if (floorplanId && data.length > 0) {
          const selected = data.find((f: FloorplanData) => f.id === parseInt(floorplanId));
          if (selected) {
            setCurrentFloorplan(selected);
          } else {
            // If not found, load the first floorplan
            setCurrentFloorplan(data[0]);
          }
        } else if (data.length > 0) {
          // No specific floorplan requested, load the first one
          setCurrentFloorplan(data[0]);
        }
      } catch (error) {
        console.error('Error fetching floorplans:', error);
        toast({
          title: "Error",
          description: "Failed to load floorplans. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFloorplans();
  }, [projectId, floorplanId, toast]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Render PDF Viewer
  const renderPdfViewer = () => {
    if (!currentFloorplan) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">No floorplan selected</p>
          <Button variant="outline">
            <FileUp className="h-4 w-4 mr-2" />
            Upload Floorplan
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{currentFloorplan.name}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("edit")}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("annotate")}>
              <Map className="h-4 w-4 mr-1" />
              Equipment Markers
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-[600px] border rounded-lg overflow-hidden">
          <iframe 
            src={currentFloorplan.file_url} 
            title={currentFloorplan.name}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };
  
  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "view":
        return renderPdfViewer();
      case "edit":
        return <PdfEditor />;
      case "annotate":
        return (
          <div className="p-4 bg-muted/20 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Equipment Markers</h3>
            <p className="text-muted-foreground">
              This section will use our existing marker annotation system to place equipment on the floorplan.
            </p>
            {/* Placeholder for equipment markers editor */}
            <div className="flex justify-center items-center h-64 mt-4 bg-muted/10 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Marker Editor (Placeholder)</p>
            </div>
          </div>
        );
      default:
        return renderPdfViewer();
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl">Enhanced Floorplan Editor</CardTitle>
          <CardDescription>
            View, edit, and annotate your floorplans with security equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="view" className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> View Floorplan
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit PDF
              </TabsTrigger>
              <TabsTrigger value="annotate" className="flex items-center gap-2">
                <Map className="h-4 w-4" /> Equipment Markers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <p>Loading...</p>
                </div>
              ) : (
                renderTabContent()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}