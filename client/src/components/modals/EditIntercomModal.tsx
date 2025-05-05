import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the schema for the intercom form
const intercomSchema = z.object({
  location: z.string().min(1, "Location is required"),
  intercom_type: z.string().min(1, "Intercom type is required"),
  connection_type: z.string().min(1, "Connection type is required"),
  mounting_type: z.string().min(1, "Mounting type is required"),
  notes: z.string().optional(),
});

type IntercomFormValues = z.infer<typeof intercomSchema>;

interface Intercom {
  id: number;
  project_id: number;
  location: string;
  intercom_type: string;
  connection_type: string;
  mounting_type: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface EditIntercomModalProps {
  isOpen: boolean;
  intercom: Intercom;
  onClose: () => void;
  onSave: (id: number, data: Intercom) => void;
  fromFloorplan?: boolean;
  isNewIntercom?: boolean;
}

export default function EditIntercomModal({
  isOpen,
  intercom,
  onClose,
  onSave,
  fromFloorplan = false,
  isNewIntercom = false
}: EditIntercomModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with default values from the existing intercom
  const form = useForm<IntercomFormValues>({
    resolver: zodResolver(intercomSchema),
    defaultValues: {
      location: intercom.location,
      intercom_type: intercom.intercom_type,
      connection_type: intercom.connection_type,
      mounting_type: intercom.mounting_type,
      notes: intercom.notes || "",
    },
  });

  const onSubmit = async (values: IntercomFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If it's a new intercom, create it
      if (isNewIntercom) {
        const response = await apiRequest("POST", `/api/projects/${intercom.project_id}/intercoms`, values);
        const newIntercom = await response.json();
        
        // Invalidate intercoms query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${intercom.project_id}/intercoms`]
        });
        
        // Call onSave with the new intercom ID and data
        onSave(newIntercom.id, { ...newIntercom });
      } else {
        // Otherwise, update the existing intercom
        await apiRequest("PUT", `/api/intercoms/${intercom.id}`, values);
        
        // Invalidate intercoms query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${intercom.project_id}/intercoms`]
        });
        
        // Call onSave to refresh the parent component
        onSave(intercom.id, { ...intercom, ...values });
      }
    } catch (error) {
      console.error("Error saving intercom:", error);
      toast({
        title: "Error",
        description: "Failed to save intercom",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Intercom type options
  const intercomTypes = [
    "Aiphone",
    "2N",
    "Comelit",
    "ButterflyMX",
    "DoorKing",
    "Linear",
    "Viking",
    "Other"
  ];
  
  // Connection type options
  const connectionTypes = [
    "IP",
    "Analog",
    "Wireless",
    "Cellular",
    "SIP",
    "Other"
  ];
  
  // Mounting type options
  const mountingTypes = [
    "Wall",
    "Pedestal",
    "Surface",
    "Flush",
    "Recessed",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNewIntercom ? "Add Intercom" : "Edit Intercom"}</DialogTitle>
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
                    <Input placeholder="Enter location" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Intercom Type */}
            <FormField
              control={form.control}
              name="intercom_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intercom Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intercom type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intercomTypes.map((type) => (
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
            
            <div className="grid grid-cols-2 gap-4">
              {/* Connection Type */}
              <FormField
                control={form.control}
                name="connection_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connection type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {connectionTypes.map((type) => (
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
              
              {/* Mounting Type */}
              <FormField
                control={form.control}
                name="mounting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mounting Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mounting type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mountingTypes.map((type) => (
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
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional information"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submit/Cancel buttons */}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Intercom'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}