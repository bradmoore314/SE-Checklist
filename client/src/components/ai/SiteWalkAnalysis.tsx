import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, FileCheck, FileSpreadsheet } from 'lucide-react';
import { generateAiAnalysis, AiAnalysisResponse } from '@/utils/gemini';
import { toast } from '@/hooks/use-toast';
import { useProject } from '@/context/ProjectContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SiteWalkAnalysisProps {
  projectId: number;
}

export function SiteWalkAnalysis({ projectId }: SiteWalkAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const { currentProject } = useProject();

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      const result = await generateAiAnalysis(projectId);
      setAnalysis(result);
      toast({
        title: "Analysis Generated",
        description: "The AI has analyzed your site walk data."
      });
    } catch (error) {
      console.error("Failed to generate analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not generate analysis"
      });
    } finally {
      setLoading(false);
    }
  };

  // Display a notice when there's no equipment
  const showNoDataWarning = () => {
    // Check if there's no data to analyze
    if (!currentProject || (
        !currentProject.replace_readers && 
        !currentProject.install_locks &&
        !currentProject.pull_wire &&
        !currentProject.wireless_locks &&
        !currentProject.conduit_drawings &&
        !currentProject.need_credentials &&
        !currentProject.photo_id &&
        !currentProject.photo_badging &&
        !currentProject.ble &&
        !currentProject.test_card &&
        !currentProject.visitor &&
        !currentProject.guard_controls &&
        !currentProject.floorplan &&
        !currentProject.reports_available &&
        !currentProject.kastle_connect &&
        !currentProject.on_site_security &&
        !currentProject.takeover &&
        !currentProject.rush &&
        !currentProject.ppi_quote_needed
    )) {
      return true;
    }
    return false;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-red-600" />
          AI Site Walk Analysis
        </CardTitle>
        <CardDescription>
          Generate an AI-powered analysis of your site walk data to help with technical planning and installation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!analysis ? (
          <>
            {showNoDataWarning() && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limited Data Available</AlertTitle>
                <AlertDescription>
                  Add more equipment and scope information to get a better AI analysis.
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground mb-4">
              Our AI assistant will analyze all your site walk data and provide both a concise overview
              and a detailed technical guide for installation teams.
            </p>
            
            <div className="flex justify-center py-8">
              <Button 
                disabled={loading} 
                onClick={generateAnalysis}
                size="lg" 
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Technical Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <div className="whitespace-pre-line text-sm">
                  {analysis.summary}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="mt-4">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
                <div className="whitespace-pre-line text-sm">
                  {analysis.detailedAnalysis}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {analysis && (
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAnalysis(null)}
          >
            Reset
          </Button>
          <Button 
            disabled={loading} 
            onClick={generateAnalysis}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}