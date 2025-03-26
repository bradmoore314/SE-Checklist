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
  door_type: z.string().min(1, "Door type is required"),
  reader_type: z.string().min(1, "Reader type is required"),
  lock_type: z.string().min(1, "Lock type is required"),
  security_level: z.string().min(1, "Security level is required"),
  ppi: z.string().optional(),
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
      door_type: "",
      reader_type: "",
      lock_type: "",
      security_level: "",
      ppi: "",
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
                name="door_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Door Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Door Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          lookupData?.doorTypes.map((type: string) => (
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
                name="security_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Security Level *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Security Level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          lookupData?.securityLevels.map((level: string) => (
                            <SelectItem key={level} value={level}>
                              {level}
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
                name="ppi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      PPI
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PPI" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          lookupData?.ppiOptions.map((option: string) => (
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
