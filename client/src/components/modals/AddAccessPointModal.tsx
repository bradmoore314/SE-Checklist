import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash, Upload, Camera, Image, X, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// Interface for lookup data
interface LookupData {
  readerTypes?: string[];
  lockTypes?: string[];
  monitoringTypes?: string[];
  lockProviderOptions?: string[];
  takeoverOptions?: string[];
  interiorPerimeterOptions?: string[];
  noisyPropOptions?: string[];
  crashbarsOptions?: string[];
  realLockTypeOptions?: string[];
}

interface AddAccessPointModalProps {
  isOpen?: boolean;
  open?: boolean;
  projectId: number;
  onSave: (accessPoint: any) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

// Create schema based on shared schema but with validation
const accessPointSchema = z.object({
  project_id: z.number(),
  location: z.string().min(1, "Location is required"),
  quick_config: z.string().default(""), // Legacy field required for database compatibility
  reader_type: z.string().min(1, "Reader type is required"),
  lock_type: z.string().min(1, "Lock type is required"),
  monitoring_type: z.string().min(1, "Monitoring type is required"),
  lock_provider: z.string().optional(), // Changed from ppi
  takeover: z.string().optional(),
  interior_perimeter: z.string().optional(),
  // Hidden fields
  exst_panel_location: z.string().optional(),
  exst_panel_type: z.string().optional(),
  exst_reader_type: z.string().optional(),
  new_panel_location: z.string().optional(),
  new_panel_type: z.string().optional(),
  new_reader_type: z.string().optional(),
  noisy_prop: z.string().optional(),
  crashbars: z.string().optional(),
  real_lock_type: z.string().optional(),
  notes: z.string().optional(),
});

type AccessPointFormValues = z.infer<typeof accessPointSchema>;

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

  // Fetch lookup data for dropdowns
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery<LookupData>({
    queryKey: ["/api/lookup"],
  });
  
  // Helper function to safely access lookup data
  const getLookupOptions = (key: keyof LookupData) => {
    return lookupData && lookupData[key] ? lookupData[key] || [] : [];
  };
  
  // Toggle the visibility of advanced fields
  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
  };

  // Initialize form with default values
  const form = useForm<AccessPointFormValues>({
    resolver: zodResolver(accessPointSchema),
    defaultValues: {
      project_id: projectId,
      location: "",
      quick_config: "", // Legacy field required for database compatibility
      reader_type: "KR-100", // Set default reader type
      lock_type: "Standard", // Set default lock type
      monitoring_type: "Prop Monitoring", // Set default monitoring type
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
  
  // All fields are always enabled - quick_config field is hidden but still required by database
  const disableFields = false;

  const { toast } = useToast();
  
  // Handle form submission
  const onSubmit = async (values: AccessPointFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting access point data:', values);
      
      const response = await apiRequest("POST", "/api/access-points", values);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(errorData?.message || 'Failed to create access point');
      }
      
      const accessPoint = await response.json();
      console.log('Created access point with ID:', accessPoint.id);
      
      // Show success message
      toast({
        title: "Success",
        description: "Access point created successfully",
      });
      
      // Extract just the ID from the created access point before passing it back
      onSave(accessPoint.id);
    } catch (error) {
      console.error("Failed to create access point:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create access point",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Access Point
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Location *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Config field removed */}

              <FormField
                control={form.control}
                name="reader_type"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Reader Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Reader Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("readerTypes").map((type: string) => (
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
                name="lock_type"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Lock Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Lock Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("lockTypes").map((type: string) => (
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
                name="monitoring_type"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Monitoring Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Monitoring Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("monitoringTypes").map((type: string) => (
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
                name="lock_provider"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Lock Provider
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Lock Provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("lockProviderOptions").map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                name="takeover"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Takeover?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Takeover Option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("takeoverOptions").map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                name="interior_perimeter"
                render={({ field }) => (
                  <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Interior/Perimeter
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disableFields}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Interior/Perimeter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("interiorPerimeterOptions").map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Exst. Panel Location
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing panel location" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exst_panel_type"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Exst. Panel Type
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing panel type" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exst_reader_type"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Exst. Reader Type
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter existing reader type" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_panel_location"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        New Panel Location
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new panel location" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_panel_type"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        New Panel Type
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new panel type" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_reader_type"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        New Reader Type
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter new reader type" 
                          {...field} 
                          disabled={disableFields}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="noisy_prop"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Noisy Prop?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disableFields}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yes/No" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLookups ? (
                            <SelectItem value="loading">Loading...</SelectItem>
                          ) : (
                            getLookupOptions("noisyPropOptions").map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                  name="crashbars"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Crashbars?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disableFields}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yes/No" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLookups ? (
                            <SelectItem value="loading">Loading...</SelectItem>
                          ) : (
                            getLookupOptions("crashbarsOptions").map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                  name="real_lock_type"
                  render={({ field }) => (
                    <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Real Lock Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disableFields}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Lock Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLookups ? (
                            <SelectItem value="loading">Loading...</SelectItem>
                          ) : (
                            getLookupOptions("realLockTypeOptions").map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes field - shown for all */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className={cn(disableFields && "opacity-50 pointer-events-none")}>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes about this access point" 
                      className="min-h-[100px]" 
                      {...field}
                      disabled={disableFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Access Point"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}