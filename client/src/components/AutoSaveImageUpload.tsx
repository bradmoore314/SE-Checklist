import { useState } from "react";
import { FileIcon, UploadIcon, ImageIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AutoSaveImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  entity: string;
  className?: string;
  multiple?: boolean;
}

/**
 * Component for automatically saving uploaded images
 * Eliminates the "save before adding images" error
 */
export function AutoSaveImageUpload({
  onUpload,
  entity = "item",
  className = "",
  multiple = false
}: AutoSaveImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process all files when multiple, or just the first one when single
    const filesToProcess = multiple ? Array.from(files) : [files[0]];
    
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload image files only",
          variant: "destructive",
        });
        continue;
      }
      
      setIsUploading(true);
      
      try {
        // Calculate progress for each file in the batch
        const fileProgress = (i / filesToProcess.length) * 100;
        setProgress(fileProgress);
        
        // Wait for the upload to complete
        await onUpload(file);
        
        // Update progress
        setProgress(((i + 1) / filesToProcess.length) * 100);
        
        toast({
          title: "Image uploaded",
          description: `The image was uploaded successfully`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
    
    // Reset the form
    setIsUploading(false);
    setProgress(0);
    e.target.value = ""; // Clear the file input
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-base">Images</Label>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="relative overflow-hidden"
          disabled={isUploading}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            multiple={multiple}
            disabled={isUploading}
          />
          <UploadIcon className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : `Add Image${multiple ? "s" : ""}`}
        </Button>
        
        {multiple && (
          <div className="text-sm text-muted-foreground">
            You can select multiple images
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}