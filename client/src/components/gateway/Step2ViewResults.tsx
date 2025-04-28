import { useState } from "react";
import { Calculations, GatewayConfiguration } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatStorage, formatThroughput } from "@/lib/gateway-calculator";

interface Step2ViewResultsProps {
  calculations: Calculations;
  gatewayConfig: GatewayConfiguration;
  onBackToStep1: () => void;
  onProceedToAssign: (config: GatewayConfiguration) => void;
}

export default function Step2ViewResults({
  calculations,
  gatewayConfig,
  onBackToStep1,
  onProceedToAssign
}: Step2ViewResultsProps) {
  const [selectedType, setSelectedType] = useState<'8ch' | '16ch'>(gatewayConfig.type);
  const [gatewayCount, setGatewayCount] = useState(gatewayConfig.count);
  
  // Gateway specs
  const gatewaySpecs = {
    '8ch': {
      maxStreams: 8,
      maxThroughput: 320,
      maxStorage: 6
    },
    '16ch': {
      maxStreams: 16,
      maxThroughput: 640,
      maxStorage: 12
    }
  };
  
  // Calculate capacity per gateway
  const maxStreamsPerGateway = gatewaySpecs[selectedType].maxStreams;
  const maxThroughputPerGateway = gatewaySpecs[selectedType].maxThroughput;
  const maxStoragePerGateway = gatewaySpecs[selectedType].maxStorage;
  
  // Calculate minimum gateways needed
  const getMinRequiredGateways = (): number => {
    const streamGateways = Math.ceil(calculations.totalStreams / maxStreamsPerGateway);
    const throughputGateways = Math.ceil(calculations.totalThroughput / maxThroughputPerGateway);
    const storageGateways = Math.ceil(calculations.totalStorage / maxStoragePerGateway);
    
    return Math.max(streamGateways, throughputGateways, storageGateways);
  };
  
  const minGateways = getMinRequiredGateways();
  
  // Helper function to calculate percentage of capacity used
  const getCapacityPercent = (value: number, max: number): number => {
    return Math.min(100, (value / max) * 100);
  };
  
  // Calculate capacity percentages
  const streamsCapacity = getCapacityPercent(
    calculations.totalStreams / gatewayCount,
    maxStreamsPerGateway
  );
  
  const throughputCapacity = getCapacityPercent(
    calculations.totalThroughput / gatewayCount,
    maxThroughputPerGateway
  );
  
  const storageCapacity = getCapacityPercent(
    calculations.totalStorage / gatewayCount,
    maxStoragePerGateway
  );
  
  // Check if current configuration can handle the requirements
  const isValidConfiguration = gatewayCount >= minGateways;
  
  // Status indicators
  const getStatusIndicator = (percent: number) => {
    if (percent > 90) return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };
  
  // Handle proceed to next step
  const handleProceed = () => {
    onProceedToAssign({
      type: selectedType,
      count: gatewayCount
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
        <h2 className="text-xl font-semibold">Gateway Requirements</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Camera Requirements Summary</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Streams</span>
                  <span className="font-medium">{calculations.totalStreams}</span>
                </div>
                <Slider disabled value={[100]} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Throughput</span>
                  <span className="font-medium">{formatThroughput(calculations.totalThroughput)}</span>
                </div>
                <Slider disabled value={[100]} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Storage</span>
                  <span className="font-medium">{formatStorage(calculations.totalStorage)}</span>
                </div>
                <Slider disabled value={[100]} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configure Gateway Solution</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-600 mb-1 block">Gateway Type</label>
                  <Select
                    value={selectedType}
                    onValueChange={(value: '8ch' | '16ch') => {
                      setSelectedType(value);
                      // Recalculate gateway count after changing type
                      const newMinGateways = Math.ceil(calculations.totalStreams / gatewaySpecs[value].maxStreams);
                      if (gatewayCount < newMinGateways) {
                        setGatewayCount(newMinGateways);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8ch">8-Channel Gateway</SelectItem>
                      <SelectItem value="16ch">16-Channel Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-neutral-600 mb-1 block">Number of Gateways</label>
                  <Select
                    value={gatewayCount.toString()}
                    onValueChange={(value) => setGatewayCount(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.max(8, minGateways + 2) }, (_, i) => i + 1).map((num) => (
                        <SelectItem 
                          key={num} 
                          value={num.toString()}
                          disabled={num < minGateways}
                        >
                          {num} {num < minGateways ? "(Insufficient)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Per Gateway Capacity</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-600 mr-2">Streams</span>
                        {getStatusIndicator(streamsCapacity)}
                      </div>
                      <span className="text-sm font-medium">
                        {Math.ceil(calculations.totalStreams / gatewayCount)} / {maxStreamsPerGateway}
                      </span>
                    </div>
                    <Slider disabled value={[streamsCapacity]} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-600 mr-2">Throughput</span>
                        {getStatusIndicator(throughputCapacity)}
                      </div>
                      <span className="text-sm font-medium">
                        {formatThroughput(calculations.totalThroughput / gatewayCount)} / {maxThroughputPerGateway} Mbps
                      </span>
                    </div>
                    <Slider disabled value={[throughputCapacity]} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="text-sm text-neutral-600 mr-2">Storage</span>
                        {getStatusIndicator(storageCapacity)}
                      </div>
                      <span className="text-sm font-medium">
                        {formatStorage(calculations.totalStorage / gatewayCount)} / {maxStoragePerGateway} TB
                      </span>
                    </div>
                    <Slider disabled value={[storageCapacity]} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {!isValidConfiguration && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Insufficient Gateway Capacity</h4>
            <p className="text-sm text-amber-700">
              Your current configuration cannot handle the camera requirements. 
              Please select at least {minGateways} {selectedType === '8ch' ? '8-Channel' : '16-Channel'} gateways.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={onBackToStep1}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cameras
        </Button>
        
        <Button
          disabled={!isValidConfiguration}
          onClick={handleProceed}
          className="flex items-center"
        >
          Proceed to Assignment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}