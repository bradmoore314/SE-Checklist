import { useState, useEffect } from "react";
import { StreamCamera, Camera } from "@shared/schema";
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
  DialogDescription,
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
import { Check, Pencil, Plus, Trash2, ArrowRight, Download } from "lucide-react";
import { getLensTypeText } from "@/lib/gateway-calculator";
import { useQuery } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const duplicateFormSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(50),
  namePrefix: z.string().optional(),
});

type CameraFormData = z.infer<typeof formSchema>;
type DuplicateFormData = z.infer<typeof duplicateFormSchema>;

export default function Step1AddCameras({
  cameras,
  setCameras,
  cameraEditIndex,
  setCameraEditIndex,
  onCalculate
}: Step1AddCamerasProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [duplicateIndex, setDuplicateIndex] = useState<number>(-1);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateQuantity, setDuplicateQuantity] = useState(1);
  const [duplicatePrefix, setDuplicatePrefix] = useState("");
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [projectId, setProjectId] = useState<number>(2); // Default to first project

  // Fetch project cameras
  const { data: projectCameras, isLoading: isLoadingCameras } = useQuery({
    queryKey: ['/api/projects', projectId, 'cameras'],
    enabled: !!projectId
  });
  
  // Add handler for importing cameras from project
  const handleImportCameras = () => {
    if (!projectCameras || projectCameras.length === 0) return;
    
    // Filter cameras based on import_to_gateway flag
    const camerasToImport = projectCameras.filter((projectCamera: Camera) => 
      projectCamera.import_to_gateway === undefined || projectCamera.import_to_gateway === true
    );
    
    if (camerasToImport.length === 0) {
      alert("No cameras are marked for import to Gateway Calculator. You can enable this in the camera settings.");
      return;
    }
    
    // Map project cameras to StreamCamera format
    const importedCameras: StreamCamera[] = camerasToImport.map((projectCamera: Camera) => ({
      name: projectCamera.location || `Camera ${projectCamera.id}`,
      lensCount: 1, // Default to single lens
      streamingResolution: 2, // Default to 1080p
      frameRate: 10, // Default frame rate
      storageDays: 30, // Default storage days
      recordingResolution: 2, // Default to 1080p
    }));
    
    // Add imported cameras to existing cameras
    setCameras([...cameras, ...importedCameras]);
  };
  
  // Note: We keep the showAdvancedFields state for use in the camera edit modal

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
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleImportCameras}
            className="flex items-center"
            variant="outline"
            disabled={!projectCameras || projectCameras.length === 0}
            title={!projectCameras || projectCameras.length === 0 ? "No cameras found in project" : "Import cameras from project"}
          >
            <Download className="h-4 w-4 mr-2" />
            Import Cameras
          </Button>
          
          <Button 
            onClick={handleAddCamera}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Camera
          </Button>
          
          <Button
            disabled={cameras.length === 0}
            onClick={onCalculate}
            className="flex items-center"
            variant="outline"
          >
            Calculate Requirements
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
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
                          title="Edit Camera"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDuplicateIndex(index)}
                          title="Duplicate Camera"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <rect x="8" y="8" width="12" height="12" rx="2" />
                            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCamera(index)}
                          title="Delete Camera"
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

      {/* Calculate Requirements button moved to top */}

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

              {/* Advanced fields section wrapped in Collapsible */}
              <Collapsible open={showAdvancedFields} className="space-y-4 pt-2">
                <CollapsibleContent>
                  <div className="rounded-lg border p-2 pb-3">
                    <h4 className="text-sm font-medium mb-2 text-gray-500 px-2">Advanced Settings</h4>
                    
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
                          <FormItem className="mt-3">
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
                  </div>
                </CollapsibleContent>
              </Collapsible>

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

      {/* Duplicate Camera Modal */}
      <Dialog open={duplicateIndex !== -1} onOpenChange={(open) => !open && setDuplicateIndex(-1)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Camera</DialogTitle>
            <DialogDescription>
              Create multiple copies of this camera with optional naming customization.
            </DialogDescription>
          </DialogHeader>

          {duplicateIndex !== -1 && (
            <div className="space-y-4 py-2">
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
                <h4 className="font-medium text-sm mb-1">Original Camera</h4>
                <p className="text-sm text-blue-800">{cameras[duplicateIndex]?.name}</p>
                <div className="text-xs text-blue-600 flex gap-3 mt-1">
                  <span>{getLensTypeText(cameras[duplicateIndex]?.lensCount)}</span>
                  <span>{cameras[duplicateIndex]?.streamingResolution} MP</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Number of Copies</label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={50}
                      value={duplicateQuantity}
                      onChange={(e) => setDuplicateQuantity(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Name Prefix (Optional)</label>
                    <Input 
                      type="text"
                      placeholder="e.g., Building A -"
                      value={duplicatePrefix}
                      onChange={(e) => setDuplicatePrefix(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Naming Preview</label>
                  <div className="text-sm p-2 bg-slate-50 border rounded-md">
                    {duplicatePrefix ? `${duplicatePrefix} ${cameras[duplicateIndex]?.name}` : `${cameras[duplicateIndex]?.name} 1`}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDuplicateIndex(-1);
                    setDuplicateQuantity(1);
                    setDuplicatePrefix("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleDuplicateCamera(duplicateIndex, duplicateQuantity, duplicatePrefix);
                    // Reset the duplicate values
                    setDuplicateQuantity(1);
                    setDuplicatePrefix("");
                  }}
                  className="flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                  </svg>
                  Duplicate Camera
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // Handler for duplicating cameras
  function handleDuplicateCamera(index: number, quantity: number, prefix: string = "") {
    if (index < 0 || index >= cameras.length) return;
    
    const sourceCam = cameras[index];
    const newCameras = [...cameras];
    
    // Create the specified number of duplicates
    for (let i = 0; i < quantity; i++) {
      const cameraCopy = { ...sourceCam };
      
      // Update name based on prefix or add a number suffix
      if (prefix) {
        cameraCopy.name = `${prefix} ${sourceCam.name}`;
      } else {
        cameraCopy.name = `${sourceCam.name} ${i + 1}`;
      }
      
      newCameras.push(cameraCopy);
    }
    
    setCameras(newCameras);
    setDuplicateIndex(-1); // Close the modal
  }
}