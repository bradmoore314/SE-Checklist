import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InsertImage, Image } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Camera, X, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ImageGalleryProps {
  equipmentType: 'access-points' | 'cameras' | 'elevators' | 'intercoms';
  equipmentId: number;
  equipmentName?: string;
  onClose: () => void;
}

export function ImageGallery({ equipmentType, equipmentId, equipmentName, onClose }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Convert hyphenated type to underscore for API
  const apiEquipmentType = equipmentType.replace('-', '_');

  // Fetch images for this equipment
  const { data: images = [], isLoading } = useQuery<Image[]>({
    queryKey: [`/api/images/${apiEquipmentType}/${equipmentId}`],
    enabled: !!equipmentId
  });

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (imageData: InsertImage) => {
      const res = await apiRequest("POST", "/api/images", imageData);
      return await res.json();
    },
    onSuccess: () => {
      // Close upload dialog
      setUploadDialogOpen(false);
      
      // Invalidate the images query
      queryClient.invalidateQueries({
        queryKey: [`/api/images/${apiEquipmentType}/${equipmentId}`],
      });
      
      toast({
        title: "Image Uploaded",
        description: "The image has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    }
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const res = await apiRequest("DELETE", `/api/images/${imageId}`);
      return await res.json();
    },
    onSuccess: () => {
      // Close image viewer if open
      setSelectedImage(null);
      
      // Invalidate the images query
      queryClient.invalidateQueries({
        queryKey: [`/api/images/${apiEquipmentType}/${equipmentId}`],
      });
      
      toast({
        title: "Image Deleted",
        description: "The image has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "The image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        // Upload the image
        uploadMutation.mutate({
          equipment_type: apiEquipmentType as 'access_point' | 'camera' | 'elevator' | 'intercom',
          equipment_id: equipmentId,
          image_data: event.target.result,
          filename: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Images for {equipmentName || `Equipment ID: ${equipmentId}`}</h3>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Camera className="h-4 w-4" />
          Add Image
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md bg-muted/20">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-md">
            No images have been added yet. Click "Add Image" to upload photos of this equipment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedImage(image)}
            >
              <CardContent className="p-0 aspect-square relative">
                <img 
                  src={image.image_data} 
                  alt={`Image ${image.id}`} 
                  className="w-full h-full object-cover"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Image Viewer Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img 
                src={selectedImage.image_data} 
                alt={`Image ${selectedImage.id}`} 
                className="w-full rounded-md max-h-[70vh] object-contain"
              />
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this image?")) {
                    deleteMutation.mutate(selectedImage.id);
                  }
                }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Image
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload a photo of this equipment. Maximum file size is 5MB.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
            <Camera className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Click the button below to select an image
            </p>
            <Button onClick={triggerFileInput} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Select Image"
              )}
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}