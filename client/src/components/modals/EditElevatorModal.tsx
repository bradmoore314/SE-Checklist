import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Elevator } from "@shared/schema";

// Define the elevator form schema
const elevatorSchema = z.object({
  title: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  elevator_type: z.string().min(1, "Elevator type is required"),
  floor_count: z.string().optional().transform(value => {
    if (!value) return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }),
  notes: z.string().optional().nullable(),
  // Building information
  building_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  // Management company information
  management_company: z.string().optional().nullable(),
  management_contact_person: z.string().optional().nullable(),
  management_phone_number: z.string().optional().nullable(),
  // Elevator company information
  elevator_company: z.string().optional().nullable(),
  elevator_contact_person: z.string().optional().nullable(),
  elevator_phone_number: z.string().optional().nullable(),
  elevator_system_type: z.string().optional().nullable(),
  // Security configuration
  secured_floors: z.string().optional().nullable(),
  rear_hall_calls: z.boolean().optional().default(false),
  rear_hall_control: z.boolean().optional().default(false),
  // Reader specifications
  reader_type: z.string().optional().nullable(),
  reader_mounting_surface_ferrous: z.boolean().optional().default(false),
  flush_mount_required: z.boolean().optional().default(false),
  // Visitor processing
  visitor_processing: z.string().optional().nullable(),
  elevator_phones_for_visitors: z.boolean().optional().default(false),
  elevator_phone_type: z.string().optional().nullable(),
  engineer_override_key_switch: z.boolean().optional().default(false),
  // Freight car specifications
  freight_car_numbers: z.string().optional().nullable(),
  freight_car_in_group: z.boolean().optional().default(false),
  freight_secure_type: z.string().optional().nullable(),
  freight_car_home_floor: z.string().optional().nullable(),
  shutdown_freight_car: z.boolean().optional().default(false),
});

type ElevatorFormValues = z.infer<typeof elevatorSchema>;

interface EditElevatorModalProps {
  isOpen: boolean;
  elevator: Elevator;
  onSave: () => void;
  onClose: () => void;
}

export default function EditElevatorModal({
  isOpen,
  elevator,
  onSave,
  onClose
}: EditElevatorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch lookup data
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Set up form with default values from the existing elevator
  const form = useForm<ElevatorFormValues>({
    resolver: zodResolver(elevatorSchema),
    defaultValues: {
      title: elevator.title || "",
      location: elevator.location,
      elevator_type: elevator.elevator_type,
      floor_count: elevator.floor_count || null,
      notes: elevator.notes || null,
      // Building information
      building_number: elevator.building_number || "",
      address: elevator.address || "",
      city: elevator.city || "",
      // Management company information
      management_company: elevator.management_company || "",
      management_contact_person: elevator.management_contact_person || "",
      management_phone_number: elevator.management_phone_number || "",
      // Elevator company information
      elevator_company: elevator.elevator_company || "",
      elevator_contact_person: elevator.elevator_contact_person || "",
      elevator_phone_number: elevator.elevator_phone_number || "",
      elevator_system_type: elevator.elevator_system_type || "",
      // Security configuration
      secured_floors: elevator.secured_floors || "",
      rear_hall_calls: elevator.rear_hall_calls || false,
      rear_hall_control: elevator.rear_hall_control || false,
      // Reader specifications
      reader_type: elevator.reader_type || "",
      reader_mounting_surface_ferrous: elevator.reader_mounting_surface_ferrous || false,
      flush_mount_required: elevator.flush_mount_required || false,
      // Visitor processing
      visitor_processing: elevator.visitor_processing || "",
      elevator_phones_for_visitors: elevator.elevator_phones_for_visitors || false,
      elevator_phone_type: elevator.elevator_phone_type || "",
      engineer_override_key_switch: elevator.engineer_override_key_switch || false,
      // Freight car specifications
      freight_car_numbers: elevator.freight_car_numbers || "",
      freight_car_in_group: elevator.freight_car_in_group || false,
      freight_secure_type: elevator.freight_secure_type || "",
      freight_car_home_floor: elevator.freight_car_home_floor || "",
      shutdown_freight_car: elevator.shutdown_freight_car || false,
    },
  });

  const onSubmit = async (values: ElevatorFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("PUT", `/api/elevators/${elevator.id}`, values);
      
      // Call onSave to refresh the parent component
      onSave();
    } catch (error) {
      console.error("Error updating elevator:", error);
      // Here you could handle errors, show a notification, etc.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Edit Elevator
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            
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
                          {lookupData?.elevatorTypes?.map((type: string) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                          {lookupData?.turnstileTypes?.map((type: string) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
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
                            field.onChange(value ? parseInt(value, 10) : null);
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
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}