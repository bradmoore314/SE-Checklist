import { useState } from "react";
import { StreamCamera } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Pencil, Plus, Trash2, ArrowRight } from "lucide-react";
import { getLensTypeText } from "@/lib/gateway-calculator";

interface Step1AddCamerasProps {
  cameras: StreamCamera[];
  setCameras: (cameras: StreamCamera[]) => void;
  cameraEditIndex: number;
  setCameraEditIndex: (index: number) => void;
  onCalculate: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Camera name is required"),
  lensCount: z.coerce.number().int().min(1).max(4),
  streamingResolution: z.coerce.number().min(0.3).max(12),
  frameRate: z.coerce.number().int().min(1).max(60),
  storageDays: z.coerce.number().int().min(1).max(365),
  recordingResolution: z.coerce.number().min(0.3).max(12),
  sameAsStreaming: z.boolean().default(true),
});

type CameraFormData = z.infer<typeof formSchema>;

export default function Step1AddCameras({
  cameras,
  setCameras,
  cameraEditIndex,
  setCameraEditIndex,
  onCalculate
}: Step1AddCamerasProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const form = useForm<CameraFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lensCount: 1,
      streamingResolution: 2,
      frameRate: 10,
      storageDays: 30,
      recordingResolution: 2,
      sameAsStreaming: true
    }
  });

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

  // Watch for changes to streaming resolution and sameAsStreaming
  const streamingResolution = form.watch("streamingResolution");
  const sameAsStreaming = form.watch("sameAsStreaming");
  
  // Update recording resolution when streamingResolution changes and sameAsStreaming is true
  if (sameAsStreaming && streamingResolution) {
    form.setValue("recordingResolution", streamingResolution);
  }

  const handleAddCamera = () => {
    resetForm();
    setCameraEditIndex(-1);
    setIsAddModalOpen(true);
  };

  const handleEditCamera = (index: number) => {
    const camera = cameras[index];
    resetForm();
    
    // Set form values from the camera
    form.setValue("name", camera.name);
    form.setValue("lensCount", camera.lensCount);
    form.setValue("streamingResolution", camera.streamingResolution);
    form.setValue("frameRate", camera.frameRate);
    form.setValue("storageDays", camera.storageDays);
    form.setValue("recordingResolution", camera.recordingResolution);
    form.setValue("sameAsStreaming", camera.streamingResolution === camera.recordingResolution);
    
    setCameraEditIndex(index);
    setIsAddModalOpen(true);
  };

  const handleDeleteCamera = (index: number) => {
    setCameras(cameras.filter((_, i) => i !== index));
  };

  const handleSubmitCamera = (data: CameraFormData) => {
    if (cameraEditIndex === -1) {
      // Add new camera
      setCameras([...cameras, data]);
    } else {
      // Update existing camera
      setCameras(cameras.map((camera, index) => 
        index === cameraEditIndex ? data : camera
      ));
    }
    
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    form.reset({
      name: "",
      lensCount: 1,
      streamingResolution: 2,
      frameRate: 10,
      storageDays: 30,
      recordingResolution: 2,
      sameAsStreaming: true
    });
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
  };

  // Total cameras count
  const totalCameras = cameras.length;
  
  // Total streams count
  const totalStreams = cameras.reduce((acc, camera) => acc + camera.lensCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
        <h2 className="text-xl font-semibold">Add Cameras</h2>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-neutral-500">
            Add all cameras that will be connected to the gateway
          </p>
          
          <div className="flex gap-6 mt-2">
            <div>
              <span className="text-sm font-medium text-neutral-600">Cameras:</span>
              <span className="ml-1 font-bold">{totalCameras}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-neutral-600">Total Streams:</span>
              <span className="ml-1 font-bold">{totalStreams}</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleAddCamera}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      {cameras.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <div className="text-center mb-4">
              <p className="text-neutral-500 mb-4">No cameras added yet</p>
              <Button
                variant="outline"
                onClick={handleAddCamera}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Camera
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camera Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Streaming</TableHead>
                  <TableHead>Recording</TableHead>
                  <TableHead>Storage Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cameras.map((camera, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{camera.name}</TableCell>
                    <TableCell>{getLensTypeText(camera.lensCount)}</TableCell>
                    <TableCell>{camera.streamingResolution} MP @ {camera.frameRate} fps</TableCell>
                    <TableCell>{camera.recordingResolution} MP</TableCell>
                    <TableCell>{camera.storageDays} days</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCamera(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCamera(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end mt-6">
        <Button
          disabled={cameras.length === 0}
          onClick={onCalculate}
          className="flex items-center"
          size="lg"
        >
          Calculate Requirements
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Add/Edit Camera Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {cameraEditIndex === -1 ? "Add New Camera" : "Edit Camera"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitCamera)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Entrance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lensCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens Count</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streamingResolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Streaming Resolution (MP)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseFloat(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {resolutionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frameRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Rate (fps)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 fps</SelectItem>
                          <SelectItem value="2">2 fps</SelectItem>
                          <SelectItem value="5">5 fps</SelectItem>
                          <SelectItem value="10">10 fps</SelectItem>
                          <SelectItem value="15">15 fps</SelectItem>
                          <SelectItem value="20">20 fps</SelectItem>
                          <SelectItem value="25">25 fps</SelectItem>
                          <SelectItem value="30">30 fps</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Days</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">365 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sameAsStreaming"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Use same resolution for recording</FormLabel>
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

              {!sameAsStreaming && (
                <FormField
                  control={form.control}
                  name="recordingResolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recording Resolution (MP)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {resolutionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  {cameraEditIndex === -1 ? "Add Camera" : "Update Camera"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}