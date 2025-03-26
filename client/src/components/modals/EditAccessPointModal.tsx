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
import { AccessPoint } from "@shared/schema";

// Define the access point form schema
const accessPointSchema = z.object({
  location: z.string().min(1, "Location is required"),
  door_type: z.string().min(1, "Door type is required"),
  reader_type: z.string().min(1, "Reader type is required"),
  lock_type: z.string().min(1, "Lock type is required"),
  security_level: z.string().min(1, "Security level is required"),
  ppi: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type AccessPointFormValues = z.infer<typeof accessPointSchema>;

interface EditAccessPointModalProps {
  isOpen: boolean;
  accessPoint: AccessPoint;
  onSave: () => void;
  onClose: () => void;
}

export default function EditAccessPointModal({
  isOpen,
  accessPoint,
  onSave,
  onClose
}: EditAccessPointModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch lookup data
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Set up form with default values from the existing access point
  const form = useForm<AccessPointFormValues>({
    resolver: zodResolver(accessPointSchema),
    defaultValues: {
      location: accessPoint.location,
      door_type: accessPoint.door_type,
      reader_type: accessPoint.reader_type,
      lock_type: accessPoint.lock_type,
      security_level: accessPoint.security_level,
      ppi: accessPoint.ppi,
      notes: accessPoint.notes,
    },
  });

  const onSubmit = async (values: AccessPointFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("PUT", `/api/access-points/${accessPoint.id}`, values);
      
      // Call onSave to refresh the parent component
      onSave();
    } catch (error) {
      console.error("Error updating access point:", error);
      // Here you could handle errors, show a notification, etc.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Access Point</DialogTitle>
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
            
            {/* Door Type */}
            <FormField
              control={form.control}
              name="door_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Door Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select door type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.doorTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Reader Type */}
            <FormField
              control={form.control}
              name="reader_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reader Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reader type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.readerTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Lock Type */}
            <FormField
              control={form.control}
              name="lock_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lock Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lock type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.lockTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Security Level */}
            <FormField
              control={form.control}
              name="security_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Level *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.securityLevels?.map((level: string) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* PPI */}
            <FormField
              control={form.control}
              name="ppi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PPI</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PPI option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {lookupData?.ppiOptions?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter any notes about this access point" 
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