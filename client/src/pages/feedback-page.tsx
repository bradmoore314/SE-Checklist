import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertFeedbackSchema, type Feedback } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const feedbackSchema = insertFeedbackSchema.extend({
  submitter_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  submitter_email: z.string().email({ message: 'Please enter a valid email address.' }).optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'bug',
      priority: 'medium',
      submitter_name: '',
      submitter_email: '',
    },
  });

  const { data: feedbackItems, isLoading } = useQuery<Feedback[]>({
    queryKey: ['/api/feedback'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FeedbackFormValues) => {
      const response = await apiRequest('POST', '/api/feedback', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback! We\'ll look into it.',
      });
      form.reset();
      setActiveTab('view');
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting feedback',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (values: FeedbackFormValues) => {
    submitMutation.mutate(values);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-purple-100 text-purple-800';
      case 'wont-fix': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'bug' ? 'bug_report' : 'lightbulb';
  };

  const getTypeColor = (type: string) => {
    return type === 'bug' ? 'text-red-500' : 'text-yellow-500';
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Center</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="view">View Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Bug Report or Feature Request</CardTitle>
              <CardDescription>
                Help us improve the Site Walk Checklist application by submitting your feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select whether you're reporting a bug or requesting a new feature.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of the issue or feature" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide details about the bug or feature request" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="submitter_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
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
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Previous Submissions</CardTitle>
              <CardDescription>
                View all submitted bug reports and feature requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading submissions...</div>
              ) : feedbackItems && feedbackItems.length > 0 ? (
                <div className="space-y-4">
                  {feedbackItems.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <span className={`material-icons ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                          </span>
                          <div>
                            <h3 className="font-medium text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500">
                              Submitted by {item.submitter_name} on {new Date(item.created_at || new Date()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No feedback submissions yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('submit')}
                  >
                    Submit Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackPage;