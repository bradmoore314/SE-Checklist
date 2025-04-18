import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// FormData interface for all form fields
interface FormData {
  // Discovery tab fields
  bdmOwner: string;
  salesEngineer: string;
  kvgSme: string;
  customerName: string;
  siteAddress: string;
  city: string;
  state: string;
  zipCode: string;
  crmOpportunity: string;
  quoteDate: string;
  timeZone: string;
  opportunityStage: string;
  opportunityType: string;
  siteEnvironment: string;
  region: string;
  customerVertical: string;
  propertyCategory: string;
  
  // Technology fields
  technology: string;
  technologyDeployed: string;
  cameraType: string;
  rspndrGdods: string;
  rspndrSubscriptions: string;
  installType: string;
  
  // Stream counts
  eventVideoTriggerStreams: number;
  virtualPatrolStreams: number;
  eventActionClipStreams: number;
  eventActionMultiViewStreams: number;
  healthStreams: number;
  audioTalkDownSpeakers: number;
  
  // Monitoring details
  totalEventsPerMonth: number;
  totalVirtualPatrolsPerMonth: number;
  patrolFrequency: string;
  totalHealthPatrolsPerMonth: number;
  totalEventActionMultiViewsPerMonth: number;
  totalEscalationsMaximum: number;
  gdodsDispatchesPerMonth: number;
  sgppScheduledPatrolsPerMonth: number;
  
  // Patrol details
  onDemandGuardDispatchDetail: string;
  sgppScheduledGuardPatrolDetail: string;
  sgppScheduledGuardPatrolsScheduleDetail: string;
  
  // Use Case tab fields
  useCaseCommitment: string;
  useCaseResponse: string;
  sowDetailedOutline: string;
  scheduleDetails: string;
  quoteWithSowAttached: string;
  quoteDesignAttached: string;
  
  // Incident Types - Criminal Activity Group
  obviousCriminalAct: boolean;
  activeBreakIn: boolean;
  destructionOfProperty: boolean;
  carDrivingThroughGate: boolean;
  carBurglaries: boolean;
  trespassing: boolean;
  carsBrokenIntoAfterFact: boolean;
  brokenGlassWindows: boolean;
  
  // Suspicious Activity Group
  suspiciousActivity: boolean;
  intentToCommitCriminalAct: boolean;
  checkingMultipleCarDoors: boolean;
  dumpsterDivingOrDumping: boolean;
  
  // Nuisance Activity Group
  urinationOrOtherBodilyFunctions: boolean;
  presenceOfScooters: boolean;
  leavingTrash: boolean;
  
  // Emergency/Medical Group
  emergencyServices: boolean;
  personInjuredOrDistress: boolean;
  obviousMedicalEmergency: boolean;
  visibleFireOrSmoke: boolean;
  
  // Tenant Activity Group
  tenantsMovingOut: boolean;
  largeItemsMovedAfterHours: boolean;
  
  // Restricted Access Group
  personInRestrictedArea: boolean;
  sittingOrSleeping: boolean;
  presentInProhibitedArea: boolean;
  
  // Loitering Group
  loitering: boolean;
  activeGathering: boolean;
  groupsLoiteringGathering: boolean;
  homelessVagrant: boolean;
  sleepingOnSiteEncampments: boolean;
  loiteringInStairwells: boolean;
  personsSmoking: boolean;
  vehicleLoiteringInArea: boolean;
  
