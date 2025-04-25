import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, CheckCircle, Info, Cpu, GraduationCap, LifeBuoy, ClipboardList, HelpCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TurnoverCallAgendaProps {
  projectId: number;
}

interface AgendaData {
  introduction: string;
  projectOverview: string;
  keyDeliverables: string[];
  systemComponents: string[];
  trainingItems: string[];
  supportInformation: string;
  clientResponsibilities: string[];
  questionsToAddress: string[];
}

const TurnoverCallAgenda: React.FC<TurnoverCallAgendaProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState<AgendaData | null>(null);
  const [activeTab, setActiveTab] = useState("introduction");
  const { toast } = useToast();

  const generateAgenda = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", `/api/projects/${projectId}/turnover-call-agenda`);
      const data = await res.json();
      
      if (data.success && data.agenda) {
        setAgendaData(data.agenda);
        toast({
          title: "Generated Turnover Call Agenda",
          description: "The turnover call meeting agenda has been successfully generated.",
        });
      } else {
        throw new Error(data.error || "Failed to generate turnover call agenda");
      }
    } catch (error) {
      console.error("Error generating turnover call agenda:", error);
      toast({
        title: "Error",
        description: `Failed to generate turnover call agenda: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            Turnover Call Meeting Agenda
          </CardTitle>
          <CardDescription>
            Generate a comprehensive meeting agenda for project turnover calls with clients. This AI-powered tool creates a structured
            agenda covering all essential handover and training points.
          </CardDescription>
        </CardHeader>

        {!agendaData ? (
          <CardFooter className="pt-0">
            <Button 
              disabled={loading} 
              onClick={generateAgenda}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Agenda...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Turnover Call Agenda
                </>
              )}
            </Button>
          </CardFooter>
        ) : (
          <CardContent>
            <Tabs defaultValue="introduction" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="introduction" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Introduction</span>
                </TabsTrigger>
                <TabsTrigger value="deliverables" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Deliverables</span>
                </TabsTrigger>
                <TabsTrigger value="components" className="flex items-center">
                  <Cpu className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Components</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Training</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="support" className="flex items-center">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Support</span>
                </TabsTrigger>
                <TabsTrigger value="responsibilities" className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Responsibilities</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Questions</span>
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Introduction</h3>
                <p className="whitespace-pre-line">{agendaData.introduction}</p>
              </TabsContent>

              <TabsContent value="overview" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Project Overview</h3>
                <p className="whitespace-pre-line">{agendaData.projectOverview}</p>
              </TabsContent>

              <TabsContent value="deliverables" className="border rounded-md p-4 bg-gradient-to-br from-white to-purple-50">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Key Deliverables</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.keyDeliverables.map((item, index) => (
                    <li key={index} className="text-purple-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="components" className="border rounded-md p-4 bg-gradient-to-br from-white to-pink-50">
                <h3 className="text-lg font-semibold mb-2 text-pink-700">System Components</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.systemComponents.map((item, index) => (
                    <li key={index} className="text-pink-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="training" className="border rounded-md p-4 bg-gradient-to-br from-white to-pink-50">
                <h3 className="text-lg font-semibold mb-2 text-pink-700">Training Items</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.trainingItems.map((item, index) => (
                    <li key={index} className="text-pink-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="support" className="border rounded-md p-4 bg-gradient-to-br from-white to-pink-50">
                <h3 className="text-lg font-semibold mb-2 text-pink-700">Support Information</h3>
                <p className="whitespace-pre-line">{agendaData.supportInformation}</p>
              </TabsContent>

              <TabsContent value="responsibilities" className="border rounded-md p-4 bg-gradient-to-br from-white to-indigo-50">
                <h3 className="text-lg font-semibold mb-2 text-indigo-700">Client Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.clientResponsibilities.map((item, index) => (
                    <li key={index} className="text-indigo-900">{item}</li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="questions" className="border rounded-md p-4 bg-gradient-to-br from-white to-indigo-50">
                <h3 className="text-lg font-semibold mb-2 text-indigo-700">Questions to Address</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {agendaData.questionsToAddress.map((item, index) => (
                    <li key={index} className="text-indigo-900">{item}</li>
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
              className="border-purple-500 text-purple-700 hover:bg-purple-50"
            >
              Reset
            </Button>
            <Button 
              onClick={generateAgenda}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
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

export default TurnoverCallAgenda;