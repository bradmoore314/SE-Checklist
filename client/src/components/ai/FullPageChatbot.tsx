import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, X, MinusCircle } from 'lucide-react';
import { useChatbot } from '@/hooks/use-chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardHeader, CardContent, CardFooter, 
  CardTitle, CardDescription 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FullPageChatbot component - Shows a full-screen version
 * of the chatbot with additional features
 */
export function FullPageChatbot() {
  const { 
    isChatbotOpen, 
    closeChatbot, 
    isFullScreen,
    toggleFullScreen,
    messages,
    addMessage,
    isListening,
    toggleListening,
    isLoading,
    setIsLoading
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    addMessage(userMessage as any);
    setInput('');
    setIsLoading(true);

    try {
      // Import chatbotService dynamically to prevent circular dependency issues
      const { default: chatbotService } = await import('@/services/chatbot-service');
      
      // Process the message through our chatbot service
      const filteredMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      
      const response = await chatbotService.processMessage(input, filteredMessages as any);
      
      // Add the response to the chat
      addMessage(response as any);
      
      // Optionally, speak the response if voice is enabled
      // This could be tied to a setting in the future
      // chatbotService.speakResponse(response.content);
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // If not full screen mode, or chatbot is closed, don't render 
  if (!isFullScreen || !isChatbotOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 p-4 bg-background"
      >
        <Card className="flex flex-col h-full">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/logo.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Security Equipment Assistant</CardTitle>
                  <CardDescription>Configure your security equipment with AI</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullScreen}
                >
                  <MinusCircle className="h-5 w-5" />
                  <span className="sr-only">Minimize</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeChatbot}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none px-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.filter(m => m.role !== 'system').map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <CardFooter className="p-4 border-t mt-auto">
                <form 
                  className="flex w-full space-x-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleListening}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="equipment" className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <CardTitle className="text-lg mb-2">Security Cameras</CardTitle>
                  <CardDescription>
                    Configure camera placement, resolution, and monitoring settings
                  </CardDescription>
                  <Button className="mt-4 w-full" variant="outline">Manage Cameras</Button>
                </Card>
                
                <Card className="p-4">
                  <CardTitle className="text-lg mb-2">Access Control</CardTitle>
                  <CardDescription>
                    Configure doors, card readers, and access permissions
                  </CardDescription>
                  <Button className="mt-4 w-full" variant="outline">Manage Access Points</Button>
                </Card>
                
                <Card className="p-4">
                  <CardTitle className="text-lg mb-2">Elevator Control</CardTitle>
                  <CardDescription>
                    Configure elevator security and floor access
                  </CardDescription>
                  <Button className="mt-4 w-full" variant="outline">Manage Elevators</Button>
                </Card>
                
                <Card className="p-4">
                  <CardTitle className="text-lg mb-2">Intercoms</CardTitle>
                  <CardDescription>
                    Configure entry communication systems
                  </CardDescription>
                  <Button className="mt-4 w-full" variant="outline">Manage Intercoms</Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">AI Assistant Preferences</h3>
                  <p className="text-muted-foreground mb-4">
                    Customize how the AI assistant works for you
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Voice Recognition</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable voice input for the AI assistant
                      </p>
                    </div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Voice Output</h4>
                      <p className="text-sm text-muted-foreground">
                        Have the AI assistant speak responses out loud
                      </p>
                    </div>
                    <Button variant="outline">Disabled</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Suggestion Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Let the AI proactively suggest configurations
                      </p>
                    </div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}