import React, { useState, useMemo, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  X,
  Save,
  Check,
  Plus, 
  Trash2 as Trash, 
  Copy,
  ImageIcon,
  Upload,
  Info as InfoIcon,
  Video as VideoIcon,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import StreamImagesModal from "@/components/modals/StreamImagesModal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/context/ProjectContext";
import { KastleVideoGuarding, KvgStream, KvgStreamImage, KvgPriceStream } from "@shared/schema";

// Define Stream interface if not already in types.ts
interface Stream {
  id: number;
  location: string;
  description: string;
  camera_type: string;
  quantity: number;
  mounting_height: string;
  resolution: string;
  focal_length: string;
  event_type: string;
  eventVolume: number;
  patrol_group: string;
  notes: string;
  images: StreamImage[];
}

interface StreamImage {
  id: number;
  url: string;
  description: string;
}

// Define form data interface
interface KvgFormData {
  projectId: number;
  customerType: "new" | "existing";
  environment: string;
  monitoringHours: "24x7" | "after-hours" | "custom";
  customMonitoringHours: string;
  guardsRequired: boolean;
  patrolGroupsRequired: boolean;
  streamGrouping: "location" | "event-type" | "none";
  existingCamerasCount: number;
  systemType: string;
  vmsType: string;
  vmsNotes: string;
  streamingProtocol: string;
  streamNotes: string;
  portForwarding: boolean;
  staticIp: boolean;
  healthMonitoring: boolean;
  videoStorage: boolean;
  videoRetentionDays: number;
  videoDownloadAccess: boolean;
  analyticsEnabled: boolean;
  customizableRules: boolean;
  otherAnalyticsNotes: string;
  incidentDispatchRequired: boolean;
  dispatchServiceLevel: string;
  firstResponderService: boolean;
  firstResponderDetails: string;
  audibleIntervention: boolean;
  audibleInterventionDetails: string;
  videoVerification: boolean;
  videoVerificationDetails: string;
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
  streams: Stream[];
}

const KastleVideoGuardingPage: React.FC = () => {
  const { toast } = useToast();
  const { currentProject } = useProject();
  
  // View mode for stream details (cards or list)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // State for streams
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  // Initialize form data with default values
  const [formData, setFormData] = useState<KvgFormData>({
    projectId: currentProject?.id || 0,
    customerType: "new",
    environment: "commercial",
    monitoringHours: "24x7",
    customMonitoringHours: "",
    guardsRequired: false,
    patrolGroupsRequired: false,
    streamGrouping: "location",
    existingCamerasCount: 0,
    systemType: "",
    vmsType: "",
    vmsNotes: "",
    streamingProtocol: "",
    streamNotes: "",
    portForwarding: false,
    staticIp: false,
    healthMonitoring: false,
    videoStorage: false,
    videoRetentionDays: 30,
    videoDownloadAccess: false,
    analyticsEnabled: false,
    customizableRules: false,
    otherAnalyticsNotes: "",
    incidentDispatchRequired: false,
    dispatchServiceLevel: "",
    firstResponderService: false,
    firstResponderDetails: "",
    audibleIntervention: false,
    audibleInterventionDetails: "",
    videoVerification: false,
    videoVerificationDetails: "",
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
    streams: []
  });

  // Fetch KVG data
  const { data: kvgData, isLoading: isLoadingKvg } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'kvg'],
    queryFn: async () => {
      if (!currentProject?.id) return null;
      const res = await apiRequest('GET', `/api/projects/${currentProject.id}/kvg`);
      return await res.json();
    },
    enabled: !!currentProject?.id
  });

  // Fetch KVG streams
  const { data: streamsData, isLoading: isLoadingStreams } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'kvg', 'streams'],
    queryFn: async () => {
      if (!currentProject?.id) return [];
      const res = await apiRequest('GET', `/api/projects/${currentProject.id}/kvg/streams`);
      return await res.json();
    },
    enabled: !!currentProject?.id
  });

  // Mutation to save KVG data
  const saveKvgMutation = useMutation({
    mutationFn: async (data: KvgFormData) => {
      if (!currentProject?.id) throw new Error("No project selected");
      
      const kvgData = {
        projectId: currentProject.id,
        customerType: data.customerType,
        environment: data.environment,
        monitoringHours: data.monitoringHours,
        customMonitoringHours: data.customMonitoringHours,
        guardsRequired: data.guardsRequired,
        patrolGroupsRequired: data.patrolGroupsRequired,
        streamGrouping: data.streamGrouping,
        existingCamerasCount: data.existingCamerasCount,
        systemType: data.systemType,
        vmsType: data.vmsType,
        vmsNotes: data.vmsNotes,
        streamingProtocol: data.streamingProtocol,
        streamNotes: data.streamNotes,
        portForwarding: data.portForwarding,
        staticIp: data.staticIp,
        healthMonitoring: data.healthMonitoring,
        videoStorage: data.videoStorage,
        videoRetentionDays: data.videoRetentionDays,
        videoDownloadAccess: data.videoDownloadAccess,
        analyticsEnabled: data.analyticsEnabled,
        customizableRules: data.customizableRules,
        otherAnalyticsNotes: data.otherAnalyticsNotes,
        incidentDispatchRequired: data.incidentDispatchRequired,
        dispatchServiceLevel: data.dispatchServiceLevel,
        firstResponderService: data.firstResponderService,
        firstResponderDetails: data.firstResponderDetails,
        audibleIntervention: data.audibleIntervention,
        audibleInterventionDetails: data.audibleInterventionDetails,
        videoVerification: data.videoVerification,
        videoVerificationDetails: data.videoVerificationDetails,
        customIncidentType1: data.customIncidentType1,
        customIncidentType1Selected: data.customIncidentType1Selected,
        customIncidentType2: data.customIncidentType2,
        customIncidentType2Selected: data.customIncidentType2Selected,
        customIncidentType3: data.customIncidentType3,
        customIncidentType3Selected: data.customIncidentType3Selected,
        customIncidentType4: data.customIncidentType4,
        customIncidentType4Selected: data.customIncidentType4Selected,
        customIncidentType5: data.customIncidentType5,
        customIncidentType5Selected: data.customIncidentType5Selected,
      };
      
      const res = await apiRequest('POST', `/api/projects/${currentProject.id}/kvg`, kvgData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg'] });
      toast({
        title: "KVG data saved",
        description: "Kastle Video Guarding data has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to save KVG data:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving the KVG data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation to save stream data
  const saveStreamMutation = useMutation({
    mutationFn: async (stream: Stream) => {
      if (!currentProject?.id) throw new Error("No project selected");
      
      const streamData = {
        kvgId: kvgData?.id,
        location: stream.location,
        description: stream.description,
        camera_type: stream.camera_type,
        quantity: stream.quantity,
        mounting_height: stream.mounting_height,
        resolution: stream.resolution,
        focal_length: stream.focal_length,
        event_type: stream.event_type,
        eventVolume: stream.eventVolume,
        patrol_group: stream.patrol_group,
        notes: stream.notes,
      };
      
      let res;
      if (stream.id < 0) {
        // New stream
        res = await apiRequest('POST', `/api/projects/${currentProject.id}/kvg/streams`, streamData);
      } else {
        // Update existing stream
        res = await apiRequest('PUT', `/api/projects/${currentProject.id}/kvg/streams/${stream.id}`, streamData);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg', 'streams'] });
      toast({
        title: "Stream saved",
        description: "Stream data has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to save stream:", error);
      toast({
        title: "Failed to save stream",
        description: "There was an error saving the stream data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete stream mutation
  const deleteStreamMutation = useMutation({
    mutationFn: async (streamId: number) => {
      if (!currentProject?.id || streamId < 0) return;
      await apiRequest('DELETE', `/api/projects/${currentProject.id}/kvg/streams/${streamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg', 'streams'] });
      toast({
        title: "Stream deleted",
        description: "The stream has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete stream:", error);
      toast({
        title: "Failed to delete",
        description: "There was an error removing the stream. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update form data when API data is loaded
  useEffect(() => {
    if (kvgData) {
      setFormData(prev => ({
        ...prev,
        customerType: kvgData.customerType || "new",
        environment: kvgData.environment || "commercial",
        monitoringHours: kvgData.monitoringHours || "24x7",
        customMonitoringHours: kvgData.customMonitoringHours || "",
        guardsRequired: kvgData.guardsRequired || false,
        patrolGroupsRequired: kvgData.patrolGroupsRequired || false,
        streamGrouping: kvgData.streamGrouping || "location",
        existingCamerasCount: kvgData.existingCamerasCount || 0,
        systemType: kvgData.systemType || "",
        vmsType: kvgData.vmsType || "",
        vmsNotes: kvgData.vmsNotes || "",
        streamingProtocol: kvgData.streamingProtocol || "",
        streamNotes: kvgData.streamNotes || "",
        portForwarding: kvgData.portForwarding || false,
        staticIp: kvgData.staticIp || false,
        healthMonitoring: kvgData.healthMonitoring || false,
        videoStorage: kvgData.videoStorage || false,
        videoRetentionDays: kvgData.videoRetentionDays || 30,
        videoDownloadAccess: kvgData.videoDownloadAccess || false,
        analyticsEnabled: kvgData.analyticsEnabled || false,
        customizableRules: kvgData.customizableRules || false,
        otherAnalyticsNotes: kvgData.otherAnalyticsNotes || "",
        incidentDispatchRequired: kvgData.incidentDispatchRequired || false,
        dispatchServiceLevel: kvgData.dispatchServiceLevel || "",
        firstResponderService: kvgData.firstResponderService || false,
        firstResponderDetails: kvgData.firstResponderDetails || "",
        audibleIntervention: kvgData.audibleIntervention || false,
        audibleInterventionDetails: kvgData.audibleInterventionDetails || "",
        videoVerification: kvgData.videoVerification || false,
        videoVerificationDetails: kvgData.videoVerificationDetails || "",
        customIncidentType1: kvgData.customIncidentType1 || "",
        customIncidentType1Selected: kvgData.customIncidentType1Selected || false,
        customIncidentType2: kvgData.customIncidentType2 || "",
        customIncidentType2Selected: kvgData.customIncidentType2Selected || false,
        customIncidentType3: kvgData.customIncidentType3 || "",
        customIncidentType3Selected: kvgData.customIncidentType3Selected || false,
        customIncidentType4: kvgData.customIncidentType4 || "",
        customIncidentType4Selected: kvgData.customIncidentType4Selected || false,
        customIncidentType5: kvgData.customIncidentType5 || "",
        customIncidentType5Selected: kvgData.customIncidentType5Selected || false,
      }));
    }
  }, [kvgData]);

  // Update streams when API data is loaded
  useEffect(() => {
    if (streamsData && Array.isArray(streamsData)) {
      const mappedStreams = streamsData.map(stream => ({
        id: stream.id,
        location: stream.location || "",
        description: stream.description || "",
        camera_type: stream.camera_type || "",
        quantity: stream.quantity || 1,
        mounting_height: stream.mounting_height || "",
        resolution: stream.resolution || "",
        focal_length: stream.focal_length || "",
        event_type: stream.event_type || "",
        eventVolume: stream.eventVolume || 0,
        patrol_group: stream.patrol_group || "",
        notes: stream.notes || "",
        images: stream.images || []
      }));
      
      setFormData(prev => ({
        ...prev,
        streams: mappedStreams
      }));
    }
  }, [streamsData]);

  // Save all data function
  const saveAllData = async () => {
    if (!currentProject?.id) {
      toast({
        title: "No project selected",
        description: "Please select a project before saving.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save main KVG data
      await saveKvgMutation.mutateAsync(formData);
      
      // Save each stream
      for (const stream of formData.streams) {
        await saveStreamMutation.mutateAsync(stream);
      }
      
      toast({
        title: "All data saved",
        description: "All Kastle Video Guarding data has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error saving data",
        description: "There was an error saving the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form field changes
  const handleChange = (field: keyof KvgFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a new stream
  const addStream = () => {
    const newStream: Stream = {
      id: -Date.now(), // Temporary negative ID to identify new streams
      location: "",
      description: "",
      camera_type: "",
      quantity: 1,
      mounting_height: "",
      resolution: "",
      focal_length: "",
      event_type: "",
      eventVolume: 10,
      patrol_group: "",
      notes: "",
      images: []
    };
    
    setFormData(prev => ({
      ...prev,
      streams: [...prev.streams, newStream]
    }));
  };

  // Duplicate a stream
  const duplicateStream = (stream: Stream) => {
    const newStream: Stream = {
      ...stream,
      id: -Date.now(), // Temporary negative ID
      images: [] // Don't copy images
    };
    
    setFormData(prev => ({
      ...prev,
      streams: [...prev.streams, newStream]
    }));
    
    toast({
      title: "Stream duplicated",
      description: "Stream has been duplicated. You can now edit the copy.",
    });
  };

  // Delete a stream
  const deleteStream = async (streamId: number) => {
    if (streamId > 0) {
      // Existing stream in database
      await deleteStreamMutation.mutateAsync(streamId);
    }
    
    // Update local state
    setFormData(prev => ({
      ...prev,
      streams: prev.streams.filter(s => s.id !== streamId)
    }));
  };

  // Update a specific stream field
  const updateStream = (streamId: number, field: keyof Stream, value: any) => {
    setFormData(prev => ({
      ...prev,
      streams: prev.streams.map(stream => 
        stream.id === streamId ? { ...stream, [field]: value } : stream
      )
    }));
  };

  // Event pricing tiers calculation
  const calculateEventFee = (totalEvents: number): number => {
    const tiers = [
      { max: 1000, price: 1.00 },
      { max: 5000, price: 0.80 },
      { max: 10000, price: 0.60 },
      { max: 50000, price: 0.40 },
      { max: Infinity, price: 0.30 }
    ];
    
    const tier = tiers.find(t => totalEvents <= t.max) || tiers[tiers.length - 1];
    return tier.price;
  };

  const getEventTier = (totalEvents: number): string => {
    if (totalEvents <= 1000) return "Tier 1 (Up to 1,000)";
    if (totalEvents <= 5000) return "Tier 2 (1,001-5,000)";
    if (totalEvents <= 10000) return "Tier 3 (5,001-10,000)";
    if (totalEvents <= 50000) return "Tier 4 (10,001-50,000)";
    return "Tier 5 (50,001+)";
  };

  // Base camera pricing
  const getCameraBaseFee = (isNewCustomer: boolean): number => {
    return isNewCustomer ? 75.00 : 65.00;
  };

  // Calculate pricing
  const pricingResults = useMemo(() => {
    const isNewCustomer = formData.customerType === "new";
    const baseMonthlyFeePerCamera = getCameraBaseFee(isNewCustomer);
    
    const totalEvents = formData.streams.reduce((sum, s) => sum + (s.eventVolume * s.quantity), 0);
    const totalCameras = formData.streams.reduce((sum, s) => sum + s.quantity, 0);
    
    const eventTier = getEventTier(totalEvents);
    const eventFeePerEvent = calculateEventFee(totalEvents);
    const totalEventFee = totalEvents * eventFeePerEvent;
    
    const totalBaseFee = totalCameras * baseMonthlyFeePerCamera;
    const totalMonthlyFee = totalBaseFee + totalEventFee;
    
    return {
      totalCameras,
      totalEvents,
      eventTier,
      eventFeePerEvent,
      totalEventFee,
      baseMonthlyFeePerCamera,
      totalBaseFee,
      totalMonthlyFee
    };
  }, [formData.customerType, formData.streams]);
  
  // Render loading state
  if (isLoadingKvg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Kastle Video Guarding data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
            Kastle Video Guarding
          </h1>
          <p className="text-gray-500">Configure video monitoring, streams, and guard response details</p>
        </div>
        <Button 
          onClick={saveAllData} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
          disabled={saveKvgMutation.isPending}
        >
          {saveKvgMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Data
        </Button>
      </div>
      
      <Tabs defaultValue="config">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="streams">Stream Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle>Customer & Monitoring Details</CardTitle>
              <CardDescription>Basic customer configuration and monitoring preferences</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Type */}
              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type</Label>
                <Select 
                  value={formData.customerType}
                  onValueChange={(value) => handleChange('customerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Customer</SelectItem>
                    <SelectItem value="existing">Existing Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Environment */}
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select 
                  value={formData.environment}
                  onValueChange={(value) => handleChange('environment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Monitoring Hours */}
              <div className="space-y-2">
                <Label htmlFor="monitoringHours">Monitoring Hours</Label>
                <Select 
                  value={formData.monitoringHours}
                  onValueChange={(value: "24x7" | "after-hours" | "custom") => handleChange('monitoringHours', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select monitoring hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24x7">24x7 Monitoring</SelectItem>
                    <SelectItem value="after-hours">After Hours Only</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Monitoring Hours (conditionally displayed) */}
              {formData.monitoringHours === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customMonitoringHours">Custom Monitoring Schedule</Label>
                  <Textarea 
                    id="customMonitoringHours"
                    placeholder="Describe custom monitoring schedule..."
                    value={formData.customMonitoringHours}
                    onChange={(e) => handleChange('customMonitoringHours', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              {/* toggles for guards and patrol groups */}
              <div className="space-y-4 col-span-full">
                <div className="flex items-center gap-2">
                  <Toggle 
                    pressed={formData.guardsRequired}
                    onPressedChange={(pressed) => handleChange('guardsRequired', pressed)}
                    className="data-[state=on]:bg-blue-500"
                  />
                  <Label htmlFor="guardsRequired">Guards Required</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Toggle 
                    pressed={formData.patrolGroupsRequired}
                    onPressedChange={(pressed) => handleChange('patrolGroupsRequired', pressed)}
                    className="data-[state=on]:bg-blue-500"
                  />
                  <Label htmlFor="patrolGroupsRequired">Patrol Groups Required</Label>
                </div>
              </div>
              
              {/* Stream Grouping */}
              <div className="space-y-2">
                <Label htmlFor="streamGrouping">Stream Grouping Method</Label>
                <Select 
                  value={formData.streamGrouping}
                  onValueChange={(value: "location" | "event-type" | "none") => handleChange('streamGrouping', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Group by Location</SelectItem>
                    <SelectItem value="event-type">Group by Event Type</SelectItem>
                    <SelectItem value="none">No Grouping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Existing Cameras Count */}
              <div className="space-y-2">
                <Label htmlFor="existingCamerasCount">Existing Cameras Count</Label>
                <Input 
                  id="existingCamerasCount"
                  type="number"
                  min="0"
                  value={formData.existingCamerasCount}
                  onChange={(e) => handleChange('existingCamerasCount', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle>Technical Configuration</CardTitle>
              <CardDescription>Camera system details and technical requirements</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Type */}
              <div className="space-y-2">
                <Label htmlFor="systemType">Camera System Type</Label>
                <Select 
                  value={formData.systemType}
                  onValueChange={(value) => handleChange('systemType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip">IP Cameras</SelectItem>
                    <SelectItem value="analog">Analog Cameras</SelectItem>
                    <SelectItem value="hybrid">Hybrid System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* VMS Type */}
              <div className="space-y-2">
                <Label htmlFor="vmsType">VMS/NVR Type</Label>
                <Select 
                  value={formData.vmsType}
                  onValueChange={(value) => handleChange('vmsType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select VMS/NVR type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exacq">ExacqVision</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="genetec">Genetec</SelectItem>
                    <SelectItem value="avigilon">Avigilon</SelectItem>
                    <SelectItem value="hikvision">Hikvision</SelectItem>
                    <SelectItem value="dahua">Dahua</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* VMS Notes */}
              <div className="space-y-2 col-span-full">
                <Label htmlFor="vmsNotes">VMS/NVR Additional Notes</Label>
                <Textarea 
                  id="vmsNotes"
                  placeholder="Additional details about VMS/NVR system..."
                  value={formData.vmsNotes}
                  onChange={(e) => handleChange('vmsNotes', e.target.value)}
                />
              </div>
              
              {/* Streaming Protocol */}
              <div className="space-y-2">
                <Label htmlFor="streamingProtocol">Streaming Protocol</Label>
                <Select 
                  value={formData.streamingProtocol}
                  onValueChange={(value) => handleChange('streamingProtocol', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select streaming protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rtsp">RTSP</SelectItem>
                    <SelectItem value="rtmp">RTMP</SelectItem>
                    <SelectItem value="hls">HLS</SelectItem>
                    <SelectItem value="webrtc">WebRTC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Stream Notes */}
              <div className="space-y-2 col-span-full">
                <Label htmlFor="streamNotes">Stream Configuration Notes</Label>
                <Textarea 
                  id="streamNotes"
                  placeholder="Additional details about streaming setup..."
                  value={formData.streamNotes}
                  onChange={(e) => handleChange('streamNotes', e.target.value)}
                />
              </div>
              
              {/* Network Configuration Toggles */}
              <div className="space-y-4 col-span-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Toggle 
                      pressed={formData.portForwarding}
                      onPressedChange={(pressed) => handleChange('portForwarding', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Label htmlFor="portForwarding">Port Forwarding Available</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Toggle 
                      pressed={formData.staticIp}
                      onPressedChange={(pressed) => handleChange('staticIp', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Label htmlFor="staticIp">Static IP Available</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Toggle 
                      pressed={formData.healthMonitoring}
                      onPressedChange={(pressed) => handleChange('healthMonitoring', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Label htmlFor="healthMonitoring">Health Monitoring Required</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle>Video Storage & Analytics</CardTitle>
              <CardDescription>Configure video retention and analytics features</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Storage Toggle */}
              <div className="flex items-center gap-4 col-span-full">
                <Toggle 
                  pressed={formData.videoStorage}
                  onPressedChange={(pressed) => handleChange('videoStorage', pressed)}
                  className="data-[state=on]:bg-blue-500"
                />
                <Label htmlFor="videoStorage">Video Storage Required</Label>
              </div>
              
              {/* Video Retention Days - only if storage is enabled */}
              {formData.videoStorage && (
                <div className="space-y-2">
                  <Label htmlFor="videoRetentionDays">Video Retention (Days)</Label>
                  <Input 
                    id="videoRetentionDays"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.videoRetentionDays}
                    onChange={(e) => handleChange('videoRetentionDays', parseInt(e.target.value) || 30)}
                  />
                </div>
              )}
              
              {/* Video Download Access */}
              {formData.videoStorage && (
                <div className="flex items-center gap-4">
                  <Toggle 
                    pressed={formData.videoDownloadAccess}
                    onPressedChange={(pressed) => handleChange('videoDownloadAccess', pressed)}
                    className="data-[state=on]:bg-blue-500"
                  />
                  <Label htmlFor="videoDownloadAccess">Client Download Access</Label>
                </div>
              )}
              
              {/* Analytics Settings */}
              <div className="space-y-4 col-span-full mt-4">
                <h3 className="text-lg font-medium">Analytics Configuration</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Toggle 
                      pressed={formData.analyticsEnabled}
                      onPressedChange={(pressed) => handleChange('analyticsEnabled', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Label htmlFor="analyticsEnabled">Analytics Required</Label>
                  </div>
                  
                  {formData.analyticsEnabled && (
                    <div className="flex items-center gap-2 ml-8">
                      <Toggle 
                        pressed={formData.customizableRules}
                        onPressedChange={(pressed) => handleChange('customizableRules', pressed)}
                        className="data-[state=on]:bg-blue-500"
                      />
                      <Label htmlFor="customizableRules">Customizable Analytics Rules</Label>
                    </div>
                  )}
                </div>
                
                {formData.analyticsEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="otherAnalyticsNotes">Analytics Notes</Label>
                    <Textarea 
                      id="otherAnalyticsNotes"
                      placeholder="Describe analytics requirements..."
                      value={formData.otherAnalyticsNotes}
                      onChange={(e) => handleChange('otherAnalyticsNotes', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle>Response & Intervention</CardTitle>
              <CardDescription>Configure incident response and intervention methods</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Incident Dispatch Required */}
              <div className="flex items-center gap-4">
                <Toggle 
                  pressed={formData.incidentDispatchRequired}
                  onPressedChange={(pressed) => handleChange('incidentDispatchRequired', pressed)}
                  className="data-[state=on]:bg-blue-500"
                />
                <Label htmlFor="incidentDispatchRequired">Incident Dispatch Required</Label>
              </div>
              
              {/* Dispatch Service Level - only if dispatch is enabled */}
              {formData.incidentDispatchRequired && (
                <div className="space-y-2">
                  <Label htmlFor="dispatchServiceLevel">Dispatch Service Level</Label>
                  <Select 
                    value={formData.dispatchServiceLevel}
                    onValueChange={(value) => handleChange('dispatchServiceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Intervention Methods */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Intervention Methods</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Responder Service */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Toggle 
                        pressed={formData.firstResponderService}
                        onPressedChange={(pressed) => handleChange('firstResponderService', pressed)}
                        className="data-[state=on]:bg-blue-500"
                      />
                      <Label htmlFor="firstResponderService">First Responder Service</Label>
                    </div>
                    
                    {formData.firstResponderService && (
                      <Textarea 
                        id="firstResponderDetails"
                        placeholder="Enter first responder service details..."
                        value={formData.firstResponderDetails}
                        onChange={(e) => handleChange('firstResponderDetails', e.target.value)}
                      />
                    )}
                  </div>
                  
                  {/* Audible Intervention */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Toggle 
                        pressed={formData.audibleIntervention}
                        onPressedChange={(pressed) => handleChange('audibleIntervention', pressed)}
                        className="data-[state=on]:bg-blue-500"
                      />
                      <Label htmlFor="audibleIntervention">Audible Intervention</Label>
                    </div>
                    
                    {formData.audibleIntervention && (
                      <Textarea 
                        id="audibleInterventionDetails"
                        placeholder="Enter audible intervention details..."
                        value={formData.audibleInterventionDetails}
                        onChange={(e) => handleChange('audibleInterventionDetails', e.target.value)}
                      />
                    )}
                  </div>
                  
                  {/* Video Verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Toggle 
                        pressed={formData.videoVerification}
                        onPressedChange={(pressed) => handleChange('videoVerification', pressed)}
                        className="data-[state=on]:bg-blue-500"
                      />
                      <Label htmlFor="videoVerification">Video Verification</Label>
                    </div>
                    
                    {formData.videoVerification && (
                      <Textarea 
                        id="videoVerificationDetails"
                        placeholder="Enter video verification details..."
                        value={formData.videoVerificationDetails}
                        onChange={(e) => handleChange('videoVerificationDetails', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Custom Incident Types */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Custom Incident Types</h3>
                <p className="text-sm text-gray-500">Define up to 5 custom incident types for monitoring</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom Incident Type 1 */}
                  <div className="flex items-center gap-4">
                    <Toggle 
                      pressed={formData.customIncidentType1Selected}
                      onPressedChange={(pressed) => handleChange('customIncidentType1Selected', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Input 
                      placeholder="Custom Incident Type 1"
                      value={formData.customIncidentType1}
                      onChange={(e) => handleChange('customIncidentType1', e.target.value)}
                    />
                  </div>
                  
                  {/* Custom Incident Type 2 */}
                  <div className="flex items-center gap-4">
                    <Toggle 
                      pressed={formData.customIncidentType2Selected}
                      onPressedChange={(pressed) => handleChange('customIncidentType2Selected', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Input 
                      placeholder="Custom Incident Type 2"
                      value={formData.customIncidentType2}
                      onChange={(e) => handleChange('customIncidentType2', e.target.value)}
                    />
                  </div>
                  
                  {/* Custom Incident Type 3 */}
                  <div className="flex items-center gap-4">
                    <Toggle 
                      pressed={formData.customIncidentType3Selected}
                      onPressedChange={(pressed) => handleChange('customIncidentType3Selected', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Input 
                      placeholder="Custom Incident Type 3"
                      value={formData.customIncidentType3}
                      onChange={(e) => handleChange('customIncidentType3', e.target.value)}
                    />
                  </div>
                  
                  {/* Custom Incident Type 4 */}
                  <div className="flex items-center gap-4">
                    <Toggle 
                      pressed={formData.customIncidentType4Selected}
                      onPressedChange={(pressed) => handleChange('customIncidentType4Selected', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Input 
                      placeholder="Custom Incident Type 4"
                      value={formData.customIncidentType4}
                      onChange={(e) => handleChange('customIncidentType4', e.target.value)}
                    />
                  </div>
                  
                  {/* Custom Incident Type 5 */}
                  <div className="flex items-center gap-4">
                    <Toggle 
                      pressed={formData.customIncidentType5Selected}
                      onPressedChange={(pressed) => handleChange('customIncidentType5Selected', pressed)}
                      className="data-[state=on]:bg-blue-500"
                    />
                    <Input 
                      placeholder="Custom Incident Type 5"
                      value={formData.customIncidentType5}
                      onChange={(e) => handleChange('customIncidentType5', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="streams" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">Stream Details</h2>
            <div className="flex items-center gap-4">
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'cards' | 'list')}>
                <ToggleGroupItem value="cards" aria-label="Cards View" className="flex gap-1 items-center">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Cards</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List View" className="flex gap-1 items-center">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </ToggleGroupItem>
              </ToggleGroup>
              
              <Button
                onClick={addStream}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Stream</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-6">
            <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {viewMode === 'cards' 
                ? "The cards view provides detailed information about each stream. The text fields support larger entries for detailed descriptions. Use the duplicate function (copy icon) to quickly create similar streams."
                : "The list view provides a compact overview of all streams. Use this view to quickly compare and manage multiple streams."}
            </div>
          </div>
          
          {formData.streams.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center">
              <VideoIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No streams configured</h3>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Define camera streams for monitoring. Each stream represents a camera or group of cameras monitoring a specific area.
              </p>
              <Button
                onClick={addStream}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Stream
              </Button>
            </div>
          ) : (
            <>
              {/* Cards View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.streams.map(stream => (
                    <Card key={stream.id} className="overflow-hidden border-gray-200 dark:border-gray-800">
                      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {stream.location || "New Stream"}
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => duplicateStream(stream)}
                              className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Duplicate</span>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteStream(stream.id)}
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-1">
                          {stream.camera_type && (
                            <Badge variant="outline" className="text-xs">
                              {stream.camera_type}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                            {stream.quantity} {stream.quantity === 1 ? 'Camera' : 'Cameras'}
                          </Badge>
                          {stream.event_type && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300">
                              {stream.event_type}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 pb-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-location`} className="text-xs">Location</Label>
                            <Input 
                              id={`stream-${stream.id}-location`}
                              placeholder="Location"
                              value={stream.location}
                              onChange={(e) => updateStream(stream.id, 'location', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-camera-type`} className="text-xs">Camera Type</Label>
                            <Input 
                              id={`stream-${stream.id}-camera-type`}
                              placeholder="Camera Type"
                              value={stream.camera_type}
                              onChange={(e) => updateStream(stream.id, 'camera_type', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-quantity`} className="text-xs">Quantity</Label>
                            <Input 
                              id={`stream-${stream.id}-quantity`}
                              type="number"
                              min="1"
                              placeholder="Quantity"
                              value={stream.quantity}
                              onChange={(e) => updateStream(stream.id, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-event-type`} className="text-xs">Event Type</Label>
                            <Input 
                              id={`stream-${stream.id}-event-type`}
                              placeholder="Event Type"
                              value={stream.event_type}
                              onChange={(e) => updateStream(stream.id, 'event_type', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-resolution`} className="text-xs">Resolution</Label>
                            <Input 
                              id={`stream-${stream.id}-resolution`}
                              placeholder="Resolution"
                              value={stream.resolution}
                              onChange={(e) => updateStream(stream.id, 'resolution', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-mounting-height`} className="text-xs">Mounting Height</Label>
                            <Input 
                              id={`stream-${stream.id}-mounting-height`}
                              placeholder="Mounting Height"
                              value={stream.mounting_height}
                              onChange={(e) => updateStream(stream.id, 'mounting_height', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-focal-length`} className="text-xs">Focal Length</Label>
                            <Input 
                              id={`stream-${stream.id}-focal-length`}
                              placeholder="Focal Length"
                              value={stream.focal_length}
                              onChange={(e) => updateStream(stream.id, 'focal_length', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`stream-${stream.id}-events`} className="text-xs">
                              Monthly Events
                              <span className="ml-1.5 text-blue-500">(${calculateEventFee(stream.eventVolume * stream.quantity).toFixed(2)}/event)</span>
                            </Label>
                            <Input 
                              id={`stream-${stream.id}-events`}
                              type="number"
                              min="0"
                              placeholder="Events"
                              value={stream.eventVolume}
                              onChange={(e) => updateStream(stream.id, 'eventVolume', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5 col-span-full">
                          <Label htmlFor={`stream-${stream.id}-description`} className="text-xs">Description</Label>
                          <Textarea 
                            id={`stream-${stream.id}-description`}
                            placeholder="Description"
                            className="min-h-[80px]"
                            value={stream.description}
                            onChange={(e) => updateStream(stream.id, 'description', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1.5 col-span-full">
                          <Label htmlFor={`stream-${stream.id}-patrol-group`} className="text-xs">Patrol Group</Label>
                          <Input 
                            id={`stream-${stream.id}-patrol-group`}
                            placeholder="Patrol Group"
                            value={stream.patrol_group}
                            onChange={(e) => updateStream(stream.id, 'patrol_group', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1.5 col-span-full">
                          <Label htmlFor={`stream-${stream.id}-notes`} className="text-xs">Notes</Label>
                          <Textarea 
                            id={`stream-${stream.id}-notes`}
                            placeholder="Notes"
                            className="min-h-[80px]"
                            value={stream.notes}
                            onChange={(e) => updateStream(stream.id, 'notes', e.target.value)}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-3 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            setSelectedStream(stream);
                            setIsImagesModalOpen(true);
                          }}
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-1" />
                          Images {stream.images.length > 0 && `(${stream.images.length})`}
                        </Button>
                        
                        <Button 
                          variant="default" 
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => saveStreamMutation.mutate(stream)}
                          disabled={saveStreamMutation.isPending}
                        >
                          {saveStreamMutation.isPending 
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...</>
                            : <><Check className="h-3.5 w-3.5 mr-1" /> Save Stream</>
                          }
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-950 border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 bg-gray-100 dark:bg-gray-800 p-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <div className="col-span-2">Location</div>
                    <div className="col-span-2">Camera Type</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Event Type</div>
                    <div className="col-span-1">Events</div>
                    <div className="col-span-2">Patrol Group</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  {formData.streams.map(stream => (
                    <div key={stream.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center text-sm">
                      <div className="col-span-2 truncate">{stream.location || "Unnamed"}</div>
                      <div className="col-span-2 truncate">{stream.camera_type || "-"}</div>
                      <div className="col-span-1">{stream.quantity}</div>
                      <div className="col-span-2 truncate">{stream.event_type || "-"}</div>
                      <div className="col-span-1">{stream.eventVolume}</div>
                      <div className="col-span-2 truncate">{stream.patrol_group || "-"}</div>
                      <div className="col-span-2 flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedStream(stream);
                            setIsImagesModalOpen(true);
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="sr-only">Images</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => duplicateStream(stream)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Duplicate</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 dark:text-red-400"
                          onClick={() => deleteStream(stream.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardTitle>Pricing Calculator</CardTitle>
              <CardDescription>Calculate estimated monthly subscription costs for Kastle Video Guarding</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Monitoring Configuration</h3>
                    <p className="text-sm text-gray-500">Summary of your current monitoring setup</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer Type</p>
                      <p className="text-lg font-medium">
                        {formData.customerType === "new" ? "New Customer" : "Existing Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monitoring Hours</p>
                      <p className="text-lg font-medium">
                        {formData.monitoringHours === "24x7" 
                          ? "24x7 Monitoring" 
                          : formData.monitoringHours === "after-hours" 
                            ? "After Hours" 
                            : "Custom Schedule"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Cameras</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {pricingResults.totalCameras}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monthly Events</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {pricingResults.totalEvents.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Event Pricing Tier</h3>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
                      <div className="flex justify-between mb-2">
                        <p className="font-medium">{pricingResults.eventTier}</p>
                        <p className="font-bold text-purple-600">${pricingResults.eventFeePerEvent.toFixed(2)}/event</p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full" 
                          style={{ 
                            width: pricingResults.totalEvents <= 1000 
                              ? `${(pricingResults.totalEvents / 1000) * 100}%`
                              : pricingResults.totalEvents <= 5000
                                ? `${((pricingResults.totalEvents - 1000) / 4000) * 20 + 20}%`
                                : pricingResults.totalEvents <= 10000
                                  ? `${((pricingResults.totalEvents - 5000) / 5000) * 20 + 40}%`
                                  : pricingResults.totalEvents <= 50000
                                    ? `${((pricingResults.totalEvents - 10000) / 40000) * 20 + 60}%`
                                    : '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-gray-500">
                        <span>0</span>
                        <span>1K</span>
                        <span>5K</span>
                        <span>10K</span>
                        <span>50K</span>
                        <span>50K+</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Monthly Cost Breakdown</h3>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Base Camera Fee</p>
                        <p className="text-sm text-gray-500">${pricingResults.baseMonthlyFeePerCamera.toFixed(2)} x {pricingResults.totalCameras} cameras</p>
                      </div>
                      <p className="text-lg font-medium">${pricingResults.totalBaseFee.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Event Monitoring Fee</p>
                        <p className="text-sm text-gray-500">${pricingResults.eventFeePerEvent.toFixed(2)} x {pricingResults.totalEvents.toLocaleString()} events</p>
                      </div>
                      <p className="text-lg font-medium">${pricingResults.totalEventFee.toFixed(2)}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">Estimated Monthly Total</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
                          ${pricingResults.totalMonthlyFee.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-sm text-gray-500 mt-4">
                      <p className="mb-1">Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Pricing is an estimate only and subject to verification</li>
                        <li>Additional fees may apply for advanced features</li>
                        <li>One-time setup fees not included</li>
                        <li>Custom quotes available for high-volume monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Image Modal for viewing stream images */}
      {selectedStream && (
        <StreamImagesModal 
          isOpen={isImagesModalOpen} 
          onClose={() => setIsImagesModalOpen(false)}
          streamName={selectedStream.location || `Stream ${selectedStream.id}`}
          images={selectedStream.images}
          onDeleteImage={(imageId: number) => {
            const updatedImages = selectedStream.images.filter(img => img.id !== imageId);
            updateStream(selectedStream.id, "images", updatedImages);
          }}
        />
      )}
    </div>
  );
};

export default KastleVideoGuardingPage;