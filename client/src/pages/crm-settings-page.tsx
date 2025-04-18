import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CrmIntegrationStatus } from "@/components/settings/CrmIntegrationStatus";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heading } from "@/components/ui/heading";

interface CrmSettings {
  id: number;
  crm_type: string;
  base_url: string;
  api_version: string | null;
  auth_type: string;
  settings: Record<string, any>;
  created_at: string | null;
  updated_at: string | null;
}

export default function CrmSettingsPage() {
  const { toast } = useToast();
  const [crmType, setCrmType] = useState("dynamics365");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [authType, setAuthType] = useState("oauth2");
  const [sharePointSiteId, setSharePointSiteId] = useState("");
  const [sharePointDriveId, setSharePointDriveId] = useState("");
  const [opportunitiesFolderId, setOpportunitiesFolderId] = useState("");

  const { data: crmSettings, isLoading: isLoadingSettings } = useQuery<CrmSettings[]>({
    queryKey: ["/api/crm-settings"],
    refetchOnWindowFocus: false,
  });

  const createCrmSettings = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/crm-settings", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create CRM settings");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CRM settings created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crm-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integration/status"] });
      
      // Reset form
      setBaseUrl("");
      setApiVersion("");
      setSharePointSiteId("");
      setSharePointDriveId("");
      setOpportunitiesFolderId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings: Record<string, any> = {
      sharePointSiteId,
      sharePointDriveId,
    };
    
    if (opportunitiesFolderId) {
      settings.opportunitiesFolderId = opportunitiesFolderId;
    }
    
    createCrmSettings.mutate({
      crm_type: crmType,
      base_url: baseUrl,
      api_version: apiVersion || undefined,
      auth_type: authType,
      settings,
    });
  };

  // Find existing settings for the current CRM type
  const currentCrmSettings = crmSettings?.find(
    (setting) => setting.crm_type === crmType
  );

  return (
    <div className="container py-8">
      <Heading 
        title="CRM Integration Settings" 
        description="Configure Microsoft Dataverse and Dynamics 365 integration" 
      />
      
      <div className="grid gap-6 mt-6">
        <CrmIntegrationStatus />
        
        <Card>
          <CardHeader>
            <CardTitle>Add CRM Configuration</CardTitle>
            <CardDescription>
              Connect to your Dynamics 365 or Dataverse environment
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crm-type">CRM Type</Label>
                <Select
                  value={crmType}
                  onValueChange={(value) => setCrmType(value)}
                >
                  <SelectTrigger id="crm-type">
                    <SelectValue placeholder="Select CRM type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamics365">Dynamics 365</SelectItem>
                    <SelectItem value="dataverse">Dataverse</SelectItem>
                  </SelectContent>
                </Select>
                {currentCrmSettings && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Note: This CRM type already has a configuration. Creating a new one will replace it.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-org.crm.dynamics.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for your Microsoft Dynamics or Dataverse environment
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-version">API Version</Label>
                <Input
                  id="api-version"
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder="v9.2"
                />
                <p className="text-xs text-muted-foreground">
                  The API version to use (e.g., v9.2)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select
                  value={authType}
                  onValueChange={(value) => setAuthType(value)}
                >
                  <SelectTrigger id="auth-type">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium">SharePoint Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure SharePoint integration for document storage
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sharepoint-site-id">SharePoint Site ID</Label>
                    <Input
                      id="sharepoint-site-id"
                      value={sharePointSiteId}
                      onChange={(e) => setSharePointSiteId(e.target.value)}
                      placeholder="your-tenant.sharepoint.com,guid,guid"
                    />
                    <p className="text-xs text-muted-foreground">
                      The ID of your SharePoint site
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sharepoint-drive-id">SharePoint Drive ID</Label>
                    <Input
                      id="sharepoint-drive-id"
                      value={sharePointDriveId}
                      onChange={(e) => setSharePointDriveId(e.target.value)}
                      placeholder="drive-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      The ID of the document library in SharePoint
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="opportunities-folder-id">Opportunities Folder ID (Optional)</Label>
                    <Input
                      id="opportunities-folder-id"
                      value={opportunitiesFolderId}
                      onChange={(e) => setOpportunitiesFolderId(e.target.value)}
                      placeholder="folder-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      The ID of the folder to store opportunities in (defaults to root if not provided)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={createCrmSettings.isPending}
                className="ml-auto"
              >
                {createCrmSettings.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {crmSettings && crmSettings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Existing CRM Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crmSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{setting.crm_type}</h3>
                      <span className="text-sm text-muted-foreground">
                        {setting.auth_type}
                      </span>
                    </div>
                    <p className="text-sm">{setting.base_url}</p>
                    {setting.api_version && (
                      <p className="text-xs text-muted-foreground">
                        API Version: {setting.api_version}
                      </p>
                    )}
                    {setting.settings && (
                      <div className="text-xs mt-2">
                        <p className="font-medium">SharePoint Settings:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {Object.entries(setting.settings).map(([key, value]) => (
                            <li key={key}>
                              {key}: {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}