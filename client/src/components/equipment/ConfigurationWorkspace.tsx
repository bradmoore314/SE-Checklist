import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mic, Send, Play, Square, Volume2, VolumeX, Save, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the equipment field interface
interface EquipmentField {
  name: string;
  value: string | null;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

// Define the equipment item interface
interface EquipmentItem {
  id: string;
  type: 'camera' | 'access_point' | 'elevator' | 'intercom';
  name: string;
  fields: EquipmentField[];
  isComplete: boolean;
  quantity: number;
}

// Define message interface for chat
interface Message {
  content: string;
  role: 'user' | 'assistant';
}

export function ConfigurationWorkspace() {
  // State for the chat interface
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([{
    content: "Hello! I'm your equipment configuration assistant. How can I help you set up your security equipment today?",
    role: 'assistant'
  }]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isContinuousMode, setIsContinuousMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // State for the equipment configuration
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<{id: number, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Toast
  const { toast } = useToast();
  
  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load projects on mount
  useEffect(() => {
    fetch('/api/projects')
      .then(response => response.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setProjectId(data[0].id);
        }
      })
      .catch(error => {
        console.error('Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
      });
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { content: message, role: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Focus back on textarea after sending
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    setIsProcessing(true);
    
    try {
      // Make API request to process the message
      const response = await fetch('/api/equipment/process-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          projectId,
          currentItems: items,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process request');
      }
      
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage = { content: data.response, role: 'assistant' as const };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update items
      setItems(data.updatedItems);
      
      // If there are items and none selected, select the first one
      if (data.updatedItems.length > 0 && selectedItemIndex === null) {
        setSelectedItemIndex(0);
      }
      
      // Speak the response if speech synthesis is available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message
      setMessages(prev => [...prev, {
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle speech recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Start listening for speech
  const startListening = () => {
    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = isContinuousMode;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setMessage(transcript);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (!isContinuousMode) {
        // Submit the form automatically after speech recognition ends
        if (message.trim()) {
          handleSubmit(new Event('submit') as any);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: 'Error',
        description: `Speech recognition error: ${event.error}`,
        variant: 'destructive',
      });
    };
    
    recognition.start();
  };
  
  // Stop listening for speech
  const stopListening = () => {
    setIsListening(false);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
    
    if (isContinuousMode && message.trim()) {
      handleSubmit(new Event('submit') as any);
    }
  };
  
  // Toggle continuous mode
  const toggleContinuousMode = () => {
    setIsContinuousMode(!isContinuousMode);
    // If currently listening, stop and restart with new mode
    if (isListening) {
      stopListening();
      setTimeout(() => startListening(), 100);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Handle field change for an equipment item
  const handleFieldChange = (itemIndex: number, fieldName: string, value: string | null) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const item = {...newItems[itemIndex]};
      const fieldIndex = item.fields.findIndex(f => f.name === fieldName);
      
      if (fieldIndex !== -1) {
        const fields = [...item.fields];
        fields[fieldIndex] = {...fields[fieldIndex], value};
        
        // Update the item
        item.fields = fields;
        
        // Check if all required fields are filled
        item.isComplete = fields.every(field => !field.required || (field.value !== null && field.value !== ''));
        
        // Update the name field based on type and location
        const typeField = fields.find(f => f.name === `${item.type}_type`);
        const locationField = fields.find(f => f.name === 'location');
        
        if (typeField && locationField && locationField.value) {
          item.name = `${typeField.value || item.type} at ${locationField.value}`;
        }
        
        newItems[itemIndex] = item;
      }
      
      return newItems;
    });
  };
  
  // Submit the equipment configuration
  const submitConfiguration = async () => {
    if (!projectId) {
      toast({
        title: 'Project Required',
        description: 'Please select a project to save your equipment configuration.',
        variant: 'destructive',
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: 'No Equipment',
        description: 'Please add at least one equipment item before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    const incompleteItems = items.filter(item => !item.isComplete);
    if (incompleteItems.length > 0) {
      toast({
        title: 'Incomplete Items',
        description: `You have ${incompleteItems.length} items with missing required fields. Please complete them before submitting.`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/equipment/submit-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          projectId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit configuration');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: data.message,
      });
      
      // Clear items and add a success message
      setItems([]);
      setSelectedItemIndex(null);
      
      // Add assistant message
      setMessages(prev => [...prev, {
        content: `I've successfully saved your equipment configuration! ${data.message}`,
        role: 'assistant'
      }]);
      
    } catch (error) {
      console.error('Error submitting configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your equipment configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a new equipment item
  const addNewItem = (type: 'camera' | 'access_point' | 'elevator' | 'intercom') => {
    // Generate default fields based on type
    let fields: EquipmentField[] = [];
    let name = '';
    
    switch (type) {
      case 'camera':
        fields = [
          { name: 'location', value: null, required: true, type: 'text' },
          { name: 'camera_type', value: null, required: true, type: 'select', options: ['Dome', 'Bullet', 'PTZ', 'Turret', 'Fisheye'] },
          { name: 'resolution', value: null, required: false, type: 'select', options: ['1080p', '4K', '5MP', '8MP'] },
          { name: 'mounting_type', value: null, required: false, type: 'select', options: ['Wall', 'Ceiling', 'Pole', 'Corner'] },
          { name: 'field_of_view', value: null, required: false, type: 'text' },
          { name: 'is_indoor', value: 'true', required: false, type: 'boolean' },
          { name: 'import_to_gateway', value: 'false', required: false, type: 'boolean' },
          { name: 'notes', value: null, required: false, type: 'text' },
        ];
        name = 'New Camera';
        break;
      
      case 'access_point':
        fields = [
          { name: 'location', value: null, required: true, type: 'text' },
          { name: 'reader_type', value: null, required: true, type: 'select', options: ['RFID', 'Biometric', 'Keypad', 'Mobile', 'Multi-factor'] },
          { name: 'lock_type', value: null, required: true, type: 'select', options: ['Magnetic', 'Electric Strike', 'Mortise', 'Deadbolt', 'Keyless'] },
          { name: 'monitoring_type', value: null, required: true, type: 'select', options: ['Door Contact', 'Motion', 'Alarm', 'None'] },
          { name: 'quick_config', value: 'Standard', required: true, type: 'select', options: ['Standard', 'High Security', 'Takeover', 'ADA Compliant'] },
          { name: 'takeover', value: null, required: false, type: 'text' },
          { name: 'lock_provider', value: null, required: false, type: 'text' },
          { name: 'notes', value: null, required: false, type: 'text' },
        ];
        name = 'New Access Point';
        break;
        
      case 'elevator':
        fields = [
          { name: 'location', value: null, required: false, type: 'text' },
          { name: 'elevator_type', value: null, required: true, type: 'select', options: ['Passenger', 'Freight', 'Service', 'Residential'] },
          { name: 'reader_type', value: null, required: false, type: 'select', options: ['RFID', 'Biometric', 'Keypad', 'Mobile', 'Multi-factor'] },
          { name: 'floor_count', value: null, required: false, type: 'number' },
          { name: 'notes', value: null, required: false, type: 'text' },
        ];
        name = 'New Elevator';
        break;
        
      case 'intercom':
        fields = [
          { name: 'location', value: null, required: true, type: 'text' },
          { name: 'intercom_type', value: null, required: true, type: 'select', options: ['Video', 'Audio', 'IP Based', 'Wireless', 'Mobile App'] },
          { name: 'notes', value: null, required: false, type: 'text' },
        ];
        name = 'New Intercom';
        break;
    }
    
    // Create the new item with a unique ID
    const newItem: EquipmentItem = {
      id: crypto.randomUUID(),
      type,
      name,
      fields,
      isComplete: false,
      quantity: 1,
    };
    
    // Add to items
    setItems(prev => [...prev, newItem]);
    
    // Select the new item
    setSelectedItemIndex(items.length);
    
    // Add message
    setMessages(prev => [...prev, {
      content: `I've added a new ${type.replace('_', ' ')} to your configuration. Please fill in the required fields.`,
      role: 'assistant'
    }]);
  };
  
  // Remove an equipment item
  const removeItem = (index: number) => {
    const item = items[index];
    
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
    
    // Update selected index
    if (selectedItemIndex === index) {
      if (items.length > 1) {
        setSelectedItemIndex(0);
      } else {
        setSelectedItemIndex(null);
      }
    } else if (selectedItemIndex !== null && selectedItemIndex > index) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
    
    // Add message
    setMessages(prev => [...prev, {
      content: `I've removed the ${item.name} from your configuration.`,
      role: 'assistant'
    }]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: Chat interface */}
        <div className="w-full lg:w-1/2">
          <Card className="h-[calc(100vh-6rem)]">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Equipment Configuration Assistant</span>
                <div className="flex items-center gap-2">
                  {isSpeaking ? (
                    <Button variant="ghost" size="icon" onClick={stopSpeaking} title="Stop Speaking">
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button 
                    variant={isContinuousMode ? "default" : "outline"} 
                    size="sm" 
                    onClick={toggleContinuousMode}
                    title={isContinuousMode ? "Disable Voice Mode" : "Enable Voice Mode"}
                  >
                    {isContinuousMode ? "Voice Mode On" : "Voice Mode Off"}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Ask me to add or configure security equipment for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col h-[calc(100%-13rem)]">
              <ScrollArea className="flex-grow pr-4">
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="w-full space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me to add cameras, access points, or other equipment..."
                    className="flex-grow min-h-[60px]"
                    ref={textareaRef}
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? "Stop" : "Record"}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !message.trim()}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Right panel: Equipment configuration */}
        <div className="w-full lg:w-1/2">
          <Card className="h-[calc(100vh-6rem)]">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Equipment Configuration</span>
                <Select 
                  value={projectId?.toString() || ''} 
                  onValueChange={(value) => setProjectId(parseInt(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>
                Configure and manage your security equipment
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-13rem)] flex flex-col">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewItem('camera')}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Camera
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewItem('access_point')}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Access Point
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewItem('elevator')}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Elevator
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNewItem('intercom')}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> Intercom
                  </Button>
                </div>
                <Button 
                  onClick={submitConfiguration} 
                  disabled={isSubmitting || items.length === 0 || !projectId}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>

              {/* Equipment list */}
              <Tabs defaultValue="list" className="flex flex-col flex-grow">
                <TabsList className="mb-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="flex-grow overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                  <ScrollArea className="flex-grow">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No equipment items added yet. Use the chat or buttons above to add items.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <div 
                            key={item.id} 
                            className={`p-3 rounded-md border cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                              selectedItemIndex === i ? 'bg-accent text-accent-foreground' : ''
                            }`}
                            onClick={() => setSelectedItemIndex(i)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant={item.isComplete ? "default" : "outline"}>
                                  {item.isComplete ? "Complete" : "Incomplete"}
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(i);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Type: {item.type.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="details" className="flex-grow overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                  {selectedItemIndex === null ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Select an item from the list to view and edit details
                    </div>
                  ) : (
                    <ScrollArea className="flex-grow">
                      <div className="space-y-4 p-2">
                        <h3 className="text-lg font-medium">{items[selectedItemIndex]?.name}</h3>
                        <div className="space-y-4">
                          {items[selectedItemIndex]?.fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                              <div className="flex items-center">
                                <label className="text-sm font-medium capitalize">
                                  {field.name.replace(/_/g, ' ')}:
                                  {field.required && <span className="text-destructive">*</span>}
                                </label>
                              </div>
                              {field.type === 'select' ? (
                                <Select 
                                  value={field.value || ''} 
                                  onValueChange={(value) => handleFieldChange(selectedItemIndex, field.name, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${field.name.replace(/_/g, ' ')}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map(option => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === 'boolean' ? (
                                <Select 
                                  value={field.value || ''} 
                                  onValueChange={(value) => handleFieldChange(selectedItemIndex, field.name, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${field.name.replace(/_/g, ' ')}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Textarea 
                                  value={field.value || ''} 
                                  onChange={(e) => handleFieldChange(selectedItemIndex, field.name, e.target.value)}
                                  placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}