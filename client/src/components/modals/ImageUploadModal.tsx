import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { uploadEquipmentImage, saveImageMetadata } from "@/lib/imageStorage";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentType: string;
  equipmentId: number;
  projectId: number;
  equipmentName: string;
  onUploadSuccess?: () => void;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  equipmentType,
  equipmentId,
  projectId,
  equipmentName,
  onUploadSuccess
}: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only image files are allowed.",
        variant: "destructive",
      });
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };



  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedImages = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        try {
          // Upload image using fallback-enabled storage
          const imageUrl = await uploadEquipmentImage(file, equipmentType, equipmentId, projectId);
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

          // Save metadata to database using centralized function
          await saveImageMetadata(
            projectId,
            equipmentType,
            equipmentId,
            imageUrl,
            file.name,
            file.size,
            file.type
          );
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          uploadedImages.push(file.name);

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${(error as Error).message}`,
            variant: "destructive",
          });
        }
      }

      if (uploadedImages.length > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${uploadedImages.length} image(s) for ${equipmentName}.`,
        });
        
        onUploadSuccess?.();
        onClose();
      }

    } finally {
      setUploading(false);
      setUploadProgress({});
      setSelectedFiles([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Images for {equipmentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to select images or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Selected Files:</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {uploading && uploadProgress[file.name] !== undefined && (
                    <div className="text-xs text-gray-500">
                      {uploadProgress[file.name]}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-700">Uploading images...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}