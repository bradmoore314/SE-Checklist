import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GatewayConfiguration, Calculations } from "@shared/schema";
import { Download, RefreshCw, CheckCircle } from "lucide-react";
import { formatStorage, formatThroughput } from "@/lib/gateway-calculator";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onStartOver: () => void;
  calculations: Calculations;
  totalCameras: number;
  gatewayConfig: GatewayConfiguration;
}

export default function CompletionModal({
  isOpen,
  onClose,
  onExport,
  onStartOver,
  calculations,
  totalCameras,
  gatewayConfig
}: CompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            Gateway Configuration Complete
          </DialogTitle>
          <DialogDescription>
            Your camera stream gateway configuration has been successfully completed
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-slate-50 p-4 rounded-lg border mb-6">
            <h3 className="font-semibold text-lg mb-2">Configuration Summary</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">Total Cameras</p>
                <p className="font-medium">{totalCameras}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Streams</p>
                <p className="font-medium">{calculations.totalStreams}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Throughput</p>
                <p className="font-medium">{formatThroughput(calculations.totalThroughput)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Storage</p>
                <p className="font-medium">{formatStorage(calculations.totalStorage)}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded p-3">
              <h4 className="font-medium text-blue-800 mb-1">Gateway Configuration</h4>
              <p className="text-sm text-blue-700">
                {gatewayConfig.count} x {gatewayConfig.type === '8ch' ? '8-Channel' : '16-Channel'} Gateway
                {gatewayConfig.count > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 mb-6">
            You can now export your configuration or start over with a new design.
          </p>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onStartOver} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
          <Button onClick={onExport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}