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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { 
  Plus, 
  Trash2, 
  Copy,
  Calculator,
  Camera,
  ImageIcon,
  Globe,
  Languages,
  Activity,
  Lightbulb as LightbulbIcon,
  ScanFace
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import type { Stream, StreamImage } from "../types";
import StreamImagesModal from "../components/modals/StreamImagesModal";
import { Badge } from "@/components/ui/badge";

interface FormData {
  // Discovery tab fields - General Information
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
  technology: string;
  numSites: number;
  servicesRecommended: string;
  monitoringType: string;
  
  // Discovery tab fields - Use Case Problem
  useCaseProblem: string;
  suggestedIncidentResponse: string;
  discoveryDetails: string;
  
  // Discovery tab fields - Patrol Schedule
  scheduleDetails: string;
  dayHoursDetails: string;
  siteActivityNotes: string;
  
  // Camera Video Stream Details
  cameraStream1Name: string;
  cameraStream1Location: string;
  cameraStream1Type: string;
  cameraStream1Accessibility: string;
  cameraStream1UseCaseProblem: string;
  cameraStream1Association: string;
  
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
  customIncidentType1: boolean;
  customIncidentType2: boolean;
  customIncidentType3: boolean;
  customIncidentType4: boolean;
  customIncidentType5: boolean;
  
  // Site Assessment tab fields - Lighting Assessment
  lightingRequirements: string;
  infraredCapability?: string;
  lightingNotes?: string;
  lightingAppropriate?: string;
  
  // Site Assessment tab fields - Camera Assessment
  cameraFieldOfView: string;
  cameraFovClear?: string;
  mountingLocations?: string;
  cameraAssessmentNotes?: string;
  
  // Site Assessment tab fields - System & Power Assessment
  headendEnvironment?: string;
  powerStable?: string;
  powerRequirements?: string;
  headendNotes?: string;
  
  // Site Assessment tab fields - Network Assessment
  networkConnectivity: string;
  siteSwitchPorts?: string;
  cloudUplinkCapacity?: string;
  networkCabling?: string;
  networkBandwidth?: string;
  wirelessAvailability?: string;
  networkUpgrade?: string;
  networkAssessmentNotes?: string;
  
  // Site Assessment tab fields - Audio Assessment
  speakerRequirements?: string;
  speakerCoverage?: string;
  audioEquipment?: string;
  audioCompatible?: string;
  audioAssessmentNotes?: string;
  
  // Site Assessment tab fields - Technology (Take-Over)
  cameraCompatibilityVerified?: string;
  cameraCompatibilityLink?: string;
  cameraCompatibilityNotes?: string;
  fisheyeCompatibility?: string;
  dewarpingAtEdge?: string;
  edgeStreamsSupport?: string;
  
  // Site Assessment tab fields - Site Plan Design
  sitePlanLink?: string;
  sitePlanNotes?: string;
  sitePhotoLink?: string;
  
  // Site Assessment tab fields - Equipment List
  equipmentListLink?: string;
  equipmentNotes?: string;
  equipmentBom?: string;
  
  // Use Case tab fields
  useCaseCommitment: string;
  
  // VOC Protocol tab fields
  amName: string;
  projectId: string;
  escalationProcess1: string;
  escalationProcess2: string;
  escalationProcess3: string;
  
  // Project Deployment tab fields
  pmName: string;
  gatewayCredentials: string;
  streamNames: string;
  speakersWork: string;
  
  // Additional Services section
  vocEscalations: number;
  dispatchResponses: number;
  gdodsPatrols: number;
  sgppPatrols: number;
  forensicInvestigations: number;
  appUsers: number;
  audioDevices: number;
}

const KastleVideoGuardingPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(null);
  const [originalSOW, setOriginalSOW] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  
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
    quoteDate: new Date().toISOString().split('T')[0],
    timeZone: "EST",
    opportunityStage: "Quote",
    opportunityType: "New",
    siteEnvironment: "Outdoor",
    technology: "Kastle Video Cloud",
    numSites: 1,
    servicesRecommended: "KVG",
    monitoringType: "24/7",
    
    // Discovery tab fields - Use Case Problem
    useCaseProblem: "",
    suggestedIncidentResponse: "",
    discoveryDetails: "",
    
    // Discovery tab fields - Patrol Schedule
    scheduleDetails: "",
    dayHoursDetails: "",
    siteActivityNotes: "",
    
    // Camera Video Stream Details
    cameraStream1Name: "",
    cameraStream1Location: "",
    cameraStream1Type: "",
    cameraStream1Accessibility: "",
    cameraStream1UseCaseProblem: "",
    cameraStream1Association: "",
    
    // Incident Types - All unchecked by default
    // Criminal Activity Group
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
    customIncidentType1: false,
    customIncidentType2: false,
    customIncidentType3: false,
    customIncidentType4: false,
    customIncidentType5: false,
    
    // Site Assessment tab fields
    lightingRequirements: "Adequate",
    cameraFieldOfView: "Clear",
    networkConnectivity: "",
    
    // Use Case tab fields
    useCaseCommitment: "",
    
    // VOC Protocol tab fields
    amName: "",
    projectId: "",
    escalationProcess1: "",
    escalationProcess2: "",
    escalationProcess3: "",
    
    // Project Deployment tab fields
    pmName: "",
    gatewayCredentials: "",
    streamNames: "",
    speakersWork: "N/A",
    
    // Additional Services section
    vocEscalations: 0,
    dispatchResponses: 0,
    gdodsPatrols: 0,
    sgppPatrols: 0,
    forensicInvestigations: 0,
    appUsers: 0,
    audioDevices: 0,
  });

  const [streams, setStreams] = useState<Stream[]>([]);
  const [nextStreamId, setNextStreamId] = useState(1);

  // Handler for form field changes
  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Function to add a new stream
  const addStream = (streamToClone?: Stream) => {
    const newStream = streamToClone 
      ? { ...streamToClone, id: nextStreamId }
      : {
          id: nextStreamId,
          quantity: 1,
          description: "",
          monitoredArea: "Pool",
          accessibility: "Secure",
          useCase: "",
          analyticRule1: "Person Detected",
          dwellTime1: 30,
          analyticRule2: "None",
          dwellTime2: 0,
          daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          schedule: "24/7",
          eventVolume: 100,
          patrolType: "Standard",
          patrolsPerWeek: 0,
          images: [],
        };

    setStreams([...streams, newStream]);
    setNextStreamId(nextStreamId + 1);
    
    toast({
      title: "Stream Added",
      description: streamToClone 
        ? "Stream duplicated successfully" 
        : "New stream added successfully",
    });
  };

  // Function to remove a stream
  const removeStream = (id: number) => {
    setStreams(streams.filter(stream => stream.id !== id));
    toast({
      title: "Stream Removed",
      description: "Stream removed successfully",
    });
  };

  // Function to update a stream
  const updateStream = (id: number, field: string, value: any) => {
    setStreams(
      streams.map(stream => 
        stream.id === id ? { ...stream, [field]: value } : stream
      )
    );
  };

  const calculatePrice = () => {
    // Placeholder for price calculation logic
    // In a real implementation, this would calculate based on the streams and other factors
    toast({
      title: "Price Calculation",
      description: "Price calculation feature coming soon!",
    });
  };
  
  // Language selection handler
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    
    // If switching back to English
    if (language === "en" && originalSOW) {
      handleFormChange("useCaseCommitment", originalSOW);
      setOriginalSOW(null);
      setTranslatedLanguage(null);
    }
  };
  
  // Get language label from code
  const getLanguageLabel = (code: string): string => {
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      zh: "Mandarin",
      hi: "Hindi",
      ar: "Arabic",
      ru: "Russian",
      pt: "Portuguese",
      ja: "Japanese"
    };
    
    return languages[code] || code;
  };
  
  // Function to translate SOW using Gemini API
  const translateSOW = async () => {
    const text = formData.useCaseCommitment.trim();
    
    if (!text) {
      toast({
        title: "Empty Content",
        description: "Please enter content in the Scope of Work field before translating.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedLanguage === 'en') {
      toast({
        title: "No Translation Needed",
        description: "The current language is already English."
      });
      return;
    }
    
    setIsTranslating(true);
    setTranslationError(null);
    
    try {
      // Save original English text if not already saved
      if (!originalSOW) {
        setOriginalSOW(text);
      }
      
      // Create the request body for Gemini API
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Translate the following Scope of Work document from English to ${getLanguageLabel(selectedLanguage)}. 
                Maintain professional language and business terminology. Keep the format intact:
                
                ${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      };

      // Make API request to backend proxy
      const response = await fetch('/api/gemini-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          targetLanguage: selectedLanguage,
          sourceLanguage: 'en'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update the form with translated text
      handleFormChange("useCaseCommitment", data.translatedText);
      setTranslatedLanguage(selectedLanguage);
      
      toast({
        title: "Translation Complete",
        description: `Successfully translated to ${getLanguageLabel(selectedLanguage)}`
      });
    } catch (error) {
      console.error("Translation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during translation";
      setTranslationError(errorMessage);
      toast({
        title: "Translation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">KVG Pricing App</h1>

      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="discovery" className="bg-green-600 data-[state=active]:bg-green-700 text-white">
            1. Discovery - BDM
          </TabsTrigger>
          <TabsTrigger value="site-assessment" className="bg-blue-600 data-[state=active]:bg-blue-700 text-white">
            2. Site Assessment - SE
          </TabsTrigger>
          <TabsTrigger value="use-case" className="bg-purple-600 data-[state=active]:bg-purple-700 text-white">
            3. Use Case - SOW - SME
          </TabsTrigger>
          <TabsTrigger value="voc-protocol" className="bg-orange-600 data-[state=active]:bg-orange-700 text-white">
            4. VOC Protocol - AM
          </TabsTrigger>
          <TabsTrigger value="deployment" className="bg-indigo-600 data-[state=active]:bg-indigo-700 text-white">
            5. Project Deployment - PM
          </TabsTrigger>
          <TabsTrigger value="stream-details" className="bg-teal-600 data-[state=active]:bg-teal-700 text-white">
            Stream Details
          </TabsTrigger>
          <TabsTrigger value="pricing" className="bg-pink-600 data-[state=active]:bg-pink-700 text-white">
            Pricing
          </TabsTrigger>
        </TabsList>

        {/* Discovery Tab Content */}
        <TabsContent value="discovery">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
              <CardDescription>Enter the basic information about this opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span> General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bdmOwner">BDM Name</Label>
                      <Input 
                        id="bdmOwner"
                        value={formData.bdmOwner}
                        onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salesEngineer">Sales Engineer</Label>
                      <Input 
                        id="salesEngineer"
                        value={formData.salesEngineer}
                        onChange={(e) => handleFormChange("salesEngineer", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kvgSme">KVG SME</Label>
                      <Input 
                        id="kvgSme"
                        value={formData.kvgSme}
                        onChange={(e) => handleFormChange("kvgSme", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input 
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleFormChange("customerName", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="crmOpportunity">CRM Opportunity #</Label>
                      <Input 
                        id="crmOpportunity"
                        value={formData.crmOpportunity}
                        onChange={(e) => handleFormChange("crmOpportunity", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quoteDate">Quote Date</Label>
                      <Input 
                        id="quoteDate"
                        type="date"
                        value={formData.quoteDate}
                        onChange={(e) => handleFormChange("quoteDate", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select 
                        value={formData.timeZone}
                        onValueChange={(value) => handleFormChange("timeZone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EST">Eastern</SelectItem>
                          <SelectItem value="CST">Central</SelectItem>
                          <SelectItem value="MST">Mountain</SelectItem>
                          <SelectItem value="PST">Pacific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="opportunityStage">Opportunity Stage</Label>
                      <Select 
                        value={formData.opportunityStage}
                        onValueChange={(value) => handleFormChange("opportunityStage", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quote">Quote</SelectItem>
                          <SelectItem value="Proposal">Proposal</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🏢</span> Site Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteAddress">Site Address</Label>
                      <Input 
                        id="siteAddress"
                        value={formData.siteAddress}
                        onChange={(e) => handleFormChange("siteAddress", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleFormChange("city", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleFormChange("state", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input 
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleFormChange("zipCode", e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numSites">Number of Sites</Label>
                      <Input 
                        id="numSites"
                        type="number"
                        min="1"
                        value={formData.numSites}
                        onChange={(e) => handleFormChange("numSites", parseInt(e.target.value))}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteEnvironment">Site Environment</Label>
                      <Select 
                        value={formData.siteEnvironment}
                        onValueChange={(value) => handleFormChange("siteEnvironment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Outdoor">Outdoor</SelectItem>
                          <SelectItem value="Indoor">Indoor</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="technology">Technology</Label>
                  <Select 
                    value={formData.technology}
                    onValueChange={(value) => handleFormChange("technology", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kastle Video Cloud">Kastle Video Cloud</SelectItem>
                      <SelectItem value="On-Premise Server">On-Premise Server</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicesRecommended">Services Recommended</Label>
                  <Select 
                    value={formData.servicesRecommended}
                    onValueChange={(value) => handleFormChange("servicesRecommended", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KVG">KVG</SelectItem>
                      <SelectItem value="KVG+Patrols">KVG + Patrols</SelectItem>
                      <SelectItem value="KVG+Forensic">KVG + Forensic</SelectItem>
                      <SelectItem value="Complete">Complete Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monitoringType">Monitoring Type</Label>
                  <Select 
                    value={formData.monitoringType}
                    onValueChange={(value) => handleFormChange("monitoringType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24/7">24/7</SelectItem>
                      <SelectItem value="After Hours">After Hours</SelectItem>
                      <SelectItem value="Custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="useCaseProblem">Use Case Problem</Label>
                  <Textarea 
                    id="useCaseProblem"
                    value={formData.useCaseProblem}
                    onChange={(e) => handleFormChange("useCaseProblem", e.target.value)}
                    placeholder="Describe the specific use case problem the customer is having"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="suggestedIncidentResponse">Suggested Incident Response</Label>
                  <Textarea 
                    id="suggestedIncidentResponse"
                    value={formData.suggestedIncidentResponse}
                    onChange={(e) => handleFormChange("suggestedIncidentResponse", e.target.value)}
                    placeholder="Describe how KVG should respond to incidents at this property"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discoveryDetails">Discovery Details</Label>
                  <Textarea 
                    id="discoveryDetails"
                    value={formData.discoveryDetails}
                    onChange={(e) => handleFormChange("discoveryDetails", e.target.value)}
                    placeholder="Enter any additional discovery details"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>📅</span> Schedule & Patrol Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDetails">Schedule Details</Label>
                    <Textarea 
                      id="scheduleDetails"
                      value={formData.scheduleDetails}
                      onChange={(e) => handleFormChange("scheduleDetails", e.target.value)}
                      placeholder="Enter patrol schedule details"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dayHoursDetails">Day/Hours Details</Label>
                    <Textarea 
                      id="dayHoursDetails"
                      value={formData.dayHoursDetails}
                      onChange={(e) => handleFormChange("dayHoursDetails", e.target.value)}
                      placeholder="Specify days and hours of patrols"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="siteActivityNotes">Site Activity Notes</Label>
                    <Textarea 
                      id="siteActivityNotes"
                      value={formData.siteActivityNotes}
                      onChange={(e) => handleFormChange("siteActivityNotes", e.target.value)}
                      placeholder="Enter notes about site activity patterns and monitoring needs"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Incident Types</CardTitle>
              <CardDescription>Select which incident types will be monitored at this site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-800 flex items-center gap-2">
                      <span>🚨</span> Criminal Activity
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.obviousCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("obviousCriminalAct", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🔪 Obvious Criminal Act</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.activeBreakIn}
                        onPressedChange={(pressed) => handleFormChange("activeBreakIn", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🔓 Active Break-in</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.destructionOfProperty}
                        onPressedChange={(pressed) => handleFormChange("destructionOfProperty", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🔨 Destruction of Property</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carDrivingThroughGate}
                        onPressedChange={(pressed) => handleFormChange("carDrivingThroughGate", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🚗 Car Driving Through Gate</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carBurglaries}
                        onPressedChange={(pressed) => handleFormChange("carBurglaries", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🚙 Car Burglaries</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.trespassing}
                        onPressedChange={(pressed) => handleFormChange("trespassing", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🚷 Trespassing</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carsBrokenIntoAfterFact}
                        onPressedChange={(pressed) => handleFormChange("carsBrokenIntoAfterFact", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">🔎 Cars Broken Into After Fact</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.brokenGlassWindows}
                        onPressedChange={(pressed) => handleFormChange("brokenGlassWindows", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-50"
                      >
                        <span className="flex items-center gap-2">💔 Broken Glass/Windows</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-800 flex items-center gap-2">
                      <span>👁️</span> Suspicious Activity
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.suspiciousActivity}
                        onPressedChange={(pressed) => handleFormChange("suspiciousActivity", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-50"
                      >
                        <span className="flex items-center gap-2">🕵️ Suspicious Activity</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.intentToCommitCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("intentToCommitCriminalAct", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-50"
                      >
                        <span className="flex items-center gap-2">🤔 Intent to Commit Criminal Act</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.checkingMultipleCarDoors}
                        onPressedChange={(pressed) => handleFormChange("checkingMultipleCarDoors", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-50"
                      >
                        <span className="flex items-center gap-2">🚪 Checking Multiple Car Doors</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.dumpsterDivingOrDumping}
                        onPressedChange={(pressed) => handleFormChange("dumpsterDivingOrDumping", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-50"
                      >
                        <span className="flex items-center gap-2">🗑️ Dumpster Diving/Dumping</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-yellow-800 flex items-center gap-2">
                      <span>⚠️</span> Nuisance Activity
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.urinationOrOtherBodilyFunctions}
                        onPressedChange={(pressed) => handleFormChange("urinationOrOtherBodilyFunctions", pressed)}
                        className="w-full justify-start data-[state=on]:bg-yellow-50"
                      >
                        <span className="flex items-center gap-2">💦 Urination/Other Bodily Functions</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.presenceOfScooters}
                        onPressedChange={(pressed) => handleFormChange("presenceOfScooters", pressed)}
                        className="w-full justify-start data-[state=on]:bg-yellow-50"
                      >
                        <span className="flex items-center gap-2">🛴 Presence of Scooters</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.leavingTrash}
                        onPressedChange={(pressed) => handleFormChange("leavingTrash", pressed)}
                        className="w-full justify-start data-[state=on]:bg-yellow-50"
                      >
                        <span className="flex items-center gap-2">🗑️ Leaving Trash</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center gap-2">
                      <span>🚑</span> Emergency/Medical
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.emergencyServices}
                        onPressedChange={(pressed) => handleFormChange("emergencyServices", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-50"
                      >
                        <span className="flex items-center gap-2">🚔 Emergency Services Response</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.personInjuredOrDistress}
                        onPressedChange={(pressed) => handleFormChange("personInjuredOrDistress", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-50"
                      >
                        <span className="flex items-center gap-2">😰 Person Injured/In Distress</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.obviousMedicalEmergency}
                        onPressedChange={(pressed) => handleFormChange("obviousMedicalEmergency", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-50"
                      >
                        <span className="flex items-center gap-2">🏥 Obvious Medical Emergency</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.visibleFireOrSmoke}
                        onPressedChange={(pressed) => handleFormChange("visibleFireOrSmoke", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-50"
                      >
                        <span className="flex items-center gap-2">🔥 Visible Fire/Smoke</span>
                      </Toggle>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
                      <span>🏢</span> Tenant Activity
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.tenantsMovingOut}
                        onPressedChange={(pressed) => handleFormChange("tenantsMovingOut", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-50"
                      >
                        <span className="flex items-center gap-2">📦 Tenants Moving Out</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.largeItemsMovedAfterHours}
                        onPressedChange={(pressed) => handleFormChange("largeItemsMovedAfterHours", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-50"
                      >
                        <span className="flex items-center gap-2">🛋️ Large Items Moved After Hours</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-teal-800 flex items-center gap-2">
                      <span>⛔</span> Restricted Access
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.personInRestrictedArea}
                        onPressedChange={(pressed) => handleFormChange("personInRestrictedArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-teal-50"
                      >
                        <span className="flex items-center gap-2">🚫 Person in Restricted Area</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.sittingOrSleeping}
                        onPressedChange={(pressed) => handleFormChange("sittingOrSleeping", pressed)}
                        className="w-full justify-start data-[state=on]:bg-teal-50"
                      >
                        <span className="flex items-center gap-2">💤 Sitting/Sleeping</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.presentInProhibitedArea}
                        onPressedChange={(pressed) => handleFormChange("presentInProhibitedArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-teal-50"
                      >
                        <span className="flex items-center gap-2">⛔ Present in Prohibited Area</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center gap-2">
                      <span>🧍</span> Loitering
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.loitering}
                        onPressedChange={(pressed) => handleFormChange("loitering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">🚶 Loitering</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.activeGathering}
                        onPressedChange={(pressed) => handleFormChange("activeGathering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">👥 Active Gathering</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.groupsLoiteringGathering}
                        onPressedChange={(pressed) => handleFormChange("groupsLoiteringGathering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">👪 Groups Loitering/Gathering</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.homelessVagrant}
                        onPressedChange={(pressed) => handleFormChange("homelessVagrant", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">🏕️ Homeless/Vagrant</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.sleepingOnSiteEncampments}
                        onPressedChange={(pressed) => handleFormChange("sleepingOnSiteEncampments", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">😴 Sleeping On Site/Encampments</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.loiteringInStairwells}
                        onPressedChange={(pressed) => handleFormChange("loiteringInStairwells", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">🪜 Loitering in Stairwells</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.personsSmoking}
                        onPressedChange={(pressed) => handleFormChange("personsSmoking", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">🚬 Persons Smoking</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.vehicleLoiteringInArea}
                        onPressedChange={(pressed) => handleFormChange("vehicleLoiteringInArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-50"
                      >
                        <span className="flex items-center gap-2">🚘 Vehicle Loitering in Area</span>
                      </Toggle>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-indigo-800 flex items-center gap-2">
                      <span>✨</span> Custom Incident Types
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.customIncidentType1}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType1", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-50"
                      >
                        <span className="flex items-center gap-2">🔍 Custom Incident Type 1</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType2}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType2", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-50"
                      >
                        <span className="flex items-center gap-2">🔍 Custom Incident Type 2</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType3}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType3", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-50"
                      >
                        <span className="flex items-center gap-2">🔍 Custom Incident Type 3</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType4}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType4", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-50"
                      >
                        <span className="flex items-center gap-2">🔍 Custom Incident Type 4</span>
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType5}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType5", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-50"
                      >
                        <span className="flex items-center gap-2">🔍 Custom Incident Type 5</span>
                      </Toggle>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stream Details Tab Content */}
        <TabsContent value="stream-details">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📹</span> Camera Stream Configuration
              </CardTitle>
              <CardDescription>Enter details for initial camera stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1Name">Stream Name</Label>
                    <Input 
                      id="cameraStream1Name"
                      value={formData.cameraStream1Name}
                      onChange={(e) => handleFormChange("cameraStream1Name", e.target.value)}
                      autoComplete="off"
                      placeholder="Enter stream name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1Location">Location</Label>
                    <Input 
                      id="cameraStream1Location"
                      value={formData.cameraStream1Location}
                      onChange={(e) => handleFormChange("cameraStream1Location", e.target.value)}
                      autoComplete="off"
                      placeholder="Enter camera location"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1Type">Camera Type</Label>
                    <Select 
                      value={formData.cameraStream1Type}
                      onValueChange={(value) => handleFormChange("cameraStream1Type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PTZ">PTZ</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Fisheye">Fisheye</SelectItem>
                        <SelectItem value="Bullet">Bullet</SelectItem>
                        <SelectItem value="Dome">Dome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1Accessibility">Area Accessibility</Label>
                    <Select 
                      value={formData.cameraStream1Accessibility}
                      onValueChange={(value) => handleFormChange("cameraStream1Accessibility", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select area accessibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Restricted">Restricted</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Secure">Secure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1UseCaseProblem">Unique Use Case Problem</Label>
                    <Textarea 
                      id="cameraStream1UseCaseProblem"
                      value={formData.cameraStream1UseCaseProblem}
                      onChange={(e) => handleFormChange("cameraStream1UseCaseProblem", e.target.value)}
                      placeholder="Enter any unique use case problem for this camera"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraStream1Association">Camera Association</Label>
                    <Input 
                      id="cameraStream1Association"
                      value={formData.cameraStream1Association}
                      onChange={(e) => handleFormChange("cameraStream1Association", e.target.value)}
                      autoComplete="off"
                      placeholder="Enter any associated equipment or areas"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>📝</span> Additional Camera Streams
                  </h3>
                  <Button onClick={() => addStream()} className="flex items-center gap-1">
                    <Plus size={16} /> Add Stream
                  </Button>
                </div>
                
                {streams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Qty</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Monitored Area</TableHead>
                          <TableHead>Accessibility</TableHead>
                          <TableHead>Analytic Rule 1</TableHead>
                          <TableHead>Dwell Time</TableHead>
                          <TableHead>Rule 2</TableHead>
                          <TableHead>Dwell Time</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Event Volume</TableHead>
                          <TableHead>Patrol Type</TableHead>
                          <TableHead>Patrols/Week</TableHead>
                          <TableHead>Images</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {streams.map((stream) => (
                          <TableRow key={stream.id}>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="1" 
                                value={stream.quantity}
                                onChange={(e) => updateStream(stream.id, "quantity", parseInt(e.target.value))}
                                className="w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={stream.description}
                                onChange={(e) => updateStream(stream.id, "description", e.target.value)}
                                placeholder="Stream description"
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.monitoredArea}
                                onValueChange={(value) => updateStream(stream.id, "monitoredArea", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select area" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pool">Pool</SelectItem>
                                  <SelectItem value="Parking Lot">Parking Lot</SelectItem>
                                  <SelectItem value="Entrance">Entrance</SelectItem>
                                  <SelectItem value="Lobby">Lobby</SelectItem>
                                  <SelectItem value="Garage">Garage</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.accessibility}
                                onValueChange={(value) => updateStream(stream.id, "accessibility", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select accessibility" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Secure">Secure</SelectItem>
                                  <SelectItem value="Open">Open</SelectItem>
                                  <SelectItem value="Restricted">Restricted</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.analyticRule1}
                                onValueChange={(value) => updateStream(stream.id, "analyticRule1", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select rule" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Person Detected">Person Detected</SelectItem>
                                  <SelectItem value="Vehicle Detected">Vehicle Detected</SelectItem>
                                  <SelectItem value="Motion Detected">Motion Detected</SelectItem>
                                  <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                value={stream.dwellTime1}
                                onChange={(e) => updateStream(stream.id, "dwellTime1", parseInt(e.target.value))}
                                className="w-16"
                                disabled={stream.analyticRule1 === "None"}
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.analyticRule2}
                                onValueChange={(value) => updateStream(stream.id, "analyticRule2", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select rule" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Person Detected">Person Detected</SelectItem>
                                  <SelectItem value="Vehicle Detected">Vehicle Detected</SelectItem>
                                  <SelectItem value="Motion Detected">Motion Detected</SelectItem>
                                  <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                value={stream.dwellTime2}
                                onChange={(e) => updateStream(stream.id, "dwellTime2", parseInt(e.target.value))}
                                className="w-16"
                                disabled={stream.analyticRule2 === "None"}
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.schedule}
                                onValueChange={(value) => updateStream(stream.id, "schedule", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="24/7">24/7</SelectItem>
                                  <SelectItem value="Business Hours">Business Hours</SelectItem>
                                  <SelectItem value="After Hours">After Hours</SelectItem>
                                  <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                max="1000"
                                value={stream.eventVolume}
                                onChange={(e) => updateStream(stream.id, "eventVolume", parseInt(e.target.value))}
                                className="w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={stream.patrolType}
                                onValueChange={(value) => updateStream(stream.id, "patrolType", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Standard">Standard</SelectItem>
                                  <SelectItem value="Premium">Premium</SelectItem>
                                  <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                value={stream.patrolsPerWeek}
                                onChange={(e) => updateStream(stream.id, "patrolsPerWeek", parseInt(e.target.value))}
                                className="w-16"
                                disabled={stream.patrolType === "None"}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{stream.images.length} images</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="Upload Image"
                                    onClick={() => {
                                      // Create file input element
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            const imageData = event.target?.result as string;
                                            // Remove data URL prefix for consistent storage
                                            const base64Data = imageData.split(',')[1];
                                            
                                            // Create new image object
                                            const newImage: StreamImage = {
                                              id: Date.now(),
                                              imageData: base64Data,
                                              filename: file.name
                                            };
                                            
                                            // Update stream with new image
                                            const updatedImages = [...stream.images, newImage];
                                            updateStream(stream.id, "images", updatedImages);
                                            
                                            toast({
                                              title: "Image Added",
                                              description: `Image "${file.name}" added to stream`
                                            });
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Camera size={16} />
                                  </Button>
                                  {stream.images.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      title="View Images"
                                      onClick={() => {
                                        setSelectedStream(stream);
                                        setIsImagesModalOpen(true);
                                      }}
                                    >
                                      <ImageIcon size={16} />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => addStream(stream)}
                                  title="Duplicate Stream"
                                >
                                  <Copy size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeStream(stream.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove Stream"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No streams added yet. Add a stream to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pricing Tab Content */}
        <TabsContent value="pricing">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Configure pricing and additional services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Additional Services</h3>
                  <Button variant="outline" onClick={calculatePrice} className="flex items-center gap-1">
                    <Calculator size={16} /> Calculate Price
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vocEscalations">VOC Escalations</Label>
                    <Input 
                      id="vocEscalations"
                      type="number"
                      min="0"
                      value={formData.vocEscalations}
                      onChange={(e) => handleFormChange("vocEscalations", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dispatchResponses">Dispatch Responses</Label>
                    <Input 
                      id="dispatchResponses"
                      type="number"
                      min="0"
                      value={formData.dispatchResponses}
                      onChange={(e) => handleFormChange("dispatchResponses", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gdodsPatrols">GDoDS Patrols</Label>
                    <Input 
                      id="gdodsPatrols"
                      type="number"
                      min="0"
                      value={formData.gdodsPatrols}
                      onChange={(e) => handleFormChange("gdodsPatrols", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sgppPatrols">SGPP Patrols</Label>
                    <Input 
                      id="sgppPatrols"
                      type="number"
                      min="0"
                      value={formData.sgppPatrols}
                      onChange={(e) => handleFormChange("sgppPatrols", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="forensicInvestigations">Forensic Investigations</Label>
                    <Input 
                      id="forensicInvestigations"
                      type="number"
                      min="0"
                      value={formData.forensicInvestigations}
                      onChange={(e) => handleFormChange("forensicInvestigations", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appUsers">App Users</Label>
                    <Input 
                      id="appUsers"
                      type="number"
                      min="0"
                      value={formData.appUsers}
                      onChange={(e) => handleFormChange("appUsers", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audioDevices">Audio Devices</Label>
                    <Input 
                      id="audioDevices"
                      type="number"
                      min="0"
                      value={formData.audioDevices}
                      onChange={(e) => handleFormChange("audioDevices", parseInt(e.target.value))}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Site Assessment Tab Content */}
        <TabsContent value="site-assessment">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔍</span> Site Assessment
              </CardTitle>
              <CardDescription>
                This form is completed during or following the Customer Discovery process and during the "Engage stage" to ensure that all the customer site details and Kastle KVG services are documented properly by the SE.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>💡</span> Site Environment & Lighting Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="lightingRequirements" className="flex items-center gap-1">
                        Lighting Requirements
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="Depending on the environment, external lighting averages a horizontal illuminance level at grade: Storefronts/entrances (20 footcandles), Small parking lots/pools (15 footcandles), Large parking lots (10 footcandles), Other areas (5 footcandles)">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.lightingRequirements}
                        onValueChange={(value) => handleFormChange("lightingRequirements", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lighting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent - No additional lighting needed</SelectItem>
                          <SelectItem value="Adequate">Adequate - Minor enhancement</SelectItem>
                          <SelectItem value="Additional Needed">Additional Needed - Moderate lighting required</SelectItem>
                          <SelectItem value="IR Required">IR Required - Night vision necessary</SelectItem>
                          <SelectItem value="Complete Update">Complete Update - Full lighting installation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lightingAppropriate">Lighting Appropriate for Night Monitoring</Label>
                      <Select 
                        value={formData.lightingAppropriate || ""}
                        onValueChange={(value) => handleFormChange("lightingAppropriate", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Verify lighting sufficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Lighting is appropriate</SelectItem>
                          <SelectItem value="No">No - Lighting is inadequate</SelectItem>
                          <SelectItem value="Partial">Partial - Some areas need improvement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="lightingNotes" className="flex items-center gap-1">
                      Lighting and FOV Notes
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                        <div className="tooltip" title="Include details about lighting conditions, specific areas needing improvement, and any special requirements for night monitoring">
                          <span>ⓘ</span>
                        </div>
                      </Button>
                    </Label>
                    <Textarea 
                      id="lightingNotes"
                      value={formData.lightingNotes || ""}
                      onChange={(e) => handleFormChange("lightingNotes", e.target.value)}
                      placeholder="Describe lighting conditions, requirements, and recommendations"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📹</span> Camera Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cameraFieldOfView" className="flex items-center gap-1">
                        Camera Field of View
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="The FOV of the camera view should be free and clear of any obstructions. There should be no trees, signs, banners, trucks parked at docks or areas that the video analytic is required to detect events.">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.cameraFieldOfView}
                        onValueChange={(value) => handleFormChange("cameraFieldOfView", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field of view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clear">Clear - Unobstructed view</SelectItem>
                          <SelectItem value="Partially Obstructed">Partially Obstructed - Some obstacles</SelectItem>
                          <SelectItem value="Heavily Obstructed">Heavily Obstructed - Significant obstacles</SelectItem>
                          <SelectItem value="Mixed">Mixed - Varies by location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cameraFovClear">FOV Clear from Obstructions</Label>
                      <Select 
                        value={formData.cameraFovClear || ""}
                        onValueChange={(value) => handleFormChange("cameraFovClear", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Verify FOV clarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Views are clear</SelectItem>
                          <SelectItem value="No">No - Significant obstructions</SelectItem>
                          <SelectItem value="Partial">Partial - Some cameras affected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="cameraAssessmentNotes">Camera Assessment Notes</Label>
                    <Textarea 
                      id="cameraAssessmentNotes"
                      value={formData.cameraAssessmentNotes || ""}
                      onChange={(e) => handleFormChange("cameraAssessmentNotes", e.target.value)}
                      placeholder="Describe camera positioning, challenges, and recommendations"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>⚡</span> System & Power Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="powerRequirements" className="flex items-center gap-1">
                        Power Requirements
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="Power budget is based on the individual systems and devices connected to the system. Each device has a power draw that must be accounted for in the total power budget.">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.powerStable || ""}
                        onValueChange={(value) => handleFormChange("powerStable", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Power status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Power is stable and ample</SelectItem>
                          <SelectItem value="No">No - Power is insufficient</SelectItem>
                          <SelectItem value="Needs Assessment">Needs Assessment - Further evaluation required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="headendEnvironment" className="flex items-center gap-1">
                        Headend Environment
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="The headend is where all network and server equipment will be installed. This area must be secure, properly ventilated, and have adequate power.">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.headendEnvironment || ""}
                        onValueChange={(value) => handleFormChange("headendEnvironment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Headend status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Secure and properly vented</SelectItem>
                          <SelectItem value="No">No - Issues with security or ventilation</SelectItem>
                          <SelectItem value="Needs Improvement">Needs Improvement - Requires modifications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="headendNotes" className="flex items-center gap-1">
                      System Headend Notes
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                        <div className="tooltip" title="Fill in any additional details that are important for the install prep or design">
                          <span>ⓘ</span>
                        </div>
                      </Button>
                    </Label>
                    <Textarea 
                      id="headendNotes"
                      value={formData.headendNotes || ""}
                      onChange={(e) => handleFormChange("headendNotes", e.target.value)}
                      placeholder="Add details about headend environment, power, and system requirements"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🌐</span> Network Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteSwitchPorts" className="flex items-center gap-1">
                        Site Switch(es) Port Availability
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="Verify that there are sufficient network switch ports available for all required devices">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.siteSwitchPorts || ""}
                        onValueChange={(value) => handleFormChange("siteSwitchPorts", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Network switch status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Sufficient ports available</SelectItem>
                          <SelectItem value="No">No - Additional switches needed</SelectItem>
                          <SelectItem value="Partial">Partial - Some areas need expansion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cloudUplinkCapacity" className="flex items-center gap-1">
                        Cloud Uplink Capacity
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="Verify that the internet connection has sufficient bandwidth for cloud video transmission">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.cloudUplinkCapacity || ""}
                        onValueChange={(value) => handleFormChange("cloudUplinkCapacity", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cloud capacity status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Sufficient uplink available</SelectItem>
                          <SelectItem value="No">No - Uplink upgrade required</SelectItem>
                          <SelectItem value="Unknown">Unknown - Testing needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="networkBandwidth" className="flex items-center gap-1">
                        Network Bandwidth
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                          <div className="tooltip" title="Bandwidth is dependent upon camera compression, frame rate, resolution and scene content. You must properly budget for all cameras based on switches and port capabilities.">
                            <span>ⓘ</span>
                          </div>
                        </Button>
                      </Label>
                      <Select 
                        value={formData.networkBandwidth || ""}
                        onValueChange={(value) => handleFormChange("networkBandwidth", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bandwidth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High (100+ Mbps)</SelectItem>
                          <SelectItem value="Medium">Medium (25-100 Mbps)</SelectItem>
                          <SelectItem value="Low">Low (5-25 Mbps)</SelectItem>
                          <SelectItem value="Very Low">Very Low (&lt; 5 Mbps)</SelectItem>
                          <SelectItem value="Unknown">Unknown - Testing required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="networkCabling">Network Cabling & Connectors</Label>
                      <Select 
                        value={formData.networkCabling || ""}
                        onValueChange={(value) => handleFormChange("networkCabling", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cabling status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Sufficient cabling exists</SelectItem>
                          <SelectItem value="No">No - New cabling required</SelectItem>
                          <SelectItem value="Partial">Partial - Some areas need new cabling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="networkAssessmentNotes" className="flex items-center gap-1">
                      Networking & Power Notes
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                        <div className="tooltip" title="Document any specific network requirements, issues, or considerations for installation">
                          <span>ⓘ</span>
                        </div>
                      </Button>
                    </Label>
                    <Textarea 
                      id="networkAssessmentNotes"
                      value={formData.networkAssessmentNotes || ""}
                      onChange={(e) => handleFormChange("networkAssessmentNotes", e.target.value)}
                      placeholder="Describe network conditions, challenges, and requirements"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🔊</span> Audio Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="speakerCoverage">Verify Proper Speaker Coverage</Label>
                      <Select 
                        value={formData.speakerCoverage || ""}
                        onValueChange={(value) => handleFormChange("speakerCoverage", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Speaker coverage status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Coverage is sufficient</SelectItem>
                          <SelectItem value="No">No - Additional speakers needed</SelectItem>
                          <SelectItem value="Not Required">Not Required - Audio not needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audioCompatible">Audio Speakers Compatible</Label>
                      <Select 
                        value={formData.audioCompatible || ""}
                        onValueChange={(value) => handleFormChange("audioCompatible", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Compatibility status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Compatible with system</SelectItem>
                          <SelectItem value="No">No - Replacement needed</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable - No audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audioAssessmentNotes">Audio Assessment Notes</Label>
                    <Textarea 
                      id="audioAssessmentNotes"
                      value={formData.audioAssessmentNotes || ""}
                      onChange={(e) => handleFormChange("audioAssessmentNotes", e.target.value)}
                      placeholder="Describe audio requirements, speaker placement, and challenges"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🖥️</span> Technology (Take-Over)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please identify the Manufacturers, Model Numbers and software version if there is existing equipment that will be taken over.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cameraCompatibilityVerified">Camera Compatibility Verified</Label>
                      <Select 
                        value={formData.cameraCompatibilityVerified || ""}
                        onValueChange={(value) => handleFormChange("cameraCompatibilityVerified", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Compatibility status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Compatibility confirmed</SelectItem>
                          <SelectItem value="No">No - Compatibility issues</SelectItem>
                          <SelectItem value="Partial">Partial - Some cameras compatible</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable - No takeover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cameraCompatibilityLink">Link to Compatibility Documentation</Label>
                      <Input
                        id="cameraCompatibilityLink"
                        value={formData.cameraCompatibilityLink || ""}
                        onChange={(e) => handleFormChange("cameraCompatibilityLink", e.target.value)}
                        placeholder="Enter URL to documentation"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="fisheyeCompatibility">Fisheye Camera Compatibility</Label>
                      <Select 
                        value={formData.fisheyeCompatibility || ""}
                        onValueChange={(value) => handleFormChange("fisheyeCompatibility", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fisheye status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Compatible</SelectItem>
                          <SelectItem value="No">No - Not compatible</SelectItem>
                          <SelectItem value="NA">N/A - No fisheye cameras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dewarpingAtEdge">Dewarping at the Edge</Label>
                      <Select 
                        value={formData.dewarpingAtEdge || ""}
                        onValueChange={(value) => handleFormChange("dewarpingAtEdge", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dewarping status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Supports edge dewarping</SelectItem>
                          <SelectItem value="No">No - Server dewarping needed</SelectItem>
                          <SelectItem value="NA">N/A - No fisheye cameras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edgeStreamsSupport">Edge Streams Support</Label>
                      <Select 
                        value={formData.edgeStreamsSupport || ""}
                        onValueChange={(value) => handleFormChange("edgeStreamsSupport", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Edge streams status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes - Supports quad/dual pano</SelectItem>
                          <SelectItem value="No">No - Not supported</SelectItem>
                          <SelectItem value="NA">N/A - No fisheye cameras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraCompatibilityNotes">Additional Compatibility Notes</Label>
                    <Textarea 
                      id="cameraCompatibilityNotes"
                      value={formData.cameraCompatibilityNotes || ""}
                      onChange={(e) => handleFormChange("cameraCompatibilityNotes", e.target.value)}
                      placeholder="Add any compatibility notes for cameras and equipment"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>🗺️</span> Site Plan Design Layout
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add in the completed Site plans that have been detailed for this opportunity utilizing IPVM, Kastle design tools or similar. This should show all exterior cameras in the proper location/FOV position with names.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="sitePlanUpload" className="flex items-center gap-1">
                          Site Plan Upload
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                            <div className="tooltip" title="Upload site plans showing all exterior cameras with proper FOV positioning and naming">
                              <span>ⓘ</span>
                            </div>
                          </Button>
                        </Label>
                        <FileUpload
                          id="sitePlanUpload"
                          title="Upload Site Plan"
                          description="PDF or CAD file showing camera locations and FOV"
                          accept="application/pdf,image/*,.dwg,.dxf"
                          maxSize={50}
                          onFileUpload={(file) => {
                            // In a real implementation, this would upload the file to a server
                            // and store the URL or file ID in formData
                            console.log("Uploaded site plan", file);
                            toast({
                              title: "Site Plan Uploaded",
                              description: `${file?.name || "File"} has been uploaded successfully`,
                            });
                          }}
                        />
                      </div>
                    
                      <div className="space-y-2">
                        <Label htmlFor="sitePlanNotes">Site Plan Notes</Label>
                        <Textarea 
                          id="sitePlanNotes"
                          value={formData.sitePlanNotes || ""}
                          onChange={(e) => handleFormChange("sitePlanNotes", e.target.value)}
                          placeholder="Any site notes of benefit in regards to scene, site, environment, surrounding areas or other"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="sitePhotoUpload" className="flex items-center gap-1">
                          Site Photos Upload
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                            <div className="tooltip" title="Upload photos of the site that correspond to locations on the site plan">
                              <span>ⓘ</span>
                            </div>
                          </Button>
                        </Label>
                        <FileUpload
                          id="sitePhotoUpload"
                          title="Upload Site Photos"
                          description="Photos from site showing specific areas of interest"
                          accept="image/*"
                          maxSize={50}
                          onFileUpload={(file) => {
                            // In a real implementation, this would upload the file to a server
                            // and store the URL or file ID in formData
                            console.log("Uploaded site photo", file);
                            toast({
                              title: "Site Photo Uploaded",
                              description: `${file?.name || "Photo"} has been uploaded successfully`,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h4 className="text-md font-medium flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                      <span>✨</span> AI-Powered Site Assessment Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "AI Feature",
                          description: "AI-powered site assessment recommendation engine activated",
                        })}
                      >
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                          <LightbulbIcon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">AI Recommendations</div>
                          <div className="text-xs text-muted-foreground">Get intelligent placement suggestions</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "AI Feature",
                          description: "Live equipment detection tool activated",
                        })}
                      >
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                          <ScanFace className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Equipment Detection</div>
                          <div className="text-xs text-muted-foreground">Identify existing hardware</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "AI Feature",
                          description: "Coverage analysis tool activated",
                        })}
                      >
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                          <Activity className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Coverage Analysis</div>
                          <div className="text-xs text-muted-foreground">Analyze security gaps</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span> Equipment List
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The equipment list must be loaded into CPQ for proper loads and pricing. Any discounting should be done post adding the equipment.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="equipmentBomUpload" className="flex items-center gap-1">
                          Upload Equipment List
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                            <div className="tooltip" title="Upload a spreadsheet containing your equipment list with all required items">
                              <span>ⓘ</span>
                            </div>
                          </Button>
                        </Label>
                        <FileUpload
                          id="equipmentBomUpload"
                          title="Upload Equipment List"
                          description="Excel or CSV file with detailed BOM"
                          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          maxSize={10}
                          onFileUpload={(file) => {
                            // In a real implementation, this would upload the file to a server
                            // and store the URL or file ID in formData
                            console.log("Uploaded equipment list", file);
                            toast({
                              title: "Equipment List Uploaded",
                              description: `${file?.name || "File"} has been uploaded successfully`,
                            });
                          }}
                        />
                      </div>
                    
                      <div className="space-y-2">
                        <Label htmlFor="equipmentNotes" className="flex items-center gap-1">
                          Equipment Notes
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                            <div className="tooltip" title="Enter any specific notes or requirements in regards to equipment">
                              <span>ⓘ</span>
                            </div>
                          </Button>
                        </Label>
                        <Textarea 
                          id="equipmentNotes"
                          value={formData.equipmentNotes || ""}
                          onChange={(e) => handleFormChange("equipmentNotes", e.target.value)}
                          placeholder="Enter any specific notes or requirements in regards to equipment"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="equipmentBom" className="flex items-center gap-1">
                          Bill of Materials (BOM)
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                            <div className="tooltip" title="Paste BOM details here with Video, Speakers, Servers, Appliance, Transmission and Other components">
                              <span>ⓘ</span>
                            </div>
                          </Button>
                        </Label>
                        <Textarea 
                          id="equipmentBom"
                          value={formData.equipmentBom || ""}
                          onChange={(e) => handleFormChange("equipmentBom", e.target.value)}
                          placeholder="Paste BOM Here with Video, Speakers, Servers, Appliance, Transmission and Other"
                          rows={8}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4">
                    <h4 className="text-md font-medium flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-300">
                      <span>🔄</span> Multi-Format Export Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "Export Feature",
                          description: "Equipment list exported to Excel",
                        })}
                      >
                        <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700 dark:text-emerald-300">
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M4 7V2h6"></path>
                            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                            <path d="M4 12v-3a2 2 0 0 1 2-2h5.9"></path>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Export to Excel</div>
                          <div className="text-xs text-muted-foreground">Spreadsheet format</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "Export Feature",
                          description: "Equipment list exported to PDF",
                        })}
                      >
                        <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700 dark:text-emerald-300">
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M5 2h9"></path>
                            <path d="M5 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5Z"></path>
                            <path d="M5 14V6a2 2 0 0 1 2-2h7"></path>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Export to PDF</div>
                          <div className="text-xs text-muted-foreground">Document format</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto py-2 px-3 flex items-center justify-start gap-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800"
                        onClick={() => toast({
                          title: "Export Feature",
                          description: "Equipment list exported to CSV",
                        })}
                      >
                        <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700 dark:text-emerald-300">
                            <path d="M8 21h8a2 2 0 0 0 2-2v-7.93a2 2 0 0 0-.59-1.42L12 4.25l-5.41 5.4A2 2 0 0 0 6 11.07V19a2 2 0 0 0 2 2Z"></path>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">Export to CSV</div>
                          <div className="text-xs text-muted-foreground">Import-friendly format</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Use Case Tab Content */}
        <TabsContent value="use-case">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Use Case Commitment</CardTitle>
              <CardDescription>Scope of work and commitment for monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <Select 
                      value={selectedLanguage}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Mandarin</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={translateSOW}
                      disabled={selectedLanguage === 'en' || isTranslating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Languages className="h-4 w-4" />
                      {isTranslating ? "Translating..." : "Translate"}
                    </Button>
                  </div>
                  
                  {translatedLanguage && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Translated to {getLanguageLabel(translatedLanguage)}
                    </Badge>
                  )}
                </div>
                
                {translationError && (
                  <div className="p-3 text-sm bg-red-50 text-red-800 rounded-md">
                    {translationError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="useCaseCommitment">Scope of Work (SOW)</Label>
                  <Textarea 
                    id="useCaseCommitment"
                    value={formData.useCaseCommitment}
                    onChange={(e) => handleFormChange("useCaseCommitment", e.target.value)}
                    placeholder="Enter detailed scope of work for Kastle Video Guarding services"
                    rows={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* VOC Protocol Tab Content */}
        <TabsContent value="voc-protocol">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Video Operations Center Protocol</CardTitle>
              <CardDescription>Setup instructions for VOC operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amName">Account Manager</Label>
                    <Input 
                      id="amName"
                      value={formData.amName}
                      onChange={(e) => handleFormChange("amName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input 
                      id="projectId"
                      value={formData.projectId}
                      onChange={(e) => handleFormChange("projectId", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="escalationProcess1">Escalation Process - Step 1</Label>
                    <Textarea 
                      id="escalationProcess1"
                      value={formData.escalationProcess1}
                      onChange={(e) => handleFormChange("escalationProcess1", e.target.value)}
                      placeholder="First escalation step"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="escalationProcess2">Escalation Process - Step 2</Label>
                    <Textarea 
                      id="escalationProcess2"
                      value={formData.escalationProcess2}
                      onChange={(e) => handleFormChange("escalationProcess2", e.target.value)}
                      placeholder="Second escalation step"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="escalationProcess3">Escalation Process - Step 3</Label>
                    <Textarea 
                      id="escalationProcess3"
                      value={formData.escalationProcess3}
                      onChange={(e) => handleFormChange("escalationProcess3", e.target.value)}
                      placeholder="Third escalation step"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Project Deployment Tab Content */}
        <TabsContent value="deployment">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Project Deployment</CardTitle>
              <CardDescription>Technical deployment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pmName">Project Manager</Label>
                    <Input 
                      id="pmName"
                      value={formData.pmName}
                      onChange={(e) => handleFormChange("pmName", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gatewayCredentials">Gateway Credentials</Label>
                    <Textarea 
                      id="gatewayCredentials"
                      value={formData.gatewayCredentials}
                      onChange={(e) => handleFormChange("gatewayCredentials", e.target.value)}
                      placeholder="Enter gateway credentials information"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streamNames">Stream Names/IDs</Label>
                    <Textarea 
                      id="streamNames"
                      value={formData.streamNames}
                      onChange={(e) => handleFormChange("streamNames", e.target.value)}
                      placeholder="Enter stream names or IDs"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="speakersWork">Speaker Functionality</Label>
                    <Select 
                      value={formData.speakersWork}
                      onValueChange={(value) => handleFormChange("speakersWork", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select speaker status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Working">All Working</SelectItem>
                        <SelectItem value="Partial Functionality">Partial Functionality</SelectItem>
                        <SelectItem value="Not Working">Not Working</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
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