  // Custom Incident Types
  customIncidentType1: string;
  customIncidentType1Selected: boolean;
  customIncidentType2: string;
  customIncidentType2Selected: boolean;
  customIncidentType3: string;
  customIncidentType3Selected: boolean;
  customIncidentType4: string;
  customIncidentType4Selected: boolean;
  customIncidentType5: string;
  customIncidentType5Selected: boolean;
}
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
  
  // Form data for all tabs
  const [formData, setFormData] = useState<FormData>({
    // Discovery tab fields
    bdmOwner: "",
    salesEngineer: "",
    kvgSme: "",
    customerName: "",
    siteAddress: "",
    city: "",
    state: "",
    zipCode: "",
    crmOpportunity: "",
    quoteDate: "04/18/2025",
    timeZone: "",
    opportunityStage: "Expect",
    opportunityType: "",
    siteEnvironment: "",
    region: "",
    customerVertical: "",
    propertyCategory: "",
    
    // Technology fields
    technology: "",
    technologyDeployed: "",
    cameraType: "",
    rspndrGdods: "",
    rspndrSubscriptions: "",
    installType: "",
    
    // Stream counts
    eventVideoTriggerStreams: 0,
    virtualPatrolStreams: 0,
    eventActionClipStreams: 0,
    eventActionMultiViewStreams: 0,
    healthStreams: 0,
    audioTalkDownSpeakers: 0,
    
    // Monitoring details
    totalEventsPerMonth: 0,
    totalVirtualPatrolsPerMonth: 0,
    patrolFrequency: "",
    totalHealthPatrolsPerMonth: 30, // Default value from the template
    totalEventActionMultiViewsPerMonth: 0,
    totalEscalationsMaximum: 0,
    gdodsDispatchesPerMonth: 0,
    sgppScheduledPatrolsPerMonth: 0,
    
    // Patrol details
    onDemandGuardDispatchDetail: "",
    sgppScheduledGuardPatrolDetail: "",
    sgppScheduledGuardPatrolsScheduleDetail: "",
    
    // Use Case tab fields
    useCaseCommitment: "",
    useCaseResponse: "",
    sowDetailedOutline: "",
    scheduleDetails: "",
    quoteWithSowAttached: "Select",
    quoteDesignAttached: "Select",
    
    // Incident Types - Criminal Activity Group
    obviousCriminalAct: false,
    activeBreakIn: false,
    destructionOfProperty: false,
    carDrivingThroughGate: false,
    carBurglaries: false,
    trespassing: false,
    carsBrokenIntoAfterFact: false,
    brokenGlassWindows: false,
    
    // Suspicious Activity Group
    suspiciousActivity: false,
    intentToCommitCriminalAct: false,
    checkingMultipleCarDoors: false,
    dumpsterDivingOrDumping: false,
    
    // Nuisance Activity Group
    urinationOrOtherBodilyFunctions: false,
    presenceOfScooters: false,
    leavingTrash: false,
    
    // Emergency/Medical Group
    emergencyServices: false,
    personInjuredOrDistress: false,
    obviousMedicalEmergency: false,
    visibleFireOrSmoke: false,
    
    // Tenant Activity Group
    tenantsMovingOut: false,
    largeItemsMovedAfterHours: false,
    
    // Restricted Access Group
    personInRestrictedArea: false,
    sittingOrSleeping: false,
    presentInProhibitedArea: false,
    
    // Loitering Group
    loitering: false,
    activeGathering: false,
    groupsLoiteringGathering: false,
    homelessVagrant: false,
    sleepingOnSiteEncampments: false,
    loiteringInStairwells: false,
    personsSmoking: false,
    vehicleLoiteringInArea: false,
    
    // Custom Incident Types
    customIncidentType1: "",
    customIncidentType1Selected: false,
    customIncidentType2: "",
    customIncidentType2Selected: false,
    customIncidentType3: "",
    customIncidentType3Selected: false,
    customIncidentType4: "",
    customIncidentType4Selected: false,
    customIncidentType5: "",
    customIncidentType5Selected: false,
  });
  
  // Handle form data change
  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
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
      <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">Kastle Video Guarding</h1>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
        Configure video monitoring settings, patrol schedules, and service commitments for your Kastle Video Guarding project
      </p>

      <Tabs defaultValue="stream-details" className="w-full">
        <TabsList className="grid grid-cols-7 mb-6 p-1 gap-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-slate-200 shadow-md">
          <TabsTrigger value="stream-details" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-500 data-[state=active]:to-teal-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">📹</span> Stream Details
          </TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">🔍</span> 1. Discovery - BDM
          </TabsTrigger>
          <TabsTrigger value="site-assessment" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">🏢</span> 2. Site Assessment - SE
          </TabsTrigger>
          <TabsTrigger value="use-case" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">📝</span> 3. Use Case - SOW - SME
          </TabsTrigger>
          <TabsTrigger value="voc-protocol" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">🎯</span> 4. VOC Protocol - AM
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">🚀</span> 5. Project Deployment - PM
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2 transition-all font-medium py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-500 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <span className="text-xl">💰</span> Pricing
          </TabsTrigger>
        </TabsList>

        {/* Stream Details Tab Content */}
        <TabsContent value="stream-details">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-teal-800">
                <span className="p-1.5 bg-teal-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <VideoIcon size={20} />
                </span>
                Camera Video Stream Details
              </CardTitle>
              <CardDescription className="text-base text-teal-700">
                Configure and manage your camera streams with detailed settings for monitoring and patrol groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => addStream()} 
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus size={16} /> Add Stream
                </Button>
              </div>
              
              {streams.length > 0 ? (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="text-xs bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th colSpan={3} className="px-2 py-3 text-center bg-teal-600 text-white font-semibold rounded-tl-lg">Camera Video Stream Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-blue-600 text-white font-semibold">FOV Area Accessibility</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-indigo-600 text-white font-semibold">Camera Type & Environment</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-purple-600 text-white font-semibold">Unique Use Case Problem</th>
                        <th colSpan={2} className="px-2 py-3 text-center bg-pink-600 text-white font-semibold">Speaker Video Stream Association & Name</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-orange-600 text-white font-semibold">Event Monitoring Details</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-red-600 text-white font-semibold">Patrol Group Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-gray-700 text-white font-semibold rounded-tr-lg">Actions</th>
                      </tr>
                      <tr className="border-b text-center bg-gray-200 font-semibold">
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
                            <div className="relative">
                              <Textarea 
                                value={stream.location || ""}
                                onChange={(e) => updateStream(stream.id, "location", e.target.value)}
                                className="min-h-[80px] resize-y focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 bg-white/90 text-sm"
                                placeholder="Enter the location and naming of the camera video stream - see note example"
                              />
                              <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                {stream.location?.length || 0} chars
                              </div>
                            </div>
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
                            <div className="relative">
                              <Textarea 
                                value={stream.useCaseProblem || ""}
                                onChange={(e) => updateStream(stream.id, "useCaseProblem", e.target.value)}
                                className="min-h-[100px] resize-y focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/90 text-sm"
                                placeholder="Enter any unique use case problem for this camera or scene if different from the site problem defined above."
                              />
                              <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                {stream.useCaseProblem?.length || 0} chars
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="relative">
                              <Textarea 
                                value={stream.speakerAssociation || ""}
                                onChange={(e) => updateStream(stream.id, "speakerAssociation", e.target.value)}
                                className="min-h-[100px] resize-y focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 bg-white/90 text-sm"
                                placeholder="Fill in if speaker is dedicated to single camera or a group of cameras (ref numbers in column A)"
                              />
                              <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                {stream.speakerAssociation?.length || 0} chars
                              </div>
                            </div>
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
                <div className="text-center bg-gray-50 p-8 rounded-md border border-gray-200 shadow-sm">
                  <VideoIcon className="w-12 h-12 text-teal-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No camera streams added yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start by adding camera streams to configure video monitoring and patrol settings for your KVG project.
                  </p>
                  <Button onClick={() => addStream()} className="flex items-center gap-1 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <Plus size={16} /> Add your first stream
                  </Button>
                </div>
              )}
              
              <div className="mt-8 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-md border border-blue-100 shadow-sm">
                <div className="flex items-start gap-2">
                  <InfoIcon className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 text-base">About Camera Streams</h3>
                    <p className="text-sm text-blue-900">
                      Configure each camera stream with its specified monitoring and patrol details. You can specify unique problem descriptions for each camera and associate speakers with one or multiple cameras. 
                      The text fields support larger entries for detailed descriptions. Use the duplicate function (copy icon) to quickly create similar streams.
                    </p>
                  </div>
                </div>
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
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-purple-800">
                <span className="p-1.5 bg-purple-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </span>
                Use Case - SOW - SME
              </CardTitle>
              <CardDescription className="text-base text-purple-700">
                Define the use case, scope of work, and service commitment details for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Opportunity Stage Ownership Section */}
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-4">Opportunity Stage Ownership</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bdmOwner">BDM Name:</Label>
                      <Input 
                        id="bdmOwner"
                        value={formData.bdmOwner} 
                        onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                        placeholder="Enter BDM name"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region:</Label>
                      <Select 
                        value={formData.region} 
                        onValueChange={(value) => handleFormChange("region", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Northeast">Northeast</SelectItem>
                          <SelectItem value="Southeast">Southeast</SelectItem>
                          <SelectItem value="Midwest">Midwest</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                          <SelectItem value="Southwest">Southwest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customerVertical">Customer Vertical:</Label>
                      <Select 
                        value={formData.customerVertical} 
                        onValueChange={(value) => handleFormChange("customerVertical", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kvgSme">KVG SME Name:</Label>
                      <Select 
                        value={formData.kvgSme} 
                        onValueChange={(value) => handleFormChange("kvgSme", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="John Smith">John Smith</SelectItem>
                          <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                          <SelectItem value="Mark Johnson">Mark Johnson</SelectItem>
                          <SelectItem value="Sarah Williams">Sarah Williams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kvgSmeApproval">KVG SME Approval:</Label>
                      <Select 
                        value={formData.useCaseCommitment} 
                        onValueChange={(value) => handleFormChange("useCaseCommitment", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="propertyCategory">Property Category:</Label>
                      <Select 
                        value={formData.propertyCategory} 
                        onValueChange={(value) => handleFormChange("propertyCategory", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                          <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* SOW Outline Section */}
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-4">SOW Outline</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="technologyDeployed">Technology Designed/Deployed:</Label>
                      <Select 
                        value={formData.technologyDeployed} 
                        onValueChange={(value) => handleFormChange("technologyDeployed", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KastlePresence">KastlePresence</SelectItem>
                          <SelectItem value="KastleVideo">KastleVideo</SelectItem>
                          <SelectItem value="KastleAccess">KastleAccess</SelectItem>
                          <SelectItem value="KastleFrontOffice">KastleFrontOffice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cameraType">Type of Cameras:</Label>
                      <Select 
                        value={formData.cameraType} 
                        onValueChange={(value) => handleFormChange("cameraType", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                          <SelectItem value="PTZ">PTZ</SelectItem>
                          <SelectItem value="Dome">Dome</SelectItem>
                          <SelectItem value="Bullet">Bullet</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rspndrGdods">RSPNDR - GDoDS:</Label>
                      <Select 
                        value={formData.rspndrGdods} 
                        onValueChange={(value) => handleFormChange("rspndrGdods", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="installType">Type of Install Account:</Label>
                      <Select 
                        value={formData.installType} 
                        onValueChange={(value) => handleFormChange("installType", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New Install">New Install</SelectItem>
                          <SelectItem value="Takeover">Takeover</SelectItem>
                          <SelectItem value="Upgrade">Upgrade</SelectItem>
                          <SelectItem value="Extension">Extension</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rspndrSubscriptions">RSPNDR Subscriptions:</Label>
                      <Select 
                        value={formData.rspndrSubscriptions} 
                        onValueChange={(value) => handleFormChange("rspndrSubscriptions", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Stream counts */}
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    <div>
                      <Label htmlFor="eventVideoTriggerStreams">Event Video|Trigger Streams:</Label>
                      <Input 
                        id="eventVideoTriggerStreams"
                        type="number"
                        value={formData.eventVideoTriggerStreams.toString()} 
                        onChange={(e) => handleFormChange("eventVideoTriggerStreams", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="virtualPatrolStreams">Virtual Patrol Streams:</Label>
                      <Input 
                        id="virtualPatrolStreams"
                        type="number"
                        value={formData.virtualPatrolStreams.toString()} 
                        onChange={(e) => handleFormChange("virtualPatrolStreams", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventActionClipStreams">Event Action Clip Streams:</Label>
                      <Input 
                        id="eventActionClipStreams"
                        type="number"
                        value={formData.eventActionClipStreams.toString()} 
                        onChange={(e) => handleFormChange("eventActionClipStreams", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventActionMultiViewStreams">Event Action Multi-View Streams:</Label>
                      <Input 
                        id="eventActionMultiViewStreams"
                        type="number"
                        value={formData.eventActionMultiViewStreams.toString()} 
                        onChange={(e) => handleFormChange("eventActionMultiViewStreams", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="healthStreams">Health Streams:</Label>
                      <Input 
                        id="healthStreams"
                        type="number"
                        value={formData.healthStreams.toString()} 
                        onChange={(e) => handleFormChange("healthStreams", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="audioTalkDownSpeakers">Audio Talk-Down Speakers:</Label>
                      <Input 
                        id="audioTalkDownSpeakers"
                        type="number"
                        value={formData.audioTalkDownSpeakers.toString()} 
                        onChange={(e) => handleFormChange("audioTalkDownSpeakers", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  {/* Monitoring details */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div>
                      <Label htmlFor="totalEventsPerMonth">Total Events/Month - Maximum:</Label>
                      <Input 
                        id="totalEventsPerMonth"
                        type="number"
                        value={formData.totalEventsPerMonth.toString()} 
                        onChange={(e) => handleFormChange("totalEventsPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalVirtualPatrolsPerMonth">Total Virtual Patrols/Month:</Label>
                      <Input 
                        id="totalVirtualPatrolsPerMonth"
                        type="number"
                        value={formData.totalVirtualPatrolsPerMonth.toString()} 
                        onChange={(e) => handleFormChange("totalVirtualPatrolsPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patrolFrequency">Patrol Frequency:</Label>
                      <Input 
                        id="patrolFrequency"
                        value={formData.patrolFrequency} 
                        onChange={(e) => handleFormChange("patrolFrequency", e.target.value)}
                        placeholder="Hourly/30 Mins/Other"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalHealthPatrolsPerMonth">Total Health Patrols/Month:</Label>
                      <Input 
                        id="totalHealthPatrolsPerMonth"
                        type="number"
                        value={formData.totalHealthPatrolsPerMonth.toString()} 
                        onChange={(e) => handleFormChange("totalHealthPatrolsPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalEventActionMultiViewsPerMonth">Total Event Action Multi-Views/Month:</Label>
                      <Input 
                        id="totalEventActionMultiViewsPerMonth"
                        type="number"
                        value={formData.totalEventActionMultiViewsPerMonth.toString()} 
                        onChange={(e) => handleFormChange("totalEventActionMultiViewsPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalEscalationsMaximum">Total Escalations - Maximum:</Label>
                      <Input 
                        id="totalEscalationsMaximum"
                        type="number"
                        value={formData.totalEscalationsMaximum.toString()} 
                        onChange={(e) => handleFormChange("totalEscalationsMaximum", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gdodsDispatchesPerMonth">GDoDS - Dispatches/Month:</Label>
                      <Input 
                        id="gdodsDispatchesPerMonth"
                        type="number"
                        value={formData.gdodsDispatchesPerMonth.toString()} 
                        onChange={(e) => handleFormChange("gdodsDispatchesPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgppScheduledPatrolsPerMonth">SGPP - Scheduled Patrols/Month:</Label>
                      <Input 
                        id="sgppScheduledPatrolsPerMonth"
                        type="number"
                        value={formData.sgppScheduledPatrolsPerMonth.toString()} 
                        onChange={(e) => handleFormChange("sgppScheduledPatrolsPerMonth", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  {/* Patrol details */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <Label htmlFor="onDemandGuardDispatchDetail">On Demand Guard Dispatch Detail:</Label>
                      <Textarea 
                        id="onDemandGuardDispatchDetail"
                        value={formData.onDemandGuardDispatchDetail} 
                        onChange={(e) => handleFormChange("onDemandGuardDispatchDetail", e.target.value)}
                        placeholder="Fill in what the Guard needs to do on the Dispatches, expand in the SOW if needed"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgppScheduledGuardPatrolDetail">SGPP - Scheduled Guard Patrol Detail:</Label>
                      <Textarea 
                        id="sgppScheduledGuardPatrolDetail"
                        value={formData.sgppScheduledGuardPatrolDetail} 
                        onChange={(e) => handleFormChange("sgppScheduledGuardPatrolDetail", e.target.value)}
                        placeholder="Fill in what the Guard needs to do on Scheduled Patrols, expand in the SOW if needed"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgppScheduledGuardPatrolsScheduleDetail">SGPP - Scheduled Guard Patrols - Schedule Detail:</Label>
                      <Textarea 
                        id="sgppScheduledGuardPatrolsScheduleDetail"
                        value={formData.sgppScheduledGuardPatrolsScheduleDetail} 
                        onChange={(e) => handleFormChange("sgppScheduledGuardPatrolsScheduleDetail", e.target.value)}
                        placeholder="Fill in schedule details for the days of week/month, hours of day, frequency of patrols, expand in the SOW if needed"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                  </div>
                  
                  {/* Incident Types Section */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Incident types to be monitored:</h3>
                    <p className="text-sm text-gray-500 mb-4">Typically 3-4 max per camera stream, clarify in use case and if needed call out unique use cases per camera in the camera list below.</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* Criminal Activity Group */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.obviousCriminalAct}
                            onPressedChange={(value) => handleFormChange("obviousCriminalAct", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            OBVIOUS CRIMINAL ACT
                          </Toggle>
                          <span className="text-xs">{formData.obviousCriminalAct ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.activeBreakIn}
                            onPressedChange={(value) => handleFormChange("activeBreakIn", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            ACTIVE BREAK-IN
                          </Toggle>
                          <span className="text-xs">{formData.activeBreakIn ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.destructionOfProperty}
                            onPressedChange={(value) => handleFormChange("destructionOfProperty", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            DESTRUCTION OF PROPERTY
                          </Toggle>
                          <span className="text-xs">{formData.destructionOfProperty ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.carDrivingThroughGate}
                            onPressedChange={(value) => handleFormChange("carDrivingThroughGate", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            CAR DRIVING THROUGH GATE
                          </Toggle>
                          <span className="text-xs">{formData.carDrivingThroughGate ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.suspiciousActivity}
                            onPressedChange={(value) => handleFormChange("suspiciousActivity", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            SUSPICIOUS ACTIVITY
                          </Toggle>
                          <span className="text-xs">{formData.suspiciousActivity ? "Yes" : "No"}</span>
                        </div>
                      </div>
                      
                      {/* Nuisance & Restricted Access Group */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.urinationOrOtherBodilyFunctions}
                            onPressedChange={(value) => handleFormChange("urinationOrOtherBodilyFunctions", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            URINATION OR BODILY FUNCTIONS
                          </Toggle>
                          <span className="text-xs">{formData.urinationOrOtherBodilyFunctions ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.presenceOfScooters}
                            onPressedChange={(value) => handleFormChange("presenceOfScooters", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            PRESENCE OF SCOOTERS
                          </Toggle>
                          <span className="text-xs">{formData.presenceOfScooters ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.emergencyServices}
                            onPressedChange={(value) => handleFormChange("emergencyServices", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            EMERGENCY SERVICES ON SITE
                          </Toggle>
                          <span className="text-xs">{formData.emergencyServices ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.personInRestrictedArea}
                            onPressedChange={(value) => handleFormChange("personInRestrictedArea", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            PERSON IN RESTRICTED AREA
                          </Toggle>
                          <span className="text-xs">{formData.personInRestrictedArea ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.sittingOrSleeping}
                            onPressedChange={(value) => handleFormChange("sittingOrSleeping", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            SITTING OR SLEEPING IN AREA
                          </Toggle>
                          <span className="text-xs">{formData.sittingOrSleeping ? "Yes" : "No"}</span>
                        </div>
                      </div>
                      
                      {/* Loitering Group */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.loitering}
                            onPressedChange={(value) => handleFormChange("loitering", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            LOITERING
                          </Toggle>
                          <span className="text-xs">{formData.loitering ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.activeGathering}
                            onPressedChange={(value) => handleFormChange("activeGathering", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            ACTIVE GATHERING
                          </Toggle>
                          <span className="text-xs">{formData.activeGathering ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.groupsLoiteringGathering}
                            onPressedChange={(value) => handleFormChange("groupsLoiteringGathering", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            GROUPS LOITERING/GATHERING
                          </Toggle>
                          <span className="text-xs">{formData.groupsLoiteringGathering ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.homelessVagrant}
                            onPressedChange={(value) => handleFormChange("homelessVagrant", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            HOMELESS/VAGRANT
                          </Toggle>
                          <span className="text-xs">{formData.homelessVagrant ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Toggle 
                            pressed={formData.sleepingOnSiteEncampments}
                            onPressedChange={(value) => handleFormChange("sleepingOnSiteEncampments", value)}
                            className="data-[state=on]:bg-green-500"
                          >
                            SLEEPING ON SITE/ENCAMPMENTS
                          </Toggle>
                          <span className="text-xs">{formData.sleepingOnSiteEncampments ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Incident Types */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          value={formData.customIncidentType1}
                          onChange={(e) => handleFormChange("customIncidentType1", e.target.value)}
                          placeholder="Custom incident type"
                          className="bg-white flex-1"
                        />
                        <Toggle 
                          pressed={formData.customIncidentType1Selected}
                          onPressedChange={(value) => handleFormChange("customIncidentType1Selected", value)}
                          className="data-[state=on]:bg-green-500"
                        >
                          {formData.customIncidentType1Selected ? "Yes" : "No"}
                        </Toggle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={formData.customIncidentType2}
                          onChange={(e) => handleFormChange("customIncidentType2", e.target.value)}
                          placeholder="Custom incident type"
                          className="bg-white flex-1"
                        />
                        <Toggle 
                          pressed={formData.customIncidentType2Selected}
                          onPressedChange={(value) => handleFormChange("customIncidentType2Selected", value)}
                          className="data-[state=on]:bg-green-500"
                        >
                          {formData.customIncidentType2Selected ? "Yes" : "No"}
                        </Toggle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={formData.customIncidentType3}
                          onChange={(e) => handleFormChange("customIncidentType3", e.target.value)}
                          placeholder="Custom incident type"
                          className="bg-white flex-1"
                        />
                        <Toggle 
                          pressed={formData.customIncidentType3Selected}
                          onPressedChange={(value) => handleFormChange("customIncidentType3Selected", value)}
                          className="data-[state=on]:bg-green-500"
                        >
                          {formData.customIncidentType3Selected ? "Yes" : "No"}
                        </Toggle>
                      </div>
                    </div>
                  </div>
                  
                  {/* Use Case Commitment and Response */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <Label htmlFor="useCaseCommitment">Use Case Commitment:</Label>
                      <Textarea 
                        id="useCaseCommitment"
                        value={formData.useCaseCommitment} 
                        onChange={(e) => handleFormChange("useCaseCommitment", e.target.value)}
                        placeholder="Fill in or modify from Discovery tab"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="useCaseResponse">Use Case Response:</Label>
                      <Textarea 
                        id="useCaseResponse"
                        value={formData.useCaseResponse} 
                        onChange={(e) => handleFormChange("useCaseResponse", e.target.value)}
                        placeholder="Fill in or modify from Discovery tab, add in any needs for RSPNDR Guard Dispatch on Demand Services"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sowDetailedOutline">SOW Detailed Outline:</Label>
                      <Textarea 
                        id="sowDetailedOutline"
                        value={formData.sowDetailedOutline} 
                        onChange={(e) => handleFormChange("sowDetailedOutline", e.target.value)}
                        placeholder="Fill in from price quoting worksheet"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduleDetails">Schedule Details:</Label>
                      <Textarea 
                        id="scheduleDetails"
                        value={formData.scheduleDetails} 
                        onChange={(e) => handleFormChange("scheduleDetails", e.target.value)}
                        placeholder="Fill in from tab on or detail complex schedules based on different days or camera groups"
                        className="bg-white min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Quote Attachment Section */}
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-4">Paste Screen-shot of KVG Services Quote</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center mb-4">
                    <div className="text-center mb-4">
                      <Label htmlFor="quoteScreenshot" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <ImageIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Click to upload quote screenshot</span>
                        <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 10MB)</span>
                        <Input id="quoteScreenshot" type="file" className="hidden" />
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                      The KVG SME Quote must be attached before completing any CRM Opportunity Quote.
                    </p>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="quoteWithSowAttached">Quote with SOW Attached:</Label>
                    <Select 
                      value={formData.quoteWithSowAttached} 
                      onValueChange={(value) => handleFormChange("quoteWithSowAttached", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* KVG Services Configuration Section */}
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-4">Paste spreadsheet of KVG Services configuration from Calculator</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center mb-4">
                    <div className="text-center mb-4">
                      <Label htmlFor="configSpreadsheet" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <ImageIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Click to upload spreadsheet</span>
                        <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 10MB)</span>
                        <Input id="configSpreadsheet" type="file" className="hidden" />
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                      KVG SME to paste in this area from the KVG calculator "KVG Process Output" Rows 6 to End and Column A-Q. Paste in same columns here and add pics in columns designated after R.
                    </p>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="quoteDesignAttached">Quote Design Attached:</Label>
                    <Select 
                      value={formData.quoteDesignAttached} 
                      onValueChange={(value) => handleFormChange("quoteDesignAttached", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
