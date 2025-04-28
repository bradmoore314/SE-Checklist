import { useState, useRef } from "react";
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
  FormDescription,
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
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardContent
} from "@/components/ui/card";

interface LookupData {
  cameraTypes?: string[];
  mountingTypes?: string[];
  resolutions?: string[];
}

interface AddCameraModalProps {
  isOpen?: boolean;
  open?: boolean;
  projectId: number;
  onSave: (camera: any) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

// Create schema based on shared schema but with validation
const cameraSchema = z.object({
  project_id: z.number(),
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().optional(),
  resolution: z.string().optional(),
  field_of_view: z.string().optional(),
  notes: z.string().optional(),
  import_to_gateway: z.boolean().default(true),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

export default function AddCameraModal({
  isOpen,
  open,
  projectId,
  onSave,
  onClose,
  onCancel,
  onOpenChange,
}: AddCameraModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch lookup data for dropdowns
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery<LookupData>({
    queryKey: ["/api/lookup"],
  });
  
  // Helper function to safely access lookup data
  const getLookupOptions = (key: keyof LookupData) => {
    return lookupData && lookupData[key] ? lookupData[key] || [] : [];
  };

  // Initialize form with default values
  const form = useForm<CameraFormValues>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      project_id: projectId,
      location: "",
      camera_type: "",
      mounting_type: "",
      resolution: "",
      field_of_view: "",
      notes: "",
      import_to_gateway: true,
    },
  });

  // Function to start camera
  const startCamera = async () => {
    setIsTakingPicture(true);
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsTakingPicture(false);
    }
  };

  // Function to take picture
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame on the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        
        // Stop all video tracks
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsTakingPicture(false);
      }
    }
  };

  // Function to cancel camera
  const cancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsTakingPicture(false);
  };

  // Function to handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove the current image
  const removeImage = () => {
    setImage(null);
  };

  // Handle form submission
  const onSubmit = async (values: CameraFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Add image data to the values if available
      const dataToSubmit = {
        ...values,
        image_data: image,
      };
      
      const response = await apiRequest("POST", "/api/cameras", dataToSubmit);
      const camera = await response.json();
      // Extract just the ID from the created camera before passing it back
      onSave(camera.id);
      console.log('Created camera with ID:', camera.id);
    } catch (error) {
      console.error("Failed to create camera:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Camera
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
                      <Input placeholder="Enter location" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="camera_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Camera Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Camera Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("cameraTypes").map((type: string) => (
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
                name="mounting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Mounting Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mounting Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("mountingTypes").map((type: string) => (
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
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Resolution
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Resolution" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLookups ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          getLookupOptions("resolutions").map((resolution: string) => (
                            <SelectItem key={resolution} value={resolution}>
                              {resolution}
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
                name="field_of_view"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Field of View
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter field of view (e.g., 90°)"
                        autoComplete="off"
                        {...field}
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
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="import_to_gateway"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Import to Gateway Calculator?
                    </FormLabel>
                    <FormDescription>
                      Choose whether to auto-import this camera to the Gateway Calculator
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <div className={`cursor-pointer px-3 py-1 rounded-md ${field.value ? 'bg-primary text-white' : 'bg-gray-100'}`} 
                           onClick={() => field.onChange(true)}>
                        Yes
                      </div>
                      <div className={`cursor-pointer px-3 py-1 rounded-md ${!field.value ? 'bg-primary text-white' : 'bg-gray-100'}`}
                           onClick={() => field.onChange(false)}>
                        No
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel className="text-sm font-medium text-neutral-700">
                Camera Image
              </FormLabel>
              <FormDescription>
                Take a picture or upload an image of the camera location
              </FormDescription>
              
              {isTakingPicture ? (
                <div className="space-y-4">
                  <div className="relative border rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="w-full h-auto"
                      onLoadedMetadata={() => videoRef.current?.play()}
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelCamera}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={takePicture}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Picture
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : image ? (
                <div className="space-y-2">
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative">
                        <img 
                          src={image} 
                          alt="Camera" 
                          className="w-full h-auto rounded" 
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startCamera}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Picture
                  </Button>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      id="camera-image"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-neutral-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || onClose || (() => onOpenChange?.(false))}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {isSubmitting ? "Saving..." : "Save Camera"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
