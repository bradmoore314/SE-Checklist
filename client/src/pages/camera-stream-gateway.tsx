import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

/**
 * Camera Stream Gateway Page
 * 
 * This page serves as a container for the Camera Stream Gateway application.
 * The actual application would be loaded in an iframe or as a component.
 */
export default function CameraStreamGateway() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading the Camera Stream Gateway application
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Render placeholder content until the full application is integrated
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Camera Stream Gateway</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/cameras")}
          className="flex items-center"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Cameras
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="material-icons text-4xl animate-spin text-primary mb-4">
              sync
            </div>
            <p className="text-neutral-600">Loading Camera Stream Gateway...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Camera Stream Gateway Integration</h2>
              <p className="mb-6 text-neutral-600 max-w-lg mx-auto">
                This is a placeholder for the Camera Stream Gateway application. 
                When the application code is available, it will be integrated here.
              </p>

              <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50 max-w-2xl mx-auto">
                <h3 className="font-medium mb-2 text-gray-700">Integration Details</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The Camera Stream Gateway application will be integrated here, allowing users to:
                </p>
                <ul className="text-sm text-left list-disc pl-6 space-y-2 mb-4">
                  <li>Configure and manage camera streams</li>
                  <li>Monitor live video feeds</li>
                  <li>Set up alerts and notifications</li>
                  <li>Control PTZ cameras</li>
                  <li>Configure recording settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}