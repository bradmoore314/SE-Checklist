import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessPoint } from "@shared/schema";

// Define the access point form schema
const accessPointSchema = z.object({
  location: z.string().min(1, "Location is required"),
  reader_type: z.string().min(1, "Reader type is required"),
  lock_type: z.string().min(1, "Lock type is required"),
  monitoring_type: z.string().min(1, "Monitoring type is required"),
  lock_provider: z.string().optional().nullable(),
  takeover: z.string().optional().nullable(),
  interior_perimeter: z.string().optional().nullable(),
  // Hidden fields
  exst_panel_location: z.string().optional().nullable(),
  exst_panel_type: z.string().optional().nullable(),
  exst_reader_type: z.string().optional().nullable(),
  new_panel_location: z.string().optional().nullable(),
  new_panel_type: z.string().optional().nullable(),
  new_reader_type: z.string().optional().nullable(),
  noisy_prop: z.string().optional().nullable(),
  crashbars: z.string().optional().nullable(),
  real_lock_type: z.string().optional().nullable(),
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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  
  // Toggle the visibility of advanced fields
  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
  };
  
  // Fetch lookup data
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Set up form with default values from the existing access point
  const form = useForm<AccessPointFormValues>({
    resolver: zodResolver(accessPointSchema),
    defaultValues: {
      location: accessPoint.location,
      reader_type: accessPoint.reader_type,
      lock_type: accessPoint.lock_type,
      monitoring_type: accessPoint.monitoring_type,
      lock_provider: accessPoint.lock_provider,
      takeover: accessPoint.takeover || "No",
      interior_perimeter: accessPoint.interior_perimeter || "Interior",
      exst_panel_location: accessPoint.exst_panel_location || "",
      exst_panel_type: accessPoint.exst_panel_type || "",
      exst_reader_type: accessPoint.exst_reader_type || "",
      new_panel_location: accessPoint.new_panel_location || "",
      new_panel_type: accessPoint.new_panel_type || "",
      new_reader_type: accessPoint.new_reader_type || "",
      noisy_prop: accessPoint.noisy_prop || "No",
      crashbars: accessPoint.crashbars || "No",
      real_lock_type: accessPoint.real_lock_type || "Mortise",
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
            
            {/* Reader Type */}
            <FormField
              control={form.control}
              name="reader_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reader Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
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
                    defaultValue={field.value || ""}
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
            
            {/* Monitoring Type */}
            <FormField
              control={form.control}
              name="monitoring_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitoring Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select monitoring type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.monitoringTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Lock Provider */}
            <FormField
              control={form.control}
              name="lock_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lock Provider</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lock provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.lockProviderOptions?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Takeover */}
            <FormField
              control={form.control}
              name="takeover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Takeover?</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "No"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select takeover option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.takeoverOptions?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Interior/Perimeter */}
            <FormField
              control={form.control}
              name="interior_perimeter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interior/Perimeter</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "Interior"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interior/perimeter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.interiorPerimeterOptions?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Button to toggle advanced fields */}
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={toggleAdvancedFields}
                size="sm"
                className="mb-2"
              >
                {showAdvancedFields ? "Hide Advanced Fields" : "Show Advanced Fields"}
              </Button>
            </div>

            {/* Advanced fields section - hidden by default */}
            {showAdvancedFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-neutral-200 rounded-md mb-4">
                <FormField
                  control={form.control}
                  name="exst_panel_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exst. Panel Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing panel location" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exst_panel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exst. Panel Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing panel type" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exst_reader_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exst. Reader Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing reader type" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_panel_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Panel Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new panel location" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_panel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Panel Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new panel type" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_reader_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Reader Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new reader type" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noisy_prop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noisy Prop?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "No"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lookupData?.noisyPropOptions?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crashbars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crashbars?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "No"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lookupData?.crashbarsOptions?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="real_lock_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Real Lock Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "Mortise"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lookupData?.realLockTypeOptions?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter notes about this access point" 
                      {...field} 
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
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