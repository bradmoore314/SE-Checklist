import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileIcon, UploadIcon, XIcon, LinkIcon, ExternalLinkIcon } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  value: { file?: File | null; url?: string | null };
  onChange: (value: { file?: File | null; url?: string | null }) => void;
  accept?: string;
  allowUrl?: boolean;
  helperText?: string;
  className?: string;
}

/**
 * A component for uploading files or providing URLs
 * Used for Site Plan & BOM upload/link fields
 */
export function FileUploadField({
  label,
  value,
  onChange,
  accept = "*/*",
  allowUrl = true,
  helperText = "",
  className = ""
}: FileUploadFieldProps) {
  const [mode, setMode] = useState<"upload" | "url">(value.url ? "url" : "upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange({ file, url: null });
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange({ url, file: null });
  };
  
  const handleClear = () => {
    onChange({ file: null, url: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const toggleMode = () => {
    setMode(mode === "upload" ? "url" : "upload");
    // Clear current value when switching modes
    onChange({ file: null, url: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const fileName = value.file?.name;
  const fileUrl = value.url;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label className="text-base">{label}</Label>
        {allowUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className="h-7 px-2 text-xs"
          >
            {mode === "upload" ? (
              <>
                <LinkIcon className="h-3 w-3 mr-1" />
                Use URL Instead
              </>
            ) : (
              <>
                <FileIcon className="h-3 w-3 mr-1" />
                Upload File Instead
              </>
            )}
          </Button>
        )}
      </div>
      
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      
      {mode === "upload" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="max-w-md"
            />
            {fileName && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {fileName && (
            <div className="flex items-center space-x-2 text-sm">
              <FileIcon className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={fileUrl || ""}
              onChange={handleUrlChange}
              className="max-w-md"
            />
            {fileUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {fileUrl && (
            <div className="flex items-center space-x-2 text-sm">
              <LinkIcon className="h-4 w-4" />
              <span className="font-medium">{fileUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => window.open(fileUrl, "_blank")}
                className="h-6 w-6"
              >
                <ExternalLinkIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}