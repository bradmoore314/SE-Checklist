import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem as BaseFormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccessPoint } from "@shared/schema";
import ImageUploadSection from "@/components/ImageUploadSection";

// Create a custom FormItem with the form-item class for highlighting
const FormItem = ({ className, ...props }: React.ComponentProps<typeof BaseFormItem>) => (
  <BaseFormItem className={cn("form-item", className)} {...props} />
);

// Define the access point form schema
const accessPointSchema = z.object({
  location: z.string().min(1, "Location is required"),
  quick_config: z.string().min(1, "Quick config is required"), // Required legacy field
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
  onSave: (id: number, data: AccessPoint) => void;
  onClose: () => void;
  selectedField?: string | null;
  fromFloorplan?: boolean;
  isNewAccessPoint?: boolean;
}

export default function EditAccessPointModal({
  isOpen,
  accessPoint,
  onSave,
  onClose,
  selectedField,
  fromFloorplan = false,
  isNewAccessPoint = false
}: EditAccessPointModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const { toast } = useToast();
  
  // Use effect to focus on the selected field when the modal opens
  useEffect(() => {
    if (isOpen && selectedField) {
      // Check if the selected field is in the advanced fields section
      const isAdvancedField = [
        'exst_panel_location',
        'exst_panel_type',
        'exst_reader_type',
        'new_panel_location',
        'new_panel_type',
        'new_reader_type',
        'noisy_prop',
        'crashbars',
        'real_lock_type'
      ].includes(selectedField);
      
      // Show advanced fields if needed
      if (isAdvancedField) {
        setShowAdvancedFields(true);
      }
      
      // Set focus on the field (DOM elements will be available after a small delay)
      setTimeout(() => {
        // Try to find the field (input or select)
        const fieldElement = document.querySelector(`[name="${selectedField}"]`);
        if (fieldElement) {
          (fieldElement as HTMLElement).focus();
          
          // Find the parent FormItem to add a highlight effect
          const formItem = fieldElement.closest('[class*="form-item"]');
          if (formItem) {
            formItem.classList.add('highlight-field');
            
            // Remove the highlight after a few seconds
            setTimeout(() => {
              formItem.classList.remove('highlight-field');
            }, 3000);
          }
        }
      }, 100);
    }
  }, [isOpen, selectedField]);
  
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
      quick_config: accessPoint.quick_config || 'Standard', // Add required legacy field
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
    
    // Log form validation status to help debug issues
    console.log("Form validation state:", form.formState);
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
      
      // Create a list of validation errors to show in the toast
      const errorMessages = Object.entries(form.formState.errors)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join(', ');
      
      toast({
        title: "Validation Error",
        description: `Please fix the following issues: ${errorMessages}`,
        variant: "destructive",
      });
      
      setIsSubmitting(false);
      return;
    }
    
    try {
      let resultData;
      
      // If isNewAccessPoint is true, create a new access point
      // Otherwise, update the existing one
      if (isNewAccessPoint) {
        // Create a new access point
        console.log("Creating new access point with data:", {
          ...values,
          project_id: accessPoint.project_id,
        });
        
        const response = await apiRequest("POST", "/api/access-points", {
          ...values,
          project_id: accessPoint.project_id,
        });
        resultData = await response.json();
        
        toast({
          title: "Success",
          description: "Access point created successfully",
        });
      } else {
        // Update existing access point
        console.log("Updating access point with ID:", accessPoint.id);
        
        const response = await apiRequest("PUT", `/api/access-points/${accessPoint.id}`, values);
        resultData = await response.json();
        
        toast({
          title: "Success", 
          description: "Access point updated successfully",
        });
      }
      
      // Call onSave with the created/updated access point id and data
      onSave(resultData.id, resultData);
    } catch (error) {
      console.error("Error saving access point:", error);
      
      toast({
        title: "Error",
        description: "Failed to save access point. Please check all required fields.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Access Point</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden quick_config field - required legacy field */}
            <input type="hidden" {...form.register("quick_config")} />
            
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

            {/* Image Upload Section */}
            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-medium">Access Point Images</h3>
              <ImageUploadSection 
                projectId={accessPoint.project_id}
                equipmentId={accessPoint.id}
                equipmentType="access_point"
              />
            </div>

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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNewAccessPoint ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  isNewAccessPoint ? "Create Access Point" : "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}