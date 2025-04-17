import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Question data types
interface ProjectQuestion {
  id: string;
  question: string;
  category: string;
  canBeAnswered: boolean;
  answerSource: string; // 'existing_field', 'derived', 'new_field', 'conversational'
  fieldPath?: string;
  options?: string[];
  additionalNotes?: string;
}

interface ProjectQuestionsAnalysisProps {
  projectId: number;
}

const sourceColors = {
  existing_field: "bg-green-100 text-green-800 border-green-300",
  derived: "bg-blue-100 text-blue-800 border-blue-300",
  new_field: "bg-yellow-100 text-yellow-800 border-yellow-300",
  conversational: "bg-purple-100 text-purple-800 border-purple-300",
};

const ProjectQuestionsAnalysis: React.FC<ProjectQuestionsAnalysisProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("questions");
  const [generateAiSummary, setGenerateAiSummary] = useState(false);
  
  // Fetch analysis data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/projects", projectId, "ai-analysis", "questions", { full: generateAiSummary }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${projectId}/ai-analysis/questions${generateAiSummary ? "?full=true" : ""}`);
      return await res.json();
    },
    enabled: !!projectId
  });
  
  const handleGenerateAiSummary = () => {
    setGenerateAiSummary(true);
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analysis...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error Loading Analysis
        </h3>
        <p className="mt-2">Failed to load project questions analysis. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md">
        <h3 className="font-bold flex items-center">
          <Info className="h-5 w-5 mr-2" />
          No Data Available
        </h3>
        <p className="mt-2">No analysis data is available for this project.</p>
      </div>
    );
  }
  
  const { staticAnalysis, aiAnalysis } = data;
  const { answerableQuestions, totalQuestions, questionsByCategory, newFieldsNeeded } = staticAnalysis;
  
  const completionPercentage = Math.round((answerableQuestions / totalQuestions) * 100);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Information Analysis</span>
          <Badge variant="outline" className="ml-2">
            {answerableQuestions} of {totalQuestions} questions answerable ({completionPercentage}%)
          </Badge>
        </CardTitle>
        <CardDescription>
          Analysis of which project information questions can be answered with existing data and which require additional input.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Analysis Completion</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="questions">Questions Analysis</TabsTrigger>
            <TabsTrigger value="summary">
              AI Summary
              {!aiAnalysis && <Badge variant="outline" className="ml-2">Generate</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Answerable Questions</CardTitle>
                    <CardDescription>Questions we can answer with existing data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                        <span className="text-2xl font-bold">{answerableQuestions}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        {completionPercentage}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Unanswerable Questions</CardTitle>
                    <CardDescription>Questions requiring additional data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <XCircle className="h-8 w-8 text-yellow-500 mr-2" />
                        <span className="text-2xl font-bold">{totalQuestions - answerableQuestions}</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {100 - completionPercentage}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(questionsByCategory).map(([category, questions]) => {
                  const categoryAnswerable = questions.filter(q => q.canBeAnswered).length;
                  const categoryCompletion = Math.round((categoryAnswerable / questions.length) * 100);
                  
                  return (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="flex items-center justify-between px-4">
                        <div className="flex-1 text-left">{category}</div>
                        <div className="flex items-center gap-2 mr-4">
                          <Badge>
                            {categoryAnswerable}/{questions.length}
                          </Badge>
                          <Progress value={categoryCompletion} className="w-24 h-2" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50%]">Question</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questions.map((question: ProjectQuestion) => (
                              <TableRow key={question.id}>
                                <TableCell className="font-medium">{question.question}</TableCell>
                                <TableCell>
                                  {question.canBeAnswered ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                      Answerable
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                      Needs Input
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={sourceColors[question.answerSource as keyof typeof sourceColors]}>
                                    {question.answerSource === "existing_field" && "Existing Field"}
                                    {question.answerSource === "derived" && "Can Be Derived"}
                                    {question.answerSource === "new_field" && "Needs New Field"}
                                    {question.answerSource === "conversational" && "Needs Discussion"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {question.additionalNotes || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Schema Updates</CardTitle>
                  <CardDescription>New fields needed to answer more questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Field Type</TableHead>
                        <TableHead>Parent Schema</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newFieldsNeeded.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{field.fieldName}</TableCell>
                          <TableCell>{field.fieldType}</TableCell>
                          <TableCell>{field.parentSchema}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            {!aiAnalysis ? (
              <div className="p-8 border rounded-md flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium mb-2">Generate AI Summary</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate an AI-powered summary of which questions can be answered with existing data and
                  suggestions for a turnover call agenda.
                </p>
                <Button onClick={handleGenerateAiSummary} disabled={generateAiSummary}>
                  {generateAiSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="whitespace-pre-wrap p-4 border rounded-md bg-slate-50 text-slate-800 font-mono text-sm">
                  {aiAnalysis.aiSummary}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Answered Questions</CardTitle>
                      <CardDescription>Top questions we can answer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiAnalysis.answeredQuestions.slice(0, 5).map((q: ProjectQuestion) => (
                          <li key={q.id} className="text-sm">{q.question}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Unanswered Questions</CardTitle>
                      <CardDescription>Top questions we need to gather</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiAnalysis.unansweredQuestions.slice(0, 5).map((q: ProjectQuestion) => (
                          <li key={q.id} className="text-sm">{q.question}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {aiAnalysis ? 
            "AI summary generated successfully." : 
            "Click 'Generate Summary' to create AI-powered quote review and turnover call summaries."}
        </div>
        {!aiAnalysis && activeTab === "summary" && (
          <Button onClick={handleGenerateAiSummary} disabled={generateAiSummary}>
            {generateAiSummary ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectQuestionsAnalysis;