import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem as BaseFormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Create a custom FormItem with the form-item class for highlighting
const FormItem = ({ className, ...props }: React.ComponentProps<typeof BaseFormItem>) => (
  <BaseFormItem className={cn("form-item", className)} {...props} />
);

// Define the access point form schema
const accessPointSchema = z.object({
  project_id: z.number(),
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

interface AddAccessPointModalProps {
  isOpen?: boolean;
  open?: boolean;
  projectId: number;
  onSave: (accessPoint: any) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function AddAccessPointModal({
  isOpen,
  open,
  projectId,
  onSave,
  onClose,
  onCancel,
  onOpenChange,
}: AddAccessPointModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const { toast } = useToast();

  // Toggle the visibility of advanced fields
  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
  };

  // Fetch lookup data
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Initialize form with default values
  const form = useForm<AccessPointFormValues>({
    resolver: zodResolver(accessPointSchema),
    defaultValues: {
      project_id: projectId,
      location: "",
      quick_config: "Standard", // Legacy field required for database compatibility - set a valid default
      reader_type: "KR-100", // Set default reader type
      lock_type: "Standard", // Set default lock type
      monitoring_type: "Prop", // Set default monitoring type to match Edit form
      lock_provider: "Kastle", // Set default lock provider
      takeover: "No",
      interior_perimeter: "Interior",
      exst_panel_location: "",
      exst_panel_type: "",
      exst_reader_type: "",
      new_panel_location: "",
      new_panel_type: "",
      new_reader_type: "",
      noisy_prop: "No",
      crashbars: "No",
      real_lock_type: "Mortise",
      notes: "",
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
      // Create a new access point
      console.log("Creating new access point with data:", values);
      
      const response = await apiRequest("POST", "/api/access-points", values);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(errorData?.message || 'Failed to create access point');
      }
      
      const accessPoint = await response.json();
      console.log('Created access point with ID:', accessPoint.id);
      
      toast({
        title: "Success",
        description: "Access point created successfully",
      });
      
      onSave(accessPoint);
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
    <Dialog open={open || isOpen} onOpenChange={(open) => !open && (onClose || onCancel)()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Access Point</DialogTitle>
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
                  <FormMessage />
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
              <div className="space-y-4 border rounded-md p-4 border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-medium">Advanced Configuration</h3>
                
                {/* Existing Panel Fields */}
                <div>
                  <h4 className="text-xs font-medium mb-2 text-neutral-600">Existing Panel Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="exst_panel_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Existing Panel Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="exst_panel_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Existing Panel Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter type" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="exst_reader_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Existing Reader Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter type" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* New Panel Fields */}
                <div>
                  <h4 className="text-xs font-medium mb-2 text-neutral-600">New Panel Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="new_panel_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">New Panel Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="new_panel_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">New Panel Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter type" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="new_reader_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">New Reader Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter type" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Additional Fields */}
                <div>
                  <h4 className="text-xs font-medium mb-2 text-neutral-600">Additional Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="noisy_prop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Noisy Prop?</FormLabel>
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
                          <FormLabel className="text-xs">Crashbars?</FormLabel>
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
                          <FormLabel className="text-xs">Actual Lock Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || "Mortise"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lock type" />
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
                </div>
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
                      placeholder="Additional notes about this access point..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose || onCancel}
                disabled={isSubmitting}
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
                  "Create Access Point"
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