import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DragContextProvider } from "@/components/ui/drag-context";
import GatewayCalculator from "@/components/gateway/GatewayCalculator";

/**
 * Camera Stream Gateway Page
 * 
 * This page serves as a container for the Camera Stream Gateway application.
 * It integrates the GatewayCalculator component that allows users to configure
 * camera streams and assign them to gateways.
 */
export default function CameraStreamGateway() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
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

      <div className="overflow-hidden rounded-lg border shadow-sm">
        <DragContextProvider>
          <GatewayCalculator />
        </DragContextProvider>
      </div>
    </div>
  );
}