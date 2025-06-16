import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Download, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EquipmentImage } from "@shared/schema";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentType: string;
  equipmentId: number;
  equipmentName: string;
  onUploadClick?: () => void;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  equipmentType,
  equipmentId,
  equipmentName,
  onUploadClick
}: ImageGalleryModalProps) {
  const [images, setImages] = useState<EquipmentImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EquipmentImage | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const response = await apiRequest("GET", `/api/equipment/${equipmentType}/${equipmentId}/images`);
      const imageData = await response.json();
      setImages(imageData);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [isOpen, equipmentType, equipmentId]);

  const handleDelete = async (imageId: number) => {
    setDeleting(imageId);
    try {
      await apiRequest("DELETE", `/api/equipment/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Success",
        description: "Image deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error", 
        description: "Failed to delete image.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (image: EquipmentImage) => {
    const link = document.createElement('a');
    link.href = image.image_url;
    link.download = image.image_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Images for {equipmentName}</span>
              {onUploadClick && (
                <Button
                  onClick={onUploadClick}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500">Loading images...</p>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-3">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No images uploaded</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload some images to see them here
                  </p>
                  {onUploadClick && (
                    <Button
                      onClick={onUploadClick}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Image
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={image.image_url}
                        alt={image.image_name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNIMy5yYzIuNT0xLjE5IDEuMTkgMi41IDEuMTkuOXYxNi4yczEuMTkuOS44OS45aDE3LjFjLjI5IDAgLjU5LS4xMS44LS4yOVYzeiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJtOSA5Yy42IDAgMS0uNTQgMS0xVjIgOCAxMSIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(image.id);
                            }}
                            disabled={deleting === image.id}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <p className="text-xs font-medium truncate" title={image.image_name}>
                        {image.image_name}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(image.file_size)}</span>
                        <span>{formatDate(image.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60]" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] m-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.image_name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
              <p className="font-medium">{selectedImage.image_name}</p>
              <p className="text-sm text-gray-300">
                {formatFileSize(selectedImage.file_size)} • {formatDate(selectedImage.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}