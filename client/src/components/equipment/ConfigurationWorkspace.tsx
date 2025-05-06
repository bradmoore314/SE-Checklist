import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, AlertTriangle, Send, Mic, MicOff, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useParams, useLocation } from 'wouter';
import { SpeechRecognitionService } from '@/services/speech-service';

interface EquipmentField {
  name: string;
  value: string | null;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

interface EquipmentItem {
  id: string;
  type: 'camera' | 'access_point' | 'elevator' | 'intercom';
  name: string;
  fields: EquipmentField[];
  isComplete: boolean;
  quantity: number;
}

export function ConfigurationWorkspace() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [speechService] = useState(() => new SpeechRecognitionService());
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [, navigate] = useLocation();
  const params = useParams();

  // Get project ID from URL if available
  useEffect(() => {
    if (params && params.projectId) {
      setProjectId(parseInt(params.projectId, 10));
    }
  }, [params]);

  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Set up speech recognition
  useEffect(() => {
    speechService.onResult((transcript) => {
      setInputMessage(prev => prev + ' ' + transcript);
    });

    speechService.onEnd(() => {
      setIsListening(false);
    });

    speechService.onError((error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      toast({
        title: 'Speech Recognition Error',
        description: 'There was an error with speech recognition. Please try again.',
        variant: 'destructive',
      });
    });

    return () => {
      if (isListening) {
        speechService.stop();
      }
    };
  }, [speechService]);

