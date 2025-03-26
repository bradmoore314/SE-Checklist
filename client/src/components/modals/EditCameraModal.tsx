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
import { Camera } from "@shared/schema";

// Define the camera form schema
const cameraSchema = z.object({
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
  field_of_view: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

interface EditCameraModalProps {
  isOpen: boolean;
  camera: Camera;
  onSave: () => void;
  onClose: () => void;
}

export default function EditCameraModal({
  isOpen,
  camera,
  onSave,
  onClose
}: EditCameraModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch lookup data
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

  // Set up form with default values from the existing camera
  const form = useForm<CameraFormValues>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      location: camera.location,
      camera_type: camera.camera_type,
      mounting_type: camera.mounting_type,
      resolution: camera.resolution,
      field_of_view: camera.field_of_view,
      notes: camera.notes,
    },
  });

  const onSubmit = async (values: CameraFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("PUT", `/api/cameras/${camera.id}`, values);
      
      // Call onSave to refresh the parent component
      onSave();
    } catch (error) {
      console.error("Error updating camera:", error);
      // Here you could handle errors, show a notification, etc.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Camera</DialogTitle>
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
            
            {/* Camera Type */}
            <FormField
              control={form.control}
              name="camera_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookupData?.cameraTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Mounting Type */}
            <FormField
              control={form.control}
              name="mounting_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mounting Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mounting type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {lookupData?.mountingTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Resolution */}
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {lookupData?.resolutions?.map((resolution: string) => (
                        <SelectItem key={resolution} value={resolution}>
                          {resolution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Field of View */}
            <FormField
              control={form.control}
              name="field_of_view"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of View</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter field of view (e.g., 90°)" 
                      {...field} 
                      value={field.value || ""}
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
                      placeholder="Enter any notes about this camera" 
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