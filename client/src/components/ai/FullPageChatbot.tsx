import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Send, X, Minimize, ArrowLeft, Radio, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * FullPageChatbot component - Displays a full-screen chat interface for in-depth interaction
 * with the AI assistant, includes additional features compared to the compact ChatbotWindow
 */
export function FullPageChatbot() {
  const { 
    messages, 
    addMessage, 
    clearMessages,
    isChatbotOpen, 
    isFullScreen,
    toggleFullScreen,
    isListening,
    isContinuousMode,
    toggleListening,
    toggleContinuousMode,
    isLoading,
    equipmentCreation,
    projectId
  } = useChatbot();
  
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when full screen mode activates
  useEffect(() => {
    if (isFullScreen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isFullScreen]);
  
  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage({ content: inputText, role: 'user' });
      setInputText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Only render if fullscreen mode is active
  if (!isChatbotOpen || !isFullScreen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background"
      >
        <div className="flex flex-col h-full">
          <CardHeader className="py-3 px-4 border-b flex-shrink-0 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <span className="text-lg font-medium">Security Assistant</span>
                {equipmentCreation && (
                  <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Adding Equipment
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearMessages}>
                Clear Chat
              </Button>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
            <div className="border-b px-4">
              <TabsList className="h-10">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden mt-0 p-0">
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="text-xl font-semibold mb-2">Welcome to the Security Assistant</h3>
                      <p className="text-muted-foreground mb-6">
                        I can help you configure security equipment, assess site requirements, 
                        and provide recommendations based on your project needs.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                          "Add 3 access points to the main entrance",
                          "Add 2 cameras to the parking lot",
                          "What access points do I need for a 5-story office building?",
                          "What are the best security solutions for a retail environment?",
                          "Help me place cameras for optimal coverage",
                          "Explain the differences between magnetic locks and electric strikes"
                        ].map((suggestion, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            className="justify-start h-auto py-3 px-4 text-left"
                            onClick={() => {
                              setInputText(suggestion);
                              setTimeout(() => {
                                handleSendMessage();
                              }, 100);
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`rounded-lg px-4 py-3 max-w-[80%] ${
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
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-3 bg-muted">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Equipment creation status indicator */}
                  {equipmentCreation && !isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-3 bg-green-50 border border-green-200 max-w-[80%]">
                        <div className="text-sm text-green-800">
                          <p className="font-medium">
                            Adding {equipmentCreation.currentStep && 
                              equipmentCreation.currentStep.replace('_', ' ')}
                          </p>
                          {equipmentCreation.isComplete ? (
                            <p className="text-xs mt-1">✓ Equipment added successfully</p>
                          ) : (
                            <p className="text-xs mt-1">Please answer the questions to continue</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              
              <CardFooter className="p-4 border-t flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isListening && !isContinuousMode ? "default" : "outline"}
                        size="icon"
                        onClick={toggleListening}
                        className="flex-shrink-0"
                        disabled={isContinuousMode}
                      >
                        {isListening && !isContinuousMode ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isContinuousMode 
                        ? "One-time listening disabled while Voice Mode is active" 
                        : isListening 
                          ? "Stop listening" 
                          : "Start one-time listening"
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isContinuousMode ? "default" : "outline"}
                        size="icon"
                        onClick={toggleContinuousMode}
                        className={`flex-shrink-0 ${isContinuousMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        {isContinuousMode ? <Radio className="h-5 w-5 animate-pulse" /> : <Headphones className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isContinuousMode 
                        ? "Voice Mode active - Turn off continuous listening" 
                        : "Turn on Voice Mode - Similar to Grok's Voice Mode"
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isContinuousMode ? "Listening for your voice..." : "Type your question or request..."}
                  className="flex-1"
                  disabled={isLoading || isContinuousMode}
                />
                
                <Button 
                  variant="default" 
                  onClick={handleSendMessage}
                  disabled={(inputText.trim() === '' && !isContinuousMode) || isLoading}
                  className="flex-shrink-0"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-grow p-6 overflow-auto">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">Assistant Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-2">Voice Settings</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                      <p className="text-muted-foreground">
                        Configure speech recognition and voice synthesis settings.
                      </p>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Voice Mode</p>
                            <p className="text-sm text-muted-foreground">
                              Continuous conversation similar to Grok's Voice Mode
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="voice-mode"
                              checked={isContinuousMode}
                              onCheckedChange={toggleContinuousMode}
                            />
                            <Label htmlFor="voice-mode" className={isContinuousMode ? "text-green-600" : ""}>
                              {isContinuousMode ? "Active" : "Disabled"}
                            </Label>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Voice Settings</p>
                            <p className="text-sm text-muted-foreground">
                              Calibrate microphone and test voice synthesis
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mic className="h-4 w-4 mr-2" />
                              Calibrate
                            </Button>
                            <Button variant="outline" size="sm">
                              Test Voice
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">AI Preferences</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground mb-3">
                        Customize how the AI assistant responds and analyzes information.
                      </p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="outline" className="justify-start">Default Mode</Button>
                          <Button variant="outline" className="justify-start">Detailed Mode</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="flex-grow p-6 overflow-auto">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">How to Use the Security Assistant</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-2">Getting Started</h4>
                    <p className="text-muted-foreground">
                      The Security Assistant is designed to help you configure, analyze, and optimize
                      security equipment for your projects. Here's how to make the most of it:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Ask specific questions about security equipment options</li>
                      <li>Describe your site requirements for recommendations</li>
                      <li>Request guidance on equipment placement</li>
                      <li>Compare different security technologies</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Voice Commands</h4>
                    <p className="text-muted-foreground">
                      You can use voice commands to interact with the assistant. Click the microphone
                      button and speak clearly. Your speech will be converted to text.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Example Questions</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p>"What type of access control is best for a multi-tenant building?"</p>
                      <p>"How many cameras would I need for a 10,000 sq ft retail space?"</p>
                      <p>"Explain the difference between IP and analog cameras."</p>
                      <p>"What security measures do you recommend for a school?"</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}