import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Send, X, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatbotWindow component - Displays a chat interface for interaction with the AI assistant
 */
export function ChatbotWindow() {
  const { 
    messages, 
    addMessage, 
    isChatbotOpen, 
    closeChatbot,
    isListening,
    toggleListening,
    isFullScreen,
    toggleFullScreen,
    isLoading,
    equipmentCreation,
    projectId,
    setProjectId
  } = useChatbot();
  
  const [inputText, setInputText] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isChatbotOpen && !isFullScreen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatbotOpen, isFullScreen]);
  
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
  
  // Only render if the chatbot is open and not in full screen mode
  if (!isChatbotOpen || isFullScreen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-20 right-5 z-30 w-96 shadow-xl"
      >
        <Card className="border rounded-lg overflow-hidden">
          <CardHeader className="p-3 border-b bg-primary/5 flex flex-row items-center justify-between">
            <div className="text-sm font-medium flex items-center">
              Security Assistant
              {equipmentCreation && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                  Adding Equipment
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullScreen}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeChatbot}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="h-80">
            <CardContent className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ask me anything about security equipment or site assessment.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
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
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} />
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-3 border-t flex gap-2">
            <Button 
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleListening}
              className="flex-shrink-0"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isLoading}
            />
            
            <Button 
              variant="default" 
              size="icon" 
              onClick={handleSendMessage}
              disabled={inputText.trim() === '' || isLoading}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}