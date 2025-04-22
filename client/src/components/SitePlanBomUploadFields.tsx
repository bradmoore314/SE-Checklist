import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SitePlanBomUploadFieldsProps {
  projectId: number;
  onSitePlanUploaded?: (url: string, fileName: string) => void;
  onBomUploaded?: (url: string, fileName: string) => void;
  className?: string;
}

/**
 * Component for uploading site plans and BOMs (Bill of Materials)
 * Part of the Site Assessment tab
 */
export function SitePlanBomUploadFields({
  projectId,
  onSitePlanUploaded,
  onBomUploaded,
  className = ""
}: SitePlanBomUploadFieldsProps) {
  const { toast } = useToast();
  const [sitePlanUrl, setSitePlanUrl] = useState<string>("");
  const [bomUrl, setBomUrl] = useState<string>("");

  // Handle file upload for site plan
  const handleSitePlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll just set a placeholder URL
    // In a real implementation, this would upload the file to a server
    const fakeUrl = `https://storage.example.com/site-plans/${projectId}/${file.name}`;
    setSitePlanUrl(fakeUrl);
    
    toast({
      title: "Site Plan Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
    
    if (onSitePlanUploaded) {
      onSitePlanUploaded(fakeUrl, file.name);
    }
  };

  // Handle file upload for BOM
  const handleBomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll just set a placeholder URL
    // In a real implementation, this would upload the file to a server
    const fakeUrl = `https://storage.example.com/boms/${projectId}/${file.name}`;
    setBomUrl(fakeUrl);
    
    toast({
      title: "BOM Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
    
    if (onBomUploaded) {
      onBomUploaded(fakeUrl, file.name);
    }
  };

  // Handle URL input changes
  const handleSitePlanUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setSitePlanUrl(url);
    
    if (onSitePlanUploaded && url) {
      onSitePlanUploaded(url, "External Site Plan Link");
    }
  };

  const handleBomUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setBomUrl(url);
    
    if (onBomUploaded && url) {
      onBomUploaded(url, "External BOM Link");
    }
  };

  return (
    <div className={className}>
      {/* Site Plan Upload */}
      <div className="mb-5">
        <Label className="mb-2 font-medium">Site Plan</Label>
        <div className="space-y-3">
          <div className="flex">
            <Input
              type="text"
              placeholder="Enter URL to site plan document"
              value={sitePlanUrl}
              onChange={handleSitePlanUrlChange}
              className="flex-grow rounded-r-none"
            />
            <div className="relative">
              <Input
                type="file"
                id="site-plan-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.dwg"
                onChange={handleSitePlanUpload}
              />
              <Button variant="secondary" className="h-full rounded-l-none">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Upload site plan document or provide a URL to existing document
          </div>
        </div>
      </div>

      {/* BOM Upload */}
      <div>
        <Label className="mb-2 font-medium">Bill of Materials (BOM)</Label>
        <div className="space-y-3">
          <div className="flex">
            <Input
              type="text"
              placeholder="Enter URL to BOM document"
              value={bomUrl}
              onChange={handleBomUrlChange}
              className="flex-grow rounded-r-none"
            />
            <div className="relative">
              <Input
                type="file"
                id="bom-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleBomUpload}
              />
              <Button variant="secondary" className="h-full rounded-l-none">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Upload BOM document or provide a URL to existing document
          </div>
        </div>
      </div>
    </div>
  );
}