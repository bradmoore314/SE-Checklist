import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { CalendarIcon, Check, ClipboardCheck, Copy, RefreshCcw, RefreshCw, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define interfaces
interface Stream {
  id?: number;
  project_id?: number;
  stream_name: string;
  camera_location: string;
  status: string;
  streams_note: string;
  active_hours: string;
  virtual_patrol: boolean;
  event_monitoring: boolean;
  audio_talkdown: boolean;
  stream_type: string;
  fields: {
    events_per_day?: number;
    patrols_per_week?: number;
    [key: string]: any;
  };
  images: StreamImage[];
}

interface StreamImage {
  id?: number;
  stream_id?: number;
  image_url: string;
  image_note: string;
  image_type: string;
}

interface PriceStream {
  quantity: number;
  eventVolume: number;
  patrolsPerWeek: number;
}

interface FormData {
  // Pricing tab fields
  customerType: string;
  streams: PriceStream[];
  vocEscalations: number;
  dispatchResponses: number;
  gdodsPatrols: number;
  sgppPatrols: number;
  forensicInvestigations: number;
  appUsers: number;
  audioDevices: number;
  
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
  maintenance: string;
  servicesRecommended: string;
  
  // KVG-specific fields
  kvgCameraStreamsCount: number;
  siteSceneActivityNotes: string;
  reviewers: string;
  
  // Schedule details fields
  scheduleType: string;
  monitoringDaysOfWeek: string;
  monitoringHours: string;
  scheduleNotes: string;
  patrolFrequencyDays: string;
  patrolFrequencyHours: string;
  suggestedIncidentResponse: string;
  
  // Project Deployment - PM tab fields
  pmName: string;
  deploymentDate: string;
  opportunityNumber: string;
  projectManager: string;
  siteSupervisor: string;
  technician: string;
  projectScopeDescription: string;
  deploymentRequirements: string;
  installationRequirements: string;
  partsListCredentials: string;
  gatewayIpAddress: string;
  gatewayPort: string;
  gatewayUsername: string;
  gatewayPassword: string;
  streamNamesIds: string;
  streamHealthVerification: string;
  speakerVerification: string;
  
  // Technology fields
  technology: string;
  rspndrGdods: string;
  rspndrSubscriptions: string;
  
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
  
  // Site Assessment fields
  lightingRequirements: string;
  lightingNotes: string;
  cameraFieldOfView: string;
  fovNotes: string;
  networkConnectivity: string;
  networkNotes: string;
  siteAssessmentNotes: string;
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
  
  // VOC Protocol tab fields
  amName: string;
  projectId: string;
  vocScript: string;
  vocContactName: string;
  typeOfInstallAccount: string;
  
  // Escalation Process 1 fields
  escalationProcess1: string;
  escalationProcess1Events: string;
  escalationProcess1DaysOfWeek: string;
  escalationProcess1StartTime: string;
  escalationProcess1EndTime: string;
  escalationProcess1Cameras: string;
  escalationProcess1SceneObservation: string;
  escalationProcess1Process: string;
  escalationProcess1UseTalkDown: string;
  escalationProcess1ContactSitePersonnel: string;
  escalationProcess1ContactPolice: string;
  escalationProcess1EscalateToBranch: string;
  escalationProcess1CreateSecurityReport: string;
  escalationProcess1RspndrDispatch: string;
  escalationProcess1AudioResponse: string;
  escalationProcess1AudioMessage: string;
  
  // Escalation Process 2 fields
  escalationProcess2: string;
  escalationProcess2Events: string;
  escalationProcess2DaysOfWeek: string;
  escalationProcess2StartTime: string;
  escalationProcess2EndTime: string;
  escalationProcess2SceneObservation: string;
  escalationProcess2Process: string;
  escalationProcess2AudioResponse: string;
  escalationProcess2AudioMessage: string;
  
  // Escalation Process 3 fields
  escalationProcess3: string;
  escalationProcess3Events: string;
  escalationProcess3DaysOfWeek: string;
  escalationProcess3StartTime: string;
  escalationProcess3EndTime: string;
  escalationProcess3SceneObservation: string;
  escalationProcess3Process: string;
  escalationProcess3AudioResponse: string;
  escalationProcess3AudioMessage: string;
  
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
  // Added additional custom incident types
  customIncidentType6: string;
  customIncidentType6Selected: boolean;
  customIncidentType7: string;
  customIncidentType7Selected: boolean;
}

const KastleVideoGuardingPage: React.FC = () => {
  const { toast } = useToast();
  const { currentProject } = useProject();
  
  // View mode for stream details (cards or list)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // State for streams
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  
  // Form data for all tabs
  const [formData, setFormData] = useState<FormData>({
    // Pricing tab fields
    customerType: "new",
    streams: [
      {
        quantity: 2,
        eventVolume: 250,
        patrolsPerWeek: 1
      }
    ],
    vocEscalations: 1,
    dispatchResponses: 0,
    gdodsPatrols: 0,
    sgppPatrols: 0,
    forensicInvestigations: 0,
    appUsers: 3,
    audioDevices: 0,
    
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
    maintenance: "",
    servicesRecommended: "",
    
    // KVG-specific fields
    kvgCameraStreamsCount: 0,
    siteSceneActivityNotes: "",
    reviewers: "",
    
    // Schedule details fields
    scheduleType: "Standard",
    monitoringDaysOfWeek: "",
    monitoringHours: "",
    scheduleNotes: "",
    patrolFrequencyDays: "",
    patrolFrequencyHours: "",
    suggestedIncidentResponse: "Ask how they currently address these issues and incidents on their property or if they have an idea of how they want us to address them. Typical examples of what is done has to do with initial talk-down when operator observes specific incident types. If the subject does not vacate premise, escalate to local onsite security or police.",
    
    // Technology fields
    technology: "",
    rspndrGdods: "",
    rspndrSubscriptions: "",
    
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
    
    // Site Assessment fields
    lightingRequirements: "",
    lightingNotes: "",
    cameraFieldOfView: "",
    fovNotes: "",
    networkConnectivity: "",
    networkNotes: "",
    siteAssessmentNotes: "",
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
    customIncidentType6: "",
    customIncidentType6Selected: false,
    customIncidentType7: "",
    customIncidentType7Selected: false,
    
    // VOC Protocol tab fields
    amName: "",
    projectId: "",
    vocScript: "",
    vocContactName: "",
    typeOfInstallAccount: "",
    
    // Project Deployment - PM tab fields
    pmName: "",
    deploymentDate: "",
    opportunityNumber: "",
    projectManager: "",
    siteSupervisor: "",
    technician: "",
    projectScopeDescription: "",
    deploymentRequirements: "",
    installationRequirements: "",
    partsListCredentials: "",
    gatewayIpAddress: "",
    gatewayPort: "",
    gatewayUsername: "",
    gatewayPassword: "",
    streamNamesIds: "",
    streamHealthVerification: "",
    speakerVerification: "",
    
    // Escalation Process 1 fields
    escalationProcess1: "",
    escalationProcess1Events: "",
    escalationProcess1DaysOfWeek: "",
    escalationProcess1StartTime: "",
    escalationProcess1EndTime: "",
    escalationProcess1Cameras: "",
    escalationProcess1SceneObservation: "",
    escalationProcess1Process: "",
    escalationProcess1UseTalkDown: "",
    escalationProcess1ContactSitePersonnel: "",
    escalationProcess1ContactPolice: "",
    escalationProcess1EscalateToBranch: "",
    escalationProcess1CreateSecurityReport: "",
    escalationProcess1RspndrDispatch: "",
    escalationProcess1AudioResponse: "",
    escalationProcess1AudioMessage: "",
    
    // Escalation Process 2 fields
    escalationProcess2: "",
    escalationProcess2Events: "",
    escalationProcess2DaysOfWeek: "",
    escalationProcess2StartTime: "",
    escalationProcess2EndTime: "",
    escalationProcess2SceneObservation: "",
    escalationProcess2Process: "",
    escalationProcess2AudioResponse: "",
    escalationProcess2AudioMessage: "",
    
    // Escalation Process 3 fields
    escalationProcess3: "",
    escalationProcess3Events: "",
    escalationProcess3DaysOfWeek: "",
    escalationProcess3StartTime: "",
    escalationProcess3EndTime: "",
    escalationProcess3SceneObservation: "",
    escalationProcess3Process: "",
    escalationProcess3AudioResponse: "",
    escalationProcess3AudioMessage: "",
  });

  // Function to handle form changes
  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle saving the form
  const handleSave = () => {
    formDataMutation.mutate(formData);
  };

  // React Query hooks
  const { data: formDataFromDb, isLoading: isLoadingFormData } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'kvg-form-data'],
    queryFn: async () => {
      if (!currentProject?.id) return null;
      const res = await fetch(`/api/projects/${currentProject.id}/kvg-form-data`);
      if (!res.ok) throw new Error('Failed to fetch KVG form data');
      return res.json();
    },
    enabled: !!currentProject?.id,
  });

  const { data: streamsFromDb, isLoading: isLoadingStreams } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'],
    queryFn: async () => {
      if (!currentProject?.id) return [];
      const res = await fetch(`/api/projects/${currentProject.id}/kvg-streams`);
      if (!res.ok) throw new Error('Failed to fetch KVG streams');
      return res.json();
    },
    enabled: !!currentProject?.id,
  });

  // Mutation for saving form data
  const formDataMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentProject?.id) throw new Error('No project selected');
      
      // Add required form_type and form_data fields
      const formPayload = {
        ...data,
        project_id: currentProject.id,
        form_type: 'kvg',
        form_data: { ...data } // Store a complete copy in form_data
      };
      
      // Check if form data already exists with valid ID
      if (formDataFromDb?.id && formDataFromDb.id !== null && formDataFromDb.id !== 0) {
        const res = await apiRequest(
          'PUT', 
          `/api/kvg-form-data/${formDataFromDb.id}`, 
          formPayload
        );
        return res.json();
      } else {
        const res = await apiRequest(
          'POST', 
          '/api/kvg-form-data', 
          formPayload
        );
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KVG form data saved successfully",
        variant: "default",
      });
      // Invalidate to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-form-data'] });
    },
    onError: (error: Error) => {
      console.error("Error saving KVG form data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save KVG form data",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container mx-auto p-4 max-w-[1680px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="p-1.5 bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </span>
          Kastle Video Guarding Configuration
        </h1>
        <p className="text-gray-600 ml-10">Configure Kastle Video Guarding details for your project.</p>
      </div>

      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="pricing" className="text-sm">
            <span className="text-xl">💰</span> 1. Pricing Calculator
          </TabsTrigger>
          <TabsTrigger value="discovery" className="text-sm">
            <span className="text-xl">🔍</span> 2. Discovery - BDM
          </TabsTrigger>
          <TabsTrigger value="use-case" className="text-sm">
            <span className="text-xl">📝</span> 3. Use Case - SOW - SME
          </TabsTrigger>
          <TabsTrigger value="voc-protocol" className="text-sm">
            <span className="text-xl">🔄</span> 4. VOC Protocol
          </TabsTrigger>
        </TabsList>
        
        {/* Discovery Tab Content */}
        <TabsContent value="discovery">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
                <span className="p-1.5 bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </span>
                KVG Customer Discovery - BDM
              </CardTitle>
              <CardDescription className="text-base text-blue-700">
                Gather initial customer details and requirements for Kastle Video Guarding
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* KVG-specific fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <Label htmlFor="kvgCameraStreamsCount" className="text-sm text-teal-700 font-medium flex items-center gap-1.5">
                    <span className="p-0.5 bg-teal-500 text-white rounded w-5 h-5 flex items-center justify-center text-[11px]">📹</span>
                    # of KVG Cameras Video Streams
                  </Label>
                  <div className="mt-1">
                    <Input 
                      id="kvgCameraStreamsCount"
                      type="number"
                      min="0"
                      value={formData.kvgCameraStreamsCount}
                      onChange={(e) => handleFormChange("kvgCameraStreamsCount", parseInt(e.target.value) || 0)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rspndrGdods" className="text-sm text-teal-700">RSPNDR-GDODS:</Label>
                  <Select 
                    value={formData.rspndrGdods} 
                    onValueChange={(value) => handleFormChange("rspndrGdods", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select">Select</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="GDODS - Dispatch on Demand Subscriptions">GDODS - Dispatch on Demand Subscriptions</SelectItem>
                      <SelectItem value="SGPP - Scheduled Periodic Site Checks">SGPP - Scheduled Periodic Site Checks</SelectItem>
                      <SelectItem value="Both GDODS and SGPP">Both GDODS and SGPP</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Site Environment Field */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <Label htmlFor="siteEnvironment" className="text-sm text-indigo-700">Site Environment:</Label>
                <Select 
                  value={formData.siteEnvironment} 
                  onValueChange={(value) => handleFormChange("siteEnvironment", value)}
                >
                  <SelectTrigger className="bg-white mb-4">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Mixed">Both Indoor & Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Use Case Tab Content */}
        <TabsContent value="use-case">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-purple-800">
                <span className="p-1.5 bg-purple-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </span>
                Use Case - SOW - SME
              </CardTitle>
              <CardDescription className="text-base text-purple-700">
                Define specific use cases and scope of work for Kastle Video Guarding
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="useCaseCommitment" className="text-sm font-medium text-purple-700 mb-1.5">
                    Use Case Commitment: 
                  </Label>
                  <Select 
                    value={formData.useCaseCommitment} 
                    onValueChange={(value) => handleFormChange("useCaseCommitment", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select commitment level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Monitoring">Event Monitoring</SelectItem>
                      <SelectItem value="Virtual Patrol">Virtual Patrol</SelectItem>
                      <SelectItem value="Event Monitoring & Virtual Patrol">Event Monitoring & Virtual Patrol</SelectItem>
                      <SelectItem value="Camera Health Only">Camera Health Only</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="customerVertical" className="text-sm font-medium text-purple-700 mb-1.5">
                    Customer Vertical:
                  </Label>
                  <Select 
                    value={formData.customerVertical} 
                    onValueChange={(value) => handleFormChange("customerVertical", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select customer vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Commercial - Retail">Commercial - Retail</SelectItem>
                      <SelectItem value="Commercial - Office">Commercial - Office</SelectItem>
                      <SelectItem value="Commercial - Industrial">Commercial - Industrial</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Self Storage">Self Storage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="useCaseResponse" className="text-sm font-medium text-purple-700 mb-1.5">
                    Use Case Response:
                  </Label>
                  <Textarea 
                    value={formData.useCaseResponse || ""}
                    onChange={(e) => handleFormChange("useCaseResponse", e.target.value)}
                    placeholder="Describe the specific response procedures for this use case"
                    className="min-h-[100px] w-full resize-y bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KastleVideoGuardingPage;