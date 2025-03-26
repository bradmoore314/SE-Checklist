import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Elevator } from "@shared/schema";

// Define the elevator form schema
const elevatorSchema = z.object({
  location: z.string().min(1, "Location is required"),
  elevator_type: z.string().min(1, "Elevator type is required"),
  floor_count: z.string().optional().transform(value => {
    if (!value) return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }),
  notes: z.string().optional().nullable(),
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
      location: elevator.location,
      elevator_type: elevator.elevator_type,
      floor_count: elevator.floor_count || null,
      notes: elevator.notes || null,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Elevator</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Elevator Type */}
            <FormField
              control={form.control}
              name="elevator_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Elevator Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select elevator type" />
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
                </FormItem>
              )}
            />
            
            {/* Floor Count */}
            <FormField
              control={form.control}
              name="floor_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Count</FormLabel>
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
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any notes about this elevator" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
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