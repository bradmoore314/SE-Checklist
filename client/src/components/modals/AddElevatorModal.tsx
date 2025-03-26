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

interface AddElevatorModalProps {
  isOpen: boolean;
  projectId: number;
  onSave: () => void;
  onClose: () => void;
}

// Create schema based on shared schema but with validation
const elevatorSchema = z.object({
  project_id: z.number(),
  location: z.string().min(1, "Location is required"),
  elevator_type: z.string().min(1, "Elevator type is required"),
  floor_count: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  notes: z.string().optional(),
});

type ElevatorFormValues = z.infer<typeof elevatorSchema>;

export default function AddElevatorModal({
  isOpen,
  projectId,
  onSave,
  onClose,
}: AddElevatorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch lookup data for dropdowns
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Initialize form with default values
  const form = useForm<ElevatorFormValues>({
    resolver: zodResolver(elevatorSchema),
    defaultValues: {
      project_id: projectId,
      location: "",
      elevator_type: "",
      floor_count: undefined,
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: ElevatorFormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", "/api/elevators", values);
      onSave();
    } catch (error) {
      console.error("Failed to create elevator:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Elevator
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
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          lookupData?.elevatorTypes.map((type: string) => (
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
                          field.onChange(value ? value : undefined);
                        }}
                      />
                    </FormControl>
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
                {isSubmitting ? "Saving..." : "Save Elevator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
