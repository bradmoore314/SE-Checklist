import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InsertImage, Image } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Camera, X, Image as ImageIcon, Loader2, Trash2, Upload, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface UnifiedImageHandlerProps {
  equipmentType: 'access-points' | 'cameras' | 'elevators' | 'intercoms';
  equipmentId: number;
  projectId: number;
  equipmentName?: string;
  variant?: 'gallery' | 'upload' | 'compact' | 'inline';
  maxImages?: number;
  showThumbnails?: boolean;
  autoSave?: boolean;
  onClose?: () => void;
  onImagesChange?: (images: Image[]) => void;
}

/**
 * Unified Image Handler - Consolidates ImageGallery, ImageUploadSection, and AutoSaveImageUpload
 * Supports multiple display modes and interaction patterns
 */
export function UnifiedImageHandler({ 
  equipmentType, 
  equipmentId, 
  projectId,
  equipmentName,
  variant = 'gallery',
  maxImages = 10,
  showThumbnails = true,
  autoSave = true,
  onClose,
  onImagesChange
}: UnifiedImageHandlerProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing images
  const { data: images = [], isLoading } = useQuery<Image[]>({
    queryKey: [`/api/images/${equipmentType}/${equipmentId}`],
    onSuccess: (data) => {
      onImagesChange?.(data);
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`images`, file);
      });
      formData.append('project_id', projectId.toString());
      formData.append('equipment_type', equipmentType.slice(0, -1)); // Remove 's' from type
      formData.append('equipment_id', equipmentId.toString());

      const response = await apiRequest('POST', '/api/images/upload', formData);
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/images/${equipmentType}/${equipmentId}`]
      });
      toast({
        title: "Success!",
        description: "Images uploaded successfully",
      });
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await apiRequest('DELETE', `/api/images/${imageId}`);
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/images/${equipmentType}/${equipmentId}`]
      });
      toast({
        title: "Success!",
        description: "Image deleted successfully",
      });
      setSelectedImage(null);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (files.length + images.length > maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    if (autoSave) {
      uploadMutation.mutate(files);
    } else {
      setUploadDialogOpen(true);
    }
  }, [images.length, maxImages, autoSave, uploadMutation, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (imageId: number) => {
    deleteMutation.mutate(imageId);
  };

  // Render compact variant (just upload button and count)
  const renderCompactView = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={openFileDialog}
        disabled={uploadMutation.isPending}
        className="flex items-center gap-1"
      >
        {uploadMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        Upload ({images.length})
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );

  // Render upload variant (focused on uploading)
  const renderUploadView = () => (
    <Card className="p-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-primary/50 cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drop images here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
        )}
      </div>

      {showThumbnails && images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={`data:image/jpeg;base64,${image.image_data}`}
                alt={image.filename || 'Equipment image'}
                className="w-full h-16 object-cover rounded cursor-pointer"
                onClick={() => setSelectedImage(image)}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(image.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </Card>
  );

  // Render inline variant (minimal footprint)
  const renderInlineView = () => (
    <div className="flex items-center gap-2">
      {images.slice(0, 3).map((image) => (
        <img
          key={image.id}
          src={`data:image/jpeg;base64,${image.image_data}`}
          alt={image.filename || 'Equipment image'}
          className="w-8 h-8 object-cover rounded cursor-pointer"
          onClick={() => setSelectedImage(image)}
        />
      ))}
      {images.length > 3 && (
        <span className="text-xs text-muted-foreground">+{images.length - 3}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={openFileDialog}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );

  // Render full gallery variant
  const renderGalleryView = () => (
    <Dialog open={true} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {equipmentName ? `Images for ${equipmentName}` : 'Equipment Images'}
          </DialogTitle>
          <DialogDescription>
            Manage photos and documentation for this equipment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              "hover:border-primary/50 cursor-pointer"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            {uploadMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                <span>Drop images here or click to browse</span>
              </div>
            )}
          </div>

          {/* Image Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={`data:image/jpeg;base64,${image.image_data}`}
                    alt={image.filename || 'Equipment image'}
                    className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(image)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No images uploaded yet
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Image preview dialog
  const imagePreviewDialog = selectedImage && (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{selectedImage.filename || 'Image Preview'}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <img
            src={`data:image/jpeg;base64,${selectedImage.image_data}`}
            alt={selectedImage.filename || 'Equipment image'}
            className="max-w-full max-h-96 object-contain"
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => handleDelete(selectedImage.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Image
          </Button>
          <Button variant="outline" onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Choose rendering method based on variant
  return (
    <>
      {variant === 'compact' && renderCompactView()}
      {variant === 'upload' && renderUploadView()}
      {variant === 'inline' && renderInlineView()}
      {variant === 'gallery' && renderGalleryView()}
      {imagePreviewDialog}
    </>
  );
}