import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Map, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SimpleFloorplanUploadProps {
  projectId: number;
  onComplete?: () => void;
}

export default function SimpleFloorplanUpload({ projectId, onComplete }: SimpleFloorplanUploadProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [floorplanName, setFloorplanName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFloorplanMutation = useMutation({
    mutationFn: async (data: { name: string; imageData: string }) => {
      return apiRequest("POST", `/api/projects/${projectId}/floorplans`, {
        name: data.name,
        image_data: data.imageData,
        scale_factor: 1.0,
        origin_x: 0,
        origin_y: 0
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Floorplan uploaded successfully"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/floorplans`] });
      onComplete?.();
      // Reset form
      setFloorplanName("");
      setSelectedFile(null);
      setCapturedImage(null);
    },
    onError: (error) => {
      console.error("Error creating floorplan:", error);
      toast({
        title: "Error",
        description: "Failed to upload floorplan. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate name from filename
      const name = file.name.replace(/\.[^/.]+$/, "");
      setFloorplanName(name);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !floorplanName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a name for the floorplan",
        variant: "destructive"
      });
      return;
    }

    try {
      const base64Data = await convertFileToBase64(selectedFile);
      createFloorplanMutation.mutate({
        name: floorplanName.trim(),
        imageData: base64Data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the selected file",
        variant: "destructive"
      });
    }
  };

  const captureScreenshot = async () => {
    try {
      // Simple screen capture - much more reliable than complex satellite workflows
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // For now, let's create a simple placeholder that users can replace
      canvas.width = 800;
      canvas.height = 600;
      
      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simple grid pattern
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        
        // Draw grid
        for (let x = 0; x <= canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Add title
        ctx.fillStyle = '#666666';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Floorplan Template', canvas.width / 2, 50);
        ctx.font = '14px Arial';
        ctx.fillText('Replace this with your actual floorplan image', canvas.width / 2, 80);
      }
      
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      setFloorplanName("Captured Floorplan " + new Date().toLocaleDateString());
      
      toast({
        title: "Image Captured",
        description: "Template image created. You can now upload it as your floorplan."
      });
    } catch (error) {
      toast({
        title: "Capture Failed",
        description: "Could not capture image. Please try uploading a file instead.",
        variant: "destructive"
      });
    }
  };

  const handleCaptureSubmit = async () => {
    if (!capturedImage || !floorplanName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please capture an image and enter a name for the floorplan",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove the data:image/...;base64, prefix
      const base64Data = capturedImage.split(',')[1];
      createFloorplanMutation.mutate({
        name: floorplanName.trim(),
        imageData: base64Data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the captured image",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Add Floorplan
        </CardTitle>
        <CardDescription>
          Upload an existing floorplan image or create a simple template to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="capture" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Create Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select Floorplan Image</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, PDF (images will be converted automatically)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-name">Floorplan Name</Label>
              <Input
                id="upload-name"
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
                placeholder="Enter a name for this floorplan"
              />
            </div>

            {selectedFile && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected File:</p>
                <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <Button 
              onClick={handleUploadSubmit}
              disabled={!selectedFile || !floorplanName.trim() || createFloorplanMutation.isPending}
              className="w-full"
            >
              {createFloorplanMutation.isPending ? "Uploading..." : "Upload Floorplan"}
            </Button>
          </TabsContent>

          <TabsContent value="capture" className="space-y-4">
            <div className="space-y-2">
              <Label>Create Template</Label>
              <p className="text-sm text-muted-foreground">
                Generate a simple grid template that you can use as a starting point for your floorplan
              </p>
            </div>

            <Button 
              onClick={captureScreenshot}
              variant="outline"
              className="w-full"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Generate Template
            </Button>

            {capturedImage && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <img 
                    src={capturedImage} 
                    alt="Captured template" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capture-name">Floorplan Name</Label>
                  <Input
                    id="capture-name"
                    value={floorplanName}
                    onChange={(e) => setFloorplanName(e.target.value)}
                    placeholder="Enter a name for this floorplan"
                  />
                </div>

                <Button 
                  onClick={handleCaptureSubmit}
                  disabled={!capturedImage || !floorplanName.trim() || createFloorplanMutation.isPending}
                  className="w-full"
                >
                  {createFloorplanMutation.isPending ? "Creating..." : "Use This Template"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}