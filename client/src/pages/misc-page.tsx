import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { CustomLabor, CustomPart } from "@shared/schema";
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
    category: string;
    name: string;
    unit: string;
    price: number;
  }

  // Sample incidental items
  const incidentalItems: IncidentalItem[] = [
    { id: 1, category: "Cables", name: "Cat6 Plenum Cable", unit: "ft", price: 0.85 },
    { id: 2, category: "Cables", name: "18/4 Conductor", unit: "ft", price: 0.65 },
    { id: 3, category: "Cables", name: "22/4 Conductor", unit: "ft", price: 0.45 },
    { id: 4, category: "Cables", name: "22/6 Conductor", unit: "ft", price: 0.55 },
    { id: 5, category: "Connectors", name: "RJ45 Connector", unit: "each", price: 1.25 },
    { id: 6, category: "Connectors", name: "BNC Connector", unit: "each", price: 2.50 },
    { id: 7, category: "Hardware", name: "Door Strike Mounting Plate", unit: "each", price: 15.00 },
    { id: 8, category: "Hardware", name: "Door Magnet Spacer", unit: "each", price: 8.00 },
    { id: 9, category: "Hardware", name: "Surface Mount Box", unit: "each", price: 12.99 },
    { id: 10, category: "Hardware", name: "Wall Mount Bracket", unit: "each", price: 18.50 },
    { id: 11, category: "Adapters", name: "Power Adapter 12V", unit: "each", price: 22.00 },
    { id: 12, category: "Adapters", name: "Power Adapter 24V", unit: "each", price: 28.00 },
    { id: 13, category: "Consumables", name: "Wire Nuts", unit: "pack", price: 5.99 },
    { id: 14, category: "Consumables", name: "Cable Ties", unit: "pack", price: 7.50 },
    { id: 15, category: "Consumables", name: "Electrical Tape", unit: "roll", price: 3.99 },
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
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Add to Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidentals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No matching incidental items found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIncidentals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.name}</TableCell>
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