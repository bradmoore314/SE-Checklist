import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * ChatbotWindow - The floating window for the AI chatbot
 */
export function ChatbotWindow() {
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

  const windowVariants = {
    open: { opacity: 1, y: 0, scale: 1 },
    closed: { opacity: 0, y: 20, scale: 0.9 }
  };

  if (!isChatbotOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="closed"
        animate="open"
        exit="closed"
        variants={windowVariants}
        transition={{ duration: 0.3 }}
        className={`fixed ${
          isFullScreen ? 'inset-0 p-4' : 'bottom-24 right-6 w-96 h-[600px]'
        } z-50`}
      >
        <Card className="flex flex-col h-full shadow-xl border-primary/20">
          <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center space-y-0">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-primary/20">
                <AvatarImage src="/logo.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">Security Equipment Assistant</h3>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFullScreen}
                className="h-8 w-8"
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeChatbot}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
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
          <CardFooter className="p-3 border-t">
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
                size="icon"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}