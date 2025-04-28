import { useEffect, useState } from "react";
import { GatewayConfiguration, Stream } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDragContext } from "@/components/ui/drag-context";
import { formatStorage, formatThroughput } from "@/lib/gateway-calculator";

interface Step3AssignCamerasProps {
  streams: Stream[];
  setStreams: (streams: Stream[]) => void;
  gatewayConfig: GatewayConfiguration;
  gatewayAssignments: {[gatewayId: string]: Stream[]};
  setGatewayAssignments: (assignments: {[gatewayId: string]: Stream[]}) => void;
  onBackToStep2: () => void;
  onFinish: () => void;
  allStreamsAssigned: boolean;
}

export default function Step3AssignCameras({
  streams,
  setStreams,
  gatewayConfig,
  gatewayAssignments,
  setGatewayAssignments,
  onBackToStep2,
  onFinish,
  allStreamsAssigned
}: Step3AssignCamerasProps) {
  const { draggedStream, setDraggedStream } = useDragContext();
  const [autoAssignInProgress, setAutoAssignInProgress] = useState(false);
  
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
  
  // Calculate capacity for a gateway
  const calculateGatewayCapacity = (streams: Stream[]) => {
    const totalStreams = streams.length;
    const totalThroughput = streams.reduce((acc, stream) => acc + stream.throughput, 0);
    const totalStorage = streams.reduce((acc, stream) => acc + stream.storage, 0);
    
    return {
      streams: totalStreams,
      streamsPercent: (totalStreams / gatewaySpecs[gatewayConfig.type].maxStreams) * 100,
      throughput: totalThroughput,
      throughputPercent: (totalThroughput / gatewaySpecs[gatewayConfig.type].maxThroughput) * 100,
      storage: totalStorage,
      storagePercent: (totalStorage / gatewaySpecs[gatewayConfig.type].maxStorage * 1000) * 100
    };
  };
  
  // Check if a stream can be added to a gateway
  const canAddStreamToGateway = (gatewayId: string, stream: Stream): boolean => {
    const currentAssignments = [...gatewayAssignments[gatewayId]];
    const potentialAssignments = [...currentAssignments, stream];
    const capacity = calculateGatewayCapacity(potentialAssignments);
    
    return (
      capacity.streams <= gatewaySpecs[gatewayConfig.type].maxStreams &&
      capacity.throughput <= gatewaySpecs[gatewayConfig.type].maxThroughput &&
      capacity.storage <= gatewaySpecs[gatewayConfig.type].maxStorage * 1000
    );
  };
  
  // Handle dropping a stream onto a gateway
  const handleDrop = (gatewayId: string) => {
    if (!draggedStream) return;
    
    // Check if the stream can be added to this gateway
    if (!canAddStreamToGateway(gatewayId, draggedStream)) return;
    
    // Check if stream is already assigned to another gateway and remove it
    Object.keys(gatewayAssignments).forEach(id => {
      const index = gatewayAssignments[id].findIndex(stream => stream.id === draggedStream.id);
      if (index !== -1) {
        const newAssignments = { ...gatewayAssignments };
        newAssignments[id] = [
          ...newAssignments[id].slice(0, index),
          ...newAssignments[id].slice(index + 1)
        ];
        setGatewayAssignments(newAssignments);
      }
    });
    
    // Add it to the new gateway
    const newAssignments = { ...gatewayAssignments };
    newAssignments[gatewayId] = [...newAssignments[gatewayId], draggedStream];
    setGatewayAssignments(newAssignments);
    
    setDraggedStream(null);
  };
  
  // Handle clicking on an assigned stream to remove it
  const handleRemoveStream = (gatewayId: string, streamId: string) => {
    const newAssignments = { ...gatewayAssignments };
    const index = newAssignments[gatewayId].findIndex(stream => stream.id === streamId);
    
    if (index !== -1) {
      newAssignments[gatewayId] = [
        ...newAssignments[gatewayId].slice(0, index),
        ...newAssignments[gatewayId].slice(index + 1)
      ];
      setGatewayAssignments(newAssignments);
    }
  };
  
  // Auto-assign streams to gateways
  const autoAssignStreams = () => {
    setAutoAssignInProgress(true);
    
    // Start with a clean assignment
    const newAssignments: {[gatewayId: string]: Stream[]} = {};
    for (let i = 0; i < gatewayConfig.count; i++) {
      newAssignments[i.toString()] = [];
    }
    
    // Group streams by camera to keep them together
    const cameraGroups: {[cameraId: string]: Stream[]} = {};
    streams.forEach(stream => {
      if (!cameraGroups[stream.cameraId]) {
        cameraGroups[stream.cameraId] = [];
      }
      cameraGroups[stream.cameraId].push(stream);
    });
    
    // Sort camera groups by total throughput (descending)
    const sortedCameraIds = Object.keys(cameraGroups).sort((a, b) => {
      const aThroughput = cameraGroups[a].reduce((acc, stream) => acc + stream.throughput, 0);
      const bThroughput = cameraGroups[b].reduce((acc, stream) => acc + stream.throughput, 0);
      return bThroughput - aThroughput;
    });
    
    // Assign each camera's streams to the gateway with the most available capacity
    sortedCameraIds.forEach(cameraId => {
      const cameraStreams = cameraGroups[cameraId];
      
      // Find the best gateway for this camera's streams
      let bestGatewayId: string | null = null;
      let lowestUsage = Infinity;
      
      for (let i = 0; i < gatewayConfig.count; i++) {
        const gatewayId = i.toString();
        
        // Calculate current usage percentage
        const capacity = calculateGatewayCapacity(newAssignments[gatewayId]);
        const usagePercent = Math.max(
          capacity.streamsPercent,
          capacity.throughputPercent,
          capacity.storagePercent
        );
        
        // Check if all streams from this camera can fit in this gateway
        const potentialAssignments = [...newAssignments[gatewayId], ...cameraStreams];
        const potentialCapacity = calculateGatewayCapacity(potentialAssignments);
        const canFit = (
          potentialCapacity.streams <= gatewaySpecs[gatewayConfig.type].maxStreams &&
          potentialCapacity.throughput <= gatewaySpecs[gatewayConfig.type].maxThroughput &&
          potentialCapacity.storage <= gatewaySpecs[gatewayConfig.type].maxStorage * 1000
        );
        
        if (canFit && usagePercent < lowestUsage) {
          bestGatewayId = gatewayId;
          lowestUsage = usagePercent;
        }
      }
      
      if (bestGatewayId !== null) {
        // Assign all streams from this camera to the best gateway
        newAssignments[bestGatewayId] = [...newAssignments[bestGatewayId], ...cameraStreams];
      } else {
        // If can't keep all streams together, try to assign individually
        cameraStreams.forEach(stream => {
          for (let i = 0; i < gatewayConfig.count; i++) {
            const gatewayId = i.toString();
            
            // Check if this stream can fit in this gateway
            if (canAddStreamToGateway(gatewayId, stream)) {
              newAssignments[gatewayId].push(stream);
              break;
            }
          }
        });
      }
    });
    
    // Update the assignments
    setGatewayAssignments(newAssignments);
    setAutoAssignInProgress(false);
  };
  
  // Clear all assignments
  const clearAllAssignments = () => {
    const newAssignments: {[gatewayId: string]: Stream[]} = {};
    for (let i = 0; i < gatewayConfig.count; i++) {
      newAssignments[i.toString()] = [];
    }
    setGatewayAssignments(newAssignments);
  };
  
  // Get all unassigned streams
  const getUnassignedStreams = (): Stream[] => {
    const assignedStreamIds = new Set<string>();
    Object.values(gatewayAssignments).forEach(gatewayStreams => {
      gatewayStreams.forEach(stream => {
        assignedStreamIds.add(stream.id);
      });
    });
    
    return streams.filter(stream => !assignedStreamIds.has(stream.id));
  };
  
  const unassignedStreams = getUnassignedStreams();
  
  // Handle dragging a stream
  const handleDragStart = (stream: Stream) => {
    setDraggedStream(stream);
  };
  
  // Clear dragged stream on component unmount
  useEffect(() => {
    return () => {
      setDraggedStream(null);
    };
  }, [setDraggedStream]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
        <h2 className="text-xl font-semibold">Assign Streams to Gateways</h2>
      </div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            Drag and drop camera streams to assign them to gateways
          </p>
          <div className="flex gap-6 mt-2">
            <div>
              <span className="text-sm font-medium text-neutral-600">Unassigned Streams:</span>
              <span className="ml-1 font-bold">{unassignedStreams.length}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-neutral-600">Gateways:</span>
              <span className="ml-1 font-bold">{gatewayConfig.count} x {gatewayConfig.type === '8ch' ? '8-Channel' : '16-Channel'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={clearAllAssignments}
            className="flex items-center"
            disabled={autoAssignInProgress}
          >
            Clear All
          </Button>
          <Button 
            onClick={autoAssignStreams}
            className="flex items-center"
            disabled={autoAssignInProgress}
          >
            {autoAssignInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Auto-Assign'
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Streams Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Unassigned Streams</CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedStreams.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>All streams have been assigned</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {unassignedStreams.map(stream => (
                  <div
                    key={stream.id}
                    className={`p-3 rounded-md border bg-white shadow-sm cursor-move ${
                      draggedStream?.id === stream.id ? 'border-blue-500 opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(stream)}
                  >
                    <div className="font-medium mb-1">{stream.name}</div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{stream.lensType}</span>
                      <span>{stream.resolution}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{stream.frameRate}</span>
                      <span>{formatThroughput(stream.throughput)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Gateway Assignment Panels */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: gatewayConfig.count }).map((_, gatewayIndex) => {
            const gatewayId = gatewayIndex.toString();
            const assignedStreams = gatewayAssignments[gatewayId] || [];
            const capacity = calculateGatewayCapacity(assignedStreams);
            
            return (
              <Card
                key={gatewayIndex}
                className={`border-2 ${
                  draggedStream && canAddStreamToGateway(gatewayId, draggedStream)
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-neutral-200'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedStream && canAddStreamToGateway(gatewayId, draggedStream)) {
                    e.dataTransfer.dropEffect = 'copy';
                  } else {
                    e.dataTransfer.dropEffect = 'none';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(gatewayId);
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    {gatewayConfig.type === '8ch' ? '8-Channel' : '16-Channel'} Gateway {gatewayIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Streams</span>
                        <span className="text-sm font-medium">
                          {capacity.streams} / {gatewaySpecs[gatewayConfig.type].maxStreams}
                        </span>
                      </div>
                      <Progress value={capacity.streamsPercent} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Throughput</span>
                        <span className="text-sm font-medium">
                          {formatThroughput(capacity.throughput)} / {gatewaySpecs[gatewayConfig.type].maxThroughput} MP/s
                        </span>
                      </div>
                      <Progress value={capacity.throughputPercent} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-neutral-600">Storage</span>
                        <span className="text-sm font-medium">
                          {formatStorage(capacity.storage)} / {gatewaySpecs[gatewayConfig.type].maxStorage} TB
                        </span>
                      </div>
                      <Progress value={capacity.storagePercent} className="h-2" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Assigned Streams ({assignedStreams.length})</h4>
                    
                    {assignedStreams.length === 0 ? (
                      <div className="text-center py-6 text-neutral-400 border border-dashed rounded-md">
                        <p className="text-sm">Drop streams here</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                        {assignedStreams.map(stream => (
                          <div
                            key={stream.id}
                            className="p-3 rounded-md border bg-white shadow-sm flex justify-between items-center"
                            onClick={() => handleRemoveStream(gatewayId, stream.id)}
                          >
                            <div>
                              <div className="font-medium text-sm">{stream.name}</div>
                              <div className="flex gap-2 text-xs text-neutral-500">
                                <span>{stream.resolution}</span>
                                <span>•</span>
                                <span>{formatThroughput(stream.throughput)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStream(gatewayId, stream.id);
                              }}
                            >
                              <span className="sr-only">Remove</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {!allStreamsAssigned && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Unassigned Streams</h4>
            <p className="text-sm text-amber-700">
              You have {unassignedStreams.length} streams that still need to be assigned to gateways.
              All streams must be assigned before you can complete the configuration.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={onBackToStep2}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requirements
        </Button>
        
        <Button
          disabled={!allStreamsAssigned}
          onClick={onFinish}
        >
          Complete Configuration
        </Button>
      </div>
    </div>
  );
}