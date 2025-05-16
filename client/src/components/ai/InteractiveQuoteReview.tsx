import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, FileText, Clock, Settings, ChevronRight, HelpCircle, Sparkles, BanknoteIcon, RefreshCw, PenLine, Check, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface InteractiveQuoteReviewProps {
  projectId: number;
}

interface ProjectQuestion {
  id: number;
  question: string;
  category: string;
  answerSource: string;
  userAnswer?: string;
  answered?: boolean;
}

interface AIAnalysisResult {
  introduction: string;
  initialAssessment: string;
  recommendations: string[];
  questions: ProjectQuestion[];
  nextSteps: string[];
}

const InteractiveQuoteReview: React.FC<InteractiveQuoteReviewProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState<ProjectQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Fetch initial project questions and analysis
  const { data: initialQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: [`/api/projects/${projectId}/ai-analysis/questions`],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (initialQuestions?.questions) {
      // Filter to include only unanswered questions
      const unanswered = initialQuestions.questions.filter(
        (q: ProjectQuestion) => q.answerSource !== "existing data" && !q.answered
      );
      setUnansweredQuestions(unanswered);
      
      // Calculate initial completion percentage
      const total = initialQuestions.questions.length;
      const answered = initialQuestions.questions.filter(
        (q: ProjectQuestion) => q.answerSource === "existing data" || q.answered
      ).length;
      setCompletionPercentage(Math.round((answered / total) * 100));
    }
  }, [initialQuestions]);

  // Handle user answer input
  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  // Set a question as skipped
  const handleSkipQuestion = (questionId: number) => {
    setUnansweredQuestions(prev => 
      prev.map(q => q.id === questionId ? {...q, skipped: true} : q)
    );
    toast({
      title: "Question Skipped",
      description: "You can come back to this question later.",
    });
  };

  // Generate or regenerate analysis with user answers
  const generateAnalysis = async () => {
    setLoading(true);
    try {
      // Prepare data to send to the API
      const questionsWithAnswers = unansweredQuestions.map(q => ({
        ...q,
        userAnswer: userAnswers[q.id] || null,
        answered: !!userAnswers[q.id]
      }));
      
      // Make API request to generate analysis
      const res = await apiRequest("POST", `/api/projects/${projectId}/interactive-quote-review`, {
        userAnsweredQuestions: questionsWithAnswers
      });
      
      const data = await res.json();
      
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        
        // Update completion percentage after user answers
        const total = unansweredQuestions.length;
        const answered = Object.keys(userAnswers).length;
        setCompletionPercentage(Math.round((answered / total) * 100));
        
        toast({
          title: "Analysis Generated",
          description: "Quote review analysis has been successfully generated with your inputs.",
        });
        
        // Switch to overview tab to show results
        setActiveTab("overview");
      } else {
        throw new Error(data.error || "Failed to generate analysis");
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Error",
        description: `Failed to generate analysis: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group questions by category for better organization
  const questionsByCategory = React.useMemo(() => {
    const groupedQuestions: Record<string, ProjectQuestion[]> = {};
    
    unansweredQuestions.forEach(question => {
      if (!groupedQuestions[question.category]) {
        groupedQuestions[question.category] = [];
      }
      groupedQuestions[question.category].push(question);
    });
    
    return groupedQuestions;
  }, [unansweredQuestions]);

  // Count how many questions are answered in each category
  const getCategoryCompletionStatus = (category: string) => {
    const questions = questionsByCategory[category] || [];
    const answeredCount = questions.filter(q => userAnswers[q.id]).length;
    return `${answeredCount}/${questions.length}`;
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading questions for analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                Interactive Quote Review
              </CardTitle>
              <CardDescription>
                Provide answers to missing information to generate a more accurate quote review analysis.
              </CardDescription>
            </div>
            <div className="w-32">
              <div className="text-sm text-gray-500 mb-1 text-center">Completion</div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1 text-center">{completionPercentage}%</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span>Answer Questions</span>
                <Badge className="ml-2 bg-blue-500">{Object.keys(userAnswers).length}/{unansweredQuestions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center" disabled={!analysisResult}>
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI Analysis</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="p-6 border rounded-lg bg-gradient-to-br from-white to-blue-50">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">Quote Review Process</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-blue-800">Answer Missing Questions</h4>
                      <p className="text-gray-600">Start by answering questions that couldn't be automatically determined from your project data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <span className="text-purple-600 font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-purple-800">Generate AI Analysis</h4>
                      <p className="text-gray-600">Our AI will analyze all your project data including your answers to generate a comprehensive quote review.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <span className="text-green-600 font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-green-800">Review and Refine</h4>
                      <p className="text-gray-600">Review the AI-generated analysis, make changes to your answers if needed, and regenerate for better results.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => setActiveTab("questions")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <PenLine className="mr-2 h-4 w-4" />
                    Start Answering Questions
                  </Button>
                </div>
              </div>
              
              {analysisResult && (
                <div className="p-6 border rounded-lg bg-gradient-to-br from-white to-purple-50">
                  <h3 className="text-lg font-semibold mb-4 text-purple-700">Analysis Summary</h3>
                  <p className="whitespace-pre-line mb-4">{analysisResult.initialAssessment}</p>
                  
                  <div className="mt-4">
                    <Button
                      onClick={() => setActiveTab("analysis")}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      View Full Analysis
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-700">Answer Questions Below</h3>
                </div>
                <p className="text-sm text-blue-600 mb-2">Fill in answers to these questions to improve your quote review analysis.</p>
                
                {Object.keys(questionsByCategory).length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">All Questions Answered!</h3>
                    <p className="text-gray-500 mb-4">All necessary information has been collected or automatically determined.</p>
                    <Button 
                      onClick={generateAnalysis}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Analysis
                    </Button>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(questionsByCategory).map(([category, questions]) => (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="flex items-center justify-between py-4 font-medium">
                          <div className="flex items-center">
                            <span>{category}</span>
                            <Badge className="ml-3 bg-blue-100 text-blue-800">{getCategoryCompletionStatus(category)}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 p-2">
                            {questions.map((question) => (
                              <div key={question.id} className="border rounded-lg p-4 bg-white">
                                <div className="flex justify-between items-start mb-3">
                                  <Label className="text-sm font-medium text-gray-800 mb-2">{question.question}</Label>
                                  <Badge className={userAnswers[question.id] ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                                    {userAnswers[question.id] ? "Answered" : "Needs Answer"}
                                  </Badge>
                                </div>
                                <Textarea
                                  placeholder="Enter your answer here..."
                                  value={userAnswers[question.id] || ""}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="min-h-[80px]"
                                />
                                <div className="flex justify-end mt-2 space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSkipQuestion(question.id)}
                                    className="text-gray-500"
                                  >
                                    Skip for now
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    disabled={!userAnswers[question.id]} 
                                    className={userAnswers[question.id] ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 text-gray-500"}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    {userAnswers[question.id] ? "Saved" : "Confirm"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={generateAnalysis}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  disabled={loading || Object.keys(userAnswers).length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Analysis with Answers
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              {analysisResult ? (
                <div className="space-y-6">
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-blue-50">
                    <h3 className="text-xl font-semibold mb-4 text-blue-700">Introduction</h3>
                    <p className="whitespace-pre-line">{analysisResult.introduction}</p>
                  </div>
                  
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-purple-50">
                    <h3 className="text-xl font-semibold mb-4 text-purple-700">Assessment</h3>
                    <p className="whitespace-pre-line">{analysisResult.initialAssessment}</p>
                  </div>
                  
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-green-50">
                    <h3 className="text-xl font-semibold mb-4 text-green-700">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResult.recommendations.map((item, index) => (
                        <li key={index} className="text-green-900">{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-amber-50">
                    <h3 className="text-xl font-semibold mb-4 text-amber-700">Next Steps</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResult.nextSteps.map((item, index) => (
                        <li key={index} className="text-amber-900">{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("questions")}
                      className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    >
                      <PenLine className="mr-2 h-4 w-4" />
                      Edit Answers
                    </Button>
                    <Button 
                      onClick={generateAnalysis}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Analysis Generated Yet</h3>
                  <p className="text-gray-500 mb-4">Please answer questions and generate an analysis first.</p>
                  <Button 
                    onClick={() => setActiveTab("questions")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PenLine className="mr-2 h-4 w-4" />
                    Go to Questions
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveQuoteReview;