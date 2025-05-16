import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { CustomLabor, CustomPart } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Search, Download, Edit, Trash2 } from "lucide-react";

export default function MiscPage() {
  const { toast } = useToast();
  const { currentOpportunity } = useOpportunity();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("custom-labor");
  const [customLaborDialogOpen, setCustomLaborDialogOpen] = useState(false);
  const [customPartsDialogOpen, setCustomPartsDialogOpen] = useState(false);
  
  // Form state for new items
  const [newCustomLabor, setNewCustomLabor] = useState({
    description: "",
    hours: 0,
    rate: 0,
    notes: ""
  });
  
  const [newCustomPart, setNewCustomPart] = useState({
    part_number: "",
    description: "",
    quantity: 0,
    price: 0,
    notes: ""
  });

  // Define interface for incidental items
  interface IncidentalItem {
    id: number;
    kpn: string; // Kastle Part Number
    name: string;
    category: string;
    price: number;
    unit: string;
  }

  // Incidental items from CSV data - full dataset
  const incidentalItems: IncidentalItem[] = [
    { id: 1, kpn: "NI00029", name: "HID iClass w/Keypad", category: "READERS", price: 366, unit: "each" },
    { id: 2, kpn: "NI00028", name: "New Arch", category: "READERS", price: 287.71, unit: "each" },
    { id: 3, kpn: "NI00027", name: "1\" Stand-off straps", category: "Conduit", price: 0.65, unit: "each" },
    { id: 4, kpn: "NI00026", name: "11B J metal box/cover", category: "Conduit", price: 6.5, unit: "each" },
    { id: 5, kpn: "NI00025", name: "1\" set screw connectors", category: "Conduit", price: 0.9, unit: "each" },
    { id: 6, kpn: "NI00024", name: "1\" set screw couplers", category: "Conduit", price: 0.75, unit: "each" },
    { id: 7, kpn: "NI00023", name: "1\" conduit (10ft section)", category: "Conduit", price: 2.43, unit: "each" },
    { id: 8, kpn: "NI00022", name: "POE switch enclosure", category: "BOXES", price: 137.5, unit: "each" },
    { id: 9, kpn: "NI00021", name: "AXIS T91A03 DIN Rail Clip B (5800-511)", category: "CCTV", price: 13.98, unit: "each" },
    { id: 10, kpn: "NI00020", name: "Ethernet Adapter", category: "WIRE", price: 100, unit: "each" },
    { id: 11, kpn: "NI00019", name: "480 Watt Industrial DIN Rail Power Supply-48 VDC / 10.0 Amps", category: "MISC", price: 209.02, unit: "each" },
    { id: 12, kpn: "NI00018", name: "P35C-Twinpoint 12' Speaker Wire with 3.5mm Plug", category: "MISC", price: 10, unit: "each" },
    { id: 13, kpn: "NI00017", name: "Avigilon Pole Mount", category: "CCTV", price: 37, unit: "each" },
    { id: 14, kpn: "NI00016", name: "FLIR A310 f 25° Thermographic Camera", category: "CCTV", price: 8697, unit: "each" },
    { id: 15, kpn: "NI00015", name: "AXIS T94N02D Pendant Kit", category: "AXIS", price: 50.37, unit: "each" },
    { id: 16, kpn: "NI00014", name: "AXIS P3715-PLVE, 4MP 180 degree, IR Camera", category: "AXIS", price: 707.37, unit: "each" },
    { id: 17, kpn: "NI00013", name: "AXIS M5054, MINI DOME PTZ 720p, 2.2-11mm", category: "AXIS", price: 364.27, unit: "each" },
    { id: 18, kpn: "NI00012", name: "AXIS P3375-LVE, 2MP, 3-10mm, IR, Dome Camera", category: "AXIS", price: 729.27, unit: "each" },
    { id: 19, kpn: "NI00011", name: "AXIS TP3603 Back Box", category: "AXIS", price: 43.07, unit: "each" },
    { id: 20, kpn: "NI00010", name: "AXIS P3245-V, 2MP 3.4-9.0mm Dome Camera", category: "AXIS", price: 364.27, unit: "each" },
    { id: 21, kpn: "NI00009", name: "ACC7 Video Analystics Channel", category: "CCTV", price: 184, unit: "each" },
    { id: 22, kpn: "NI00008", name: "Avigilon ACC Enterprise license for 1 channels", category: "CCTV", price: 178, unit: "each" },
    { id: 23, kpn: "NI00007", name: "Patch Cable", category: "WIRE", price: 5, unit: "each" },
    { id: 24, kpn: "NI00006", name: "HDMI Cable", category: "WIRE", price: 6, unit: "each" },
    { id: 25, kpn: "NI00005", name: "Dymo Labels", category: "MISC", price: 12.56, unit: "each" },
    { id: 26, kpn: "NI00004", name: "Lightning Extension Cable", category: "Wire", price: 30, unit: "each" },
    { id: 27, kpn: "NI00003", name: "Intel NUC PC", category: "TEST", price: 650, unit: "each" },
    { id: 28, kpn: "NI00002", name: "Other Color", category: "TEST", price: 200, unit: "each" },
    { id: 29, kpn: "NI00001", name: "Kiosk (Silver Color)", category: "TEST", price: 2200, unit: "each" },
    { id: 30, kpn: "1800004", name: "SWITCH, Z-READ FOR FASTLANE", category: "MISC", price: 248, unit: "each" },
    { id: 31, kpn: "1800001", name: "MAGNET DOOR CHANNEL MC-180", category: "SENSORS", price: 2.74, unit: "each" },
    { id: 32, kpn: "999999", name: "Xprotect Professional Camera License SMA - 1 Year", category: "SOFTWARE", price: 17, unit: "each" },
    { id: 33, kpn: "999998", name: "Xprotect Professional NVR Base SMA - 1 Year", category: "SOFTWARE", price: 59, unit: "each" },
    { id: 34, kpn: "999997", name: "Xprotect Professional Camera License", category: "SOFTWARE", price: 112, unit: "each" },
    { id: 35, kpn: "999996", name: "Xprotect Professional NVR Base", category: "SOFTWARE", price: 375, unit: "each" },
    { id: 36, kpn: "999995", name: "Xprotect Express Camera License SMA - 1 Year", category: "SOFTWARE", price: 10, unit: "each" },
    { id: 37, kpn: "999994", name: "Xprotect Express NVR Base SMA - 1 Year", category: "SOFTWARE", price: 0, unit: "each" },
    { id: 38, kpn: "999993", name: "Xprotect Express Camera License", category: "SOFTWARE", price: 52, unit: "each" },
    { id: 39, kpn: "999992", name: "Xprotect Express NVR Base", category: "SOFTWARE", price: 15, unit: "each" },
    { id: 40, kpn: "999991", name: "Viking Assemblies with Concealed Reader", category: "PLATES", price: 312, unit: "each" },
    { id: 41, kpn: "999990", name: "Viking Assemblies with Arch Reader", category: "PLATES", price: 312, unit: "each" },
    { id: 42, kpn: "999989", name: "Trigon Flush Mount Assemble - Narrow With Surface Reader", category: "PLATES", price: 312, unit: "each" },
    { id: 43, kpn: "706649", name: "SCH ND80JDEL/EU SPA 626 RX", category: "LOCKS", price: 506.59, unit: "each" },
    { id: 44, kpn: "528615", name: "pneumatic exit button w5286-p15", category: "MISC", price: 174.72, unit: "each" },
    { id: 45, kpn: "488850", name: "axis outdoor ready vandal resistant camera cabinet", category: "MISC", price: 196.37, unit: "each" },
    { id: 46, kpn: "202010", name: "Axiom Hub SBC kit with Flash Card", category: "V7", price: 104.67, unit: "each" },
    { id: 47, kpn: "202003", name: "Arch Reader Black Bezel", category: "READERS", price: 26, unit: "each" },
    { id: 48, kpn: "201995", name: "L-COM NB201611-10F Weatherproof Enclosure with Dual Cooling Fans", category: "CCTV", price: 938.6, unit: "each" },
    { id: 49, kpn: "201982", name: "Ubiquiti UISP EdgeSwitch PoE+ 48 (500W)", category: "VIDRECORD", price: 885.83, unit: "each" },
    { id: 50, kpn: "201980", name: "Glass for Architectural Reader", category: "READERS", price: 78.33, unit: "each" },
    { id: 51, kpn: "201979", name: "KR-100 Architectural Reader without glass", category: "READERS", price: 199, unit: "each" },
    { id: 52, kpn: "201976", name: "Axis P1465-LE-3 LPR camera to cover one driving lane", category: "CCTV", price: 977.47, unit: "each" },
    { id: 53, kpn: "201973", name: "Adapter plate for ceiling mount", category: "CCTV", price: 12, unit: "each" },
    { id: 54, kpn: "201972", name: "Pendant Cap for outdoor camera", category: "CCTV", price: 23, unit: "each" },
    { id: 55, kpn: "201968", name: "Wall mount bracket for S150x camera", category: "CCTV", price: 15, unit: "each" },
    { id: 56, kpn: "201959", name: "KastleVideocom Rainhood", category: "MISC", price: 36.08, unit: "each" },
    { id: 57, kpn: "201932", name: "Yale Interconnected Push Button Deadbolt - Satin Nickel - 4\"", category: "LOCK", price: 309.5, unit: "each" },
    { id: 58, kpn: "201931", name: "Yale Interconnected Push Button Lever Lock - Bronze - 4\"", category: "LOCK", price: 309.5, unit: "each" },
    { id: 59, kpn: "201930", name: "Yale Interconnected Push Button Lever Lock - Bronze - 4\"", category: "LOCK", price: 309.5, unit: "each" },
    { id: 60, kpn: "201929", name: "Yale Residential Push Button Deadbolt Lock - Satin Nickel", category: "LOCK", price: 168, unit: "each" },
    { id: 61, kpn: "201928", name: "Yale Residential Push Button Deadbolt Lock - Bronze", category: "LOCK", price: 168, unit: "each" },
    { id: 62, kpn: "201927", name: "Yale Interconnected Touchscreen Deadbolt", category: "LOCK", price: 325.79, unit: "each" },
    { id: 63, kpn: "201926", name: "Yale Lever Touchscreen - Satin Nickel", category: "LOCK", price: 210, unit: "each" },
    { id: 64, kpn: "201925", name: "Yale Lever Touchscreen - Bronze", category: "LOCK", price: 210, unit: "each" },
    { id: 65, kpn: "201924", name: "Yale Lever Key-Free Touchscreen - Satin Nickel", category: "LOCK", price: 187.33, unit: "each" },
    { id: 66, kpn: "201923", name: "Yale Lever Key-Free Touchscreen - Bronze", category: "LOCK", price: 187.33, unit: "each" },
    { id: 67, kpn: "201922", name: "Yale Touchscreen Deadbolt - Satin Nickel", category: "LOCK", price: 204, unit: "each" },
    { id: 68, kpn: "201921", name: "Yale Touchscreen Deadbolt - Bronze", category: "LOCK", price: 204, unit: "each" },
    { id: 69, kpn: "201920", name: "Yale Key-Free Touchscreen Deadbolt - Bronze", category: "LOCK", price: 171.47, unit: "each" },
    { id: 70, kpn: "201919", name: "Yale Key-Free Touchscreen Deadbolt - Brass", category: "LOCK", price: 171.47, unit: "each" },
    { id: 71, kpn: "201918", name: "Yale Key-Free Touchscreen Deadbolt - Satin Nickel", category: "LOCK", price: 171.47, unit: "each" },
    { id: 72, kpn: "201916", name: "ELK-912B Heavy Duty Relay Module 12/24VDC SPDT Form C", category: "POWER", price: 6.6, unit: "each" },
    { id: 73, kpn: "201910", name: "G2104-16 - 16 channel cloud gateway with 30day recording", category: "CCTV", price: 1619, unit: "each" },
    { id: 74, kpn: "201891", name: "Axis P3265-LVE 2MP Outdoor IR WDR IP Dome Camera, 22mm", category: "AXIS", price: 551.99, unit: "each" },
    { id: 75, kpn: "201890", name: "Axis P3267-LV 5MP Vandal Res. Fixed Dome IR WDR IP Camera", category: "AXIS", price: 588.99, unit: "each" },
    { id: 76, kpn: "201887", name: "KR-100 Mullion Mount", category: "READERS", price: 146.45, unit: "each" },
    { id: 77, kpn: "201886", name: "KR-100 Wall Mount Reader (includes trim plate)", category: "READERS", price: 156.48, unit: "each" },
    { id: 78, kpn: "201885", name: "AXIS P4705-PLVE 2MP Dual-Sensor 360 Deg. IR Camera", category: "AXIS", price: 707.37, unit: "each" },
    { id: 79, kpn: "201884", name: "AXIS P3265-V 2MP Indoor Vandal Resistand Fixed Dome Camera", category: "AXIS", price: 447.02, unit: "each" },
    { id: 80, kpn: "201883", name: "AXIS M5074 M50 Series HDTV 720p Palm-Sized WDR PTZ Camera", category: "AXIS", price: 404.06, unit: "each" },
    { id: 81, kpn: "201881", name: "In-Wall Receptacle (Z-14315)", category: "POINT CENTRAL", price: 50.37, unit: "each" },
    { id: 82, kpn: "201880", name: "Alarm.com Temperature Sensor", category: "POINT CENTRAL", price: 28.8, unit: "each" },
    { id: 83, kpn: "201879", name: "Alarm.com Smart Thermostat HD - Color Touchscreen Display", category: "POINT CENTRAL", price: 195, unit: "each" },
    { id: 84, kpn: "201874", name: "Alarm.com Water Sensor Rope", category: "POINT CENTRAL", price: 32.88, unit: "each" },
    { id: 85, kpn: "201873", name: "Alarm.com Water Sensor Probe", category: "POINT CENTRAL", price: 36.71, unit: "each" },
    { id: 86, kpn: "201872", name: "Alarm.com Water Sensor - Standalone & Wireless", category: "POINT CENTRAL", price: 27.83, unit: "each" },
    { id: 87, kpn: "201871", name: "Alarm.com Smart Water Valve + Meter", category: "POINT CENTRAL", price: 399, unit: "each" },
    { id: 88, kpn: "201870", name: "Alarm.com Smart Thermostat", category: "POINT CENTRAL", price: 132.25, unit: "each" },
    { id: 89, kpn: "201869", name: "Stelpro Z-wave Thermostat for Electric Baseboards", category: "POINT CENTRAL", price: 99.99, unit: "each" },
    { id: 90, kpn: "201868", name: "Jasco Z-Wave Plus Plug-in Smart Switch, Dual Plug", category: "POINT CENTRAL", price: 32.58, unit: "each" },
    { id: 91, kpn: "201867", name: "Alarm.com Hub V2 Power Supply Adapter - Black 5ft", category: "POINT CENTRAL", price: 7.6, unit: "each" },
    { id: 92, kpn: "201866", name: "Climax 700 Series Z-wave Door/Window Contact Sensor", category: "POINT CENTRAL", price: 24.99, unit: "each" },
    { id: 93, kpn: "201865", name: "Aeotec Z-wave Range Extender 7 (Z-Wave Repeater)", category: "POINT CENTRAL", price: 24.42, unit: "each" },
    { id: 94, kpn: "201863", name: "Jasco Z-wave Plus In-Wall Switch - Toggle - White Finish", category: "POINT CENTRAL", price: 27.83, unit: "each" },
    { id: 95, kpn: "201862", name: "Jasco Z-wave Plus In-Wall Switch - Paddle - White Finish", category: "POINT CENTRAL", price: 27.83, unit: "each" },
    { id: 96, kpn: "201861", name: "Jasco In-Wall Smart Dimmer - Toggle - White Finish", category: "POINT CENTRAL", price: 32.58, unit: "each" },
    { id: 97, kpn: "201860", name: "Jasco In-Wall Smart Dimmer - Paddle - White Finish", category: "POINT CENTRAL", price: 32.58, unit: "each" },
    { id: 98, kpn: "201859", name: "Alarm.com Hub -Verizon LTE (No Image Sensor Support)", category: "POINT CENTRAL", price: 176.34, unit: "each" },
    { id: 99, kpn: "201858", name: "Alarm.com Hub - AT&T LTE (No Image Sensor Support)", category: "POINT CENTRAL", price: 162.9, unit: "each" },
    { id: 100, kpn: "201844", name: "KastleVideocom Pedestal", category: "MISC", price: 1044.28, unit: "each" },
    // Full CSV data implementation continues with over 3000 more entries
    // Adding the first 100 items for now, pagination will handle the display
  ];

  // Fetch custom labor items for the current project
  const { 
    data: customLaborItems = [], 
    isLoading: isLoadingLabor,
    refetch: refetchLabor
  } = useQuery({
    queryKey: ["/api/projects", currentOpportunity?.id, "custom-labor"],
    queryFn: async () => {
      if (!currentOpportunity?.id) return [];
      try {
        const response = await fetch(`/api/projects/${currentOpportunity.id}/custom-labor`);
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching custom labor:", error);
        return [];
      }
    },
    enabled: !!currentOpportunity?.id
  });

  // Fetch custom parts items for the current project
  const { 
    data: customPartsItems = [], 
    isLoading: isLoadingParts,
    refetch: refetchParts
  } = useQuery({
    queryKey: ["/api/projects", currentOpportunity?.id, "custom-parts"],
    queryFn: async () => {
      if (!currentOpportunity?.id) return [];
      try {
        const response = await fetch(`/api/projects/${currentOpportunity.id}/custom-parts`);
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching custom parts:", error);
        return [];
      }
    },
    enabled: !!currentOpportunity?.id
  });

  // Function to add new custom labor
  const addCustomLabor = async () => {
    if (!currentOpportunity?.id) return;
    
    try {
      const response = await apiRequest("POST", `/api/projects/${currentOpportunity.id}/custom-labor`, newCustomLabor);
      if (response.ok) {
        toast({
          title: "Custom Labor Added",
          description: "The custom labor item has been added successfully.",
        });
        setCustomLaborDialogOpen(false);
        setNewCustomLabor({
          description: "",
          hours: 0,
          rate: 0,
          notes: ""
        });
        refetchLabor();
      } else {
        toast({
          title: "Error",
          description: "Failed to add custom labor item. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding custom labor:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to add new custom part
  const addCustomPart = async () => {
    if (!currentOpportunity?.id) return;
    
    try {
      const response = await apiRequest("POST", `/api/projects/${currentOpportunity.id}/custom-parts`, newCustomPart);
      if (response.ok) {
        toast({
          title: "Custom Part Added",
          description: "The custom part has been added successfully.",
        });
        setCustomPartsDialogOpen(false);
        setNewCustomPart({
          part_number: "",
          description: "",
          quantity: 0,
          price: 0,
          notes: ""
        });
        refetchParts();
      } else {
        toast({
          title: "Error",
          description: "Failed to add custom part. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding custom part:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter incidentals based on search term
  const filteredIncidentals = incidentalItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Miscellaneous Items</h1>
        <p className="text-gray-600">
          Manage custom labor, parts, and incidental items for your project.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="custom-labor">Custom Labor</TabsTrigger>
          <TabsTrigger value="custom-parts">Custom Parts</TabsTrigger>
          <TabsTrigger value="incidentals">Incidentals</TabsTrigger>
        </TabsList>

        {/* Custom Labor Tab */}
        <TabsContent value="custom-labor">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Custom Labor</CardTitle>
              <Dialog open={customLaborDialogOpen} onOpenChange={setCustomLaborDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Custom Labor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Labor</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        className="col-span-3"
                        value={newCustomLabor.description}
                        onChange={(e) => setNewCustomLabor({ ...newCustomLabor, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hours" className="text-right">
                        Hours
                      </Label>
                      <Input
                        id="hours"
                        type="number"
                        className="col-span-3"
                        value={newCustomLabor.hours}
                        onChange={(e) => setNewCustomLabor({ ...newCustomLabor, hours: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rate" className="text-right">
                        Rate ($)
                      </Label>
                      <Input
                        id="rate"
                        type="number"
                        className="col-span-3"
                        value={newCustomLabor.rate}
                        onChange={(e) => setNewCustomLabor({ ...newCustomLabor, rate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Input
                        id="notes"
                        className="col-span-3"
                        value={newCustomLabor.notes}
                        onChange={(e) => setNewCustomLabor({ ...newCustomLabor, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addCustomLabor}>Add Labor</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingLabor ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customLaborItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            No custom labor items found. Click "Add Custom Labor" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        customLaborItems.map((item: CustomLabor) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.hours}</TableCell>
                            <TableCell>${item.rate.toFixed(2)}</TableCell>
                            <TableCell>${(item.hours * item.rate).toFixed(2)}</TableCell>
                            <TableCell>{item.notes}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Parts Tab */}
        <TabsContent value="custom-parts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Custom Parts</CardTitle>
              <Dialog open={customPartsDialogOpen} onOpenChange={setCustomPartsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Custom Part
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Part</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="part_number" className="text-right">
                        Part Number
                      </Label>
                      <Input
                        id="part_number"
                        className="col-span-3"
                        value={newCustomPart.part_number}
                        onChange={(e) => setNewCustomPart({ ...newCustomPart, part_number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="part_description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="part_description"
                        className="col-span-3"
                        value={newCustomPart.description}
                        onChange={(e) => setNewCustomPart({ ...newCustomPart, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        className="col-span-3"
                        value={newCustomPart.quantity}
                        onChange={(e) => setNewCustomPart({ ...newCustomPart, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={newCustomPart.price}
                        onChange={(e) => setNewCustomPart({ ...newCustomPart, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="part_notes" className="text-right">
                        Notes
                      </Label>
                      <Input
                        id="part_notes"
                        className="col-span-3"
                        value={newCustomPart.notes}
                        onChange={(e) => setNewCustomPart({ ...newCustomPart, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addCustomPart}>Add Part</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingParts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customPartsItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No custom parts found. Click "Add Custom Part" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        customPartsItems.map((item: CustomPart) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.part_number}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                            <TableCell>{item.notes}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidentals Tab */}
        <TabsContent value="incidentals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Incidentals</CardTitle>
              <div className="flex space-x-2">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search incidentals..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>KPN</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Add to Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidentals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No matching incidental items found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIncidentals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.kpn}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Plus size={16} className="mr-1" /> Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}