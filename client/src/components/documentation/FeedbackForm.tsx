import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the feedback form schema
const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["bug", "feature"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  submitter_name: z.string().min(1, "Name is required"),
  submitter_email: z.string().email("Valid email is required").optional().or(z.literal("")),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface Feedback {
  id: number;
  title: string;
  type: "bug" | "feature";
  description: string;
  priority: "low" | "medium" | "high";
  submitter_name: string;
  submitter_email?: string;
  status: "open" | "in-progress" | "resolved" | "wont-fix";
  created_at: string;
  updated_at: string;
}

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [activeTab, setActiveTab] = useState("submit");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing feedback items
  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  // Setup form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      type: "bug",
      description: "",
      priority: "medium",
      submitter_name: "",
      submitter_email: "",
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (values: FeedbackFormValues) => {
      const response = await apiRequest("POST", "/api/feedback", values);
      return await response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      // Show success toast
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! Your submission has been recorded.",
        variant: "default",
      });
      // Invalidate feedback query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      // Switch to view tab
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FeedbackFormValues) => {
    submitMutation.mutate(values);
  };

  // Render priority badge with appropriate color
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">{priority}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">{priority}</Badge>;
      case "low":
        return <Badge className="bg-green-500">{priority}</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">{status}</Badge>;
      case "in-progress":
        return <Badge className="bg-purple-500">{status}</Badge>;
      case "resolved":
        return <Badge className="bg-green-600">{status}</Badge>;
      case "wont-fix":
        return <Badge className="bg-gray-500">{"won't fix"}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" style={{ color: 'var(--red-accent)' }}>
            Feedback & Feature Requests
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="submit" className="w-full mt-4" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="submit">Submit New</TabsTrigger>
            <TabsTrigger value="view">View All</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of the issue or request" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="bug" />
                            </FormControl>
                            <FormLabel className="font-normal">Bug Report</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="feature" />
                            </FormControl>
                            <FormLabel className="font-normal">Feature Request</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about the bug or feature request..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Priority *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="low" />
                            </FormControl>
                            <FormLabel className="font-normal">Low</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="medium" />
                            </FormControl>
                            <FormLabel className="font-normal">Medium</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="high" />
                            </FormControl>
                            <FormLabel className="font-normal">High</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitter_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submitter_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email for updates (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={submitMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    style={{ backgroundColor: 'var(--red-accent)' }}
                    className="text-white"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="view">
            <div className="mb-4 px-4">
              <h2 className="text-xl font-bold text-gray-800">Previously Submitted Feedback</h2>
              <p className="text-gray-600 text-sm">
                View all bug reports and feature requests that have been submitted by the community.
              </p>
            </div>
            
            <ScrollArea className="h-[50vh] px-4">
              <div className="space-y-4">
                {isLoadingFeedback ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Loading feedback items...</p>
                  </div>
                ) : feedbackItems && feedbackItems.length > 0 ? (
                  feedbackItems.map((item) => (
                    <Card key={item.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-gray-800">{item.title}</CardTitle>
                            <CardDescription>
                              Submitted by {item.submitter_name} on{" "}
                              {new Date(item.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={item.type === "bug" ? "bg-red-400" : "bg-blue-400"}>
                              {item.type === "bug" ? "Bug" : "Feature"}
                            </Badge>
                            {renderPriorityBadge(item.priority)}
                            {renderStatusBadge(item.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No feedback items submitted yet.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("submit")}
                        style={{ borderColor: 'var(--red-accent)', color: 'var(--red-accent)' }}
                      >
                        Be the first to submit feedback
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}