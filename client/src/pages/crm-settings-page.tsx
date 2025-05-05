import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Create a schema for the CRM settings form
const crmSettingSchema = z.object({
  crm_type: z.string(),
  base_url: z.string().url("Please enter a valid URL"),
  api_version: z.string().optional(),
  auth_type: z.string(),
  settings: z.string().optional(),
});

type CrmSetting = {
  id: number;
  crm_type: string;
  base_url: string;
  api_version: string | null;
  auth_type: string;
  settings: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

const DataverseSettingsForm = () => {
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  const { data: existingSettings, isLoading: isLoadingSettings } = useQuery<CrmSetting | undefined>({
    queryKey: ['/api/crm/settings/type/dataverse'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/crm/settings/type/dataverse');
        if (!res.ok) {
          if (res.status === 404) {
            return undefined; // No settings found is ok
          }
          throw new Error(`Failed to fetch Dataverse settings: ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching Dataverse settings:", error);
        return undefined;
      }
    }
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(crmSettingSchema),
    defaultValues: {
      crm_type: "dataverse",
      base_url: "",
      api_version: "9.2",
      auth_type: "oauth2",
      settings: "",
    }
  });

  // Update form when existing settings are loaded
  useEffect(() => {
    if (existingSettings) {
      setValue("crm_type", existingSettings.crm_type);
      setValue("base_url", existingSettings.base_url);
      setValue("api_version", existingSettings.api_version || "");
      setValue("auth_type", existingSettings.auth_type);
      setValue("settings", existingSettings.settings || "");
    }
  }, [existingSettings, setValue]);

  const createSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof crmSettingSchema>) => {
      const res = await apiRequest("POST", "/api/crm/settings", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create CRM settings");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Dataverse settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/settings/type/dataverse'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { id: number; settings: Partial<z.infer<typeof crmSettingSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/crm/settings/${data.id}`, data.settings);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update CRM settings");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Dataverse settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/settings/type/dataverse'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: z.infer<typeof crmSettingSchema>) => {
    try {
      // Parse and enhance the settings to ensure it's a valid JSON string
      if (data.settings) {
        try {
          // Attempt to parse as JSON to validate
          const settingsObj = JSON.parse(data.settings);
          // Format it nicely
          data.settings = JSON.stringify(settingsObj, null, 2);
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "The settings field must contain valid JSON.",
            variant: "destructive",
          });
          return;
        }
      }

      if (existingSettings) {
        await updateSettingsMutation.mutateAsync({ 
          id: existingSettings.id, 
          settings: data 
        });
      } else {
        await createSettingsMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const testConnection = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);

      // Get form data for testing
      const formData = {
        url: document.getElementById("base_url") as HTMLInputElement,
        api_version: document.getElementById("api_version") as HTMLInputElement,
        auth_type: document.getElementById("auth_type") as HTMLSelectElement,
        settings: document.getElementById("settings") as HTMLTextAreaElement,
      };

      // Parse settings to extract credentials
      let clientId = "";
      let clientSecret = "";
      let tenantId = "";

      try {
        const settingsObj = JSON.parse(formData.settings.value);
        clientId = settingsObj.clientId || "";
        clientSecret = settingsObj.clientSecret || "";
        tenantId = settingsObj.tenantId || "";
      } catch (e) {
        throw new Error("Invalid settings JSON. Please check the format.");
      }

      if (!clientId || !clientSecret || !tenantId) {
        throw new Error("Missing required credentials in settings. Please provide clientId, clientSecret, and tenantId.");
      }

      // Call the test connection endpoint
      const response = await fetch("/api/crm/dataverse/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.url.value,
          clientId,
          clientSecret,
          tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Connection test failed");
      }

      const result = await response.json();
      setTestResult({
        success: true,
        message: result.message || "Connection successful",
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="base_url">Base URL</Label>
            <Input
              id="base_url"
              placeholder="https://your-org.crm.dynamics.com"
              {...register("base_url")}
            />
            {errors.base_url && (
              <p className="text-sm text-destructive mt-1">{errors.base_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="api_version">API Version</Label>
            <Input
              id="api_version"
              placeholder="9.2"
              {...register("api_version")}
            />
            {errors.api_version && (
              <p className="text-sm text-destructive mt-1">{errors.api_version.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="auth_type">Authentication Type</Label>
            <Select defaultValue="oauth2" {...register("auth_type")}>
              <SelectTrigger id="auth_type">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="client_credentials">Client Credentials</SelectItem>
              </SelectContent>
            </Select>
            {errors.auth_type && (
              <p className="text-sm text-destructive mt-1">{errors.auth_type.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="settings" className="flex justify-between">
              <span>Settings (JSON)</span>
              <span className="text-xs text-muted-foreground">
                Include clientId, clientSecret, tenantId
              </span>
            </Label>
            <Textarea
              id="settings"
              placeholder='{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "tenantId": "your-tenant-id"
}'
              className="h-[240px] font-mono text-sm"
              {...register("settings")}
            />
            {errors.settings && (
              <p className="text-sm text-destructive mt-1">{errors.settings.message}</p>
            )}
          </div>
        </div>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"} className="my-4">
          <div className="flex items-center">
            {testResult.success ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
          </div>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={testConnection}
          disabled={testLoading}
        >
          {testLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingSettings ? "Update Settings" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};

const SyncSettingsForm = () => {
  const { toast } = useToast();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{success: boolean; message: string} | null>(null);

  const startSync = async () => {
    try {
      setSyncLoading(true);
      setSyncResult(null);

      const response = await fetch("/api/crm/dataverse/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }

      const result = await response.json();
      setSyncResult({
        success: true,
        message: `Sync completed. ${result.syncedProjects} projects were synchronized.`,
      });
      
      if (result.syncedProjects > 0) {
        // Invalidate projects query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Synchronize with Microsoft Dataverse</h3>
            <p className="text-sm text-muted-foreground">
              Synchronize projects with opportunities in Dataverse.
            </p>
          </div>
          <Button onClick={startSync} disabled={syncLoading}>
            {syncLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Sync
          </Button>
        </div>

        {syncResult && (
          <Alert variant={syncResult.success ? "default" : "destructive"} className="my-4">
            <div className="flex items-center">
              {syncResult.success ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              <AlertTitle>{syncResult.success ? "Success" : "Error"}</AlertTitle>
            </div>
            <AlertDescription>{syncResult.message}</AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sync Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Auto Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync projects with Dataverse opportunities
              </p>
            </div>
            <Switch id="auto-sync" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-way-sync">Two-way Sync</Label>
              <p className="text-sm text-muted-foreground">
                Changes in either system will be reflected in the other
              </p>
            </div>
            <Switch id="two-way-sync" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-contacts">Sync Contacts</Label>
              <p className="text-sm text-muted-foreground">
                Include contacts in synchronization
              </p>
            </div>
            <Switch id="sync-contacts" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectMappingForm = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Field Mappings</h3>
        <p className="text-muted-foreground">
          Configure how fields map between projects and Dataverse opportunities
        </p>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Project Field</th>
              <th className="py-2 px-4 text-left">Dataverse Field</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4">Name</td>
              <td className="py-2 px-4">
                <Input defaultValue="name" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Client</td>
              <td className="py-2 px-4">
                <Input defaultValue="customerid" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">Site Address</td>
              <td className="py-2 px-4">
                <Input defaultValue="address1_composite" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">SE Name</td>
              <td className="py-2 px-4">
                <Input defaultValue="ownerid" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-4">BDM Name</td>
              <td className="py-2 px-4">
                <Input defaultValue="salesrepid" />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <Button>Save Mappings</Button>
        </div>
      </div>
    </div>
  );
};

export default function CrmSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CRM Integration Settings</h1>
        <p className="text-muted-foreground">
          Configure Microsoft Dataverse integration for project synchronization.
        </p>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Microsoft Dataverse Connection</CardTitle>
              <CardDescription>
                Configure connection settings for Microsoft Dataverse CRM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataverseSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how and when data is synchronized with Dataverse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>
                Configure how fields map between projects and Dataverse opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectMappingForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}