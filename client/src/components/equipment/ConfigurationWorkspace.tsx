import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, X, Trash2, AlertCircle, PlusCircle, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatbot } from '@/hooks/use-chatbot';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

// Define types for equipment items in the scratchpad
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
  // State for the scratchpad items
  const [scratchpadItems, setScratchpadItems] = useState<EquipmentItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ content: string; role: 'user' | 'assistant' }[]>([
    {
      role: 'assistant',
      content: 'Welcome to the Equipment Configuration Workspace. How can I help you configure your security equipment today?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ itemId: string; fieldName: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [projectId, setProjectId] = useState<number | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();
  
  // Get project ID from URL if available
  useEffect(() => {
    const path = location;
    const match = path.match(/\/projects\/(\d+)/);
    if (match && match[1]) {
      setProjectId(Number(match[1]));
    }
  }, [location]);
  
  // Fetch project data if project ID is available
  const { data: projectData } = useQuery({
    queryKey: projectId ? ['/api/projects', projectId] : null,
    enabled: !!projectId,
  });

  // Load saved scratchpad from localStorage
  useEffect(() => {
    const savedScratchpad = localStorage.getItem('equipment-scratchpad');
    if (savedScratchpad) {
      try {
        const parsed = JSON.parse(savedScratchpad);
        setScratchpadItems(parsed);
      } catch (e) {
        console.error('Failed to load saved scratchpad data', e);
      }
    }
  }, []);

  // Save scratchpad to localStorage whenever it changes
  useEffect(() => {
    if (scratchpadItems.length > 0) {
      localStorage.setItem('equipment-scratchpad', JSON.stringify(scratchpadItems));
    }
  }, [scratchpadItems]);
  
  // Calculate overall progress whenever scratchpad changes
  useEffect(() => {
    if (scratchpadItems.length === 0) {
      setOverallProgress(0);
      return;
    }
    
    const totalFields = scratchpadItems.reduce((acc, item) => 
      acc + item.fields.filter(f => f.required).length, 0);
      
    const completedFields = scratchpadItems.reduce((acc, item) => 
      acc + item.fields.filter(f => f.required && f.value).length, 0);
    
    const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    setOverallProgress(progress);
    
    // Update completion status for each item
    setScratchpadItems(prev => prev.map(item => {
      const requiredFields = item.fields.filter(f => f.required);
      const completedRequiredFields = requiredFields.filter(f => f.value);
      const isComplete = requiredFields.length > 0 && completedRequiredFields.length === requiredFields.length;
      
      return {
        ...item,
        isComplete
      };
    }));
  }, [scratchpadItems]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Process user message and update scratchpad
  const processMessage = async (message: string) => {
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      // Call API to process the message
      const response = await fetch('/api/equipment/process-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          projectId: projectId || undefined,
          currentItems: scratchpadItems
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process message');
      }
      
      const data = await response.json();
      
      // Update scratchpad based on AI response
      if (data.updatedItems) {
        setScratchpadItems(data.updatedItems);
      }
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      processMessage(currentMessage.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Edit field value in scratchpad
  const handleFieldEdit = (itemId: string, fieldName: string, value: string) => {
    setScratchpadItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? {
              ...item,
              fields: item.fields.map(field => 
                field.name === fieldName 
                  ? { ...field, value: value || null } 
                  : field
              )
            }
          : item
      )
    );
    
    setEditingField(null);
  };

  // Delete item from scratchpad
  const handleDeleteItem = (itemId: string) => {
    setScratchpadItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Submit final configuration
  const handleSubmitConfiguration = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/equipment/submit-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: scratchpadItems,
          projectId: projectId || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit configuration');
      }
      
      const data = await response.json();
      
      // Clear scratchpad after successful submission
      setScratchpadItems([]);
      localStorage.removeItem('equipment-scratchpad');
      
      // Add success message to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Configuration successfully submitted! All equipment has been added to your project.' 
      }]);
      
    } catch (error) {
      console.error('Error submitting configuration:', error);
      // Add error message to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error submitting your configuration. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for equipment type
  const getEquipmentTypeIcon = (type: string) => {
    switch(type) {
      case 'camera': return '📷';
      case 'access_point': return '🔑';
      case 'elevator': return '🛗';
      case 'intercom': return '📞';
      default: return '📦';
    }
  };

  // Calculate completion percentage for a single item
  const calculateItemCompletion = (item: EquipmentItem) => {
    const requiredFields = item.fields.filter(f => f.required);
    if (requiredFields.length === 0) return 100;
    
    const completedFields = requiredFields.filter(f => f.value);
    return (completedFields.length / requiredFields.length) * 100;
  };

  return (
    <div className="flex flex-col h-full md:flex-row">
      {/* Chat panel */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col border-r">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h2 className="text-lg font-medium">Equipment Configuration Assistant</h2>
          {projectData && (
            <Badge variant="outline" className="ml-2">
              Project: {projectData.name}
            </Badge>
          )}
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your equipment configuration request..."
            className="flex-1"
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
      
      {/* Scratchpad panel */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        <div className="p-4 border-b bg-muted/20">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Equipment Scratchpad</h2>
            <div className="flex items-center gap-2">
              {scratchpadItems.length > 0 && overallProgress === 100 && (
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmitConfiguration}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Configure Now
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Progress value={overallProgress} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground">
              {Math.round(overallProgress)}% Complete
            </span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {scratchpadItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="mb-4">
                <PlusCircle className="h-12 w-12 opacity-20" />
              </div>
              <p className="max-w-xs">
                Your equipment configuration scratchpad is empty. 
                Ask the assistant to add equipment items.
              </p>
              <p className="mt-2 text-sm">
                Try: "Add 2 cameras to the parking lot" or "I need an access point at the main entrance"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scratchpadItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-muted/30 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getEquipmentTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.type.replace('_', ' ')}
                          {item.quantity > 1 ? ` (${item.quantity})` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant={item.isComplete ? "default" : "outline"}
                              className={item.isComplete ? "bg-green-600" : "border-amber-500 text-amber-500"}
                            >
                              {item.isComplete ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Complete
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Incomplete
                                </span>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.isComplete 
                              ? "All required fields are complete" 
                              : "Some required fields need information"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {item.fields.map((field) => (
                        <div key={`${item.id}-${field.name}`} className="grid grid-cols-5 gap-2 items-center">
                          <div className="col-span-2 flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {field.name.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                              {field.required && <span className="text-red-500">*</span>}
                            </span>
                          </div>
                          
                          <div className="col-span-2">
                            {editingField?.itemId === item.id && editingField?.fieldName === field.name ? (
                              <Input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                autoFocus
                                onBlur={() => handleFieldEdit(item.id, field.name, editingValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleFieldEdit(item.id, field.name, editingValue);
                                  }
                                }}
                              />
                            ) : (
                              <div 
                                className={`px-2 py-1 rounded border ${
                                  field.value ? 'border-transparent bg-muted/50' : 'border-dashed border-muted-foreground/50'
                                }`}
                                onClick={() => {
                                  setEditingField({ itemId: item.id, fieldName: field.name });
                                  setEditingValue(field.value || '');
                                }}
                              >
                                {field.value || (
                                  <span className="text-muted-foreground text-sm italic">Click to add...</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-center">
                            {field.required && (
                              <div className={`p-1 rounded-full ${
                                field.value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {field.value ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <div className="px-4 pb-4">
                    <Progress 
                      value={calculateItemCompletion(item)} 
                      className="h-1"
                      style={{
                        background: "#f1f5f9",
                        "--progress-value": `${calculateItemCompletion(item)}%`
                      } as React.CSSProperties}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}