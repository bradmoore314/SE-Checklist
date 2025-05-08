import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from '@/hooks/use-toast';
import { Camera, Upload, X, ChevronDown, ChevronRight, Sliders, Move, RotateCcw } from 'lucide-react';

// Define the schema for camera data
const cameraSchema = z.object({
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().optional(),
  resolution: z.string().optional(),
  field_of_view: z.string().optional(),
  notes: z.string().optional(),
  is_indoor: z.boolean().default(true),
  import_to_gateway: z.boolean().default(true),
  
  // Gateway Calculator fields
  lensCount: z.coerce.number().int().min(1).max(4).default(1),
  streamingResolution: z.coerce.number().min(0.3).max(12).default(2),
  frameRate: z.coerce.number().int().min(1).max(60).default(10),
  storageDays: z.coerce.number().int().min(1).max(365).default(30),
  recordingResolution: z.coerce.number().min(0.3).max(12).default(2),
  sameAsStreaming: z.boolean().default(true),
  
  // Marker visualization fields (from CombinedCameraConfigForm)
  fov: z.coerce.number().min(10).max(360).default(90),
  range: z.coerce.number().min(20).max(200).default(60),
  rotation: z.coerce.number().min(0).max(359).default(0)
});

type CameraData = z.infer<typeof cameraSchema>;

interface AddCameraModalProps {
  projectId: number;
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export default function AddCameraModal({
  projectId,
  open,
  isOpen,
  onOpenChange,
  onClose,
  onSave,
  onCancel
}: AddCameraModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Fetch lookup data for the form
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ['/api/lookup'],
    queryFn: async () => {
      const response = await fetch('/api/lookup');
      return response.json();
    }
  });

  const getLookupOptions = (category: string) => {
    if (!lookupData) return [];
    return lookupData[category] || [];
  };

  const form = useForm<CameraData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      location: "",
      camera_type: "",
      mounting_type: "",
      resolution: "",
      field_of_view: "",
      notes: "",
      is_indoor: true,
      import_to_gateway: true,
      
      // Gateway Calculator defaults
      lensCount: 1,
      streamingResolution: 2,
      frameRate: 10,
      storageDays: 30,
      recordingResolution: 2,
      sameAsStreaming: true,
      
      // Marker visualization defaults
      fov: 90,
      range: 60,
      rotation: 0
    },
  });

  // Watch for changes to streaming resolution and sameAsStreaming
  const streamingResolution = form.watch("streamingResolution");
  const sameAsStreaming = form.watch("sameAsStreaming");
  const fov = form.watch("fov");
  const range = form.watch("range");
  const rotation = form.watch("rotation");
  
  // Update recording resolution when streamingResolution changes and sameAsStreaming is true
  useEffect(() => {
    if (sameAsStreaming && streamingResolution) {
      form.setValue("recordingResolution", streamingResolution);
    }
  }, [sameAsStreaming, streamingResolution, form]);
  
  // Format angle to display degrees symbol
  const formatAngle = (angle: number): string => {
    return `${angle.toFixed(0)}°`;
  };

  const resolutionOptions = [
    { value: 0.3, label: "0.3 MP (480p)" },
    { value: 1, label: "1 MP (720p)" },
    { value: 2, label: "2 MP (1080p)" },
    { value: 4, label: "4 MP (1440p)" },
    { value: 5, label: "5 MP" },
    { value: 6, label: "6 MP" },
    { value: 8, label: "8 MP (4K)" },
    { value: 12, label: "12 MP" }
  ];

  const addCameraMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/cameras`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/cameras`] });
      toast({
        title: "Success",
        description: "Camera added successfully",
      });
      if (onSave) {
        onSave({});
      }
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsTakingPicture(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const dataURL = canvas.toDataURL('image/jpeg');
        setImage(dataURL);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          video.srcObject = null;
        }
        
        setIsTakingPicture(false);
      }
    }
  };

  const cancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setIsTakingPicture(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const onSubmit = async (data: CameraData) => {
    setIsSubmitting(true);
    
    try {
      // Extract the base64 part of the image data if it exists
      let imageData = null;
      if (image) {
        const base64Data = image.split(',')[1];
        imageData = base64Data;
      }
      
      // Create the payload
      const payload = {
        ...data,
        project_id: projectId,
        image_data: imageData
      };
      
      await addCameraMutation.mutateAsync(payload);
      
      // Clear the form and image
      form.reset();
      setImage(null);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting form:', error);
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_indoor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Camera Location
                      </FormLabel>
                      <FormDescription>
                        Is this an indoor or outdoor camera?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <div className={`cursor-pointer px-3 py-1 rounded-md ${field.value ? 'bg-primary text-white' : 'bg-gray-100'}`} 
                             onClick={() => field.onChange(true)}>
                          Indoor
                        </div>
                        <div className={`cursor-pointer px-3 py-1 rounded-md ${!field.value ? 'bg-primary text-white' : 'bg-gray-100'}`}
                             onClick={() => field.onChange(false)}>
                          Outdoor
                        </div>
                      </div>
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
                        Auto-import to Gateway Calculator
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
            </div>

            {/* Advanced fields from Gateway Calculator */}
            <Accordion 
              type="single" 
              collapsible
              className="border rounded-md"
              value={showAdvancedFields ? "advanced" : ""}
              onValueChange={(value) => setShowAdvancedFields(value === "advanced")}
            >
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span className="font-medium">Advanced Gateway Settings</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lensCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Lens Count
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 (Single Lens)</SelectItem>
                                <SelectItem value="2">2 (Dual Lens / 180°)</SelectItem>
                                <SelectItem value="3">3 (Triple Lens)</SelectItem>
                                <SelectItem value="4">4 (Quad Lens / 360°)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Number of camera lenses or streams
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="streamingResolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Streaming Resolution
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseFloat(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {resolutionOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Resolution for live streaming
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frameRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Frame Rate (fps)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={60}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Frames per second (1-60)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storageDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Storage Days
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Days to retain recordings (1-365)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sameAsStreaming"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Same resolution for recording
                            </FormLabel>
                            <FormDescription>
                              Use streaming resolution for recording
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!sameAsStreaming && (
                      <FormField
                        control={form.control}
                        name="recordingResolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Recording Resolution
                            </FormLabel>
                            <FormControl>
                              <Select
                                value={field.value.toString()}
                                onValueChange={(value) => field.onChange(parseFloat(value))}
                                disabled={sameAsStreaming}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {resolutionOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Resolution for recordings
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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