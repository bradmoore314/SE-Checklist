import React, { useState } from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { 
  Plus, 
  Trash2 as Trash, 
  Copy,
  ImageIcon,
  Upload,
  Info as InfoIcon,
  Video as VideoIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StreamImagesModal from "@/components/modals/StreamImagesModal";

const KastleVideoGuardingPage: React.FC = () => {
  const { toast } = useToast();
  
  // State for streams
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  
  // Stream interface
  interface StreamImage {
    id: string;
    url: string;
    filename: string;
    uploadDate: Date;
  }

  interface Stream {
    id: number;
    location: string;
    fovAccessibility: string;
    cameraType: string;
    useCaseProblem: string;
    speakerAssociation: string;
    audioTalkDown: string;
    eventMonitoring: string;
    monitoringStartTime: string;
    monitoringEndTime: string;
    patrolGroups: string;
    patrolStartTime: string;
    patrolEndTime: string;
    images: StreamImage[];
  }

  // Function to add a new stream
  const addStream = (streamToClone?: Stream) => {
    const newStream: Stream = streamToClone 
      ? { ...streamToClone, id: streams.length + 1, images: [] } 
      : {
          id: streams.length + 1,
          location: "",
          fovAccessibility: "Select",
          cameraType: "Select",
          useCaseProblem: "",
          speakerAssociation: "",
          audioTalkDown: "Select",
          eventMonitoring: "Select",
          monitoringStartTime: "",
          monitoringEndTime: "",
          patrolGroups: "Select",
          patrolStartTime: "",
          patrolEndTime: "",
          images: []
        };
    
    setStreams([...streams, newStream]);
    toast({
      title: streamToClone ? "Stream Duplicated" : "Stream Added",
      description: streamToClone 
        ? "The stream has been duplicated successfully." 
        : "A new stream has been added.",
    });
  };

  // Function to update a stream
  const updateStream = (id: number, field: keyof Stream, value: any) => {
    setStreams(streams.map(stream => 
      stream.id === id ? { ...stream, [field]: value } : stream
    ));
  };

  // Function to remove a stream
  const removeStream = (id: number) => {
    setStreams(streams.filter(stream => stream.id !== id));
    toast({
      title: "Stream Removed",
      description: "The stream has been removed successfully.",
    });
  };

  // Handle stream image upload click
  const handleUploadStreamImageClick = (streamId: number) => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    
    // Add event listener for when files are selected
    fileInput.addEventListener("change", (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      // Process each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (!e.target || typeof e.target.result !== "string") return;
          
          // Create a new stream image
          const newImage: StreamImage = {
            id: `stream_${streamId}_img_${Date.now()}_${i}`,
            url: e.target.result,
            filename: file.name,
            uploadDate: new Date()
          };
          
          // Update the stream with the new image
          setStreams(prevStreams => 
            prevStreams.map(stream => 
              stream.id === streamId 
                ? { ...stream, images: [...stream.images, newImage] } 
                : stream
            )
          );
        };
        
        reader.readAsDataURL(file);
      }
      
      toast({
        title: "Images Uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      });
    });
    
    // Trigger the file selection dialog
    fileInput.click();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">KVG Pricing App</h1>

      <Tabs defaultValue="stream-details" className="w-full">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="stream-details" className="bg-teal-600 data-[state=active]:bg-teal-700 text-white flex items-center justify-center gap-1">
            <span>📹</span> Stream Details
          </TabsTrigger>
          <TabsTrigger value="discovery" className="bg-green-600 data-[state=active]:bg-green-700 text-white flex items-center justify-center gap-1">
            <span>🔍</span> 1. Discovery - BDM
          </TabsTrigger>
          <TabsTrigger value="site-assessment" className="bg-blue-600 data-[state=active]:bg-blue-700 text-white flex items-center justify-center gap-1">
            <span>🏢</span> 2. Site Assessment - SE
          </TabsTrigger>
          <TabsTrigger value="use-case" className="bg-purple-600 data-[state=active]:bg-purple-700 text-white flex items-center justify-center gap-1">
            <span>📝</span> 3. Use Case - SOW - SME
          </TabsTrigger>
          <TabsTrigger value="voc-protocol" className="bg-orange-600 data-[state=active]:bg-orange-700 text-white flex items-center justify-center gap-1">
            <span>🎯</span> 4. VOC Protocol - AM
          </TabsTrigger>
          <TabsTrigger value="deployment" className="bg-indigo-600 data-[state=active]:bg-indigo-700 text-white flex items-center justify-center gap-1">
            <span>🚀</span> 5. Project Deployment - PM
          </TabsTrigger>
          <TabsTrigger value="pricing" className="bg-pink-600 data-[state=active]:bg-pink-700 text-white flex items-center justify-center gap-1">
            <span>💰</span> Pricing
          </TabsTrigger>
        </TabsList>

        {/* Stream Details Tab Content */}
        <TabsContent value="stream-details">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📹</span> Camera Video Stream Details
              </CardTitle>
              <CardDescription>Configure and manage your camera streams with detailed settings for monitoring and patrol groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={() => addStream()} className="flex items-center gap-1">
                  <Plus size={16} /> Add Stream
                </Button>
              </div>
              
              {streams.length > 0 ? (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="text-xs bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th colSpan={3} className="px-2 py-3 text-center bg-teal-100">Camera Video Stream Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-blue-100">FOV Area Accessibility</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-indigo-100">Camera Type & Environment</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-purple-100">Unique Use Case Problem</th>
                        <th colSpan={2} className="px-2 py-3 text-center bg-pink-100">Speaker Video Stream Association & Name</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-orange-100">Event Monitoring Details</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-red-100">Patrol Group Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-gray-200">Actions</th>
                      </tr>
                      <tr className="border-b text-center">
                        <th className="px-2 py-2 w-10">Stream #</th>
                        <th className="px-2 py-2 w-60">Camera/Video Stream Location/Name</th>
                        <th className="px-2 py-2 w-16">Images</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-28">Environment</th>
                        <th className="px-2 py-2 w-60">Problem Description</th>
                        <th className="px-2 py-2 w-40">Association</th>
                        <th className="px-2 py-2 w-20">Audio Talk-Down Y/N</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-32">Start Time</th>
                        <th className="px-2 py-2 w-32">End Time</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-32">Start Time</th>
                        <th className="px-2 py-2 w-32">End Time</th>
                        <th className="px-2 py-2 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streams.map((stream) => (
                        <tr key={stream.id} className="border-b hover:bg-gray-50">
                          <td className="px-2 py-3 text-center font-medium">{stream.id}</td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.location || ""}
                              onChange={(e) => updateStream(stream.id, "location", e.target.value)}
                              className="h-14"
                              placeholder="Enter the location and naming of the camera video stream - see note example"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedStream(stream);
                                  setIsImagesModalOpen(true);
                                }}
                                className="flex items-center gap-1"
                                title="View Images"
                              >
                                <ImageIcon size={14} /> {stream.images.length}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUploadStreamImageClick(stream.id)}
                                className="px-2"
                                title="Upload Image"
                              >
                                <Upload size={14} />
                              </Button>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.fovAccessibility}
                              onValueChange={(value) => updateStream(stream.id, "fovAccessibility", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.cameraType}
                              onValueChange={(value) => updateStream(stream.id, "cameraType", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Indoor">Indoor</SelectItem>
                                <SelectItem value="Outdoor">Outdoor</SelectItem>
                                <SelectItem value="PTZ">PTZ</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.useCaseProblem || ""}
                              onChange={(e) => updateStream(stream.id, "useCaseProblem", e.target.value)}
                              className="h-14"
                              placeholder="Enter any unique use case problem for this camera or scene if different from the site problem defined above."
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.speakerAssociation || ""}
                              onChange={(e) => updateStream(stream.id, "speakerAssociation", e.target.value)}
                              className="h-14"
                              placeholder="Fill in if speaker is dedicated to single camera or a group of cameras (ref numbers in column A)"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.audioTalkDown}
                              onValueChange={(value) => updateStream(stream.id, "audioTalkDown", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.eventMonitoring}
                              onValueChange={(value) => updateStream(stream.id, "eventMonitoring", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.monitoringStartTime || ""}
                              onChange={(e) => updateStream(stream.id, "monitoringStartTime", e.target.value)}
                              className="h-8"
                              placeholder="Start Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.monitoringEndTime || ""}
                              onChange={(e) => updateStream(stream.id, "monitoringEndTime", e.target.value)}
                              className="h-8"
                              placeholder="End Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.patrolGroups}
                              onValueChange={(value) => updateStream(stream.id, "patrolGroups", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.patrolStartTime || ""}
                              onChange={(e) => updateStream(stream.id, "patrolStartTime", e.target.value)}
                              className="h-8"
                              placeholder="Start Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.patrolEndTime || ""}
                              onChange={(e) => updateStream(stream.id, "patrolEndTime", e.target.value)}
                              className="h-8"
                              placeholder="End Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex flex-col gap-1 items-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addStream(stream)}
                                title="Duplicate Stream"
                                className="w-9 h-9 p-0"
                              >
                                <Copy size={16} />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeStream(stream.id)}
                                title="Remove Stream"
                                className="w-9 h-9 p-0"
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 p-8 border rounded-md text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <VideoIcon size={48} className="text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No Camera Streams Configured</h3>
                  </div>
                  <p className="max-w-md mx-auto mb-4">
                    Start by adding camera streams to configure video monitoring and patrol settings for your KVG project.
                  </p>
                  <Button onClick={() => addStream()} className="flex items-center gap-2">
                    <Plus size={16} /> Add Your First Stream
                  </Button>
                </div>
              )}
              
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <h3 className="text-md font-semibold flex items-center gap-2 mb-2">
                  <InfoIcon size={18} className="text-blue-600" />
                  About Camera Streams
                </h3>
                <p className="text-sm">
                  Configure each camera stream with its associated monitoring and patrol details. You can associate speakers with cameras, 
                  set up event monitoring schedules, and define patrol group timings for each stream. Use the duplicate function to quickly create similar streams.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs Content (placeholders) */}
        <TabsContent value="discovery">
          <div>Discovery content would go here</div>
        </TabsContent>
        
        <TabsContent value="site-assessment">
          <div>Site Assessment content would go here</div>
        </TabsContent>
        
        <TabsContent value="use-case">
          <div>Use Case content would go here</div>
        </TabsContent>
        
        <TabsContent value="voc-protocol">
          <div>VOC Protocol content would go here</div>
        </TabsContent>
        
        <TabsContent value="deployment">
          <div>Deployment content would go here</div>
        </TabsContent>
        
        <TabsContent value="pricing">
          <div>Pricing content would go here</div>
        </TabsContent>
      </Tabs>
      
      {/* Image Modal for viewing stream images */}
      {selectedStream && (
        <StreamImagesModal 
          isOpen={isImagesModalOpen} 
          onClose={() => setIsImagesModalOpen(false)}
          stream={selectedStream}
          onImageDelete={(imageId) => {
            const updatedImages = selectedStream.images.filter(img => img.id !== imageId);
            updateStream(selectedStream.id, "images", updatedImages);
          }}
        />
      )}
    </div>
  );
};

export default KastleVideoGuardingPage;
