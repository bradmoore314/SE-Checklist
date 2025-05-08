import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import GeminiTest from "@/components/ai/GeminiTest";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="flex items-center"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-2 px-4"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="account" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-2 px-4"
          >
            Account
          </TabsTrigger>
          <TabsTrigger 
            value="export" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-2 px-4"
          >
            Export
          </TabsTrigger>
          <TabsTrigger 
            value="ai-test" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-2 px-4"
          >
            AI Test
          </TabsTrigger>
          <TabsTrigger 
            value="crm-integration" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-2 px-4"
          >
            CRM Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch id="compact-view" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                  <Switch id="mobile-notifications" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Account settings will be implemented in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export your site walk data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Data export options will be implemented in a future update.</p>
                <div className="flex gap-4">
                  <Button variant="outline" disabled>Export as Excel</Button>
                  <Button variant="outline" disabled>Export as PDF</Button>
                  <Button variant="outline" disabled>Export as CSV</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Test Interface</CardTitle>
              <CardDescription>
                Test the Gemini AI integration with simple prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeminiTest />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crm-integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Integration Settings</CardTitle>
              <CardDescription>
                Connect with Microsoft Dataverse and configure synchronization options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Connection Settings</h3>
                  <p className="text-muted-foreground">Configure your Dataverse connection</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="base_url">Base URL</Label>
                        <input
                          id="base_url"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="https://your-org.crm.dynamics.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="auth_type">Authentication Type</Label>
                        <select 
                          id="auth_type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="oauth2">OAuth 2.0</option>
                          <option value="client_credentials">Client Credentials</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings" className="flex justify-between">
                        <span>Settings (JSON)</span>
                        <span className="text-xs text-muted-foreground">
                          Include clientId, clientSecret, tenantId
                        </span>
                      </Label>
                      <textarea
                        id="settings"
                        placeholder='{"clientId": "your-client-id", "clientSecret": "your-client-secret", "tenantId": "your-tenant-id"}'
                        className="h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline">Test Connection</Button>
                    <Button>Save Settings</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Synchronize with Dataverse</h3>
                      <p className="text-sm text-muted-foreground">
                        Synchronize projects with opportunities in Dataverse.
                      </p>
                    </div>
                    <Button>Start Sync</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Sync Settings</h3>
                  
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}