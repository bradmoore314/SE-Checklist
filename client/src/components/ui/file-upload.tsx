import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, File, X, Check } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  title?: string;
  description?: string;
  id?: string;
  className?: string;
  value?: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadComplete?: boolean;
  error?: string;
}

export function FileUpload({
  onFileUpload,
  accept = "application/pdf,image/*",
  maxSize = 10, // 10MB default
  title = "Upload a file",
  description = "Drag and drop a file here, or click to select a file",
  id = "file-upload",
  className = "",
  value = null,
  isUploading = false,
  uploadProgress = 0,
  uploadComplete = false,
  error = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(value);
  const [localError, setLocalError] = useState<string>(error);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setLocalError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type if accept is provided
    if (accept) {
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const fileType = file.type;
      
      // Special handling for PDFs and images
      if (acceptedTypes.includes("application/pdf") && fileType === "application/pdf") {
        return true;
      }
      
      if (acceptedTypes.includes("image/*") && fileType.startsWith("image/")) {
        return true;
      }
      
      // Direct match check
      if (acceptedTypes.includes(fileType)) {
        return true;
      }
      
      setLocalError(`File type not accepted. Please upload ${accept}`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setLocalError("");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError("");
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileUpload(null as any);
  };

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center 
            ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground" />
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            className="mt-2"
          >
            Browse Files
          </Button>
          <Input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          {localError && (
            <p className="text-sm text-destructive mt-2">{localError}</p>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && !uploadComplete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {uploadComplete && (
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}