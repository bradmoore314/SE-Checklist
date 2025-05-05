import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '@/services/chatbot-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ScrollArea, 
  ScrollBar 
} from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Microphone, MicrophoneOff, SendHorizonal, Minimize2, RefreshCw, Zap, Settings, Camera, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EquipmentRecommendation {
  type: string;
  location: string;
  properties: Record<string, any>;
  confidence: number;
  explanation: string;
}

interface FullPageChatbotProps {
  projectId?: number;
  onClose: () => void;
  onAddMarker?: (type: string, properties: Record<string, any>) => void;
}

const FullPageChatbot: React.FC<FullPageChatbotProps> = ({
  projectId,
  onClose,
  onAddMarker,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interimResult, setInterimResult] = useState('');
  const [recommendations, setRecommendations] = useState<EquipmentRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize on mount
  useEffect(() => {
    setIsRecognitionSupported(chatbotService.isRecognitionSupported());
    setIsSynthesisSupported(chatbotService.isSynthesisSupported());
    
    // Load existing chat session
    const existingMessages = chatbotService.getMessages();
    if (existingMessages.length > 0) {
      setMessages(existingMessages);
    } else {
      // Start with assistant greeting
      sendInitialGreeting();
    }
    
    // Check for existing recommendations
    updateRecommendations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const response = await chatbotService.sendMessage("Hi", false);
      setMessages([response]);
    } catch (error) {
      console.error('Error sending initial greeting:', error);
      toast({
        title: 'Error',
        description: 'Could not initialize the chatbot assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecommendations = async () => {
    try {
      const recs = await chatbotService.getEquipmentRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !interimResult.trim()) return;
    
    const messageText = input.trim() || interimResult.trim();
    setInput('');
    setInterimResult('');
    
    // Add user message to the UI immediately
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to service and get response
    setIsLoading(true);
    try {
      const response = await chatbotService.sendMessage(messageText, isSynthesisSupported);
      setMessages((prev) => [...prev, response]);
      
      // Update recommendations
      updateRecommendations();
      
      // Switch to recommendations tab if configuration is complete
      const session = chatbotService.getSession();
      if (session?.context?.configStage === 'complete' && recommendations.length > 0) {
        setActiveTab('recommendations');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message to the assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    chatbotService.startVoiceInput(
      (text) => setInterimResult(text),
      (text) => {
        setInput(text);
        stopListening();
        // Auto-send after voice recognition if we got a result
        if (text.trim()) {
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        toast({
          title: 'Speech Recognition Error',
          description: error.message || 'An error occurred with speech recognition',
          variant: 'destructive',
        });
        stopListening();
      }
    );
  };

  const stopListening = () => {
    setIsListening(false);
    chatbotService.stopVoiceInput();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    chatbotService.resetSession();
    setMessages([]);
    setRecommendations([]);
    setActiveTab('chat');
    sendInitialGreeting();
  };

  const applyRecommendation = (recommendation: EquipmentRecommendation) => {
    if (onAddMarker) {
      onAddMarker(recommendation.type, recommendation.properties);
      
      toast({
        title: 'Success',
        description: `${recommendation.type.replace('_', ' ')} was added to the floorplan.`,
        variant: 'default',
      });
      
      // Reset after applying
      resetChat();
      onClose();
    }
  };

  const getEquipmentTypeLabel = (type: string) => {
    switch (type) {
      case 'access_point':
        return 'Access Point';
      case 'camera':
        return 'Camera';
      case 'elevator':
        return 'Elevator';
      case 'intercom':
        return 'Intercom';
      default:
        return type.replace('_', ' ');
    }
  };

  const getEquipmentTypeIcon = (type: string) => {
    switch (type) {
      case 'access_point':
        return <MapPin className="h-4 w-4" />;
      case 'camera':
        return <Camera className="h-4 w-4" />;
      case 'elevator':
        return <Zap className="h-4 w-4" />;
      case 'intercom':
        return <Microphone className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-xl">
      <CardHeader className="px-6 pt-6 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-primary/10">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Security Equipment Configuration</CardTitle>
              <CardDescription>
                Let me help you configure your security equipment through conversation
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="recommendations">
              Recommendations
              {recommendations.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {recommendations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-grow flex flex-col px-6 pt-4 pb-6 space-y-4">
          <ScrollArea className="flex-grow">
            <div className="pr-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-50 mt-1 text-right">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {interimResult && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg p-4 bg-primary/40 text-primary-foreground">
                    <p className="italic">{interimResult}</p>
                  </div>
                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            <ScrollBar />
          </ScrollArea>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={resetChat}
              className="flex-shrink-0"
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder={isListening ? 'Listening...' : 'Type a message...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isListening}
                className="pr-20"
              />
              <div className="absolute right-2 top-2 flex space-x-2">
                {isRecognitionSupported && (
                  <Button
                    variant={isListening ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleListening}
                    className="h-6 w-6"
                    disabled={isLoading}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicrophoneOff className="h-4 w-4" />
                    ) : (
                      <Microphone className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  className="h-6 w-6"
                  disabled={isLoading || (!input.trim() && !interimResult.trim())}
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="flex-grow px-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Equipment Recommendations</h3>
              <Button variant="outline" size="sm" onClick={resetChat}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start New Configuration
              </Button>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-4">No recommendations available yet</p>
                <Button variant="outline" onClick={() => setActiveTab('chat')}>
                  Start a Conversation
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4 pr-4">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="bg-muted/40 p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              {getEquipmentTypeIcon(rec.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{getEquipmentTypeLabel(rec.type)}</h4>
                              <p className="text-sm text-muted-foreground">{rec.location}</p>
                            </div>
                          </div>
                          <div className="bg-primary/10 px-2 py-1 rounded text-xs font-medium">
                            {Math.round(rec.confidence * 100)}% complete
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {Object.entries(rec.properties)
                            .filter(([key]) => key !== 'location' && rec.properties[key] !== null && rec.properties[key] !== undefined)
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="text-sm">{value.toString()}</span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t p-4 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('chat')}
                        >
                          Continue Conversation
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => applyRecommendation(rec)}
                        >
                          Add to Floorplan
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default FullPageChatbot;