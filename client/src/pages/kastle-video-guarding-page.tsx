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
import MainLayout from "@/layouts/MainLayout";
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

const KastleVideoGuardingPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-center mb-6">KVG Pricing App</h1>

        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="discovery" className="bg-green-600 data-[state=active]:bg-green-700">
              1. Discovery - BDM
            </TabsTrigger>
            <TabsTrigger value="site-assessment" className="bg-blue-600 data-[state=active]:bg-blue-700">
              2. Site Assessment - SE
            </TabsTrigger>
            <TabsTrigger value="use-case" className="bg-purple-600 data-[state=active]:bg-purple-700">
              3. Use Case - SOW - SME
            </TabsTrigger>
            <TabsTrigger value="voc-protocol" className="bg-orange-600 data-[state=active]:bg-orange-700">
              4. VOC Protocol - AM
            </TabsTrigger>
            <TabsTrigger value="deployment" className="bg-indigo-600 data-[state=active]:bg-indigo-700">
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
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stream #</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Monitored Area</TableHead>
                        <TableHead>Accessibility</TableHead>
                        <TableHead>Use Case</TableHead>
                        <TableHead>Analytic Rule 1</TableHead>
                        <TableHead>Dwell Time 1 (sec)</TableHead>
                        <TableHead>Analytic Rule 2</TableHead>
                        <TableHead>Dwell Time 2 (sec)</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Event Volume (events/mo)</TableHead>
                        <TableHead>Patrol Type</TableHead>
                        <TableHead>#Patrols/wk</TableHead>
                        <TableHead>Actions</TableHead>
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
                  <div className="space-y-2">
                    <Label htmlFor="lightingRequirements">Lighting Requirements</Label>
                    <Select defaultValue="Adequate">
                      <SelectTrigger id="lightingRequirements">
                        <SelectValue placeholder="Select lighting requirements" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adequate">Adequate</SelectItem>
                        <SelectItem value="Inadequate">Inadequate</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* More site assessment fields would be added here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Use Case Tab Content */}
          <TabsContent value="use-case">
            <Card>
              <CardHeader>
                <CardTitle>Use Case & Statement of Work</CardTitle>
                <CardDescription>Define the use case for KVG</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Use case fields would be added here */}
                  <p>Use case configuration fields will be added here based on your requirements.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOC Protocol Tab Content */}
          <TabsContent value="voc-protocol">
            <Card>
              <CardHeader>
                <CardTitle>VOC Protocol</CardTitle>
                <CardDescription>Voice of Customer protocol settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* VOC protocol fields would be added here */}
                  <p>VOC protocol configuration fields will be added here based on your requirements.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Deployment Tab Content */}
          <TabsContent value="deployment">
            <Card>
              <CardHeader>
                <CardTitle>Project Deployment</CardTitle>
                <CardDescription>Project deployment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Deployment fields would be added here */}
                  <p>Project deployment configuration fields will be added here based on your requirements.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default KastleVideoGuardingPage;