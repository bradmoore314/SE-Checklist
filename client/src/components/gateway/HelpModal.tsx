import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Camera Stream Gateway Help</DialogTitle>
          <DialogDescription>
            Learn how to use the Camera Stream Gateway Calculator to configure your system
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cameras">Adding Cameras</TabsTrigger>
            <TabsTrigger value="results">Viewing Results</TabsTrigger>
            <TabsTrigger value="assignment">Gateway Assignment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-semibold mb-2">What is the Camera Stream Gateway?</h3>
            <p className="mb-4">
              The Camera Stream Gateway (CSG) is a device that manages video streams from multiple cameras
              and provides a secure, reliable connection to the Kastle Video Monitoring system.
            </p>
            
            <h3 className="text-lg font-semibold mb-2">How to use this calculator</h3>
            <p className="mb-4">
              This calculator helps you determine how many gateways you need based on your camera configuration.
              Follow these steps:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li><strong>Step 1:</strong> Add all cameras that will be connected to gateways</li>
              <li><strong>Step 2:</strong> Review the calculated requirements and gateway recommendation</li>
              <li><strong>Step 3:</strong> Assign camera streams to individual gateways</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="cameras" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-semibold mb-2">Adding and Configuring Cameras</h3>
            <p className="mb-4">
              Configure each camera with:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Camera Name:</strong> A descriptive name (e.g., "Main Entrance")</li>
              <li><strong>Lens Count:</strong> The number of lenses/sensors on the camera (1-4)</li>
              <li><strong>Streaming Resolution:</strong> The resolution used for live viewing (in MP)</li>
              <li><strong>Frame Rate:</strong> The frame rate for recording (in FPS)</li>
              <li><strong>Storage Days:</strong> How many days of footage to retain</li>
              <li><strong>Recording Resolution:</strong> The resolution used for recording (in MP)</li>
            </ul>
            
            <p className="mb-4">
              For multi-lens cameras (e.g., 180° or 360° cameras), each lens counts as a separate stream.
            </p>
          </TabsContent>
          
          <TabsContent value="results" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-semibold mb-2">Understanding Gateway Requirements</h3>
            <p className="mb-4">
              The calculator provides estimates for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Total Streams:</strong> The number of video streams across all cameras</li>
              <li><strong>Total Throughput:</strong> The bandwidth required for all cameras (in MP/s)</li>
              <li><strong>Total Storage:</strong> The storage needed for recorded footage (in GB)</li>
            </ul>
            
            <p className="mb-4">
              Based on these calculations, the tool recommends either:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>8-Channel Gateway:</strong> For smaller deployments (≤ 8 streams, ≤ 320 MP/s, ≤ 6 TB)</li>
              <li><strong>16-Channel Gateway:</strong> For larger deployments (≤ 16 streams, ≤ 640 MP/s, ≤ 12 TB)</li>
            </ul>
            
            <p>
              If your requirements exceed a single gateway's capacity, multiple gateways will be recommended.
            </p>
          </TabsContent>
          
          <TabsContent value="assignment" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-semibold mb-2">Assigning Streams to Gateways</h3>
            <p className="mb-4">
              In the gateway assignment step, you can:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Drag and drop camera streams between gateways</li>
              <li>View real-time capacity indicators for each gateway</li>
              <li>Keep streams from the same camera on the same gateway when possible</li>
              <li>Balance load across gateways for optimal performance</li>
            </ul>
            
            <p className="mb-4">
              Each gateway has maximum limits for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Number of streams (8 or 16 depending on model)</li>
              <li>Throughput (320 or 640 MP/s)</li>
              <li>Storage (6 or 12 TB)</li>
            </ul>
            
            <p>
              The system prevents you from exceeding any of these limits per gateway.
            </p>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}