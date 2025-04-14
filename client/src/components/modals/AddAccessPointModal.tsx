import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddAccessPointModalProps {
  isOpen: boolean;
  projectId: number;
  onSave: () => void;
  onClose: () => void;
}

// Create schema based on shared schema but with validation
const accessPointSchema = z.object({
  project_id: z.number(),
  location: z.string().min(1, "Location is required"),
  quick_config: z.string().optional(), // Optional now
  reader_type: z.string().min(1, "Reader type is required"),
  lock_type: z.string().min(1, "Lock type is required"),
  monitoring_type: z.string().min(1, "Monitoring type is required"), // Changed from security_level
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
  notes: z.string().optional(),
});

type AccessPointFormValues = z.infer<typeof accessPointSchema>;

export default function AddAccessPointModal({
  isOpen,
  projectId,
  onSave,
  onClose,
}: AddAccessPointModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Fetch lookup data for dropdowns
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Initialize form with default values
  const form = useForm<AccessPointFormValues>({
    resolver: zodResolver(accessPointSchema),
    defaultValues: {
      project_id: projectId,
      location: "",
      quick_config: "",
      reader_type: "",
      lock_type: "",
      monitoring_type: "",
      lock_provider: "",
      takeover: "No",
      interior_perimeter: "Interior",
      exst_panel_location: "",
      exst_panel_type: "",
      exst_reader_type: "",
      new_panel_location: "",
      new_panel_type: "",
      new_reader_type: "",
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: AccessPointFormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/access-points", values);
      onSave();
    } catch (error) {
      console.error("Failed to create access point:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quick_config"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Quick Config
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Quick Config" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          lookupData?.quickConfigOptions.map((type: string) => (
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
                name="reader_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Reader Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.readerTypes.map((type: string) => (
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
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Lock Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.lockTypes.map((type: string) => (
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
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Monitoring Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.monitoringTypes.map((type: string) => (
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
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Lock Provider
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.lockProviderOptions.map((option: string) => (
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
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Takeover?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.takeoverOptions.map((option: string) => (
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
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Interior/Perimeter
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                          lookupData?.interiorPerimeterOptions.map((option: string) => (
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    Notes
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

            <DialogFooter className="border-t border-neutral-200 pt-4">
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
                {isSubmitting ? "Saving..." : "Save Access Point"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
