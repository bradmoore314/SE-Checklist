import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Mic, MicOff, Maximize2, X } from 'lucide-react';
import { useChatbot } from './ChatbotProvider';
import { MicrophoneIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotWindow: React.FC = () => {
  const { isOpen, isExpanded, closeChatbot, expandChatbot, projectId } = useChatbot();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I can help you configure security equipment. How can I assist you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Make API call to backend for AI response
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          projectId: projectId,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Optional: Speak the response if text-to-speech is enabled
      if (isSpeaking) {
        speakText(data.response);
      }
      
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Here you would stop the recording and process the audio
      // For now, we'll simulate this with a timeout
      setIsProcessing(true);
      setTimeout(() => {
        const simulatedText = "Show me options for camera placement in the lobby area";
        setInputMessage(simulatedText);
        setIsProcessing(false);
        toast({
          title: "Speech Recognition",
          description: "This is a simulation. In production, we would use the Google Speech API.",
        });
      }, 1500);
    } else {
      // Start recording
      setIsRecording(true);
      
      try {
        // In production, you would integrate with the speech recognition service
        toast({
          title: "Speech Recognition",
          description: "Speak now... (This is a simulation)",
        });
        
        // Simulate recording for a few seconds
        setTimeout(() => {
          toggleRecording();
        }, 3000);
        
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        toast({
          title: "Error",
          description: "Failed to start speech recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const speakText = (text: string) => {
    // Using the browser's built-in speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser');
    }
  };
  
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={`fixed bottom-4 right-4 z-50 shadow-lg transition-all duration-300 ${
      isExpanded ? 'w-full md:w-3/4 lg:w-2/3 h-[80vh]' : 'w-80 h-96'
    }`}>
      <CardHeader className="p-4 flex flex-row items-center justify-between bg-primary/10 rounded-t-lg">
        <div>
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <CardDescription>Configure security equipment with voice</CardDescription>
        </div>
        <div className="flex gap-1">
          {!isExpanded ? (
            <Button variant="ghost" size="icon" onClick={expandChatbot}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={closeChatbot}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-50 block mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex items-center w-full gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleRecording}
            className={isRecording ? 'bg-red-100 text-red-500 animate-pulse' : ''}
          >
            {isRecording ? (
              <MicrophoneIcon className="h-4 w-4" />
            ) : (
              <MicrophoneIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSpeaking}
          >
            {isSpeaking ? (
              <SpeakerWaveIcon className="h-4 w-4" />
            ) : (
              <SpeakerXMarkIcon className="h-4 w-4" />
            )}
          </Button>
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isProcessing}
            className="flex-grow"
          />
          <Button
            onClick={sendMessage}
            disabled={inputMessage.trim() === '' || isProcessing}
            size="icon"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatbotWindow;