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
              <div className="rounded-md border p-4 bg-gradient-to-r from-white to-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-primary">Executive Summary</h3>
                <div className="prose prose-sm max-w-none">
                  {analysis.summary.split('\n\n').map((paragraph, idx) => (
                    <div key={idx} className="mb-4">
                      {paragraph.startsWith('- ') ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {paragraph.split('\n').map((item, i) => (
                            <li key={i} className="mb-1">
                              {item.replace('- ', '').split('**').map((part, j) => 
                                j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : paragraph.includes(':') && !paragraph.includes('\n') ? (
                        <div>
                          <h4 className="font-medium text-base mb-1">{paragraph.split(':')[0]}:</h4>
                          <p>{paragraph.split(':').slice(1).join(':').trim()}</p>
                        </div>
                      ) : (
                        <p>{paragraph.split('**').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                        )}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="mt-4">
              <div className="rounded-md border p-4 bg-gradient-to-r from-white to-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-primary">Technical Analysis</h3>
                <div className="prose prose-sm max-w-none">
                  {analysis.detailedAnalysis.split('\n\n').map((paragraph, idx) => (
                    <div key={idx} className="mb-4">
                      {paragraph.startsWith('# ') ? (
                        <h3 className="text-base font-semibold mt-4 mb-2">
                          {paragraph.replace('# ', '').split('**').map((part, j) => 
                            j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                          )}
                        </h3>
                      ) : paragraph.startsWith('## ') ? (
                        <h4 className="text-sm font-medium mt-3 mb-2">{paragraph.replace('## ', '')}</h4>
                      ) : paragraph.startsWith('- ') ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {paragraph.split('\n').map((item, i) => (
                            <li key={i} className="mb-1">
                              {item.replace('- ', '').split('**').map((part, j) => 
                                j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : paragraph.includes(':') && !paragraph.includes('\n') ? (
                        <div>
                          <span className="font-medium">{paragraph.split(':')[0]}:</span>
                          {paragraph.split(':').slice(1).join(':').trim()}
                        </div>
                      ) : (
                        <p>{paragraph.split('**').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                        )}</p>
                      )}
                    </div>
                  ))}
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