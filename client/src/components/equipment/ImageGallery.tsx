import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InsertImage, Image } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Camera, X, Image as ImageIcon, Loader2 } from "lucide-react";
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
  equipmentType: 'access_point' | 'camera' | 'elevator' | 'intercom';
  equipmentId: number;
  projectId: number;
}

export default function ImageGallery({ equipmentType, equipmentId, projectId }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch images for this equipment
  const { data: images, isLoading } = useQuery<Image[]>({
    queryKey: [`/api/images/${equipmentType}/${equipmentId}`],
    enabled: !!equipmentId
  });

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (imageData: InsertImage) => {
      const res = await apiRequest("POST", "/api/images", imageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/images/${equipmentType}/${equipmentId}`] });
      setUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/images/${equipmentType}/${equipmentId}`] });
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      // Get base64 string without metadata prefix
      const base64String = event.target.result.toString().split(',')[1];
      
      // Create image data
      const imageData: InsertImage = {
        equipment_type: equipmentType,
        equipment_id: equipmentId,
        project_id: projectId,
        image_data: base64String,
        filename: file.name
      };
      
      // Upload image
      uploadMutation.mutate(imageData);
    };
    
    reader.readAsDataURL(file);
  }, [equipmentType, equipmentId, projectId, uploadMutation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Thumbnail gallery */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {images && images.length > 0 ? (
          images.map((image) => (
            <Card 
              key={image.id} 
              className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedImage(image)}
            >
              <CardContent className="p-1">
                <img 
                  src={`data:image/jpeg;base64,${image.image_data}`}
                  alt={image.filename || "Image"}
                  className="w-full h-20 object-cover rounded"
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-muted-foreground">
            <ImageIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No images available</p>
          </div>
        )}
      </div>

      {/* Add image button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setUploadDialogOpen(true)}
      >
        <Camera className="h-4 w-4 mr-2" />
        Add Image
      </Button>

      {/* Upload dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image for this equipment item
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Select Image
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        {selectedImage && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.filename || "Image"}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${selectedImage.image_data}`}
                alt={selectedImage.filename || "Image"}
                className="w-full rounded-md"
              />
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedImage.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}