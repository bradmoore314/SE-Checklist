import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FileText, Clock, Settings, ChevronRight, HelpCircle, Sparkles, BanknoteIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuoteReviewAgendaProps {
  projectId: number;
}

interface AgendaData {
  introduction: string;
  scopeReview: string;
  pricingBreakdown: string[];
  technicalConsiderations: string[];
  timeline: string;
  nextSteps: string[];
  questionsToAsk: string[];
}

const QuoteReviewAgenda: React.FC<QuoteReviewAgendaProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState<AgendaData | null>(null);
  const [activeTab, setActiveTab] = useState("introduction");
  const { toast } = useToast();

  const generateAgenda = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/projects/${projectId}/quote-review-agenda`);
      const data = await res.json();
      
      if (data.success && data.agenda) {
        setAgendaData(data.agenda);
        toast({
          title: "Generated Quote Review Agenda",
          description: "The quote review meeting agenda has been successfully generated.",
        });
      } else {
        throw new Error(data.error || "Failed to generate quote review agenda");
      }
    } catch (error) {
      console.error("Error generating quote review agenda:", error);
      toast({
        title: "Error",
        description: `Failed to generate quote review agenda: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 text-transparent bg-clip-text">
            Quote Review Meeting Agenda
          </CardTitle>
          <CardDescription>
            Generate a comprehensive meeting agenda for reviewing quotes with clients. This AI-powered tool creates a structured
            format covering all essential discussion points.
          </CardDescription>
        </CardHeader>

        {!agendaData ? (
          <CardFooter className="pt-0">
            <Button 
              disabled={loading} 
              onClick={generateAgenda}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Agenda...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quote Review Agenda
                </>
              )}
            </Button>
          </CardFooter>
        ) : (
          <CardContent>
            <Tabs defaultValue="introduction" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-7 mb-4">
                <TabsTrigger value="introduction" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Introduction</span>
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Scope</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center">
                  <BanknoteIcon className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Technical</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="next-steps" className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Next Steps</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Questions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="border rounded-md p-4 bg-gradient-to-br from-white to-emerald-50">
                <h3 className="text-lg font-semibold mb-2 text-emerald-700">Introduction</h3>
                <p className="whitespace-pre-line">{agendaData.introduction}</p>
              </TabsContent>

              <TabsContent value="scope" className="border rounded-md p-4 bg-gradient-to-br from-white to-emerald-50">
                <h3 className="text-lg font-semibold mb-2 text-emerald-700">Scope Review</h3>
                <p className="whitespace-pre-line">{agendaData.scopeReview}</p>
              </TabsContent>

              <TabsContent value="pricing" className="border rounded-md p-4 bg-gradient-to-br from-white to-blue-50">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Pricing Breakdown</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.pricingBreakdown.map((item, index) => (
                    <li key={index} className="text-blue-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="technical" className="border rounded-md p-4 bg-gradient-to-br from-white to-blue-50">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Technical Considerations</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.technicalConsiderations.map((item, index) => (
                    <li key={index} className="text-blue-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="timeline" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Timeline</h3>
                <p className="whitespace-pre-line">{agendaData.timeline}</p>
              </TabsContent>

              <TabsContent value="next-steps" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Next Steps</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.nextSteps.map((item, index) => (
                    <li key={index} className="text-purple-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="questions" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Questions to Ask</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.questionsToAsk.map((item, index) => (
                    <li key={index} className="text-purple-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
        
        {agendaData && (
          <CardFooter className="pt-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setAgendaData(null)}
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
            >
              Reset
            </Button>
            <Button 
              onClick={generateAgenda}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QuoteReviewAgenda;