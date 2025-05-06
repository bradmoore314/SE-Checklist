import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, Send, Mic, MicOff, Loader2, Share2, Download } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * FullPageChatbot - Full page version of the AI chatbot with more advanced features
 * This is shown when users want to configure security equipment in detail
 */
export function FullPageChatbot() {
  const { 
    isFullScreen,
    toggleFullScreen,
    closeChatbot,
    messages,
    addMessage,
    isListening,
    toggleListening,
    isLoading,
    setIsLoading
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // This is where we would normally call the backend API
      // For now, we'll just simulate a response after a delay
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: 'I can help you configure detailed security equipment settings. What specifications are you looking for?'
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isFullScreen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="flex flex-col h-full">
        <header className="py-3 px-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={toggleFullScreen}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-primary/20">
                <AvatarImage src="/logo.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">Security Equipment Configuration Assistant</h2>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="icon" onClick={closeChatbot}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="flex flex-col w-full overflow-hidden" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b rounded-none justify-start px-4 h-11">
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary/10">Chat</TabsTrigger>
              <TabsTrigger value="equipment" className="data-[state=active]:bg-primary/10">Equipment</TabsTrigger>
              <TabsTrigger value="floorplans" className="data-[state=active]:bg-primary/10">Floorplans</TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-primary/10">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              </div>
              
              <div className="p-4 border-t">
                <form 
                  className="flex space-x-2"
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
              </div>
            </TabsContent>
            
            <TabsContent value="equipment" className="flex-1 p-4 overflow-y-auto">
              <div className="grid gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Configured Equipment</h3>
                  <p className="text-muted-foreground text-sm">No equipment has been configured yet. Start a conversation with the AI to begin configuring security equipment.</p>
                </div>
                <div className="grid gap-4">
                  <h3 className="font-medium">Available Equipment Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Access Control Systems', 'Surveillance Cameras', 'Intrusion Detection', 'Fire Alarm Systems', 'Intercom Systems', 'Mass Notification'].map(type => (
                      <Card key={type} className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="p-4 pb-2">
                          <h4 className="font-medium">{type}</h4>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">Click to browse equipment options</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="floorplans" className="flex-1 p-4 overflow-y-auto">
              <div className="border rounded-lg p-8 text-center">
                <h3 className="font-medium mb-2">Floorplan Integration</h3>
                <p className="text-muted-foreground mb-4">Connect to the floorplan viewer to place equipment on your building layouts</p>
                <Button>Open Floorplan Viewer</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="flex-1 p-4 overflow-y-auto">
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2">Configuration Summary</h3>
                <p className="text-muted-foreground text-sm">Your AI-assisted configuration will appear here</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Complete Configuration</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}