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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Send, 
  Maximize2, 
  Minimize2, 
  MessageSquare,
  X,
  RefreshCw,
  Camera,
  BrainCircuit,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotWindowProps {
  projectId?: number;
  onExpand?: () => void;
  onMinimize?: () => void;
  onAddMarker?: (type: string, properties: Record<string, any>) => void;
  isExpanded?: boolean;
  className?: string;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  projectId,
  onExpand,
  onMinimize,
  onAddMarker,
  isExpanded = false,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [interimResult, setInterimResult] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize on mount
  useEffect(() => {
    setIsRecognitionSupported(chatbotService.isRecognitionSupported());
    setIsSynthesisSupported(chatbotService.isSynthesisSupported());
    
    // Load existing chat session or start a new one
    const session = chatbotService.getSession();
    if (session) {
      setMessages(chatbotService.getMessages());
    } else {
      // Start with assistant greeting
      sendInitialGreeting();
    }
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
      
      // Check if we have a complete equipment recommendation
      const session = chatbotService.getSession();
      if (session?.context?.configStage === 'complete' && session?.context?.confidence && session?.context?.confidence > 0.7) {
        const recommendations = await chatbotService.getEquipmentRecommendations();
        if (recommendations && recommendations.length > 0) {
          setPendingRecommendation(recommendations[0]);
          setShowConfirmation(true);
        }
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
    setPendingRecommendation(null);
    setShowConfirmation(false);
    sendInitialGreeting();
  };

  const confirmRecommendation = () => {
    if (pendingRecommendation && onAddMarker) {
      onAddMarker(
        pendingRecommendation.type,
        pendingRecommendation.properties
      );
      
      toast({
        title: 'Success',
        description: `${pendingRecommendation.type.replace('_', ' ')} was added to the floorplan.`,
        variant: 'default',
      });
      
      resetChat();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized && onMinimize) {
      onMinimize();
    }
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={toggleMinimize}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <Card 
      className={`${className} ${isExpanded ? 'w-full h-full' : 'w-80 h-96'} 
                 flex flex-col shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/80 to-primary/60">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          <CardTitle className="text-lg font-semibold text-primary-foreground">AI Assistant</CardTitle>
        </div>
        <div className="flex space-x-1">
          {isExpanded ? (
            <Button variant="ghost" size="icon" onClick={onMinimize} className="h-7 w-7 text-primary-foreground">
              <Minimize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleExpand} className="h-7 w-7 text-primary-foreground">
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-7 w-7 text-primary-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {showConfirmation ? (
        <CardContent className="flex-grow p-4 overflow-auto flex flex-col">
          <div className="bg-muted p-3 rounded-lg mb-4">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Configuration Complete
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI assistant has gathered all the necessary information for your {pendingRecommendation?.type.replace('_', ' ')}.
            </p>
            
            <div className="bg-background p-3 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Configuration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="text-muted-foreground">
                    {pendingRecommendation?.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span className="text-muted-foreground">
                    {pendingRecommendation?.properties.location || 'Not specified'}
                  </span>
                </div>
                
                {pendingRecommendation?.type === 'access_point' && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Reader Type:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.reader_type || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Lock Type:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.lock_type || 'Not specified'}
                      </span>
                    </div>
                  </>
                )}
                
                {pendingRecommendation?.type === 'camera' && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Camera Type:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.camera_type || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mounting:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.mounting_type || 'Not specified'}
                      </span>
                    </div>
                  </>
                )}
                
                {pendingRecommendation?.type === 'intercom' && (
                  <div className="flex justify-between">
                    <span className="font-medium">Intercom Type:</span>
                    <span className="text-muted-foreground">
                      {pendingRecommendation?.properties.intercom_type || 'Not specified'}
                    </span>
                  </div>
                )}
                
                {pendingRecommendation?.type === 'elevator' && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Elevator Type:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.elevator_type || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Floor Count:</span>
                      <span className="text-muted-foreground">
                        {pendingRecommendation?.properties.floor_count || 'Not specified'}
                      </span>
                    </div>
                  </>
                )}
                
                {pendingRecommendation?.properties.notes && (
                  <div className="flex justify-between">
                    <span className="font-medium">Notes:</span>
                    <span className="text-muted-foreground">
                      {pendingRecommendation?.properties.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 justify-end">
              <Button variant="outline" size="sm" onClick={resetChat}>
                Start Over
              </Button>
              <Button size="sm" onClick={confirmRecommendation}>
                Add to Floorplan
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="flex-grow p-3 overflow-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
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
                  <div className="max-w-[80%] rounded-lg p-3 bg-primary/40 text-primary-foreground">
                    <p className="text-sm italic">{interimResult}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <div className="w-full flex space-x-2 items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={resetChat}
                className="h-8 w-8 flex-shrink-0"
                title="Reset conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder={isListening ? 'Listening...' : 'Type a message...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || isListening}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1 flex space-x-1">
                  {isRecognitionSupported && (
                    <Button
                      variant={isListening ? "default" : "ghost"}
                      size="icon"
                      onClick={toggleListening}
                      className="h-6 w-6 flex-shrink-0"
                      disabled={isLoading}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSendMessage}
                    className="h-6 w-6 flex-shrink-0"
                    disabled={isLoading || (!input.trim() && !interimResult.trim())}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ChatbotWindow;