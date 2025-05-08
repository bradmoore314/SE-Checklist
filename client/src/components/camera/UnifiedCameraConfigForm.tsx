import React, { useState, useRef, useEffect } from 'react';
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from '@/components/ui/slider';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';

// Define the schema for camera data
export const cameraConfigSchema = z.object({
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().optional(),
  resolution: z.string().optional(),
  field_of_view: z.string().optional(),
  notes: z.string().optional(),
  is_indoor: z.boolean().default(true),
  import_to_gateway: z.boolean().default(true),
  
  // Marker visualization fields
  fov: z.coerce.number().min(10).max(360).default(90),
  range: z.coerce.number().min(20).max(200).default(60),
  rotation: z.coerce.number().min(0).max(359).default(0),
  
  // Gateway calculator fields
  lens_count: z.string().default("1 (Single Lens)"),
  streaming_resolution: z.string().default("2 MP (1080p)"),
  frame_rate: z.string().default("10 fps"),
  recording_resolution: z.string().default("2 MP (1080p)"),
  storage_days: z.string().default("30 days")
});

export type CameraConfigData = z.infer<typeof cameraConfigSchema>;

interface UnifiedCameraConfigFormProps {
  projectId: number;
  initialData?: Partial<CameraConfigData>;
  onSave: (data: CameraConfigData) => void;
  onCancel?: () => void;
  saveButtonText?: string;
  cancelButtonText?: string;
  showImageUpload?: boolean;
  mode?: 'add' | 'edit';
}

