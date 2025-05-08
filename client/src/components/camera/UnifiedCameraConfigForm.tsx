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
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';

// Define the schema for camera data
export const cameraConfigSchema = z.object({
  location: z.string().min(1, "Location is required"),
  camera_type: z.string().min(1, "Camera type is required"),
  mounting_type: z.string().optional(),
  resolution: z.string().optional(),
  notes: z.string().optional(),
  is_indoor: z.enum(["indoor", "outdoor"]).default("indoor"),
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
      notes: initialData?.notes || "",
      is_indoor: typeof initialData?.is_indoor === 'string' ? initialData.is_indoor as "indoor" | "outdoor" : "indoor",
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
      // Pass data to parent component with image if present
      onSave({
        ...data,
        ...(image && { image_data: image })
      });
      
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Main content area - 2 column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Basic camera info and settings */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary">Camera Details</h3>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Name/Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter camera name or location" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="camera_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Camera Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
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
                      <FormLabel>Mounting Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
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
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_indoor"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Location Type</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="indoor" id="indoor" />
                            <Label htmlFor="indoor">Indoor</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="outdoor" id="outdoor" />
                            <Label htmlFor="outdoor">Outdoor</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="import_to_gateway"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gateway Import</FormLabel>
                        <FormDescription className="text-xs">
                          Add to gateway system
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
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes"
                        rows={2}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Gateway Calculator - only show when import_to_gateway is checked */}
            {form.watch("import_to_gateway") && (
              <div className="border p-4 rounded-md bg-blue-50">
                <h4 className="text-base font-medium mb-3">Gateway Calculator</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lens_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lens Count</FormLabel>
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
                        <FormLabel>Rec Resolution</FormLabel>
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
                            <SelectItem value="2 MP (1080p)">2 MP (1080p)</SelectItem>
                            <SelectItem value="4 MP (1440p)">4 MP (1440p)</SelectItem>
                            <SelectItem value="8 MP (4K)">8 MP (4K)</SelectItem>
                            <SelectItem value="12 MP (5K)">12 MP (5K)</SelectItem>
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
                        <FormLabel>Frame Rate</FormLabel>
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
                            <SelectItem value="30 fps">30 fps</SelectItem>
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
                        <FormLabel>Storage Days</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Storage Duration" />
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
          
          {/* Right column - Camera image and visualization */}
          <div className="space-y-6">
            {/* Camera Image Section */}
            {showImageUpload && (
              <div className="border p-4 rounded-md bg-slate-50">
                <h3 className="text-lg font-medium text-primary mb-2">Camera Image</h3>
                <FormDescription className="mb-3">
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
                        size="icon"
                        onClick={cancelCamera}
                        title="Cancel"
                        aria-label="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={takePicture}
                        title="Take Photo"
                        aria-label="Take Photo"
                      >
                        <Camera className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {image ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="border p-1 rounded-md">
                          <img
                            src={image}
                            alt="Camera view"
                            className="max-w-full h-auto rounded max-h-[200px]"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          title="Remove Image"
                          aria-label="Remove Image"
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={startCamera}
                          title="Take Photo"
                          aria-label="Take Photo"
                        >
                          <Camera className="h-5 w-5" />
                        </Button>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Upload Image"
                            aria-label="Upload Image"
                          >
                            <Upload className="h-5 w-5" />
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Marker Visualization */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-medium text-primary mb-2">Marker Visualization</h3>
              <FormDescription className="mb-3">
                Configure how the camera appears on the floorplan
              </FormDescription>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Field of View: {formatAngle(fov)}</FormLabel>
                    <span className="text-xs text-muted-foreground">(10° - 360°)</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="fov"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Slider
                            min={10}
                            max={360}
                            step={5}
                            value={[field.value]}
                            onValueChange={values => field.onChange(values[0])}
                            className="mt-1"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Range: {range} units</FormLabel>
                    <span className="text-xs text-muted-foreground">(20 - 200 units)</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="range"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Slider
                            min={20}
                            max={200}
                            step={10}
                            value={[field.value]}
                            onValueChange={values => field.onChange(values[0])}
                            className="mt-1"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Rotation: {formatAngle(rotation)}</FormLabel>
                    <span className="text-xs text-muted-foreground">(0° - 359°)</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="rotation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Slider
                            min={0}
                            max={359}
                            step={15}
                            value={[field.value]}
                            onValueChange={values => field.onChange(values[0])}
                            className="mt-1"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Visualization Preview */}
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  <div className="relative bg-slate-50 border border-slate-200 rounded-md h-56 flex items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 z-10"></div>
                    </div>
                    <svg viewBox="-100 -100 200 200" width="200" height="200" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {/* Camera FOV visualization */}
                      <path
                        d={`M 0 0 L ${range * Math.cos((90 - fov / 2) * Math.PI / 180)} ${-range * Math.sin((90 - fov / 2) * Math.PI / 180)} A ${range} ${range} 0 0 0 ${range * Math.cos((90 + fov / 2) * Math.PI / 180)} ${-range * Math.sin((90 + fov / 2) * Math.PI / 180)} Z`}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.7)"
                        strokeWidth="2"
                        transform={`rotate(${rotation})`}
                      />
                      
                      {/* Line for direction indication */}
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={-range}
                        stroke="rgba(59, 130, 246, 0.7)"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        transform={`rotate(${rotation})`}
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Action Buttons - Moved here to be closer to preview */}
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </form>
    </Form>
  );
}