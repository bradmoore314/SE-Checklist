import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, AlertTriangle, CheckCircle, ShieldOff, 
  Check, X, Server, Database, Key 
} from "lucide-react";
import { cn } from "@/lib/utils";

type IntegrationStatus = {
  microsoftAuth: {
    configured: boolean;
    status: string;
    missingCredentials?: string[];
    hasRefreshToken: boolean;
  };
  microsoftGraph: {
    configured: boolean;
    status: string;
    missingCredentials?: string[];
  };
  crmSystems: Record<
    string,
    {
      configured: boolean;
      name: string;
      error?: string;
      status: string;
      missingSettings?: string[];
      authIssue?: boolean;
    }
  >;
  requiredSecrets?: string[];
};

export function CrmIntegrationStatus() {
  const { data, isLoading, error, refetch } = useQuery<IntegrationStatus>({
    queryKey: ["/api/integration/status"],
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load integration status</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { microsoftAuth, microsoftGraph, crmSystems, requiredSecrets } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>CRM Integration Status</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiredSecrets && requiredSecrets.length > 0 && (
          <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Missing Required Secrets</AlertTitle>
            <AlertDescription>
              <div>The following secrets are required for Microsoft integration:</div>
              <ul className="list-disc pl-5 mt-2">
                {requiredSecrets.map((secret) => (
                  <li key={secret}>{secret}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Key size={16} />
              Microsoft Authentication
              <Badge
                variant={microsoftAuth.configured ? "success" : "destructive"}
                className="ml-auto"
              >
                {microsoftAuth.configured ? "Configured" : "Not Configured"}
              </Badge>
            </h3>
            <div className="text-sm">
              <div className="flex items-center text-muted-foreground">
                {microsoftAuth.hasRefreshToken ? (
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <X className="h-4 w-4 text-red-500 mr-2" />
                )}
                User refresh token
              </div>
              {microsoftAuth.missingCredentials && (
                <div className="mt-2">
                  <div className="text-destructive text-xs">
                    Missing credentials:
                  </div>
                  <ul className="list-disc pl-5 text-xs">
                    {microsoftAuth.missingCredentials.map((cred) => (
                      <li key={cred}>{cred}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Server size={16} />
              Microsoft Graph API
              <Badge
                variant={microsoftGraph.configured ? "success" : "destructive"}
                className="ml-auto"
              >
                {microsoftGraph.status}
              </Badge>
            </h3>
            <div className="text-sm">
              {microsoftGraph.missingCredentials && (
                <div className="mt-2">
                  <div className="text-destructive text-xs">
                    Missing credentials:
                  </div>
                  <ul className="list-disc pl-5 text-xs">
                    {microsoftGraph.missingCredentials.map((cred) => (
                      <li key={cred}>{cred}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="font-medium mb-3">CRM Systems</h3>
          <div className="space-y-3">
            {Object.entries(crmSystems).map(([key, crm]) => (
              <div
                key={key}
                className={cn(
                  "p-3 border rounded-md",
                  crm.configured
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    <Database size={16} />
                    {crm.name}
                  </div>
                  <Badge
                    variant={
                      crm.configured
                        ? "success"
                        : crm.error
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {crm.status}
                  </Badge>
                </div>
                {crm.error && (
                  <div className="mt-2 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                    {crm.error}
                  </div>
                )}
                {crm.missingSettings && crm.missingSettings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-amber-800 text-xs font-medium">
                      Missing settings:
                    </div>
                    <ul className="list-disc pl-5 text-xs text-amber-700">
                      {crm.missingSettings.map((setting) => (
                        <li key={setting}>{setting}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {crm.authIssue && (
                  <div className="mt-2 text-xs text-amber-800">
                    <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                    Microsoft authentication issue affects this CRM system
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          {!microsoftAuth.configured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Microsoft Integration Required</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  To enable CRM integration, the following environment variables need to be set:
                </p>
                <ul className="list-disc pl-5">
                  <li>AZURE_CLIENT_ID</li>
                  <li>AZURE_CLIENT_SECRET</li>
                  <li>AZURE_TENANT_ID</li>
                  <li>MS_REFRESH_TOKEN (for user authentication)</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}