export default function UnifiedCameraConfigForm({
  projectId,
  initialData,
  onSave,
  onCancel,
  saveButtonText = "Save",
  cancelButtonText = "Cancel",
  showImageUpload = true,
  mode = 'add'
}: UnifiedCameraConfigFormProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const form = useForm<CameraConfigData>({
    resolver: zodResolver(cameraConfigSchema),
    defaultValues: {
      location: initialData?.location || "",
      camera_type: initialData?.camera_type || "",
      mounting_type: initialData?.mounting_type || "",
      resolution: initialData?.resolution || "",
      field_of_view: initialData?.field_of_view || "",
      notes: initialData?.notes || "",
      is_indoor: initialData?.is_indoor ?? true,
      import_to_gateway: initialData?.import_to_gateway ?? true,
      
      // Marker visualization defaults
      fov: initialData?.fov ?? 90,
      range: initialData?.range ?? 60,
      rotation: initialData?.rotation ?? 0,
      
      // Gateway calculator defaults
      lens_count: initialData?.lens_count || "1 (Single Lens)",
      streaming_resolution: initialData?.streaming_resolution || "2 MP (1080p)",
      frame_rate: initialData?.frame_rate || "10 fps",
      recording_resolution: initialData?.recording_resolution || "2 MP (1080p)",
      storage_days: initialData?.storage_days || "30 days"
    },
  });

  // Watch values for visualization
  const fov = form.watch("fov");
  const range = form.watch("range");
  const rotation = form.watch("rotation");
  
  // Format angle to display degrees symbol
  const formatAngle = (angle: number): string => {
    return `${angle.toFixed(0)}°`;
  };

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

  const handleSubmit = async (data: CameraConfigData) => {
    setIsSubmitting(true);
    
    try {
      // Extract the base64 part of the image data if it exists
      let imageData = null;
      if (image) {
        const base64Data = image.split(',')[1];
        imageData = base64Data;
      }
      
      // Pass data to parent component
      onSave({
        ...data,
        ...(imageData && { image_data: imageData })
      });
      
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Two-column Layout for Camera Info and Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Left Column - Camera Equipment */}
          <div>
            <h3 className="font-medium mb-4">Camera Equipment</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Camera Name/Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter camera name or location" autoComplete="off" {...field} />
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
                      Camera Type
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
            </div>
          </div>
          
          {/* Right Column - Marker Visualization */}
          <div>
            <h3 className="font-medium mb-4">Marker Visualization</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Field of View: {formatAngle(fov)}</FormLabel>
                  <span className="text-xs text-gray-500">(10° - 360°)</span>
                </div>
                <FormField
                  control={form.control}
                  name="fov"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Slider
                          min={10}
                          max={360}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Range: {range.toFixed(0)} units</FormLabel>
                  <span className="text-xs text-gray-500">(20 - 200 units)</span>
                </div>
                <FormField
                  control={form.control}
                  name="range"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Slider
                          min={20}
                          max={200}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <FormLabel>Rotation: {formatAngle(rotation)}</FormLabel>
                  <span className="text-xs text-gray-500">(0° - 359°)</span>
                </div>
                <FormField
                  control={form.control}
                  name="rotation"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <Slider
                          min={0}
                          max={359}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Visualization Preview</h4>
                <div className="relative bg-white border border-gray-300 rounded-md h-48 flex items-center justify-center overflow-hidden">
                  <div className="absolute">
                    {/* Camera center point */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full z-10"
                    />
                    
                    {/* FOV visualization - much larger to fix the scaling issue */}
                    <svg 
                      width="400" 
                      height="400" 
                      viewBox="-200 -200 400 400" 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      {/* Field of view area */}
                      <path
                        d={(() => {
                          const centerX = 0;
                          const centerY = 0;
                          const radius = range;
                          const fovRadians = (fov * Math.PI) / 180;
                          const rotationRadians = (rotation * Math.PI) / 180;
                          const startAngle = rotationRadians - fovRadians / 2;
                          const endAngle = rotationRadians + fovRadians / 2;
                          
                          // Generate arc points
                          let path = `M${centerX},${centerY}`;
                          
                          // Add line to first point on arc
                          const x1 = centerX + radius * Math.cos(startAngle);
                          const y1 = centerY + radius * Math.sin(startAngle);
                          path += ` L${x1},${y1}`;
                          
                          // Create arc
                          const arcSweep = fovRadians <= Math.PI ? 0 : 1;
                          const x2 = centerX + radius * Math.cos(endAngle);
                          const y2 = centerY + radius * Math.sin(endAngle);
                          
                          // For FOV < 180 degrees (less than half circle)
                          if (fov < 180) {
                            path += ` A${radius},${radius} 0 0,1 ${x2},${y2}`;
                          } else if (fov < 360) {
                            // For FOV > 180 but < 360 (more than half, less than full)
                            path += ` A${radius},${radius} 0 1,1 ${x2},${y2}`;
                          } else {
                            // For 360 degrees (full circle)
                            path += ` A${radius},${radius} 0 1,1 ${centerX},${centerY + radius}`;
                            path += ` A${radius},${radius} 0 1,1 ${centerX},${centerY - radius}`;
                          }
                          
                          path += ` Z`;
                          return path;
                        })()}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="2"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                      
                      {/* Direction indicator line */}
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={-range}
                        stroke="rgba(59, 130, 246, 0.7)"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Gateway Calculator - only show when import_to_gateway is checked */}
                {form.watch("import_to_gateway") && (
                  <div className="mt-4 border p-3 rounded-md bg-blue-50">
                    <h4 className="text-sm font-medium mb-2">Gateway Calculator</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="lens_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Lens Count
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Lens Count" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1 (Single Lens)">1 (Single Lens)</SelectItem>
                                <SelectItem value="2 (Dual Lens)">2 (Dual Lens)</SelectItem>
                                <SelectItem value="3 (Multi Lens)">3 (Multi Lens)</SelectItem>
                                <SelectItem value="4 (360° View)">4 (360° View)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="streaming_resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Streaming Resolution (MP)
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Streaming Resolution" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2 MP (1080p)">2 MP (1080p)</SelectItem>
                                <SelectItem value="3 MP (1440p)">3 MP (1440p)</SelectItem>
                                <SelectItem value="4 MP (1520p)">4 MP (1520p)</SelectItem>
                                <SelectItem value="5 MP (2K)">5 MP (2K)</SelectItem>
                                <SelectItem value="8 MP (4K)">8 MP (4K)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="frame_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Frame Rate (fps)
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Frame Rate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="10 fps">10 fps</SelectItem>
                                <SelectItem value="15 fps">15 fps</SelectItem>
                                <SelectItem value="20 fps">20 fps</SelectItem>
                                <SelectItem value="25 fps">25 fps</SelectItem>
                                <SelectItem value="30 fps">30 fps</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recording_resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Recording Resolution (MP)
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Recording Resolution" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1 MP (720p)">1 MP (720p)</SelectItem>
                                <SelectItem value="2 MP (1080p)">2 MP (1080p)</SelectItem>
                                <SelectItem value="3 MP (1440p)">3 MP (1440p)</SelectItem>
                                <SelectItem value="4 MP (1520p)">4 MP (1520p)</SelectItem>
                                <SelectItem value="5 MP (2K)">5 MP (2K)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="storage_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-700">
                              Storage Days
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Storage Days" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="7 days">7 days</SelectItem>
                                <SelectItem value="14 days">14 days</SelectItem>
                                <SelectItem value="30 days">30 days</SelectItem>
                                <SelectItem value="60 days">60 days</SelectItem>
                                <SelectItem value="90 days">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showImageUpload && (
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
                    Take Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startCamera}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                
                {image && (
                  <div className="relative border rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt="Camera" 
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
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
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
                    Import to Gateway
                  </FormLabel>
                  <FormDescription>
                    Import this camera to gateway?
                  </FormDescription>
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

        <div className="flex justify-end gap-2 mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : saveButtonText}
          </Button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </form>
    </Form>
  );
}