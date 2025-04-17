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
import { 
  Plus, 
  Trash2, 
  Copy
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
  const handleFormChange = (field: string, value: string | number) => {
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

          <Card>
            <CardHeader>
              <CardTitle>Stream Details</CardTitle>
              <CardDescription>Add streams for this video guarding project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-red-600">
                    <TableRow className="bg-red-600">
                      <TableHead className="text-white">Stream #</TableHead>
                      <TableHead className="text-white">Quantity</TableHead>
                      <TableHead className="text-white">Description</TableHead>
                      <TableHead className="text-white">Monitored Area</TableHead>
                      <TableHead className="text-white">Accessibility</TableHead>
                      <TableHead className="text-white">Use Case</TableHead>
                      <TableHead className="text-white">Analytic Rule 1</TableHead>
                      <TableHead className="text-white">Dwell Time 1 (sec)</TableHead>
                      <TableHead className="text-white">Analytic Rule 2</TableHead>
                      <TableHead className="text-white">Dwell Time 2 (sec)</TableHead>
                      <TableHead className="text-white">Schedule</TableHead>
                      <TableHead className="text-white">Event Volume (events/mo)</TableHead>
                      <TableHead className="text-white">Patrol Type</TableHead>
                      <TableHead className="text-white">#Patrols/wk</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streams.map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell>Stream {stream.id}</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="1" 
                            value={stream.quantity} 
                            onChange={(e) => updateStream(stream.id, "quantity", parseInt(e.target.value))}
                            className="w-16"
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="text" 
                            value={stream.description} 
                            onChange={(e) => updateStream(stream.id, "description", e.target.value)}
                            className="w-full"
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.monitoredArea}
                            onValueChange={(value) => updateStream(stream.id, "monitoredArea", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pool">Pool</SelectItem>
                              <SelectItem value="Stairwells">Stairwells</SelectItem>
                              <SelectItem value="Front or Main Lobby">Front or Main Lobby</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.accessibility}
                            onValueChange={(value) => updateStream(stream.id, "accessibility", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select accessibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Secure">Secure</SelectItem>
                              <SelectItem value="Semi-Secure">Semi-Secure</SelectItem>
                              <SelectItem value="Restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea 
                            value={stream.useCase} 
                            onChange={(e) => updateStream(stream.id, "useCase", e.target.value)}
                            className="min-h-[60px] w-[140px]"
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.analyticRule1}
                            onValueChange={(value) => updateStream(stream.id, "analyticRule1", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select rule" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Person Detected">Person Detected</SelectItem>
                              <SelectItem value="Crowd Forming">Crowd Forming</SelectItem>
                              <SelectItem value="Loitering">Loitering</SelectItem>
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
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.analyticRule2}
                            onValueChange={(value) => updateStream(stream.id, "analyticRule2", value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select rule" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Person Detected">Person Detected</SelectItem>
                              <SelectItem value="Crowd Forming">Crowd Forming</SelectItem>
                              <SelectItem value="Loitering">Loitering</SelectItem>
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
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.schedule}
                            onValueChange={(value) => updateStream(stream.id, "schedule", value)}
                          >
                            <SelectTrigger className="w-[120px]">
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
                            value={stream.eventVolume} 
                            onChange={(e) => updateStream(stream.id, "eventVolume", parseInt(e.target.value))}
                            className="w-24"
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={stream.patrolType}
                            onValueChange={(value) => updateStream(stream.id, "patrolType", value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Enhanced">Enhanced</SelectItem>
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
                            autoComplete="off"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => addStream(stream)}
                              title="Duplicate stream"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => removeStream(stream.id)}
                              title="Remove stream"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 flex flex-col gap-4">
                <Button 
                  variant="secondary" 
                  className="w-full md:w-40"
                  onClick={() => addStream()}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Stream
                </Button>
                
                <Button 
                  className="w-full md:w-40"
                  onClick={calculatePrice}
                >
                  Calculate Price
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Assessment Tab Content */}
        <TabsContent value="site-assessment">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Site Assessment & Design</CardTitle>
              <CardDescription>Enter details about the site environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Auto-synced fields from Discovery tab */}
                <div className="space-y-2">
                  <Label htmlFor="saBdmOwner">BDM Owner</Label>
                  <Input 
                    id="saBdmOwner"
                    value={formData.bdmOwner}
                    onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saSalesEngineer">Sales Engineer</Label>
                  <Input 
                    id="saSalesEngineer"
                    value={formData.salesEngineer}
                    onChange={(e) => handleFormChange("salesEngineer", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saCustomerName">Customer Name</Label>
                  <Input 
                    id="saCustomerName"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange("customerName", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saSiteAddress">Site Address</Label>
                  <Input 
                    id="saSiteAddress"
                    value={formData.siteAddress}
                    onChange={(e) => handleFormChange("siteAddress", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saCityStateZip">City, State, Zip</Label>
                  <Input 
                    id="saCityStateZip"
                    value={formData.cityStateZip}
                    onChange={(e) => handleFormChange("cityStateZip", e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Environment & Lighting</CardTitle>
              <CardDescription>Document the site environment conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lightingRequirements">Lighting Requirements</Label>
                  <Select 
                    value={formData.lightingRequirements}
                    onValueChange={(value) => handleFormChange("lightingRequirements", value)}
                  >
                    <SelectTrigger id="lightingRequirements">
                      <SelectValue placeholder="Select lighting requirements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adequate">Adequate</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      <SelectItem value="Inadequate">Inadequate</SelectItem>
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
                      <SelectValue placeholder="Select field of view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clear">Clear</SelectItem>
                      <SelectItem value="Partial Obstruction">Partial Obstruction</SelectItem>
                      <SelectItem value="Heavy Obstruction">Heavy Obstruction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="networkConnectivity">Network & Connectivity</Label>
                  <Textarea 
                    id="networkConnectivity"
                    value={formData.networkConnectivity}
                    onChange={(e) => handleFormChange("networkConnectivity", e.target.value)}
                    rows={3}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Use Case Tab Content */}
        <TabsContent value="use-case">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Use Case Design & SOW</CardTitle>
              <CardDescription>Define the statement of work and use case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ucBdmOwner">BDM Owner</Label>
                  <Input 
                    id="ucBdmOwner"
                    value={formData.bdmOwner}
                    onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ucKvgSme">KVG SME</Label>
                  <Input 
                    id="ucKvgSme"
                    value={formData.kvgSme}
                    onChange={(e) => handleFormChange("kvgSme", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ucCustomerName">Customer Name</Label>
                  <Input 
                    id="ucCustomerName"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange("customerName", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ucCrmOpportunity">CRM Opportunity #</Label>
                  <Input 
                    id="ucCrmOpportunity"
                    value={formData.crmOpportunity}
                    onChange={(e) => handleFormChange("crmOpportunity", e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Use Case Commitment</CardTitle>
              <CardDescription>Define the detailed use case commitment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea 
                  id="useCaseCommitment"
                  placeholder="Enter Use Case commitment details"
                  value={formData.useCaseCommitment}
                  onChange={(e) => handleFormChange("useCaseCommitment", e.target.value)}
                  rows={4}
                  className="w-full"
                  autoComplete="off"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VOC Protocol Tab Content */}
        <TabsContent value="voc-protocol">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>VOC Protocol Configuration</CardTitle>
              <CardDescription>Configure Voice of Customer protocols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amName">AM Name</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="vocCustomerName">Customer Name</Label>
                  <Input 
                    id="vocCustomerName"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange("customerName", e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Escalation Process</CardTitle>
              <CardDescription>Define escalation procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="escalationProcess1">Escalation Process 1</Label>
                  <Textarea 
                    id="escalationProcess1"
                    value={formData.escalationProcess1}
                    onChange={(e) => handleFormChange("escalationProcess1", e.target.value)}
                    rows={3}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="escalationProcess2">Escalation Process 2</Label>
                  <Textarea 
                    id="escalationProcess2"
                    value={formData.escalationProcess2}
                    onChange={(e) => handleFormChange("escalationProcess2", e.target.value)}
                    rows={3}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="escalationProcess3">Escalation Process 3</Label>
                  <Textarea 
                    id="escalationProcess3"
                    value={formData.escalationProcess3}
                    onChange={(e) => handleFormChange("escalationProcess3", e.target.value)}
                    rows={3}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Deployment Tab Content */}
        <TabsContent value="deployment">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Project Deployment Planning</CardTitle>
              <CardDescription>Configure project deployment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pmName">PM Name</Label>
                  <Input 
                    id="pmName"
                    value={formData.pmName}
                    onChange={(e) => handleFormChange("pmName", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deployCustomerName">Customer Name</Label>
                  <Input 
                    id="deployCustomerName"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange("customerName", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deployCrmOpportunity">CRM Opportunity #</Label>
                  <Input 
                    id="deployCrmOpportunity"
                    value={formData.crmOpportunity}
                    onChange={(e) => handleFormChange("crmOpportunity", e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Equipment Configuration</CardTitle>
              <CardDescription>Verify equipment setup and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gatewayCredentials">Verified Gateway/Server Credentials</Label>
                  <Input 
                    id="gatewayCredentials"
                    value={formData.gatewayCredentials}
                    onChange={(e) => handleFormChange("gatewayCredentials", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streamNames">Verified Stream Names</Label>
                  <Input 
                    id="streamNames"
                    value={formData.streamNames}
                    onChange={(e) => handleFormChange("streamNames", e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="speakersWork">Verified Speakers Work</Label>
                  <Select 
                    value={formData.speakersWork}
                    onValueChange={(value) => handleFormChange("speakersWork", value)}
                  >
                    <SelectTrigger id="speakersWork">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Additional Services Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Additional Services</CardTitle>
          <CardDescription>Add additional services to this quote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vocEscalations">Additional VOC Escalations</Label>
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
              <Label htmlFor="dispatchResponses">Additional Dispatch Responses</Label>
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
              <Label htmlFor="gdodsPatrols">GDoDS-RSPD-OnDemand Patrols</Label>
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
              <Label htmlFor="sgppPatrols">SGPP-RSPD-Scheduled Patrols</Label>
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
              <Label htmlFor="appUsers"># Arm/Disarm App Users</Label>
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
              <Label htmlFor="audioDevices"># of Audio Devices</Label>
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
        </CardContent>
      </Card>
      
      {/* Calculate Quote Button */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={calculatePrice} 
          className="bg-orange-600 hover:bg-orange-700 px-8 py-6 text-lg"
        >
          Generate Quote
        </Button>
      </div>
    </div>
  );
};

export default KastleVideoGuardingPage;