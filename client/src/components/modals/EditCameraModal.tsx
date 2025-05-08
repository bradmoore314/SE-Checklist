import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the schema for the camera form
const cameraSchema = z.object({
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().min(1, "Mounting type is required"),
  resolution: z.string().min(1, "Resolution is required"),
  notes: z.string().optional(),
  is_indoor: z.boolean().default(true),
  import_to_gateway: z.boolean().default(true),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

interface Camera {
  id: number;
  project_id: number;
  location: string;
  camera_type: string;
  mounting_type: string;
  resolution: string;
  notes?: string;
  is_indoor?: boolean;
  import_to_gateway?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EditCameraModalProps {
  isOpen: boolean;
  camera: Camera;
  onClose: () => void;
  onSave: (id: number, data: Camera) => void;
  fromFloorplan?: boolean;
  isNewCamera?: boolean;
}

export default function EditCameraModal({
  isOpen,
  camera,
  onClose,
  onSave,
  fromFloorplan = false,
  isNewCamera = false
}: EditCameraModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch lookup data
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
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
      notes: camera.notes || "",
      is_indoor: camera.is_indoor !== undefined ? camera.is_indoor : true,
      import_to_gateway: camera.import_to_gateway !== undefined ? camera.import_to_gateway : true,
    },
  });

  const onSubmit = async (values: CameraFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If it's a new camera, create it
      if (isNewCamera) {
        const response = await apiRequest("POST", `/api/projects/${camera.project_id}/cameras`, values);
        const newCamera = await response.json();
        
        // Invalidate cameras query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${camera.project_id}/cameras`]
        });
        
        // Call onSave with the new camera ID and data
        onSave(newCamera.id, { ...newCamera });
      } else {
        // Otherwise, update the existing camera
        await apiRequest("PUT", `/api/cameras/${camera.id}`, values);
        
        // Invalidate cameras query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${camera.project_id}/cameras`]
        });
        
        // Call onSave to refresh the parent component
        onSave(camera.id, { ...camera, ...values });
      }
    } catch (error) {
      console.error("Error saving camera:", error);
      toast({
        title: "Error",
        description: "Failed to save camera",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby="edit-camera-dialog">
        <DialogHeader>
          <DialogTitle>{isNewCamera ? "Add Camera" : "Edit Camera"}</DialogTitle>
        </DialogHeader>
        
        <div id="edit-camera-dialog">
          {isLoadingLookups ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
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
                        )) || [
                          <SelectItem key="Dome" value="Dome">Dome</SelectItem>,
                          <SelectItem key="Bullet" value="Bullet">Bullet</SelectItem>,
                          <SelectItem key="PTZ" value="PTZ">PTZ</SelectItem>,
                          <SelectItem key="Multi-Sensor" value="Multi-Sensor">Multi-Sensor</SelectItem>
                        ]}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
                          {lookupData?.mountingTypes?.map((type: string) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          )) || [
                            <SelectItem key="Ceiling" value="Ceiling">Ceiling</SelectItem>,
                            <SelectItem key="Wall" value="Wall">Wall</SelectItem>,
                            <SelectItem key="Pole" value="Pole">Pole</SelectItem>,
                            <SelectItem key="Pendant" value="Pendant">Pendant</SelectItem>
                          ]}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Resolution */}
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resolution" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lookupData?.resolutions?.map((res: string) => (
                            <SelectItem key={res} value={res}>
                              {res}
                            </SelectItem>
                          )) || [
                            <SelectItem key="2MP" value="2MP">2MP (1080p)</SelectItem>,
                            <SelectItem key="4MP" value="4MP">4MP</SelectItem>,
                            <SelectItem key="5MP" value="5MP">5MP</SelectItem>,
                            <SelectItem key="8MP" value="8MP">8MP (4K)</SelectItem>
                          ]}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              

              <div className="grid grid-cols-2 gap-4">
                {/* Is Indoor */}
                <FormField
                  control={form.control}
                  name="is_indoor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Indoor Camera</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Import to Gateway */}
                <FormField
                  control={form.control}
                  name="import_to_gateway"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Import to Gateway</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    'Save Camera'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}