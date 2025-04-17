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
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Stream type definition
interface Stream {
  id: number;
  quantity: number;
  description: string;
  monitoredArea: string;
  accessibility: string;
  useCase: string;
  analyticRule1: string;
  dwellTime1: number;
  analyticRule2: string;
  dwellTime2: number;
  daysOfWeek: string[];
  schedule: string;
  eventVolume: number;
  patrolType: string;
  patrolsPerWeek: number;
}

interface FormData {
  // Discovery tab fields
  bdmOwner: string;
  salesEngineer: string;
  kvgSme: string;
  customerName: string;
  siteAddress: string;
  cityStateZip: string;
  crmOpportunity: string;
  quoteDate: string;
  numSites: number;
  technology: string;
  installType: string;
  
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
  
  // Site Assessment tab fields
  lightingRequirements: string;
  cameraFieldOfView: string;
  networkConnectivity: string;
  
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
  const [formData, setFormData] = useState<FormData>({
    // Discovery tab fields
    bdmOwner: "",
    salesEngineer: "",
    kvgSme: "",
    customerName: "",
    siteAddress: "",
    cityStateZip: "",
    crmOpportunity: "",
    quoteDate: new Date().toISOString().split('T')[0],
    numSites: 1,
    technology: "Kastle Video Cloud",
    installType: "New Construction",
    
    // Incident Types - Default values
    // Criminal Activity Group
    obviousCriminalAct: true,
    activeBreakIn: false,
    destructionOfProperty: false,
    carDrivingThroughGate: false,
    carBurglaries: false,
    trespassing: false,
    carsBrokenIntoAfterFact: false,
    brokenGlassWindows: false,
    
    // Suspicious Activity Group
    suspiciousActivity: true,
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
    loitering: true,
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">KVG Pricing App</h1>

      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
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
        </TabsList>

        {/* Discovery Tab Content */}
        <TabsContent value="discovery">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
              <CardDescription>Enter the basic information about this opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bdmOwner">BDM Owner</Label>
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
                  <Label htmlFor="siteAddress">Site Address</Label>
                  <Input 
                    id="siteAddress"
                    value={formData.siteAddress}
                    onChange={(e) => handleFormChange("siteAddress", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cityStateZip">City, State, Zip</Label>
                  <Input 
                    id="cityStateZip"
                    value={formData.cityStateZip}
                    onChange={(e) => handleFormChange("cityStateZip", e.target.value)}
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
                  <Label htmlFor="quoteDate">Date Quote Generated</Label>
                  <Input 
                    id="quoteDate"
                    type="date"
                    value={formData.quoteDate}
                    onChange={(e) => handleFormChange("quoteDate", e.target.value)}
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
                  <Label htmlFor="technology">Technology Required</Label>
                  <Select 
                    value={formData.technology}
                    onValueChange={(value) => handleFormChange("technology", value)}
                  >
                    <SelectTrigger id="technology">
                      <SelectValue placeholder="Select technology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kastle Video Cloud">Kastle Video Cloud</SelectItem>
                      <SelectItem value="Avigilon Cameras">Avigilon Cameras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installType">Type of Install</Label>
                  <Select
                    value={formData.installType}
                    onValueChange={(value) => handleFormChange("installType", value)}
                  >
                    <SelectTrigger id="installType">
                      <SelectValue placeholder="Select install type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Construction">New Construction</SelectItem>
                      <SelectItem value="Existing Customer Add-on">Existing Customer Add-on</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 - Criminal Activity Group */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-red-800">Criminal Activity</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.obviousCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("obviousCriminalAct", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Obvious Criminal Act
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.activeBreakIn}
                        onPressedChange={(pressed) => handleFormChange("activeBreakIn", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Active Break-In
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.destructionOfProperty}
                        onPressedChange={(pressed) => handleFormChange("destructionOfProperty", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Destruction of Property
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carDrivingThroughGate}
                        onPressedChange={(pressed) => handleFormChange("carDrivingThroughGate", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Car Driving Through Parking Gate
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carBurglaries}
                        onPressedChange={(pressed) => handleFormChange("carBurglaries", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Car Burglaries
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.trespassing}
                        onPressedChange={(pressed) => handleFormChange("trespassing", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Trespassing
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.carsBrokenIntoAfterFact}
                        onPressedChange={(pressed) => handleFormChange("carsBrokenIntoAfterFact", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Cars Broken Into After the Fact
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.brokenGlassWindows}
                        onPressedChange={(pressed) => handleFormChange("brokenGlassWindows", pressed)}
                        className="w-full justify-start data-[state=on]:bg-red-100 data-[state=on]:text-red-900"
                      >
                        Broken Glass - Windows/Doors
                      </Toggle>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-orange-800">Suspicious Activity</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.suspiciousActivity}
                        onPressedChange={(pressed) => handleFormChange("suspiciousActivity", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-100 data-[state=on]:text-orange-900"
                      >
                        Suspicious Individual(s)/Activity
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.intentToCommitCriminalAct}
                        onPressedChange={(pressed) => handleFormChange("intentToCommitCriminalAct", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-100 data-[state=on]:text-orange-900 ml-4"
                      >
                        Intent to Commit Criminal Act
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.checkingMultipleCarDoors}
                        onPressedChange={(pressed) => handleFormChange("checkingMultipleCarDoors", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-100 data-[state=on]:text-orange-900 ml-4"
                      >
                        Checking Multiple Car Doors
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.dumpsterDivingOrDumping}
                        onPressedChange={(pressed) => handleFormChange("dumpsterDivingOrDumping", pressed)}
                        className="w-full justify-start data-[state=on]:bg-orange-100 data-[state=on]:text-orange-900"
                      >
                        Dumpster Diving or Dumping
                      </Toggle>
                    </div>
                  </div>
                </div>
                
                {/* Column 2 - Nuisance, Emergency, Tenant Activity */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Nuisance Activity</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.urinationOrOtherBodilyFunctions}
                        onPressedChange={(pressed) => handleFormChange("urinationOrOtherBodilyFunctions", pressed)}
                        className="w-full justify-start data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900"
                      >
                        Urination or Other Bodily Functions
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.presenceOfScooters}
                        onPressedChange={(pressed) => handleFormChange("presenceOfScooters", pressed)}
                        className="w-full justify-start data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900"
                      >
                        Presence of Scooters, Bicycles, Skateboards
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.leavingTrash}
                        onPressedChange={(pressed) => handleFormChange("leavingTrash", pressed)}
                        className="w-full justify-start data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900"
                      >
                        Leaving Trash in Parking Lots or Perimeter
                      </Toggle>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Emergency/Medical</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.emergencyServices}
                        onPressedChange={(pressed) => handleFormChange("emergencyServices", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900"
                      >
                        Emergency Services on Site
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.personInjuredOrDistress}
                        onPressedChange={(pressed) => handleFormChange("personInjuredOrDistress", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900"
                      >
                        Person Presumed Injured or in Distress
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.obviousMedicalEmergency}
                        onPressedChange={(pressed) => handleFormChange("obviousMedicalEmergency", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900"
                      >
                        Obvious Medical Emergency
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.visibleFireOrSmoke}
                        onPressedChange={(pressed) => handleFormChange("visibleFireOrSmoke", pressed)}
                        className="w-full justify-start data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900"
                      >
                        Visible Fire or Smoke
                      </Toggle>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">Tenant Activity</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.tenantsMovingOut}
                        onPressedChange={(pressed) => handleFormChange("tenantsMovingOut", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-100 data-[state=on]:text-green-900"
                      >
                        Tenants Moving Out of Building
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.largeItemsMovedAfterHours}
                        onPressedChange={(pressed) => handleFormChange("largeItemsMovedAfterHours", pressed)}
                        className="w-full justify-start data-[state=on]:bg-green-100 data-[state=on]:text-green-900"
                      >
                        Large Items Being Moved After Hours
                      </Toggle>
                    </div>
                  </div>
                </div>
                
                {/* Column 3 - Restricted Access, Loitering, Custom Types */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-purple-800">Restricted Access</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.personInRestrictedArea}
                        onPressedChange={(pressed) => handleFormChange("personInRestrictedArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-100 data-[state=on]:text-purple-900"
                      >
                        Person in Restricted Area
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.sittingOrSleeping}
                        onPressedChange={(pressed) => handleFormChange("sittingOrSleeping", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-100 data-[state=on]:text-purple-900"
                      >
                        Sitting or Sleeping in Prohibited Area
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.presentInProhibitedArea}
                        onPressedChange={(pressed) => handleFormChange("presentInProhibitedArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-purple-100 data-[state=on]:text-purple-900"
                      >
                        Present in Prohibited Area
                      </Toggle>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-amber-800">Loitering</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.loitering}
                        onPressedChange={(pressed) => handleFormChange("loitering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Loitering
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.activeGathering}
                        onPressedChange={(pressed) => handleFormChange("activeGathering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Active Gathering
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.groupsLoiteringGathering}
                        onPressedChange={(pressed) => handleFormChange("groupsLoiteringGathering", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Groups Loitering/Gathering
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.homelessVagrant}
                        onPressedChange={(pressed) => handleFormChange("homelessVagrant", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Homeless/Vagrant
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.sleepingOnSiteEncampments}
                        onPressedChange={(pressed) => handleFormChange("sleepingOnSiteEncampments", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Sleeping on Site/Encampments
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.loiteringInStairwells}
                        onPressedChange={(pressed) => handleFormChange("loiteringInStairwells", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Loitering in Stairwells
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.personsSmoking}
                        onPressedChange={(pressed) => handleFormChange("personsSmoking", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Persons Smoking
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.vehicleLoiteringInArea}
                        onPressedChange={(pressed) => handleFormChange("vehicleLoiteringInArea", pressed)}
                        className="w-full justify-start data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900"
                      >
                        Vehicle Loitering in Area
                      </Toggle>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-800">Custom Incident Types</h3>
                    <div className="space-y-2">
                      <Toggle
                        pressed={formData.customIncidentType1}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType1", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-900"
                      >
                        Custom Incident Type 1
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType2}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType2", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-900"
                      >
                        Custom Incident Type 2
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType3}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType3", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-900"
                      >
                        Custom Incident Type 3
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType4}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType4", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-900"
                      >
                        Custom Incident Type 4
                      </Toggle>
                      
                      <Toggle
                        pressed={formData.customIncidentType5}
                        onPressedChange={(pressed) => handleFormChange("customIncidentType5", pressed)}
                        className="w-full justify-start data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-900"
                      >
                        Custom Incident Type 5
                      </Toggle>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Enter camera stream details for monitoring and surveillance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Camera Streams</h3>
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
                
                <div className="flex justify-between items-center mt-6">
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gdodsPatrols">GDODS Patrols</Label>
                    <Input 
                      id="gdodsPatrols"
                      type="number"
                      min="0"
                      value={formData.gdodsPatrols}
                      onChange={(e) => handleFormChange("gdodsPatrols", parseInt(e.target.value))}
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
              <CardTitle>Site Assessment</CardTitle>
              <CardDescription>Technical assessment of the site conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lightingRequirements">Lighting Requirements</Label>
                    <Select 
                      value={formData.lightingRequirements}
                      onValueChange={(value) => handleFormChange("lightingRequirements", value)}
                    >
                      <SelectTrigger id="lightingRequirements">
                        <SelectValue placeholder="Select lighting status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adequate">Adequate</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraFieldOfView">Camera Field of View</Label>
                    <Select 
                      value={formData.cameraFieldOfView}
                      onValueChange={(value) => handleFormChange("cameraFieldOfView", value)}
                    >
                      <SelectTrigger id="cameraFieldOfView">
                        <SelectValue placeholder="Select field of view status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clear">Clear</SelectItem>
                        <SelectItem value="Partially Obstructed">Partially Obstructed</SelectItem>
                        <SelectItem value="Significantly Obstructed">Significantly Obstructed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="networkConnectivity">Network Connectivity Notes</Label>
                    <Textarea 
                      id="networkConnectivity"
                      value={formData.networkConnectivity}
                      onChange={(e) => handleFormChange("networkConnectivity", e.target.value)}
                      placeholder="Document any network constraints or requirements"
                      rows={5}
                    />
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
              <CardTitle>Use Case - Scope of Work</CardTitle>
              <CardDescription>Define the service level agreement and commitment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="useCaseCommitment">Use Case Commitment Details</Label>
                  <Textarea 
                    id="useCaseCommitment"
                    value={formData.useCaseCommitment}
                    onChange={(e) => handleFormChange("useCaseCommitment", e.target.value)}
                    placeholder="Document the specific use case details and service commitments"
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
              <CardTitle>VOC Protocol</CardTitle>
              <CardDescription>Establish customer communication protocols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amName">Account Manager Name</Label>
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
                    <Label htmlFor="escalationProcess1">Escalation Process Level 1</Label>
                    <Textarea 
                      id="escalationProcess1"
                      value={formData.escalationProcess1}
                      onChange={(e) => handleFormChange("escalationProcess1", e.target.value)}
                      placeholder="Document the first level escalation protocol"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="escalationProcess2">Escalation Process Level 2</Label>
                    <Textarea 
                      id="escalationProcess2"
                      value={formData.escalationProcess2}
                      onChange={(e) => handleFormChange("escalationProcess2", e.target.value)}
                      placeholder="Document the second level escalation protocol"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="escalationProcess3">Escalation Process Level 3</Label>
                    <Textarea 
                      id="escalationProcess3"
                      value={formData.escalationProcess3}
                      onChange={(e) => handleFormChange("escalationProcess3", e.target.value)}
                      placeholder="Document the third level escalation protocol"
                      rows={3}
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
              <CardDescription>Define implementation details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pmName">Project Manager Name</Label>
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
                      placeholder="Document the gateway access credentials"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streamNames">Stream Names</Label>
                    <Textarea 
                      id="streamNames"
                      value={formData.streamNames}
                      onChange={(e) => handleFormChange("streamNames", e.target.value)}
                      placeholder="List the stream names"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="speakersWork">Speakers Functionality</Label>
                    <Select 
                      value={formData.speakersWork}
                      onValueChange={(value) => handleFormChange("speakersWork", value)}
                    >
                      <SelectTrigger id="speakersWork">
                        <SelectValue placeholder="Select speaker status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Partially">Partially</SelectItem>
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
    </div>
  );
};

export default KastleVideoGuardingPage;