import React from "react";
import QuoteReviewAgenda from "./QuoteReviewAgenda";
import TurnoverCallAgenda from "./TurnoverCallAgenda";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgendaContainerProps {
  projectId: number;
}

const AgendaContainer: React.FC<AgendaContainerProps> = ({ projectId }) => {
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
          Meeting Agenda Generator
        </CardTitle>
        <CardDescription>
          Generate professional meeting agendas powered by AI. Select the type of meeting you're planning and our AI will create a comprehensive agenda based on your project details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quote-review" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="quote-review" className="text-base">Quote Review Meeting</TabsTrigger>
            <TabsTrigger value="turnover-call" className="text-base">Turnover Call Meeting</TabsTrigger>
          </TabsList>
          <TabsContent value="quote-review">
            <QuoteReviewAgenda projectId={projectId} />
          </TabsContent>
          <TabsContent value="turnover-call">
            <TurnoverCallAgenda projectId={projectId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgendaContainer;