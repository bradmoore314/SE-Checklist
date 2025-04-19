import React, { useState, useMemo, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useProject } from "@/context/ProjectContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stream, StreamImage } from "@/types";
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
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import StreamImagesModal from "@/components/modals/StreamImagesModal";

// Price Stream data for the pricing calculator
interface PriceStream {
  quantity: number;
  eventVolume: number;
  patrolsPerWeek: number;
}

// FormData interface for all form fields
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
  
  // Pricing calculation helper functions
  const calculateEventFee = (totalEvents: number): number => {
    const tiers = [
      { max: 500, price: 625 }, { max: 750, price: 935 }, { max: 1000, price: 1250 },
      { max: 1250, price: 1560 }, { max: 1500, price: 1875 }, { max: 1750, price: 2190 },
      { max: 2000, price: 2400 }, { max: 2250, price: 2700 }, { max: 2500, price: 3000 },
      { max: 2750, price: 3300 }, { max: 3000, price: 3600 }
    ];
    const tier = tiers.find(t => totalEvents <= t.max) || tiers[tiers.length - 1];
    return totalEvents > 0 ? tier.price : 0;
  };

  const getEventTier = (totalEvents: number): string => {
    if (totalEvents <= 0) return "N/A";
    if (totalEvents <= 500) return "Tier 1 (≤ 500)";
    if (totalEvents <= 750) return "Tier 2 (≤ 750)";
    if (totalEvents <= 1000) return "Tier 3 (≤ 1000)";
    if (totalEvents <= 1250) return "Tier 4 (≤ 1250)";
    if (totalEvents <= 1500) return "Tier 5 (≤ 1500)";
    if (totalEvents <= 1750) return "Tier 6 (≤ 1750)";
    if (totalEvents <= 2000) return "Tier 7 (≤ 2000)";
    if (totalEvents <= 2250) return "Tier 8 (≤ 2250)";
    if (totalEvents <= 2500) return "Tier 9 (≤ 2500)";
    if (totalEvents <= 2750) return "Tier 10 (≤ 2750)";
    return "Tier 11 (≤ 3000)";
  };

  // Calculate pricing based on current form data
  const pricingResults = useMemo(() => {
    const isNewCustomer = formData.customerType === "new";
    
    // 1. Event Fee
    const totalEvents = formData.streams.reduce((sum, s) => sum + (s.eventVolume * s.quantity), 0);
    const totalCameras = formData.streams.reduce((sum, s) => sum + s.quantity, 0);
    const eventFee = calculateEventFee(totalEvents);
    const eventTier = getEventTier(totalEvents);

    // 2. Patrol Fee
    let totalPatrolsPerMonth = 0;
    let patrolHours = 0;
    formData.streams.forEach(s => {
      if (s.patrolsPerWeek > 0) {
        const patrolsPerMonth = s.patrolsPerWeek * 4.33 * s.quantity;
        totalPatrolsPerMonth += patrolsPerMonth;
        patrolHours += patrolsPerMonth * (5 / 60); // each patrol = 5 min
      }
    });
    const patrolFee = patrolHours * 85;

    // 3. Additional Services Fee
    const additionalFees =
      formData.vocEscalations * 10 +
      formData.dispatchResponses * 0 +
      formData.gdodsPatrols * 425 +
      formData.sgppPatrols * 60 +
      formData.forensicInvestigations * 60 +
      formData.appUsers * 5 +
      formData.audioDevices * 0;

    // 4. Total Calculation
    let totalFee = eventFee + patrolFee + additionalFees;
    const minimumFee = isNewCustomer ? 250 : 200;
    const minimumFeeApplied = totalFee < minimumFee;
    totalFee = Math.max(totalFee, minimumFee);

    return {
      totalFee,
      totalEvents,
      totalCameras,
      patrolsPerMonth: Math.round(totalPatrolsPerMonth),
      patrolHours,
      isNewCustomer,
      approvalNeeded: !isNewCustomer && totalFee < 200,
      eventFee,
      patrolFee,
      additionalFees,
      minimumFee,
      minimumFeeApplied,
      eventTier
    };
  }, [formData]);

  // Functions for pricing tab
  const handleAddStream = () => {
    setFormData(prev => ({
      ...prev,
      streams: [
        ...prev.streams,
        {
          quantity: 1,
          eventVolume: 0,
          patrolsPerWeek: 0
        }
      ]
    }));
  };

  const handleRemoveStream = (index: number) => {
    setFormData(prev => ({
      ...prev,
      streams: prev.streams.filter((_, i) => i !== index)
    }));
  };

  const handleStreamChange = (index: number, field: keyof PriceStream, value: number) => {
    setFormData(prev => ({
      ...prev,
      streams: prev.streams.map((stream, i) =>
        i === index ? { ...stream, [field]: value } : stream
      )
    }));
  };

  // Handle form data change
  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // React Query hooks for KVG data persistence
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

  // Form data mutation for saving
  const formDataMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentProject?.id) throw new Error('No project selected');
      
      // Check if form data already exists
      if (formDataFromDb?.id) {
        const res = await apiRequest(
          'PUT', 
          `/api/kvg-form-data/${formDataFromDb.id}`, 
          { ...data, project_id: currentProject.id }
        );
        return res.json();
      } else {
        const res = await apiRequest(
          'POST', 
          '/api/kvg-form-data', 
          { ...data, project_id: currentProject.id }
        );
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-form-data'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Saving Form Data",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stream mutation for adding
  const addStreamMutation = useMutation({
    mutationFn: async (stream: any) => {
      if (!currentProject?.id) throw new Error('No project selected');
      const res = await apiRequest(
        'POST', 
        '/api/kvg-streams', 
        { ...stream, project_id: currentProject.id }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Adding Stream",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stream mutation for updating
  const updateStreamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/kvg-streams/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Stream",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stream mutation for deleting
  const deleteStreamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/kvg-streams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Stream",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stream images mutation for adding
  const addStreamImageMutation = useMutation({
    mutationFn: async ({ streamId, imageData, filename }: { streamId: number; imageData: string; filename: string }) => {
      const res = await apiRequest('POST', '/api/stream-images', {
        stream_id: streamId,
        image_data: imageData,
        filename
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Adding Stream Image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stream images mutation for deleting
  const deleteStreamImageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/stream-images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'kvg-streams'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Stream Image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load data from database when component mounts
  useEffect(() => {
    if (formDataFromDb && !isLoadingFormData) {
      setFormData(prev => ({
        ...prev,
        ...formDataFromDb
      }));
    }
  }, [formDataFromDb, isLoadingFormData]);

  useEffect(() => {
    if (streamsFromDb && !isLoadingStreams) {
      setStreams(streamsFromDb);
    }
  }, [streamsFromDb, isLoadingStreams]);

  // Auto-save form data when it changes
  useEffect(() => {
    if (!currentProject?.id) return;
    
    const saveTimeout = setTimeout(() => {
      formDataMutation.mutate(formData);
    }, 2000); // 2 second debounce

    return () => clearTimeout(saveTimeout);
  }, [formData, currentProject?.id]);

  // Handle form save button click
  const handleSave = () => {
    if (!currentProject?.id) {
      toast({
        title: "Error",
        description: "Please select a project before saving.",
        variant: "destructive",
      });
      return;
    }
    
    formDataMutation.mutate(formData);
    
    toast({
      title: "Form Saved",
      description: "Your changes have been saved successfully.",
      variant: "default",
    });
  };
  
  // Stream functions
  const addStream = (streamToClone?: Stream) => {
    // Create a temporary ID for immediate UI feedback
    const tempId = -1 * (Date.now());  // Negative ID to distinguish from DB IDs
    
    const newStream: Stream = streamToClone 
      ? { ...streamToClone, id: tempId, images: [] } 
      : {
          id: tempId,
          location: "",
          fovAccessibility: "Select",
          cameraAccessibility: "Select",
          cameraType: "Select",
          environment: "",
          useCaseProblem: "",
          speakerAssociation: "",
          audioTalkDown: "Select",
          eventMonitoring: "Select",
          monitoringStartTime: "",
          monitoringEndTime: "",
          patrolGroups: "Select",
          patrolStartTime: "",
          patrolEndTime: "",
          // Legacy fields
          quantity: 1,
          description: "",
          monitoredArea: "",
          accessibility: "",
          useCase: "",
          analyticRule1: "",
          dwellTime1: 0,
          analyticRule2: "",
          dwellTime2: 0,
          daysOfWeek: [],
          schedule: "",
          eventVolume: 0,
          patrolType: "",
          patrolsPerWeek: 0,
          images: []
        };
    
    // Update UI immediately
    setStreams([...streams, newStream]);
    
    // Then persist to database
    if (currentProject?.id) {
      // Create a copy without the ID for database insertion
      const { id, ...streamWithoutId } = newStream;
      const streamForDb = { ...streamWithoutId, project_id: currentProject.id };
      
      addStreamMutation.mutate(streamForDb, {
        onSuccess: (newDbStream) => {
          // Replace the temporary stream with the one from the database (with proper ID)
          setStreams(prev => prev.map(s => s.id === tempId ? newDbStream : s));
        }
      });
    }
    
    toast({
      title: streamToClone ? "Stream Duplicated" : "Stream Added",
      description: streamToClone 
        ? "The stream has been duplicated successfully." 
        : "A new stream has been added.",
    });
  };

  // Function to update a stream
  const updateStream = (id: number, field: keyof Stream, value: any) => {
    // Update locally first for immediate UI feedback
    const updatedStreams = streams.map(stream => 
      stream.id === id ? { ...stream, [field]: value } : stream
    );
    setStreams(updatedStreams);
    
    // Then persist to database
    const streamToUpdate = updatedStreams.find(s => s.id === id);
    if (streamToUpdate && currentProject?.id) {
      updateStreamMutation.mutate({ 
        id, 
        data: { 
          ...streamToUpdate,
          project_id: currentProject.id
        } 
      });
    }
  };

  // Function to remove a stream
  const removeStream = (id: number) => {
    // Remove locally first for immediate UI feedback
    setStreams(streams.filter(stream => stream.id !== id));
    
    // Then remove from database
    if (id > 0) { // Only delete from DB if it's an existing record
      deleteStreamMutation.mutate(id);
    }
    
    toast({
      title: "Stream Removed",
      description: "The stream has been removed successfully.",
    });
  };

  // Handle stream image upload click
  const handleUploadStreamImageClick = (streamId: number) => {
    // Only allow upload for streams that exist in the database (positive IDs)
    if (streamId <= 0) {
      toast({
        title: "Error",
        description: "Please save the stream before adding images.",
        variant: "destructive",
      });
      return;
    }
    
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
          
          // Create a temporary image for immediate UI feedback
          const tempId = -1 * (Date.now() + i);
          const imageData = e.target.result;
          
          // Update the UI immediately
          const newImage: StreamImage = {
            id: tempId,
            imageData,
            filename: file.name
          };
          
          setStreams(prevStreams => 
            prevStreams.map(stream => 
              stream.id === streamId 
                ? { ...stream, images: [...stream.images, newImage] } 
                : stream
            )
          );
          
          // Then persist to database
          addStreamImageMutation.mutate({
            streamId,
            imageData,
            filename: file.name
          }, {
            onSuccess: (savedImage) => {
              // Replace the temporary image with the one from the database
              setStreams(prevStreams => 
                prevStreams.map(stream => {
                  if (stream.id !== streamId) return stream;
                  
                  return {
                    ...stream,
                    images: stream.images.map(img => 
                      img.id === tempId ? savedImage : img
                    )
                  };
                })
              );
            }
          });
        };
        
        reader.readAsDataURL(file);
      }
      
      toast({
        title: "Images Uploading",
        description: `${files.length} image(s) being uploaded...`,
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
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex border rounded overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`h-9 ${viewMode === 'cards' ? 
                        'bg-blue-50 text-blue-700 border-r border-blue-200' : 
                        'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                      onClick={() => setViewMode('cards')}
                      title="Card View"
                    >
                      <LayoutGrid size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`h-9 ${viewMode === 'list' ? 
                        'bg-blue-50 text-blue-700' : 
                        'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <List size={18} />
                    </Button>
                  </div>
                  
                  {streams.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {streams.length} {streams.length === 1 ? 'stream' : 'streams'}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => addStream()} 
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus size={16} /> Add Stream
                </Button>
              </div>
              
              {streams.length > 0 ? (
                viewMode === 'cards' ? (
                  /* Card-based Layout for Camera Stream Details */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {streams.map((stream) => (
                      <Card key={stream.id} className="overflow-hidden border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
                              <span className="p-1 bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                                {stream.id}
                              </span>
                              Camera Stream
                            </CardTitle>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addStream(stream)}
                                className="text-blue-500 p-0 h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                                title="Duplicate Stream"
                              >
                                <Copy size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeStream(stream.id)}
                                className="text-red-500 p-0 h-7 w-7 hover:bg-red-50 hover:text-red-600"
                                title="Delete Stream"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-teal-700 font-medium mt-1 flex items-center gap-1">
                            <VideoIcon size={14} className="text-teal-600" /> 
                            {stream.location ? 
                              (stream.location.length > 40 ? 
                                `${stream.location.substring(0, 40)}...` : 
                                stream.location) : 
                              "Location not specified"}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 pb-3 px-4">
                          {/* Main Stream Details */}
                          <div className="grid gap-3">
                            {/* Location/Name */}
                            <div>
                              <Label htmlFor={`stream-${stream.id}-location`} className="text-xs font-medium text-teal-700 mb-1 flex items-center gap-1.5">
                                <span className="p-0.5 bg-teal-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">📍</span>
                                Camera Location/Name
                              </Label>
                              <div className="relative">
                                <Textarea 
                                  id={`stream-${stream.id}-location`}
                                  value={stream.location || ""}
                                  onChange={(e) => updateStream(stream.id, "location", e.target.value)}
                                  className="min-h-[60px] resize-y focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 bg-white/90 text-sm"
                                  placeholder="Enter the location and naming of the camera video stream"
                                />
                                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                  {stream.location?.length || 0}
                                </div>
                              </div>
                            </div>
                            
                            {/* Image Management - Horizontal Layout */}
                            <div className="flex items-center gap-2 mt-1">
                              <Label className="text-xs font-medium text-teal-700 whitespace-nowrap flex items-center gap-1.5">
                                <span className="p-0.5 bg-teal-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">🖼️</span>
                                Images ({stream.images.length})
                              </Label>
                              <div className="flex items-center gap-1.5">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStream(stream);
                                    setIsImagesModalOpen(true);
                                  }}
                                  className="h-7 text-xs flex items-center gap-1"
                                  title="View Images"
                                >
                                  <ImageIcon size={12} /> View 
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUploadStreamImageClick(stream.id)}
                                  className="h-7 text-xs"
                                  title="Upload Image"
                                >
                                  <Upload size={12} /> Add
                                </Button>
                              </div>
                            </div>
                            
                            {/* Core Properties Grid */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">
                              <div>
                                <Label htmlFor={`stream-${stream.id}-fov`} className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-blue-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">🔍</span>
                                  FOV Accessibility
                                </Label>
                                <Select 
                                  value={stream.fovAccessibility}
                                  onValueChange={(value) => updateStream(stream.id, "fovAccessibility", value)}
                                >
                                  <SelectTrigger id={`stream-${stream.id}-fov`} className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                    <SelectItem value="Select">Select</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor={`stream-${stream.id}-camera-type`} className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-indigo-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">📹</span>
                                  Camera Type
                                </Label>
                                <Select 
                                  value={stream.cameraType}
                                  onValueChange={(value) => updateStream(stream.id, "cameraType", value)}
                                >
                                  <SelectTrigger id={`stream-${stream.id}-camera-type`} className="h-8">
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
                              </div>
                              
                              <div>
                                <Label htmlFor={`stream-${stream.id}-monitoring`} className="text-xs font-medium text-orange-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-orange-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">👁️</span>
                                  Event Monitoring
                                </Label>
                                <Select 
                                  value={stream.eventMonitoring}
                                  onValueChange={(value) => updateStream(stream.id, "eventMonitoring", value)}
                                >
                                  <SelectTrigger id={`stream-${stream.id}-monitoring`} className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                    <SelectItem value="Select">Select</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor={`stream-${stream.id}-audio`} className="text-xs font-medium text-pink-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-pink-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">🔊</span>
                                  Audio Talk Down
                                </Label>
                                <Select 
                                  value={stream.audioTalkDown}
                                  onValueChange={(value) => updateStream(stream.id, "audioTalkDown", value)}
                                >
                                  <SelectTrigger id={`stream-${stream.id}-audio`} className="h-8">
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
                            
                            {/* Schedule Section */}
                            <div className="grid grid-cols-2 gap-3 mt-1">
                              <div>
                                <Label htmlFor={`stream-${stream.id}-patrol-groups`} className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-red-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">👮</span>
                                  Patrol Groups
                                </Label>
                                <Select 
                                  value={stream.patrolGroups}
                                  onValueChange={(value) => updateStream(stream.id, "patrolGroups", value)}
                                >
                                  <SelectTrigger id={`stream-${stream.id}-patrol-groups`} className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                    <SelectItem value="Select">Select</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex flex-col">
                                <Label className="text-xs font-medium text-orange-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-orange-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">⏰</span>
                                  Monitoring Times
                                </Label>
                                <div className="flex gap-1 items-center">
                                  <Input 
                                    type="time"
                                    value={stream.monitoringStartTime || ""}
                                    onChange={(e) => updateStream(stream.id, "monitoringStartTime", e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                  <span className="text-xs">to</span>
                                  <Input 
                                    type="time"
                                    value={stream.monitoringEndTime || ""}
                                    onChange={(e) => updateStream(stream.id, "monitoringEndTime", e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Collapsible Sections */}
                            <div className="border-t pt-2 mt-2">
                              {/* Expandable Sections Toggle */}
                              <div className="flex justify-between mb-1">
                                <Label className="text-xs font-medium text-gray-700">Detailed Information</Label>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs px-2 text-purple-600"
                                    onClick={() => {
                                      const el = document.getElementById(`stream-${stream.id}-problem-detail`);
                                      if (el) {
                                        const isVisible = el.style.display !== 'none';
                                        el.style.display = isVisible ? 'none' : 'block';
                                      }
                                    }}
                                  >
                                    Problem
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs px-2 text-pink-600"
                                    onClick={() => {
                                      const el = document.getElementById(`stream-${stream.id}-association-detail`);
                                      if (el) {
                                        const isVisible = el.style.display !== 'none';
                                        el.style.display = isVisible ? 'none' : 'block';
                                      }
                                    }}
                                  >
                                    Association
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs px-2 text-red-600"
                                    onClick={() => {
                                      const el = document.getElementById(`stream-${stream.id}-patrol-times`);
                                      if (el) {
                                        const isVisible = el.style.display !== 'none';
                                        el.style.display = isVisible ? 'none' : 'block';
                                      }
                                    }}
                                  >
                                    Patrol
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Problem Description Section - Collapsible */}
                              <div id={`stream-${stream.id}-problem-detail`} className="mb-3" style={{display: 'none'}}>
                                <Label htmlFor={`stream-${stream.id}-problem`} className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-purple-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">⚠️</span>
                                  Problem Description
                                </Label>
                                <div className="relative">
                                  <Textarea 
                                    id={`stream-${stream.id}-problem`}
                                    value={stream.useCaseProblem || ""}
                                    onChange={(e) => updateStream(stream.id, "useCaseProblem", e.target.value)}
                                    className="min-h-[120px] resize-y focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/90 text-sm"
                                    placeholder="Enter any unique use case problem for this camera or scene if different from the site problem defined above."
                                  />
                                  <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                    {stream.useCaseProblem?.length || 0} chars
                                  </div>
                                </div>
                              </div>
                              
                              {/* Speaker Association Section - Collapsible */}
                              <div id={`stream-${stream.id}-association-detail`} className="mb-3" style={{display: 'none'}}>
                                <Label htmlFor={`stream-${stream.id}-association`} className="text-xs font-medium text-pink-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-pink-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">🔗</span>
                                  Speaker Association
                                </Label>
                                <div className="relative">
                                  <Textarea 
                                    id={`stream-${stream.id}-association`}
                                    value={stream.speakerAssociation || ""}
                                    onChange={(e) => updateStream(stream.id, "speakerAssociation", e.target.value)}
                                    className="min-h-[120px] resize-y focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 bg-white/90 text-sm"
                                    placeholder="Fill in if speaker is dedicated to single camera or a group of cameras"
                                  />
                                  <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                                    {stream.speakerAssociation?.length || 0} chars
                                  </div>
                                </div>
                              </div>
                              
                              {/* Patrol Times Section - Collapsible */}
                              <div id={`stream-${stream.id}-patrol-times`} className="mb-3" style={{display: 'none'}}>
                                <Label className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1.5">
                                  <span className="p-0.5 bg-red-500 text-white rounded w-4 h-4 flex items-center justify-center text-[10px]">⏱️</span>
                                  Patrol Times
                                </Label>
                                <div className="flex gap-1 items-center">
                                  <Input 
                                    type="time"
                                    value={stream.patrolStartTime || ""}
                                    onChange={(e) => updateStream(stream.id, "patrolStartTime", e.target.value)}
                                    className="h-8"
                                  />
                                  <span className="text-xs text-gray-500">to</span>
                                  <Input 
                                    type="time"
                                    value={stream.patrolEndTime || ""}
                                    onChange={(e) => updateStream(stream.id, "patrolEndTime", e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Table/List View for Camera Stream Details */
                  <div className="overflow-x-auto shadow-md sm:rounded-lg mb-8">
                    <table className="w-full text-sm">
                      <thead className="text-xs">
                        <tr className="border-b border-gray-300">
                          <th colSpan={1} className="px-3 py-3 text-center bg-teal-600 text-white font-semibold rounded-tl-lg">ID</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-teal-600 text-white font-semibold">Location</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-teal-600 text-white font-semibold">Images</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-blue-600 text-white font-semibold">FOV</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-indigo-600 text-white font-semibold">Type</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-pink-600 text-white font-semibold">Audio</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-orange-600 text-white font-semibold">Monitoring</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-red-600 text-white font-semibold">Patrol</th>
                          <th colSpan={1} className="px-3 py-3 text-center bg-gray-700 text-white font-semibold rounded-tr-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {streams.map((stream) => (
                          <tr key={stream.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-3 py-3 text-center font-medium">{stream.id}</td>
                            <td className="px-3 py-3 max-w-[200px]">
                              <div className="line-clamp-2 text-sm">{stream.location || "Not specified"}</div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStream(stream);
                                    setIsImagesModalOpen(true);
                                  }}
                                  className="h-7 w-7 p-0"
                                  title="View Images"
                                >
                                  <ImageIcon size={14} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUploadStreamImageClick(stream.id)}
                                  className="h-7 w-7 p-0"
                                  title="Upload Image"
                                >
                                  <Upload size={14} />
                                </Button>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">{stream.fovAccessibility === "Select" ? "-" : stream.fovAccessibility}</td>
                            <td className="px-3 py-3 text-center">{stream.cameraType === "Select" ? "-" : stream.cameraType}</td>
                            <td className="px-3 py-3 text-center">{stream.audioTalkDown === "Select" ? "-" : stream.audioTalkDown}</td>
                            <td className="px-3 py-3 text-center">
                              {stream.eventMonitoring === "Yes" ? (
                                <div className="text-xs">
                                  {stream.monitoringStartTime && stream.monitoringEndTime ? 
                                    `${stream.monitoringStartTime} - ${stream.monitoringEndTime}` : 
                                    "Yes (no time set)"}
                                </div>
                              ) : (stream.eventMonitoring === "Select" ? "-" : "No")}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {stream.patrolGroups === "Yes" ? (
                                <div className="text-xs">
                                  {stream.patrolStartTime && stream.patrolEndTime ? 
                                    `${stream.patrolStartTime} - ${stream.patrolEndTime}` : 
                                    "Yes (no time set)"}
                                </div>
                              ) : (stream.patrolGroups === "Select" ? "-" : "No")}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex gap-1 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => addStream(stream)}
                                  title="Duplicate Stream"
                                  className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
                                >
                                  <Copy size={14} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeStream(stream.id)}
                                  title="Remove Stream"
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
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
              
              {/* Opportunity Details Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-blue-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2">
                  <span className="p-1 bg-blue-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </span>
                  Opportunity Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div>
                    <Label htmlFor="bdmOwner" className="text-sm text-blue-700">BDM Name:</Label>
                    <Input 
                      id="bdmOwner"
                      value={formData.bdmOwner} 
                      onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                      placeholder="Enter BDM name"
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="crmOpportunity" className="text-sm text-blue-700">CRM Opportunity:</Label>
                    <Input 
                      id="crmOpportunity"
                      value={formData.crmOpportunity} 
                      onChange={(e) => handleFormChange("crmOpportunity", e.target.value)}
                      placeholder="Enter CRM opportunity ID"
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="opportunityStage" className="text-sm text-blue-700">Opportunity Stage:</Label>
                    <Select 
                      value={formData.opportunityStage} 
                      onValueChange={(value) => handleFormChange("opportunityStage", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engage">Engage</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Close">Close</SelectItem>
                        <SelectItem value="Install">Install</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div>
                    <Label htmlFor="quoteDate" className="text-sm text-blue-700">Quote Date:</Label>
                    <Input 
                      id="quoteDate"
                      type="date"
                      value={formData.quoteDate} 
                      onChange={(e) => handleFormChange("quoteDate", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timeZone" className="text-sm text-blue-700">Time Zone:</Label>
                    <Select 
                      value={formData.timeZone} 
                      onValueChange={(value) => handleFormChange("timeZone", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EST">Eastern (EST/EDT)</SelectItem>
                        <SelectItem value="CST">Central (CST/CDT)</SelectItem>
                        <SelectItem value="MST">Mountain (MST/MDT)</SelectItem>
                        <SelectItem value="PST">Pacific (PST/PDT)</SelectItem>
                        <SelectItem value="AKST">Alaska (AKST/AKDT)</SelectItem>
                        <SelectItem value="HST">Hawaii (HST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="region" className="text-sm text-blue-700">Region:</Label>
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
                        <SelectItem value="Southwest">Southwest</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Customer Details Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm border border-indigo-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center gap-2">
                  <span className="p-1 bg-indigo-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                  </span>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerName" className="text-sm text-indigo-700">Customer Name:</Label>
                    <Input 
                      id="customerName"
                      value={formData.customerName} 
                      onChange={(e) => handleFormChange("customerName", e.target.value)}
                      placeholder="Enter customer name"
                      className="bg-white mb-4"
                    />
                    
                    <Label htmlFor="siteAddress" className="text-sm text-indigo-700">Site Address:</Label>
                    <Input 
                      id="siteAddress"
                      value={formData.siteAddress} 
                      onChange={(e) => handleFormChange("siteAddress", e.target.value)}
                      placeholder="Enter site address"
                      className="bg-white mb-4"
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="city" className="text-sm text-indigo-700">City:</Label>
                        <Input 
                          id="city"
                          value={formData.city} 
                          onChange={(e) => handleFormChange("city", e.target.value)}
                          placeholder="City"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-sm text-indigo-700">State:</Label>
                        <Select 
                          value={formData.state} 
                          onValueChange={(value) => handleFormChange("state", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="AK">Alaska</SelectItem>
                            <SelectItem value="AZ">Arizona</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="CO">Colorado</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="DE">Delaware</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="GA">Georgia</SelectItem>
                            <SelectItem value="HI">Hawaii</SelectItem>
                            <SelectItem value="ID">Idaho</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="IN">Indiana</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="KY">Kentucky</SelectItem>
                            <SelectItem value="LA">Louisiana</SelectItem>
                            <SelectItem value="ME">Maine</SelectItem>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="MA">Massachusetts</SelectItem>
                            <SelectItem value="MI">Michigan</SelectItem>
                            <SelectItem value="MN">Minnesota</SelectItem>
                            <SelectItem value="MS">Mississippi</SelectItem>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="MT">Montana</SelectItem>
                            <SelectItem value="NE">Nebraska</SelectItem>
                            <SelectItem value="NV">Nevada</SelectItem>
                            <SelectItem value="NH">New Hampshire</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="NM">New Mexico</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NC">North Carolina</SelectItem>
                            <SelectItem value="ND">North Dakota</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                            <SelectItem value="OK">Oklahoma</SelectItem>
                            <SelectItem value="OR">Oregon</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="RI">Rhode Island</SelectItem>
                            <SelectItem value="SC">South Carolina</SelectItem>
                            <SelectItem value="SD">South Dakota</SelectItem>
                            <SelectItem value="TN">Tennessee</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="UT">Utah</SelectItem>
                            <SelectItem value="VT">Vermont</SelectItem>
                            <SelectItem value="VA">Virginia</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                            <SelectItem value="WV">West Virginia</SelectItem>
                            <SelectItem value="WI">Wisconsin</SelectItem>
                            <SelectItem value="WY">Wyoming</SelectItem>
                            <SelectItem value="DC">District of Columbia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-sm text-indigo-700">Zip Code:</Label>
                        <Input 
                          id="zipCode"
                          value={formData.zipCode} 
                          onChange={(e) => handleFormChange("zipCode", e.target.value)}
                          placeholder="Zip"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="customerVertical" className="text-sm text-indigo-700">Customer Vertical:</Label>
                    <Select 
                      value={formData.customerVertical} 
                      onValueChange={(value) => handleFormChange("customerVertical", value)}
                    >
                      <SelectTrigger className="bg-white mb-4">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commercial Real Estate">Commercial Real Estate</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Label htmlFor="propertyCategory" className="text-sm text-indigo-700">Property Category:</Label>
                    <Select 
                      value={formData.propertyCategory} 
                      onValueChange={(value) => handleFormChange("propertyCategory", value)}
                    >
                      <SelectTrigger className="bg-white mb-4">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Multifamily">Multifamily</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                        <SelectItem value="Hotel">Hotel</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Self Storage">Self Storage</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Label htmlFor="siteEnvironment" className="text-sm text-indigo-700">Site Environment:</Label>
                    <Select 
                      value={formData.siteEnvironment} 
                      onValueChange={(value) => handleFormChange("siteEnvironment", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                        <SelectItem value="Mixed">Both Indoor & Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Technology & Installation Section */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-5 rounded-lg shadow-sm border border-teal-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-teal-800 flex items-center gap-2">
                  <span className="p-1 bg-teal-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </span>
                  Technology & Installation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="technology" className="text-sm text-teal-700">Technology:</Label>
                    <Select 
                      value={formData.technology} 
                      onValueChange={(value) => handleFormChange("technology", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CCTV">CCTV</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                        <SelectItem value="Thermal">Thermal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="technologyDeployed" className="text-sm text-teal-700">Technology Deployed:</Label>
                    <Select 
                      value={formData.technologyDeployed} 
                      onValueChange={(value) => handleFormChange("technologyDeployed", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New System">New System</SelectItem>
                        <SelectItem value="Existing System">Existing System</SelectItem>
                        <SelectItem value="Hybrid">Hybrid (New+Existing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="cameraType" className="text-sm text-teal-700">Camera Type:</Label>
                    <Select 
                      value={formData.cameraType} 
                      onValueChange={(value) => handleFormChange("cameraType", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IP">IP</SelectItem>
                        <SelectItem value="Analog">Analog</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="installType" className="text-sm text-teal-700">Install Type:</Label>
                    <Select 
                      value={formData.installType} 
                      onValueChange={(value) => handleFormChange("installType", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Takeover">Takeover</SelectItem>
                        <SelectItem value="Add-on">Add-on</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="opportunityType" className="text-sm text-teal-700">Opportunity Type:</Label>
                    <Select 
                      value={formData.opportunityType} 
                      onValueChange={(value) => handleFormChange("opportunityType", value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Upgrade">Upgrade</SelectItem>
                        <SelectItem value="Replacement">Replacement</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Incident Types Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg shadow-sm border border-amber-100 mb-6">
                <h3 className="text-lg font-semibold mb-5 text-amber-800 flex items-center gap-2">
                  <span className="p-1 bg-amber-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </span>
                  <span className="flex items-center gap-2">📋 Incident Types to Monitor</span>
                </h3>
                <div className="grid gap-6">
                  {/* Criminal Activity */}
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">🚨</span> Criminal Activity
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Toggle 
                        pressed={formData.obviousCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("obviousCriminalAct", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.obviousCriminalAct ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🦹‍♂️ Obvious Criminal Act</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.activeBreakIn}
                        onPressedChange={(pressed) => handleFormChange("activeBreakIn", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.activeBreakIn ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🔨 Active Break-in</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.destructionOfProperty}
                        onPressedChange={(pressed) => handleFormChange("destructionOfProperty", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.destructionOfProperty ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">💥 Destruction of Property</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.carDrivingThroughGate}
                        onPressedChange={(pressed) => handleFormChange("carDrivingThroughGate", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.carDrivingThroughGate ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🚗 Car Driving Through Gate</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.carBurglaries}
                        onPressedChange={(pressed) => handleFormChange("carBurglaries", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.carBurglaries ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🚙 Car Burglaries</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.trespassing}
                        onPressedChange={(pressed) => handleFormChange("trespassing", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.trespassing ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">⛔ Trespassing</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.carsBrokenIntoAfterFact}
                        onPressedChange={(pressed) => handleFormChange("carsBrokenIntoAfterFact", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.carsBrokenIntoAfterFact ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🔎 Cars Broken Into (After Fact)</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.brokenGlassWindows}
                        onPressedChange={(pressed) => handleFormChange("brokenGlassWindows", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.brokenGlassWindows ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🪟 Broken Glass/Windows</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  {/* Suspicious Activity */}
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">👁️</span> Suspicious Activity
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Toggle 
                        pressed={formData.suspiciousActivity}
                        onPressedChange={(pressed) => handleFormChange("suspiciousActivity", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.suspiciousActivity ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🕵️ Suspicious Activity</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.intentToCommitCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("intentToCommitCriminalAct", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.intentToCommitCriminalAct ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">📝 Intent to Commit Crime</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.checkingMultipleCarDoors}
                        onPressedChange={(pressed) => handleFormChange("checkingMultipleCarDoors", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.checkingMultipleCarDoors ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🚪 Checking Car Doors</span>
                      </Toggle>
                      
                      <Toggle 
                        pressed={formData.dumpsterDivingOrDumping}
                        onPressedChange={(pressed) => handleFormChange("dumpsterDivingOrDumping", pressed)}
                        variant="outline"
                        size="sm"
                        className={formData.dumpsterDivingOrDumping ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                      >
                        <span className="flex items-center gap-1">🗑️ Dumpster Diving/Dumping</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  {/* More Incident Types */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Nuisance Activity */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">😒</span> Nuisance Activity
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.urinationOrOtherBodilyFunctions}
                          onPressedChange={(pressed) => handleFormChange("urinationOrOtherBodilyFunctions", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.urinationOrOtherBodilyFunctions ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">💦 Urination/Bodily Functions</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.presenceOfScooters}
                          onPressedChange={(pressed) => handleFormChange("presenceOfScooters", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.presenceOfScooters ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🛴 Presence of Scooters</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.leavingTrash}
                          onPressedChange={(pressed) => handleFormChange("leavingTrash", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.leavingTrash ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🗑️ Leaving Trash</span>
                        </Toggle>
                      </div>
                    </div>
                    
                    {/* Emergency/Medical */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🚑</span> Emergency/Medical
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.emergencyServices}
                          onPressedChange={(pressed) => handleFormChange("emergencyServices", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.emergencyServices ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🚒 Emergency Services</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.personInjuredOrDistress}
                          onPressedChange={(pressed) => handleFormChange("personInjuredOrDistress", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.personInjuredOrDistress ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🤕 Person Injured/In Distress</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.obviousMedicalEmergency}
                          onPressedChange={(pressed) => handleFormChange("obviousMedicalEmergency", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.obviousMedicalEmergency ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">⚕️ Medical Emergency</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.visibleFireOrSmoke}
                          onPressedChange={(pressed) => handleFormChange("visibleFireOrSmoke", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.visibleFireOrSmoke ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🔥 Visible Fire/Smoke</span>
                        </Toggle>
                      </div>
                    </div>
                    
                    {/* Loitering Group */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🧍</span> Loitering
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.loitering}
                          onPressedChange={(pressed) => handleFormChange("loitering", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.loitering ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">⌛ Loitering</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.activeGathering}
                          onPressedChange={(pressed) => handleFormChange("activeGathering", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.activeGathering ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">👪 Active Gathering</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.groupsLoiteringGathering}
                          onPressedChange={(pressed) => handleFormChange("groupsLoiteringGathering", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.groupsLoiteringGathering ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">👥 Groups Loitering</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.homelessVagrant}
                          onPressedChange={(pressed) => handleFormChange("homelessVagrant", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.homelessVagrant ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🧳 Homeless/Vagrant</span>
                        </Toggle>
                      </div>
                    </div>
                  </div>
                  
                  {/* Even More Incident Types */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Tenant Activity */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🏢</span> Tenant Activity
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.tenantsMovingOut}
                          onPressedChange={(pressed) => handleFormChange("tenantsMovingOut", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.tenantsMovingOut ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">📦 Tenants Moving Out</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.largeItemsMovedAfterHours}
                          onPressedChange={(pressed) => handleFormChange("largeItemsMovedAfterHours", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.largeItemsMovedAfterHours ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🛋️ Items Moved After Hours</span>
                        </Toggle>
                      </div>
                    </div>
                    
                    {/* Restricted Access */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🚫</span> Restricted Access
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.personInRestrictedArea}
                          onPressedChange={(pressed) => handleFormChange("personInRestrictedArea", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.personInRestrictedArea ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🚷 Person in Restricted Area</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.sittingOrSleeping}
                          onPressedChange={(pressed) => handleFormChange("sittingOrSleeping", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.sittingOrSleeping ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">😴 Sitting or Sleeping</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.presentInProhibitedArea}
                          onPressedChange={(pressed) => handleFormChange("presentInProhibitedArea", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.presentInProhibitedArea ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">⛔ Present in Prohibited Area</span>
                        </Toggle>
                      </div>
                    </div>
                    
                    {/* More Loitering */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">👥</span> More Loitering Types
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Toggle 
                          pressed={formData.sleepingOnSiteEncampments}
                          onPressedChange={(pressed) => handleFormChange("sleepingOnSiteEncampments", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.sleepingOnSiteEncampments ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🏕️ Sleeping on Site</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.loiteringInStairwells}
                          onPressedChange={(pressed) => handleFormChange("loiteringInStairwells", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.loiteringInStairwells ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🪜 Loitering in Stairwells</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.personsSmoking}
                          onPressedChange={(pressed) => handleFormChange("personsSmoking", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.personsSmoking ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🚬 Persons Smoking</span>
                        </Toggle>
                        
                        <Toggle 
                          pressed={formData.vehicleLoiteringInArea}
                          onPressedChange={(pressed) => handleFormChange("vehicleLoiteringInArea", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.vehicleLoiteringInArea ? "bg-amber-100 border-amber-400 text-amber-900" : ""}
                        >
                          <span className="flex items-center gap-1">🚘 Vehicle Loitering</span>
                        </Toggle>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Incident Types */}
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">⚙️</span> Custom Incident Types
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3">
                        <Toggle 
                          pressed={formData.customIncidentType1Selected}
                          onPressedChange={(pressed) => handleFormChange("customIncidentType1Selected", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.customIncidentType1Selected ? "bg-amber-100 border-amber-400 text-amber-900 min-w-[120px]" : "min-w-[120px]"}
                        >
                          <span className="flex items-center gap-1">🔶 Custom Type 1</span>
                        </Toggle>
                        <Input 
                          value={formData.customIncidentType1 || ""}
                          onChange={(e) => handleFormChange("customIncidentType1", e.target.value)}
                          placeholder="Enter custom incident type"
                          className="flex-1 bg-white"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Toggle 
                          pressed={formData.customIncidentType2Selected}
                          onPressedChange={(pressed) => handleFormChange("customIncidentType2Selected", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.customIncidentType2Selected ? "bg-amber-100 border-amber-400 text-amber-900 min-w-[120px]" : "min-w-[120px]"}
                        >
                          <span className="flex items-center gap-1">🔷 Custom Type 2</span>
                        </Toggle>
                        <Input 
                          value={formData.customIncidentType2 || ""}
                          onChange={(e) => handleFormChange("customIncidentType2", e.target.value)}
                          placeholder="Enter custom incident type"
                          className="flex-1 bg-white"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Toggle 
                          pressed={formData.customIncidentType3Selected}
                          onPressedChange={(pressed) => handleFormChange("customIncidentType3Selected", pressed)}
                          variant="outline"
                          size="sm"
                          className={formData.customIncidentType3Selected ? "bg-amber-100 border-amber-400 text-amber-900 min-w-[120px]" : "min-w-[120px]"}
                        >
                          <span className="flex items-center gap-1">💠 Custom Type 3</span>
                        </Toggle>
                        <Input 
                          value={formData.customIncidentType3 || ""}
                          onChange={(e) => handleFormChange("customIncidentType3", e.target.value)}
                          placeholder="Enter custom incident type"
                          className="flex-1 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Use Case Problem Information */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-lg shadow-sm border border-red-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2">
                  <span className="p-1 bg-red-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                  </span>
                  <span className="flex items-center gap-2">🔍 Use Case Problem Information</span>
                </h3>
                <div className="relative">
                  <Textarea 
                    value={formData.useCaseResponse || ""}
                    onChange={(e) => handleFormChange("useCaseResponse", e.target.value)}
                    placeholder="Fill in information around the specific issues and problems the customer is having..."
                    className="min-h-[120px] w-full resize-y bg-white"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.useCaseResponse?.length || 0} characters
                  </div>
                </div>
              </div>
              
              {/* Patrol Details Section */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-lg shadow-sm border border-green-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center gap-2">
                  <span className="p-1 bg-green-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </span>
                  Patrol & Guard Dispatch Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">On-Demand Guard Dispatch Detail:</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">GDODs Dispatches Per Month:</div>
                        <Input 
                          type="number"
                          value={formData.gdodsDispatchesPerMonth || ''}
                          onChange={(e) => handleFormChange("gdodsDispatchesPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white w-24"
                        />
                      </div>
                      <Textarea 
                        value={formData.onDemandGuardDispatchDetail || ""}
                        onChange={(e) => handleFormChange("onDemandGuardDispatchDetail", e.target.value)}
                        placeholder="Enter details about on-demand guard dispatch requirements and procedures"
                        className="min-h-[100px] resize-y bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">SGPP Scheduled Guard Patrol Detail:</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">SGPP Scheduled Patrols Per Month:</div>
                        <Input 
                          type="number"
                          value={formData.sgppScheduledPatrolsPerMonth || ''}
                          onChange={(e) => handleFormChange("sgppScheduledPatrolsPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white w-24"
                        />
                      </div>
                      <Textarea 
                        value={formData.sgppScheduledGuardPatrolDetail || ""}
                        onChange={(e) => handleFormChange("sgppScheduledGuardPatrolDetail", e.target.value)}
                        placeholder="Enter details about scheduled guard patrol requirements and procedures"
                        className="min-h-[100px] resize-y bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">SGPP Scheduled Guard Patrols Schedule Detail:</Label>
                    <Textarea 
                      value={formData.sgppScheduledGuardPatrolsScheduleDetail || ""}
                      onChange={(e) => handleFormChange("sgppScheduledGuardPatrolsScheduleDetail", e.target.value)}
                      placeholder="Enter the specific schedule details for guard patrols (days/times)"
                      className="min-h-[100px] resize-y bg-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
                  onClick={() => handleSave()}
                >
                  <Save size={16} />
                  Save Discovery Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Site Assessment Tab Content */}
        <TabsContent value="site-assessment">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                <span className="p-1.5 bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                KVG Site Assessment
              </CardTitle>
              <CardDescription className="text-base text-green-700">
                Evaluate the site conditions for successful KVG deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Technical Requirements */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-lg shadow-sm border border-green-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center gap-2">
                  <span className="p-1 bg-green-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                  </span>
                  Technical Requirements
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">Lighting Requirements:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <Select 
                        value={formData.lightingRequirements} 
                        onValueChange={(value) => handleFormChange("lightingRequirements", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select lighting requirements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent - Well lit area</SelectItem>
                          <SelectItem value="Good">Good - Sufficient for most cameras</SelectItem>
                          <SelectItem value="Fair">Fair - May need enhancement</SelectItem>
                          <SelectItem value="Poor">Poor - Requires lighting upgrade</SelectItem>
                          <SelectItem value="None">None - Complete darkness</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="col-span-2">
                        <Input 
                          value={formData.lightingNotes || ""}
                          onChange={(e) => handleFormChange("lightingNotes", e.target.value)}
                          placeholder="Additional lighting notes or requirements"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">Camera Field of View:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <Select 
                        value={formData.cameraFieldOfView} 
                        onValueChange={(value) => handleFormChange("cameraFieldOfView", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select field of view assessment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent - Optimal coverage</SelectItem>
                          <SelectItem value="Good">Good - Minor obstructions</SelectItem>
                          <SelectItem value="Fair">Fair - Some obstructions</SelectItem>
                          <SelectItem value="Poor">Poor - Significant obstructions</SelectItem>
                          <SelectItem value="Blocked">Blocked - Major rework needed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="col-span-2">
                        <Input 
                          value={formData.fovNotes || ""}
                          onChange={(e) => handleFormChange("fovNotes", e.target.value)}
                          placeholder="Additional field of view notes or requirements"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-1.5">Network Connectivity:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <Select 
                        value={formData.networkConnectivity} 
                        onValueChange={(value) => handleFormChange("networkConnectivity", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select network connectivity assessment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent - High bandwidth</SelectItem>
                          <SelectItem value="Good">Good - Stable connection</SelectItem>
                          <SelectItem value="Fair">Fair - Occasional issues</SelectItem>
                          <SelectItem value="Poor">Poor - Frequent disconnects</SelectItem>
                          <SelectItem value="None">None - No connectivity</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="col-span-2">
                        <Input 
                          value={formData.networkNotes || ""}
                          onChange={(e) => handleFormChange("networkNotes", e.target.value)}
                          placeholder="Additional network connectivity notes"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stream Counts & Monitoring Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Stream Counts Section */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-lg shadow-sm border border-teal-100">
                  <h3 className="text-lg font-semibold mb-4 text-teal-800 flex items-center gap-2">
                    <span className="p-1 bg-teal-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </span>
                    Stream Counts
                  </h3>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-sm text-teal-700">Event Video Trigger Streams:</Label>
                      <Input 
                        type="number"
                        value={formData.eventVideoTriggerStreams || ''}
                        onChange={(e) => handleFormChange("eventVideoTriggerStreams", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-teal-700">Virtual Patrol Streams:</Label>
                      <Input 
                        type="number"
                        value={formData.virtualPatrolStreams || ''}
                        onChange={(e) => handleFormChange("virtualPatrolStreams", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-teal-700">Event Action Clip Streams:</Label>
                      <Input 
                        type="number"
                        value={formData.eventActionClipStreams || ''}
                        onChange={(e) => handleFormChange("eventActionClipStreams", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-teal-700">Event Action Multi-View Streams:</Label>
                      <Input 
                        type="number"
                        value={formData.eventActionMultiViewStreams || ''}
                        onChange={(e) => handleFormChange("eventActionMultiViewStreams", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-teal-700">Health Streams:</Label>
                      <Input 
                        type="number"
                        value={formData.healthStreams || ''}
                        onChange={(e) => handleFormChange("healthStreams", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-teal-700">Audio Talk Down Speakers:</Label>
                      <Input 
                        type="number"
                        value={formData.audioTalkDownSpeakers || ''}
                        onChange={(e) => handleFormChange("audioTalkDownSpeakers", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Monitoring Details Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-lg shadow-sm border border-indigo-100">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center gap-2">
                    <span className="p-1 bg-indigo-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </span>
                    Monitoring Details
                  </h3>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-sm text-indigo-700">Total Events Per Month:</Label>
                      <Input 
                        type="number"
                        value={formData.totalEventsPerMonth || ''}
                        onChange={(e) => handleFormChange("totalEventsPerMonth", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-indigo-700">Total Virtual Patrols Per Month:</Label>
                      <Input 
                        type="number"
                        value={formData.totalVirtualPatrolsPerMonth || ''}
                        onChange={(e) => handleFormChange("totalVirtualPatrolsPerMonth", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-indigo-700">Patrol Frequency:</Label>
                      <Select 
                        value={formData.patrolFrequency} 
                        onValueChange={(value) => handleFormChange("patrolFrequency", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-indigo-700">Total Health Patrols Per Month:</Label>
                      <Input 
                        type="number"
                        value={formData.totalHealthPatrolsPerMonth || ''}
                        onChange={(e) => handleFormChange("totalHealthPatrolsPerMonth", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-indigo-700">Total Event Action Multi-Views Per Month:</Label>
                      <Input 
                        type="number"
                        value={formData.totalEventActionMultiViewsPerMonth || ''}
                        onChange={(e) => handleFormChange("totalEventActionMultiViewsPerMonth", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-indigo-700">Total Escalations (Maximum):</Label>
                      <Input 
                        type="number"
                        value={formData.totalEscalationsMaximum || ''}
                        onChange={(e) => handleFormChange("totalEscalationsMaximum", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              

              {/* Notes & Plan Section */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-lg shadow-sm border border-amber-100 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-amber-800 flex items-center gap-2">
                  <span className="p-1 bg-amber-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </span>
                  Site Assessment Notes & Plan
                </h3>
                <Textarea 
                  value={formData.siteAssessmentNotes || ""}
                  onChange={(e) => handleFormChange("siteAssessmentNotes", e.target.value)}
                  placeholder="Enter detailed notes about the site assessment, including any challenges, recommendations, or special requirements"
                  className="min-h-[150px] w-full resize-y bg-white mb-4"
                />
                
                <Label className="text-sm font-medium text-amber-700 block mb-2">Quote with SOW attached?</Label>
                <div className="flex gap-2 mb-4">
                  <ToggleGroup type="single" variant="outline" value={formData.quoteWithSowAttached} onValueChange={(value) => handleFormChange("quoteWithSowAttached", value)}>
                    <ToggleGroupItem value="Yes" className={formData.quoteWithSowAttached === "Yes" ? "bg-green-100 border-green-400 text-green-900" : ""}>Yes</ToggleGroupItem>
                    <ToggleGroupItem value="No" className={formData.quoteWithSowAttached === "No" ? "bg-red-100 border-red-400 text-red-900" : ""}>No</ToggleGroupItem>
                    <ToggleGroupItem value="N/A" className={formData.quoteWithSowAttached === "N/A" ? "bg-gray-100 border-gray-400 text-gray-900" : ""}>N/A</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <Label className="text-sm font-medium text-amber-700 block mb-2">Quote design attached?</Label>
                <div className="flex gap-2">
                  <ToggleGroup type="single" variant="outline" value={formData.quoteDesignAttached} onValueChange={(value) => handleFormChange("quoteDesignAttached", value)}>
                    <ToggleGroupItem value="Yes" className={formData.quoteDesignAttached === "Yes" ? "bg-green-100 border-green-400 text-green-900" : ""}>Yes</ToggleGroupItem>
                    <ToggleGroupItem value="No" className={formData.quoteDesignAttached === "No" ? "bg-red-100 border-red-400 text-red-900" : ""}>No</ToggleGroupItem>
                    <ToggleGroupItem value="N/A" className={formData.quoteDesignAttached === "N/A" ? "bg-gray-100 border-gray-400 text-gray-900" : ""}>N/A</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 gap-2"
                  onClick={() => handleSave()}
                >
                  <Save size={16} />
                  Save Site Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center gap-2">
            <span className="p-1 bg-purple-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </span>
            Opportunity Stage Ownership
          </h3>
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
              <Label htmlFor="salesEngineer">Sales Engineer:</Label>
              <Input 
                id="salesEngineer"
                value={formData.salesEngineer} 
                onChange={(e) => handleFormChange("salesEngineer", e.target.value)}
                placeholder="Enter SE name"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="kvgSme">KVG SME:</Label>
              <Input 
                id="kvgSme"
                value={formData.kvgSme} 
                onChange={(e) => handleFormChange("kvgSme", e.target.value)}
                placeholder="Enter KVG SME name"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="opportunityStage">Opportunity Stage:</Label>
              <Select 
                value={formData.opportunityStage} 
                onValueChange={(value) => handleFormChange("opportunityStage", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identify">Identify</SelectItem>
                  <SelectItem value="Qualify">Qualify</SelectItem>
                  <SelectItem value="Expect">Expect</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Design Complete">Design Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
                
        {/* SOW Details Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center gap-2">
            <span className="p-1 bg-purple-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </span>
            SOW Outline
          </h3>
                  
          {/* Incident Types - Criminal Activity Group */}
          <div className="bg-white/80 p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-md font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Z" />
              </svg>
              Criminal Activity
            </h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.obviousCriminalAct}
                  onPressedChange={(value) => handleFormChange("obviousCriminalAct", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.obviousCriminalAct ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Obvious Criminal Act</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.activeBreakIn}
                  onPressedChange={(value) => handleFormChange("activeBreakIn", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.activeBreakIn ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Active Break-in</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.destructionOfProperty}
                  onPressedChange={(value) => handleFormChange("destructionOfProperty", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.destructionOfProperty ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Destruction of Property</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carDrivingThroughGate}
                  onPressedChange={(value) => handleFormChange("carDrivingThroughGate", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carDrivingThroughGate ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Car Driving Through Gate</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carBurglaries}
                  onPressedChange={(value) => handleFormChange("carBurglaries", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carBurglaries ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Car Burglaries</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.trespassing}
                  onPressedChange={(value) => handleFormChange("trespassing", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.trespassing ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Trespassing</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carsBrokenIntoAfterFact}
                  onPressedChange={(value) => handleFormChange("carsBrokenIntoAfterFact", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carsBrokenIntoAfterFact ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Cars Broken Into (After Fact)</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.brokenGlassWindows}
                  onPressedChange={(value) => handleFormChange("brokenGlassWindows", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.brokenGlassWindows ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Broken Glass/Windows</span>
              </div>
            </div>
                    
            {/* Suspicious Activity Group */}
            <h4 className="text-md font-semibold mb-4 mt-6 text-orange-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
              </svg>
              Suspicious Activity
            </h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.suspiciousActivity}
                  onPressedChange={(value) => handleFormChange("suspiciousActivity", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.suspiciousActivity ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Suspicious Activity</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.intentToCommitCriminalAct}
                  onPressedChange={(value) => handleFormChange("intentToCommitCriminalAct", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.intentToCommitCriminalAct ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Intent to Commit Criminal Act</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.checkingMultipleCarDoors}
                  onPressedChange={(value) => handleFormChange("checkingMultipleCarDoors", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.checkingMultipleCarDoors ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Checking Multiple Car Doors</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.dumpsterDivingOrDumping}
                  onPressedChange={(value) => handleFormChange("dumpsterDivingOrDumping", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.dumpsterDivingOrDumping ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Dumpster Diving/Dumping</span>
              </div>
            </div>
                    
            {/* Other Incident Type Groups would go here */}
            
            {/* Custom Incident Types */}
            <div className="mt-6 pt-4 border-t border-blue-200">
              <h4 className="text-md font-semibold mb-4 text-blue-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Custom Incident Types
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 bg-white/50 p-2 rounded border border-gray-200">
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
      </div>
    </CardContent>
  </Card>
</TabsContent>        
        <TabsContent value="voc-protocol">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-orange-800">
                <span className="p-1.5 bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </span>
                VOC Protocol Configuration
              </CardTitle>
              <CardDescription className="text-base text-orange-700">
                Configure escalation processes, monitoring actions, and response plans for the Virtual Operations Center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Project Stage Ownership Section */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-lg shadow-sm border border-orange-100">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800 flex items-center gap-2">
                    <span className="p-1 bg-orange-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </span>
                    Project Stage Ownership
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="amName">AM Name:</Label>
                      <Input 
                        id="amName"
                        value={formData.amName || ""} 
                        onChange={(e) => handleFormChange("amName", e.target.value)}
                        placeholder="Enter Account Manager name"
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
                          <SelectItem value="Mid-Atlantic">Mid-Atlantic</SelectItem>
                          <SelectItem value="Southeast">Southeast</SelectItem>
                          <SelectItem value="Midwest">Midwest</SelectItem>
                          <SelectItem value="Southwest">Southwest</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vocScript">VOC Script:</Label>
                      <Select 
                        value={formData.vocScript || ""} 
                        onValueChange={(value) => handleFormChange("vocScript", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kvgSmeName">KVG SME Name:</Label>
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
                          <SelectItem value="David Johnson">David Johnson</SelectItem>
                          <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="projectId">Project ID:</Label>
                      <Input 
                        id="projectId"
                        value={formData.projectId || ""} 
                        onChange={(e) => handleFormChange("projectId", e.target.value)}
                        placeholder="Enter Project ID"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vocContactName">VOC Contact Name:</Label>
                      <Input 
                        id="vocContactName"
                        value={formData.vocContactName || ""} 
                        onChange={(e) => handleFormChange("vocContactName", e.target.value)}
                        placeholder="Enter VOC contact name"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
                
                {/* VOC Monitoring Action/Response Plan */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-lg shadow-sm border border-orange-100">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800 flex items-center gap-2">
                    <span className="p-1 bg-orange-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                    </span>
                    VOC Monitoring Action/Response Plan
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 bg-white/70 p-3 rounded border border-gray-200">
                    This section identifies incident types based on the customer's use cases. Typically, incident types should align with standard VOC response actions. Complete this based on incidents tied to specific cameras or patrol groups. Non-standard incidents require KVG SME and VOC leadership review.
                  </p>

                  {/* General Requirements Section */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <h4 className="font-semibold text-orange-700 mb-3">General Requirements</h4>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label htmlFor="typeOfInstallAccount">Type of Install Account:</Label>
                        <Select 
                          value={formData.typeOfInstallAccount || ""} 
                          onValueChange={(value) => handleFormChange("typeOfInstallAccount", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Existing">Existing</SelectItem>
                            <SelectItem value="Takeover">Takeover</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="eventVideoStreams">Event Video Streams:</Label>
                        <Input 
                          id="eventVideoStreams"
                          type="number"
                          value={formData.eventVideoTriggerStreams} 
                          onChange={(e) => handleFormChange("eventVideoTriggerStreams", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="virtualPatrolStreams">Virtual Patrol Streams:</Label>
                        <Input 
                          id="virtualPatrolStreams"
                          type="number"
                          value={formData.virtualPatrolStreams} 
                          onChange={(e) => handleFormChange("virtualPatrolStreams", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventActionClipStreams">Event Action Clip Streams:</Label>
                        <Input 
                          id="eventActionClipStreams"
                          type="number"
                          value={formData.eventActionClipStreams} 
                          onChange={(e) => handleFormChange("eventActionClipStreams", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventActionMultiViewStreams">Event Action - Multi-View:</Label>
                        <Input 
                          id="eventActionMultiViewStreams"
                          type="number"
                          value={formData.eventActionMultiViewStreams} 
                          onChange={(e) => handleFormChange("eventActionMultiViewStreams", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="healthStreams">Health Streams:</Label>
                        <Input 
                          id="healthStreams"
                          type="number"
                          value={formData.healthStreams} 
                          onChange={(e) => handleFormChange("healthStreams", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="audioTalkDownSpeakers">Audio Talk-Down Speakers:</Label>
                        <Input 
                          id="audioTalkDownSpeakers"
                          type="number"
                          value={formData.audioTalkDownSpeakers} 
                          onChange={(e) => handleFormChange("audioTalkDownSpeakers", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <Label htmlFor="totalEventsMaximum">Total Events - Maximum:</Label>
                        <Input 
                          id="totalEventsMaximum"
                          type="number"
                          value={formData.totalEventsPerMonth} 
                          onChange={(e) => handleFormChange("totalEventsPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalVirtualPatrolsPerMonth">Total Virtual Patrols/Mth:</Label>
                        <Input 
                          id="totalVirtualPatrolsPerMonth"
                          type="number"
                          value={formData.totalVirtualPatrolsPerMonth} 
                          onChange={(e) => handleFormChange("totalVirtualPatrolsPerMonth", parseInt(e.target.value) || 0)}
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
                        <Label htmlFor="totalHealthPatrolsPerMonth">Total Health Patrols/Mth:</Label>
                        <Input 
                          id="totalHealthPatrolsPerMonth"
                          type="number"
                          value={formData.totalHealthPatrolsPerMonth} 
                          onChange={(e) => handleFormChange("totalHealthPatrolsPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalEventActionMultiViewsPerMonth">Total Event Action Multi-Views/Mth:</Label>
                        <Input 
                          id="totalEventActionMultiViewsPerMonth"
                          type="number"
                          value={formData.totalEventActionMultiViewsPerMonth} 
                          onChange={(e) => handleFormChange("totalEventActionMultiViewsPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalEscalationsMaximum">Total Escalations - Maximum:</Label>
                        <Input 
                          id="totalEscalationsMaximum"
                          type="number"
                          value={formData.totalEscalationsMaximum} 
                          onChange={(e) => handleFormChange("totalEscalationsMaximum", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
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
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="gdodsDispatchesPerMonth">GDoDS - Dispatches/Mth:</Label>
                        <Input 
                          id="gdodsDispatchesPerMonth"
                          type="number"
                          value={formData.gdodsDispatchesPerMonth} 
                          onChange={(e) => handleFormChange("gdodsDispatchesPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sgppScheduledPatrolsPerMonth">SGPP - Scheduled Patrols/Mth:</Label>
                        <Input 
                          id="sgppScheduledPatrolsPerMonth"
                          type="number"
                          value={formData.sgppScheduledPatrolsPerMonth} 
                          onChange={(e) => handleFormChange("sgppScheduledPatrolsPerMonth", parseInt(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="onDemandGuardDispatchDetail">On Demand Guard Dispatches:</Label>
                        <Textarea 
                          id="onDemandGuardDispatchDetail"
                          value={formData.onDemandGuardDispatchDetail} 
                          onChange={(e) => handleFormChange("onDemandGuardDispatchDetail", e.target.value)}
                          placeholder="Fill in what the Guard needs to do on Dispatches, expand in the SOW if needed"
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
                        <Label htmlFor="sgppScheduledGuardPatrolsScheduleDetail">SGPP - Schedule Detail:</Label>
                        <Textarea 
                          id="sgppScheduledGuardPatrolsScheduleDetail"
                          value={formData.sgppScheduledGuardPatrolsScheduleDetail} 
                          onChange={(e) => handleFormChange("sgppScheduledGuardPatrolsScheduleDetail", e.target.value)}
                          placeholder="Fill in schedule details for days, hours, frequency of patrols, expand in SOW if needed"
                          className="bg-white min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Escalation Process 1 */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mt-6">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <span className="p-1 bg-orange-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs shadow-sm">1</span>
                      Escalation Process 1
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess1IncidentType">Incident Type:</Label>
                        <Select 
                          value={formData.escalationProcess1 || ""} 
                          onValueChange={(value) => handleFormChange("escalationProcess1", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Criminal Activity">Criminal Activity</SelectItem>
                            <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                            <SelectItem value="Loitering">Loitering</SelectItem>
                            <SelectItem value="Nuisance Activity">Nuisance Activity</SelectItem>
                            <SelectItem value="Emergency/Medical">Emergency/Medical</SelectItem>
                            <SelectItem value="Restricted Access">Restricted Access</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess1Events">Events:</Label>
                        <Select
                          value={formData.escalationProcess1Events || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1Events", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Criminal Only">Criminal Only</SelectItem>
                            <SelectItem value="Suspicious Only">Suspicious Only</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess1DaysOfWeek">Days of Week:</Label>
                        <Input 
                          id="escalationProcess1DaysOfWeek"
                          value={formData.escalationProcess1DaysOfWeek || ""} 
                          onChange={(e) => handleFormChange("escalationProcess1DaysOfWeek", e.target.value)}
                          placeholder="Fill in days or reference Use Case Design and SOW"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess1StartTime">Monitoring Start Time:</Label>
                        <Input 
                          id="escalationProcess1StartTime"
                          value={formData.escalationProcess1StartTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess1StartTime", e.target.value)}
                          placeholder="Start time"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess1EndTime">Monitoring End Time:</Label>
                        <Input 
                          id="escalationProcess1EndTime"
                          value={formData.escalationProcess1EndTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess1EndTime", e.target.value)}
                          placeholder="End time"
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess1Cameras">Camera(s):</Label>
                      <Input 
                        id="escalationProcess1Cameras"
                        value={formData.escalationProcess1Cameras || ""} 
                        onChange={(e) => handleFormChange("escalationProcess1Cameras", e.target.value)}
                        placeholder="List cameras for this escalation process"
                        className="bg-white"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess1SceneObservation">VOC Scene Observation:</Label>
                      <Textarea 
                        id="escalationProcess1SceneObservation"
                        value={formData.escalationProcess1SceneObservation || ""} 
                        onChange={(e) => handleFormChange("escalationProcess1SceneObservation", e.target.value)}
                        placeholder="Fill in detailed observation requirements for VOC"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess1Process">Escalation Process:</Label>
                      <Textarea 
                        id="escalationProcess1Process"
                        value={formData.escalationProcess1Process || ""} 
                        onChange={(e) => handleFormChange("escalationProcess1Process", e.target.value)}
                        placeholder="Fill in with what is required by the VOC for action to be taken"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="mb-1 block">Use Talk-Down:</Label>
                        <Select
                          value={formData.escalationProcess1UseTalkDown || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1UseTalkDown", value)}
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
                        <Label className="mb-1 block">Contact Site Personnel:</Label>
                        <Select
                          value={formData.escalationProcess1ContactSitePersonnel || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1ContactSitePersonnel", value)}
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
                        <Label className="mb-1 block">Contact Police/Fire:</Label>
                        <Select
                          value={formData.escalationProcess1ContactPolice || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1ContactPolice", value)}
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
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="mb-1 block">Escalate to Branch/Region:</Label>
                        <Select
                          value={formData.escalationProcess1EscalateToBranch || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1EscalateToBranch", value)}
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
                        <Label className="mb-1 block">Create Security Report:</Label>
                        <Select
                          value={formData.escalationProcess1CreateSecurityReport || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1CreateSecurityReport", value)}
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
                        <Label className="mb-1 block">RSPNDR GDoDS Dispatch:</Label>
                        <Select
                          value={formData.escalationProcess1RspndrDispatch || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1RspndrDispatch", value)}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="escalationProcess1AudioResponse">Audio Response:</Label>
                        <Select
                          value={formData.escalationProcess1AudioResponse || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess1AudioResponse", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess1AudioMessage">Audio Message:</Label>
                        <Textarea 
                          id="escalationProcess1AudioMessage"
                          value={formData.escalationProcess1AudioMessage || ""} 
                          onChange={(e) => handleFormChange("escalationProcess1AudioMessage", e.target.value)}
                          placeholder="Enter Talk-down message(s)"
                          className="bg-white min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Escalation Process 2 */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mt-6">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <span className="p-1 bg-orange-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs shadow-sm">2</span>
                      Escalation Process 2
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess2IncidentType">Incident Type:</Label>
                        <Select 
                          value={formData.escalationProcess2 || ""} 
                          onValueChange={(value) => handleFormChange("escalationProcess2", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Criminal Activity">Criminal Activity</SelectItem>
                            <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                            <SelectItem value="Loitering">Loitering</SelectItem>
                            <SelectItem value="Nuisance Activity">Nuisance Activity</SelectItem>
                            <SelectItem value="Emergency/Medical">Emergency/Medical</SelectItem>
                            <SelectItem value="Restricted Access">Restricted Access</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess2Events">Events:</Label>
                        <Select
                          value={formData.escalationProcess2Events || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess2Events", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Criminal Only">Criminal Only</SelectItem>
                            <SelectItem value="Suspicious Only">Suspicious Only</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess2DaysOfWeek">Days of Week:</Label>
                        <Input 
                          id="escalationProcess2DaysOfWeek"
                          value={formData.escalationProcess2DaysOfWeek || ""} 
                          onChange={(e) => handleFormChange("escalationProcess2DaysOfWeek", e.target.value)}
                          placeholder="Fill in days or reference Use Case Design and SOW"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess2StartTime">Monitoring Start Time:</Label>
                        <Input 
                          id="escalationProcess2StartTime"
                          value={formData.escalationProcess2StartTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess2StartTime", e.target.value)}
                          placeholder="Start time"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess2EndTime">Monitoring End Time:</Label>
                        <Input 
                          id="escalationProcess2EndTime"
                          value={formData.escalationProcess2EndTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess2EndTime", e.target.value)}
                          placeholder="End time"
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess2SceneObservation">Incident Type Description:</Label>
                      <Textarea 
                        id="escalationProcess2SceneObservation"
                        value={formData.escalationProcess2SceneObservation || ""} 
                        onChange={(e) => handleFormChange("escalationProcess2SceneObservation", e.target.value)}
                        placeholder="Fill in with what incident types the VOC would observe for this escalation process"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess2Process">Escalation Process:</Label>
                      <Textarea 
                        id="escalationProcess2Process"
                        value={formData.escalationProcess2Process || ""} 
                        onChange={(e) => handleFormChange("escalationProcess2Process", e.target.value)}
                        placeholder="Fill in with what is required by the VOC for action to be taken"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="escalationProcess2AudioResponse">Audio Response:</Label>
                        <Select
                          value={formData.escalationProcess2AudioResponse || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess2AudioResponse", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess2AudioMessage">Audio Message:</Label>
                        <Textarea 
                          id="escalationProcess2AudioMessage"
                          value={formData.escalationProcess2AudioMessage || ""} 
                          onChange={(e) => handleFormChange("escalationProcess2AudioMessage", e.target.value)}
                          placeholder="Fill in Talk-down message(s)"
                          className="bg-white min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Escalation Process 3 */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mt-6">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <span className="p-1 bg-orange-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs shadow-sm">3</span>
                      Escalation Process 3
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess3IncidentType">Incident Type:</Label>
                        <Select 
                          value={formData.escalationProcess3 || ""} 
                          onValueChange={(value) => handleFormChange("escalationProcess3", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Criminal Activity">Criminal Activity</SelectItem>
                            <SelectItem value="Suspicious Activity">Suspicious Activity</SelectItem>
                            <SelectItem value="Loitering">Loitering</SelectItem>
                            <SelectItem value="Nuisance Activity">Nuisance Activity</SelectItem>
                            <SelectItem value="Emergency/Medical">Emergency/Medical</SelectItem>
                            <SelectItem value="Restricted Access">Restricted Access</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess3Events">Events:</Label>
                        <Select
                          value={formData.escalationProcess3Events || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess3Events", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Criminal Only">Criminal Only</SelectItem>
                            <SelectItem value="Suspicious Only">Suspicious Only</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="escalationProcess3DaysOfWeek">Days of Week:</Label>
                        <Input 
                          id="escalationProcess3DaysOfWeek"
                          value={formData.escalationProcess3DaysOfWeek || ""} 
                          onChange={(e) => handleFormChange("escalationProcess3DaysOfWeek", e.target.value)}
                          placeholder="Fill in days or reference Use Case Design and SOW"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess3StartTime">Monitoring Start Time:</Label>
                        <Input 
                          id="escalationProcess3StartTime"
                          value={formData.escalationProcess3StartTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess3StartTime", e.target.value)}
                          placeholder="Start time"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess3EndTime">Monitoring End Time:</Label>
                        <Input 
                          id="escalationProcess3EndTime"
                          value={formData.escalationProcess3EndTime || ""} 
                          onChange={(e) => handleFormChange("escalationProcess3EndTime", e.target.value)}
                          placeholder="End time"
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess3SceneObservation">Incident Type Description:</Label>
                      <Textarea 
                        id="escalationProcess3SceneObservation"
                        value={formData.escalationProcess3SceneObservation || ""} 
                        onChange={(e) => handleFormChange("escalationProcess3SceneObservation", e.target.value)}
                        placeholder="Fill in with what incident types the VOC would observe for this escalation process"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="escalationProcess3Process">Escalation Process:</Label>
                      <Textarea 
                        id="escalationProcess3Process"
                        value={formData.escalationProcess3Process || ""} 
                        onChange={(e) => handleFormChange("escalationProcess3Process", e.target.value)}
                        placeholder="Fill in with what is required by the VOC for action to be taken"
                        className="bg-white min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="escalationProcess3AudioResponse">Audio Response:</Label>
                        <Select
                          value={formData.escalationProcess3AudioResponse || ""}
                          onValueChange={(value) => handleFormChange("escalationProcess3AudioResponse", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="escalationProcess3AudioMessage">Audio Message:</Label>
                        <Textarea 
                          id="escalationProcess3AudioMessage"
                          value={formData.escalationProcess3AudioMessage || ""} 
                          onChange={(e) => handleFormChange("escalationProcess3AudioMessage", e.target.value)}
                          placeholder="Fill in Talk-down message(s)"
                          className="bg-white min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployment">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-indigo-800">
                <span className="p-1.5 bg-indigo-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                  5
                </span>
                KVG Pre-Deployment Prep
              </CardTitle>
              <CardDescription className="text-base text-indigo-700">
                Configure deployment settings, installation requirements, and gateway credentials for your Kastle Video Guarding project
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {/* Opportunity Info Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-indigo-800 border-b border-indigo-100 pb-2 mb-4">
                  Opportunity Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="opportunityNumber" className="text-indigo-700">Opportunity Number:</Label>
                    <Input 
                      id="opportunityNumber" 
                      value={formData.opportunityNumber}
                      onChange={(e) => handleFormChange("opportunityNumber", e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="Enter opportunity number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectManager" className="text-indigo-700">Project Manager:</Label>
                    <Input 
                      id="projectManager" 
                      value={formData.projectManager}
                      onChange={(e) => handleFormChange("projectManager", e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="Enter project manager name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deploymentDate" className="text-indigo-700">Deployment Date:</Label>
                    <Input 
                      id="deploymentDate" 
                      value={formData.deploymentDate}
                      onChange={(e) => handleFormChange("deploymentDate", e.target.value)}
                      className="mt-1 bg-white"
                      type="date"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contacts Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-indigo-800 border-b border-indigo-100 pb-2 mb-4">
                  Contacts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="pmName" className="text-indigo-700">Project Manager:</Label>
                    <Input 
                      id="pmName" 
                      value={formData.pmName}
                      onChange={(e) => handleFormChange("pmName", e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="Enter PM name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteSupervisor" className="text-indigo-700">Site Supervisor:</Label>
                    <Input 
                      id="siteSupervisor" 
                      value={formData.siteSupervisor}
                      onChange={(e) => handleFormChange("siteSupervisor", e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="Enter site supervisor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="technician" className="text-indigo-700">Technician:</Label>
                    <Input 
                      id="technician" 
                      value={formData.technician}
                      onChange={(e) => handleFormChange("technician", e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="Enter technician name"
                    />
                  </div>
                </div>
              </div>
              
              {/* Project Scope Description Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-indigo-800 border-b border-indigo-100 pb-2 mb-4">
                  Project Scope Description
                </h3>
                <div>
                  <Label htmlFor="projectScopeDescription" className="text-indigo-700">Description:</Label>
                  <Textarea 
                    id="projectScopeDescription"
                    value={formData.projectScopeDescription}
                    onChange={(e) => handleFormChange("projectScopeDescription", e.target.value)}
                    className="mt-1 bg-white h-32"
                    placeholder="Enter detailed project scope description"
                  />
                </div>
              </div>
              
              {/* Project Deployment/Installation Requirements Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-indigo-800 border-b border-indigo-100 pb-2 mb-4">
                  Project Deployment/Installation Requirements (Configuration Details Required)
                </h3>
                <div className="mb-5">
                  <Label htmlFor="deploymentRequirements" className="text-indigo-700">Deployment Requirements:</Label>
                  <Textarea 
                    id="deploymentRequirements"
                    value={formData.deploymentRequirements}
                    onChange={(e) => handleFormChange("deploymentRequirements", e.target.value)}
                    className="mt-1 bg-white h-24"
                    placeholder="Enter deployment requirements and configuration details"
                  />
                </div>
                <div>
                  <Label htmlFor="installationRequirements" className="text-indigo-700">Installation Requirements:</Label>
                  <Textarea 
                    id="installationRequirements"
                    value={formData.installationRequirements}
                    onChange={(e) => handleFormChange("installationRequirements", e.target.value)}
                    className="mt-1 bg-white h-24"
                    placeholder="Enter installation requirements"
                  />
                </div>
              </div>
              
              {/* Parts or Fill in Pan List of Parts, IP addresses and Credentials */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold bg-black text-white px-4 py-2 mb-4">
                  Parts or Fill in Pan List of Parts, IP addresses and Credentials
                </h3>
                <div>
                  <Textarea 
                    id="partsListCredentials"
                    value={formData.partsListCredentials}
                    onChange={(e) => handleFormChange("partsListCredentials", e.target.value)}
                    className="bg-white h-40"
                    placeholder="Enter list of parts, IP addresses, and credentials"
                  />
                </div>
              </div>
              
              {/* Gateway & Video Stream Configuration */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-indigo-800 border-b border-indigo-100 pb-2 mb-4">
                  Gateway & Video Stream Configuration
                </h3>
                
                {/* Gateway Credentials */}
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-indigo-800 mb-3">Gateway Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gatewayIpAddress" className="text-indigo-700">IP Address:</Label>
                      <Input 
                        id="gatewayIpAddress" 
                        value={formData.gatewayIpAddress}
                        onChange={(e) => handleFormChange("gatewayIpAddress", e.target.value)}
                        className="mt-1 bg-white"
                        placeholder="Enter gateway IP address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gatewayPort" className="text-indigo-700">Port:</Label>
                      <Input 
                        id="gatewayPort" 
                        value={formData.gatewayPort}
                        onChange={(e) => handleFormChange("gatewayPort", e.target.value)}
                        className="mt-1 bg-white"
                        placeholder="Enter gateway port"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gatewayUsername" className="text-indigo-700">Username:</Label>
                      <Input 
                        id="gatewayUsername" 
                        value={formData.gatewayUsername}
                        onChange={(e) => handleFormChange("gatewayUsername", e.target.value)}
                        className="mt-1 bg-white"
                        placeholder="Enter gateway username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gatewayPassword" className="text-indigo-700">Password:</Label>
                      <Input 
                        id="gatewayPassword" 
                        value={formData.gatewayPassword}
                        onChange={(e) => handleFormChange("gatewayPassword", e.target.value)}
                        className="mt-1 bg-white"
                        type="password"
                        placeholder="Enter gateway password"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Stream Configuration */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Stream Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="streamNamesIds" className="text-blue-700">Stream Names/IDs:</Label>
                      <Textarea 
                        id="streamNamesIds"
                        value={formData.streamNamesIds}
                        onChange={(e) => handleFormChange("streamNamesIds", e.target.value)}
                        className="mt-1 bg-white h-24"
                        placeholder="Enter stream names and IDs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="streamHealthVerification" className="text-blue-700">Stream Health Verification:</Label>
                      <Select
                        value={formData.streamHealthVerification}
                        onValueChange={(value) => handleFormChange("streamHealthVerification", value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Partially Verified">Partially Verified</SelectItem>
                          <SelectItem value="Not Verified">Not Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="speakerVerification" className="text-blue-700">Speaker Verification:</Label>
                      <Select
                        value={formData.speakerVerification}
                        onValueChange={(value) => handleFormChange("speakerVerification", value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Working">Working</SelectItem>
                          <SelectItem value="Not Working">Not Working</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={handleSave}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
                >
                  <Save size={18} /> Save Deployment Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card className="border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">KVG Pricing Calculator</h3>
                <Badge variant="outline" className="text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <span className="mr-1">✨</span> Automated Pricing
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Type */}
                <div>
                  <h4 className="text-md font-medium mb-4 flex items-center text-gray-700">
                    <span className="mr-2">👤</span> Customer Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="customer_type" className="text-sm">Customer Type</Label>
                      <select
                        id="customer_type"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.customerType || "new"}
                        onChange={(e) => handleFormChange("customerType", e.target.value)}
                      >
                        <option value="new">New Construction</option>
                        <option value="existing">Existing Customer</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {formData.customerType === "existing" ? 
                          "Minimum fee of $200 applies for existing customers" : 
                          "Minimum fee of $250 applies for new construction"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional Services */}
                  <h4 className="text-md font-medium mt-6 mb-4 flex items-center text-gray-700">
                    <span className="mr-2">🔖</span> Additional Services
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voc_escalations" className="text-sm flex items-center">
                        <span className="mr-1">📞</span> VOC Escalations
                      </Label>
                      <Input
                        id="voc_escalations"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.vocEscalations}
                        onChange={(e) => handleFormChange("vocEscalations", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">$10 per escalation</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dispatch_responses" className="text-sm flex items-center">
                        <span className="mr-1">🚨</span> Dispatch Responses
                      </Label>
                      <Input
                        id="dispatch_responses"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.dispatchResponses}
                        onChange={(e) => handleFormChange("dispatchResponses", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">No additional cost</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gdods_patrols" className="text-sm flex items-center">
                        <span className="mr-1">🚶</span> GDODs Patrols
                      </Label>
                      <Input
                        id="gdods_patrols"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.gdodsPatrols}
                        onChange={(e) => handleFormChange("gdodsPatrols", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">$425 per patrol</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sgpp_patrols" className="text-sm flex items-center">
                        <span className="mr-1">🔍</span> SGPP Patrols
                      </Label>
                      <Input
                        id="sgpp_patrols"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.sgppPatrols}
                        onChange={(e) => handleFormChange("sgppPatrols", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">$60 per patrol</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forensic_investigations" className="text-sm flex items-center">
                        <span className="mr-1">🔎</span> Forensic Investigations
                      </Label>
                      <Input
                        id="forensic_investigations"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.forensicInvestigations}
                        onChange={(e) => handleFormChange("forensicInvestigations", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">$60 per investigation</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app_users" className="text-sm flex items-center">
                        <span className="mr-1">📱</span> App Users
                      </Label>
                      <Input
                        id="app_users"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.appUsers}
                        onChange={(e) => handleFormChange("appUsers", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">$5 per user</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio_devices" className="text-sm flex items-center">
                        <span className="mr-1">🔊</span> Audio Devices
                      </Label>
                      <Input
                        id="audio_devices"
                        type="number"
                        min="0"
                        className="w-full"
                        value={formData.audioDevices}
                        onChange={(e) => handleFormChange("audioDevices", parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">No additional cost</p>
                    </div>
                  </div>
                </div>
                
                {/* Stream Information */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium flex items-center text-gray-700">
                      <span className="mr-2">📹</span> Stream Details
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddStream}
                      className="flex items-center"
                    >
                      <span className="mr-1">➕</span> Add Stream
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.streams.map((stream, index) => (
                      <div key={index} className="p-4 border rounded-md relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveStream(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <h5 className="font-medium mb-4">Stream {index + 1}</h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`stream_quantity_${index}`} className="text-sm">Number of Cameras</Label>
                            <Input
                              id={`stream_quantity_${index}`}
                              type="number"
                              min="1"
                              className="w-full"
                              value={stream.quantity}
                              onChange={(e) => handleStreamChange(index, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`stream_event_volume_${index}`} className="text-sm">Monthly Event Volume</Label>
                            <Input
                              id={`stream_event_volume_${index}`}
                              type="number"
                              min="0"
                              className="w-full"
                              value={stream.eventVolume}
                              onChange={(e) => handleStreamChange(index, "eventVolume", parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`stream_patrols_${index}`} className="text-sm">Patrols Per Week</Label>
                            <Input
                              id={`stream_patrols_${index}`}
                              type="number"
                              min="0"
                              className="w-full"
                              value={stream.patrolsPerWeek}
                              onChange={(e) => handleStreamChange(index, "patrolsPerWeek", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Pricing Calculation Results */}
              <div className="mt-10">
                <div className="rounded-md overflow-hidden border">
                  <div className="bg-gray-100 p-4 border-b">
                    <h4 className="text-lg font-medium">Pricing Summary</h4>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col space-y-1 items-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <span className="text-blue-500 mb-1">💰</span>
                        <span className="text-2xl font-bold">${pricingResults.totalFee.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">Monthly Fee</span>
                      </div>
                      <div className="flex flex-col space-y-1 items-center p-4 rounded-lg bg-green-50 border border-green-100">
                        <span className="text-green-500 mb-1">📊</span>
                        <span className="text-2xl font-bold">{pricingResults.totalEvents}</span>
                        <span className="text-sm text-gray-600">Total Events</span>
                      </div>
                      <div className="flex flex-col space-y-1 items-center p-4 rounded-lg bg-purple-50 border border-purple-100">
                        <span className="text-purple-500 mb-1">🚶</span>
                        <span className="text-2xl font-bold">{pricingResults.patrolsPerMonth}</span>
                        <span className="text-sm text-gray-600">Monthly Patrols</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-medium">Fee Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span>Events Fee (Tier: {pricingResults.eventTier})</span>
                          <span className="font-medium">${pricingResults.eventFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Patrol Fee ({pricingResults.patrolHours.toFixed(1)} hours @ $85/hr)</span>
                          <span className="font-medium">${pricingResults.patrolFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Additional Services</span>
                          <span className="font-medium">${pricingResults.additionalFees.toFixed(2)}</span>
                        </div>
                        {pricingResults.minimumFeeApplied && (
                          <div className="flex justify-between py-2 border-b text-amber-600">
                            <span>Minimum Fee Applied</span>
                            <span className="font-medium">${pricingResults.minimumFee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {pricingResults.approvalNeeded && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-amber-700">Approval Required</h5>
                            <p className="text-sm text-amber-600">
                              This quote is below the $200 minimum for existing customers and requires management approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
