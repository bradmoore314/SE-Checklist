import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ImageUploadSection from "@/components/ImageUploadSection";

interface LookupData {
  elevatorTypes?: string[];
}

interface AddElevatorModalProps {
  isOpen?: boolean;
  open?: boolean;
  projectId: number;
  onSave: (elevator: any) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

// Create schema based on shared schema but with validation
const elevatorSchema = z.object({
  project_id: z.number(),
  title: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  elevator_type: z.string().min(1, "Elevator type is required"),
  floor_count: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  notes: z.string().optional(),
  // Building information
  building_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  // Management company information
  management_company: z.string().optional(),
  management_contact_person: z.string().optional(),
  management_phone_number: z.string().optional(),
  // Elevator company information
  elevator_company: z.string().optional(),
  elevator_contact_person: z.string().optional(),
  elevator_phone_number: z.string().optional(),
  elevator_system_type: z.string().optional(),
  // Security configuration
  secured_floors: z.string().optional(),
  rear_hall_calls: z.boolean().optional().default(false),
  rear_hall_control: z.boolean().optional().default(false),
  // Reader specifications
  reader_type: z.string().optional(),
  reader_mounting_surface_ferrous: z.boolean().optional().default(false),
  flush_mount_required: z.boolean().optional().default(false),
  // Visitor processing
  visitor_processing: z.string().optional(),
  elevator_phones_for_visitors: z.boolean().optional().default(false),
  elevator_phone_type: z.string().optional(),
  engineer_override_key_switch: z.boolean().optional().default(false),
  // Freight car specifications
  freight_car_numbers: z.string().optional(),
  freight_car_in_group: z.boolean().optional().default(false),
  freight_secure_type: z.string().optional(),
  freight_car_home_floor: z.string().optional(),
  shutdown_freight_car: z.boolean().optional().default(false),
});

type ElevatorFormValues = z.infer<typeof elevatorSchema>;

export default function AddElevatorModal({
  isOpen,
  open,
  projectId,
  onSave,
  onClose,
  onCancel,
  onOpenChange,
}: AddElevatorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch lookup data for dropdowns
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery<LookupData>({
    queryKey: ["/api/lookup"],
  });
  
  // Helper function to safely access lookup data
  const getLookupOptions = (key: keyof LookupData) => {
    return lookupData && lookupData[key] ? lookupData[key] || [] : [];
  };

  // Initialize form with default values
  const form = useForm<ElevatorFormValues>({
    resolver: zodResolver(elevatorSchema),
    defaultValues: {
      project_id: projectId,
      title: "",
      location: "",
      elevator_type: "",
      floor_count: undefined,
      notes: "",
      // Building information
      building_number: "",
      address: "",
      city: "",
      // Management company information
      management_company: "",
      management_contact_person: "",
      management_phone_number: "",
      // Elevator company information
      elevator_company: "",
      elevator_contact_person: "",
      elevator_phone_number: "",
      elevator_system_type: "",
      // Security configuration
      secured_floors: "",
      rear_hall_calls: false,
      rear_hall_control: false,
      // Reader specifications
      reader_type: "",
      reader_mounting_surface_ferrous: false,
      flush_mount_required: false,
      // Visitor processing
      visitor_processing: "",
      elevator_phones_for_visitors: false,
      elevator_phone_type: "",
      engineer_override_key_switch: false,
      // Freight car specifications
      freight_car_numbers: "",
      freight_car_in_group: false,
      freight_secure_type: "",
      freight_car_home_floor: "",
      shutdown_freight_car: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: ElevatorFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/elevators", values);
      const elevator = await response.json();
      // Extract just the ID from the created elevator before passing it back
      onSave(elevator.id);
      console.log('Created elevator with ID:', elevator.id);
    } catch (error) {
      console.error("Failed to create elevator:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Elevator
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-primary">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Location *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="elevator_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Elevator Type *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Elevator Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLookups ? (
                            <SelectItem value="loading">Loading...</SelectItem>
                          ) : (
                            getLookupOptions("elevatorTypes").map((type: string) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Floor Count
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter floor count"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? value : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Building Information */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-blue-600">Building Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="building_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Building Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter building number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Management Company Information */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-purple-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-purple-600">Management Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="management_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Management Company
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter management company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="management_contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Contact Person
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="management_phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Elevator Company Information */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-green-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Elevator Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="elevator_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Elevator Company
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter elevator company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="elevator_contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Contact Person
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="elevator_phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="elevator_system_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Elevator System Type
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter system type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Security Configuration */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-amber-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-amber-600">Security Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="secured_floors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Secured Floors
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1,2,5-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reader_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Reader Type
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reader type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rear_hall_calls"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Rear Hall Calls</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rear_hall_control"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Rear Hall Control</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reader_mounting_surface_ferrous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Reader Mounting Surface Ferrous</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="flush_mount_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Flush Mount Required</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Visitor Processing */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-red-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Visitor Processing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitor_processing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Visitor Processing
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter visitor processing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="elevator_phone_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Elevator Phone Type
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="elevator_phones_for_visitors"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Elevator Phones for Visitors</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="engineer_override_key_switch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Engineer Override Key Switch</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Freight Car */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-cyan-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-cyan-600">Freight Car Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="freight_car_numbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Freight Car Numbers
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter car numbers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="freight_secure_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Freight Secure Type
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter secure type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="freight_car_home_floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Freight Car Home Floor
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter home floor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="freight_car_in_group"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Freight Car in Group?</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shutdown_freight_car"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Shutdown Freight Car?</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Notes */}
            <div className="border rounded-lg p-4 pb-5 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-primary">Notes</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Additional Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t border-neutral-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || onClose || (() => onOpenChange?.(false))}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {isSubmitting ? "Saving..." : "Save Elevator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
