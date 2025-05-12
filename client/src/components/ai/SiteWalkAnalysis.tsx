import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Badge,
  AlertCircle, 
  Brain, 
  FileCheck, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart4, 
  Lightbulb, 
  Loader2, 
  Timer 
} from 'lucide-react';
import { generateAiAnalysis, AiAnalysisResponse } from '@/utils/azure-openai';
import { toast } from '@/hooks/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OpportunityAnalysisProps {
  projectId: number;
}

export function OpportunityAnalysis({ projectId }: OpportunityAnalysisProps) {
  return <SiteWalkAnalysis projectId={projectId} />;
}

export function SiteWalkAnalysis({ projectId }: OpportunityAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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

  // Function to render the summary content with enhanced styling
  const renderSummary = () => {
    if (!analysis || typeof analysis.summary !== 'string') {
      return <p className="text-gray-600">No summary available yet</p>;
    }
    
    return (
      <div className="space-y-4">
        {analysis.summary.split('\n\n').map((paragraph, idx) => (
          <div key={idx} className="mb-4">
            {paragraph.startsWith('- ') ? (
              <ul className="list-disc pl-5 space-y-2">
                {paragraph.split('\n').map((item, i) => (
                  <li key={i} className="mb-1 text-slate-700">
                    {formatBoldText(item.replace('- ', ''))}
                  </li>
                ))}
              </ul>
            ) : paragraph.includes(':') && !paragraph.includes('\n') ? (
              <div>
                <h4 className="font-medium text-base mb-1 text-primary">{paragraph.split(':')[0]}:</h4>
                <p className="text-slate-700">{paragraph.split(':').slice(1).join(':').trim()}</p>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed">{formatBoldText(paragraph)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Function to render the technical analysis content with enhanced styling
  const renderTechnicalAnalysis = () => {
    if (!analysis || typeof analysis.detailedAnalysis !== 'string') {
      return <p className="text-gray-600">No technical details available yet</p>;
    }
    
    return (
      <div className="space-y-4">
        {analysis.detailedAnalysis.split('\n\n').map((paragraph, idx) => (
          <div key={idx} className="mb-4">
            {paragraph.startsWith('# ') ? (
              <h3 className="text-lg font-semibold mt-5 mb-3 text-primary border-b pb-1">
                {formatBoldText(paragraph.replace('# ', ''))}
              </h3>
            ) : paragraph.startsWith('## ') ? (
              <h4 className="text-base font-medium mt-4 mb-2 text-secondary">{paragraph.replace('## ', '')}</h4>
            ) : paragraph.startsWith('- ') ? (
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                {paragraph.split('\n').map((item, i) => (
                  <li key={i} className="mb-1">
                    {formatBoldText(item.replace('- ', ''))}
                  </li>
                ))}
              </ul>
            ) : paragraph.includes(':') && !paragraph.includes('\n') ? (
              <div className="flex">
                <span className="font-medium text-primary mr-1">{paragraph.split(':')[0]}:</span>
                <span className="text-slate-700">{paragraph.split(':').slice(1).join(':').trim()}</span>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed">{formatBoldText(paragraph)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Helper function to format bold text (text between ** markers)
  const formatBoldText = (text: string) => {
    if (!text) return null;
    return text.split('**').map((part, i) => 
      i % 2 === 0 ? part : <strong key={i} className="text-primary">{part}</strong>
    );
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-b from-white to-slate-50">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow">
            <Brain className="h-5 w-5 text-white" />
          </div>
          Gemini AI Site Analysis
        </CardTitle>
        <CardDescription className="text-slate-700">
          Generate AI-powered insights from your site walk data to enhance technical planning and streamline installation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-6">
        {!analysis ? (
          <>
            {showNoDataWarning() && (
              <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limited Data Available</AlertTitle>
                <AlertDescription>
                  Add more equipment and scope information to get a comprehensive AI analysis.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-xl border p-6 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                What this AI assistant can do
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Executive Summary</p>
                    <p className="text-sm text-slate-600">Concise project scope overview for stakeholders</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Technical Details</p>
                    <p className="text-sm text-slate-600">Comprehensive specifications for installation teams</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-1 rounded-full mr-3 mt-0.5">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Key Recommendations</p>
                    <p className="text-sm text-slate-600">Actionable insights to enhance project success</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 p-1 rounded-full mr-3 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Risk Assessment</p>
                    <p className="text-sm text-slate-600">Potential challenges with mitigation strategies</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center py-4">
              <Button 
                disabled={loading} 
                onClick={generateAnalysis}
                size="lg" 
                className="gap-2 relative group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-indigo-600/20 rounded-md blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Site Data...
                  </>
                ) : (
                  <>
                    <span className="material-icons">auto_awesome</span>
                    Generate AI Analysis
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Technical Details
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risks
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-0">
              <div className="rounded-xl border border-blue-100 p-6 bg-gradient-to-br from-blue-50 to-slate-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-blue-600" />
                    Executive Summary
                  </h3>
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Project Overview
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {renderSummary()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="mt-0">
              <div className="rounded-xl border border-indigo-100 p-6 bg-gradient-to-br from-indigo-50 to-slate-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-indigo-700 flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-2 text-indigo-600" />
                    Technical Analysis
                  </h3>
                  <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    Implementation Details
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {renderTechnicalAnalysis()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-0">
              <div className="rounded-xl border border-purple-100 p-6 bg-gradient-to-br from-purple-50 to-slate-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-purple-700 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-600" />
                    Key Recommendations
                  </h3>
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    Strategic Insights
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysis && analysis.recommendations.map((recommendation, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700">{formatBoldText(recommendation)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="risks" className="mt-0">
              <div className="rounded-xl border border-amber-100 p-6 bg-gradient-to-br from-amber-50 to-slate-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-amber-700 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                    Risk Assessment
                  </h3>
                  <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    Potential Challenges
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysis && analysis.risks.map((risk, idx) => (
                    <Collapsible key={idx} className="border border-amber-100 rounded-lg bg-white overflow-hidden shadow-sm">
                      <CollapsibleTrigger
                        onClick={() => toggleSection(`risk-${idx}`)}
                        className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-slate-800">{risk.split(':')[0] || risk}</span>
                        </div>
                        {expandedSection === `risk-${idx}` ? (
                          <ChevronUp className="h-4 w-4 text-amber-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-amber-500" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 pt-0 border-t border-amber-100 bg-amber-50/40">
                        <p className="text-slate-700 pl-9">
                          {risk.includes(':') ? risk.split(':').slice(1).join(':').trim() : 'Consider mitigation strategies for this risk.'}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h4 className="text-base font-medium mb-3 text-amber-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Implementation Timeline
                  </h4>
                  <div className="p-4 border border-amber-100 rounded-lg bg-white">
                    <div className="prose prose-sm max-w-none text-slate-700">
                      {formatBoldText(analysis?.timeline || "Timeline information not available")}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {analysis && (
        <CardFooter className="flex justify-between border-t p-4 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center">
            <Timer className="h-4 w-4 text-slate-500 mr-2" />
            <span className="text-xs text-slate-500">Generated {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setAnalysis(null)}
              className="border-slate-200 text-slate-700"
            >
              Reset
            </Button>
            <Button 
              disabled={loading} 
              onClick={generateAnalysis}
              className="gap-2 relative group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow hover:shadow-blue-500/30 transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-indigo-600/20 rounded-md blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">auto_awesome</span>
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}