  const toggleListening = () => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      speechService.start();
      setIsListening(true);
    }
  };

  const calculateItemCompletion = (item: EquipmentItem) => {
    const requiredFields = item.fields.filter(field => field.required);
    const completedRequiredFields = requiredFields.filter(field => field.value !== null && field.value !== '');
    const isComplete = requiredFields.length === completedRequiredFields.length;
    
    return {
      ...item,
      isComplete
    };
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to conversation
    const userMessage = inputMessage.trim();
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Call the API to process the message
      const response = await apiRequest('POST', '/api/equipment/process-configuration', {
        message: userMessage,
        projectId,
        currentItems: items
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add assistant response to conversation
        setConversation(prev => [...prev, { role: 'assistant', content: data.response }]);
        
        // Update items with processed items
        const updatedItems = data.updatedItems.map(calculateItemCompletion);
        setItems(updatedItems);
        
        // If there's only one item, select it
        if (updatedItems.length === 1 && !selectedItemId) {
          setSelectedItemId(updatedItems[0].id);
        }
      } else {
        throw new Error(data.message || 'Error processing request');
      }
    } catch (error) {
      console.error('Error processing configuration message:', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (itemId: string, fieldName: string, value: string | null) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            fields: item.fields.map(field => 
              field.name === fieldName ? { ...field, value } : field
            )
          };
          return calculateItemCompletion(updatedItem);
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleNameChange = (itemId: string, name: string) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return { ...item, name };
        }
        return item;
      })
    );
  };

  const handleSubmitConfiguration = async () => {
    if (items.length === 0) {
      toast({
        title: 'No Equipment',
        description: 'There is no equipment to submit. Please add some equipment first.',
        variant: 'destructive',
      });
      return;
    }
    
    const incompleteItems = items.filter(item => !item.isComplete);
    if (incompleteItems.length > 0) {
      toast({
        title: 'Incomplete Equipment',
        description: `${incompleteItems.length} equipment item(s) are incomplete. Please fill in all required fields.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!projectId) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const response = await apiRequest('POST', '/api/equipment/submit-configuration', {
        items,
        projectId
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Equipment configuration submitted successfully',
        });
        
        // Navigate back to project page
        navigate(`/projects/${projectId}`);
      } else {
        throw new Error(data.message || 'Error submitting configuration');
      }
    } catch (error) {
      console.error('Error submitting configuration:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Equipment Configuration Workspace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Chat Interface */}
        <div className="space-y-4">
          <Card className="h-[calc(70vh-2rem)]">
            <CardHeader>
              <CardTitle>Equipment Configuration Assistant</CardTitle>
              <CardDescription>
                Chat with the assistant to configure your security equipment
              </CardDescription>
            </CardHeader>
            
            <CardContent className="h-[calc(70vh-12rem)] overflow-y-auto pb-2">
              <div className="space-y-4">
                {conversation.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Start a conversation with the assistant to add or configure equipment.</p>
                    <p className="mt-2 text-sm">Try saying "Add 3 cameras for the lobby" or "Configure access points for the main entrance"</p>
                  </div>
                ) : (
                  conversation.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={conversationEndRef} />
              </div>
            </CardContent>
            
            <CardFooter>
              <form onSubmit={handleMessageSubmit} className="w-full flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={toggleListening}
                  className={isListening ? 'bg-red-100' : ''}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </Button>
                <Button type="submit" disabled={isProcessing || !inputMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column: Equipment Scratchpad */}
        <div className="space-y-4">
          <Card className="h-[calc(70vh-2rem)]">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Equipment Scratchpad</CardTitle>
                  <CardDescription>
                    {items.length === 0 
                      ? 'No equipment added yet'
                      : `${items.length} item(s) - ${items.filter(i => i.isComplete).length} complete`}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={items.length === 0 || !projectId} 
                    onClick={handleSubmitConfiguration}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Submit All
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="h-[calc(70vh-10rem)]">
              <Tabs defaultValue="list" className="h-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="detail">Detail View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="h-[calc(100%-3rem)] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No equipment items yet</p>
                      <p className="mt-2 text-sm">Chat with the assistant to add equipment</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          className={`p-3 rounded-md cursor-pointer ${
                            selectedItemId === item.id ? 'bg-primary/10 border border-primary' : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{item.name}</div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getVariantForType(item.type)}>
                                {formatItemType(item.type)}
                              </Badge>
                              {item.isComplete ? (
                                <Badge variant="outline" className="bg-green-100">
                                  <Check className="h-3 w-3 mr-1" /> Complete
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100">
                                  <AlertTriangle className="h-3 w-3 mr-1" /> Incomplete
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {getCompletionStatus(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="detail" className="h-[calc(100%-3rem)] overflow-y-auto">
                  {!selectedItem ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No equipment selected</p>
                      <p className="mt-2 text-sm">Select an item from the list view or chat with the assistant to add equipment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label htmlFor="item-name">Equipment Name</Label>
                          <Input 
                            id="item-name"
                            value={selectedItem.name} 
                            onChange={(e) => handleNameChange(selectedItem.id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex space-x-2 items-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteItem(selectedItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.fields.map(field => (
                          <div key={field.name} className="space-y-1">
                            <Label htmlFor={`field-${field.name}`}>
                              {formatFieldName(field.name)}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderFieldInput(field, selectedItem.id)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Helper functions
  function formatItemType(type: string): string {
    switch (type) {
      case 'camera': return 'Camera';
      case 'access_point': return 'Access Point';
      case 'elevator': return 'Elevator';
      case 'intercom': return 'Intercom';
      default: return type;
    }
  }

  function getVariantForType(type: string): "default" | "outline" | "secondary" | "destructive" {
    switch (type) {
      case 'camera': return 'default';
      case 'access_point': return 'secondary';
      case 'elevator': return 'outline';
      case 'intercom': return 'destructive';
      default: return 'default';
    }
  }

  function getCompletionStatus(item: EquipmentItem): string {
    const requiredFields = item.fields.filter(field => field.required);
    const completedRequiredFields = requiredFields.filter(field => field.value !== null && field.value !== '');
    return `${completedRequiredFields.length}/${requiredFields.length} required fields completed`;
  }

  function formatFieldName(name: string): string {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function renderFieldInput(field: EquipmentField, itemId: string) {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={field.value || ''}
            onValueChange={(value) => handleFieldChange(itemId, field.name, value)}
          >
            <SelectTrigger id={`field-${field.name}`}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`field-${field.name}`}
              checked={field.value === 'true'}
              onCheckedChange={(checked) => 
                handleFieldChange(itemId, field.name, checked ? 'true' : 'false')
              }
            />
            <Label htmlFor={`field-${field.name}`}>
              {field.value === 'true' ? 'Yes' : 'No'}
            </Label>
          </div>
        );
      
      case 'number':
        return (
          <Input
            id={`field-${field.name}`}
            type="number"
            value={field.value || ''}
            onChange={(e) => handleFieldChange(itemId, field.name, e.target.value)}
          />
        );
      
      case 'text':
      default:
        if (field.name === 'notes') {
          return (
            <Textarea
              id={`field-${field.name}`}
              value={field.value || ''}
              onChange={(e) => handleFieldChange(itemId, field.name, e.target.value)}
              placeholder={field.required ? 'Required' : 'Optional'}
            />
          );
        }
        return (
          <Input
            id={`field-${field.name}`}
            value={field.value || ''}
            onChange={(e) => handleFieldChange(itemId, field.name, e.target.value)}
            placeholder={field.required ? 'Required' : 'Optional'}
          />
        );
    }
  }
}