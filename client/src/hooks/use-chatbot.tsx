import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage } from '@/services/chatbot-service';

interface ChatbotContextProps {
  // Chat state
  messages: Array<ChatMessage & { role: string }>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // UI state
  isChatbotOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  
  // Speech state
  isListening: boolean;
  toggleListening: () => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const initialContext: ChatbotContextProps = {
  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
  isChatbotOpen: false,
  openChatbot: () => {},
  closeChatbot: () => {},
  isFullScreen: false,
  toggleFullScreen: () => {},
  isListening: false,
  toggleListening: () => {},
  isLoading: false,
  setIsLoading: () => {},
};

export const ChatbotContext = createContext<ChatbotContextProps>(initialContext);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  // Chat state
  const [messages, setMessages] = useState<Array<ChatMessage & { role: string }>>([
    {
      role: 'system',
      content: 'You are a helpful security equipment configuration assistant. Help users configure cameras, access control points, elevators, and intercoms.'
    },
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for security equipment configuration. How can I help you today?'
    }
  ]);
  
  // UI state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Speech state
  const [isListening, setIsListening] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Add a new message to the chat
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message as any]);
  };
  
  // Clear all messages except the system and initial greeting
  const clearMessages = () => {
    setMessages([
      {
        role: 'system',
        content: 'You are a helpful security equipment configuration assistant. Help users configure cameras, access control points, elevators, and intercoms.'
      },
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for security equipment configuration. How can I help you today?'
      }
    ]);
  };
  
  // Open the chatbot
  const openChatbot = () => {
    setIsChatbotOpen(true);
  };
  
  // Close the chatbot
  const closeChatbot = () => {
    setIsChatbotOpen(false);
    setIsFullScreen(false);
    setIsListening(false);
  };
  
  // Toggle full screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };
  
  // Toggle listening mode
  const toggleListening = async () => {
    // Import chatbotService dynamically to prevent circular dependency issues
    const { default: chatbotService } = await import('@/services/chatbot-service');
    
    if (isListening) {
      // Stop listening
      chatbotService.stopListening();
      setIsListening(false);
    } else {
      // Start listening and handle the transcript
      const success = chatbotService.startListening((transcript) => {
        // We'll handle the transcript in the ChatbotWindow component
        // This will use the addMessage function to add the transcript as a user message
        console.log('Transcript:', transcript);
        setIsListening(false);
      });
      
      setIsListening(success);
    }
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Import chatbotService dynamically to prevent circular dependency issues
      import('@/services/chatbot-service').then(({ default: chatbotService }) => {
        // Stop any ongoing speech or listening
        chatbotService.stopListening();
        chatbotService.stopSpeaking();
      });
    };
  }, []);
  
  const value = {
    messages,
    addMessage,
    clearMessages,
    isChatbotOpen,
    openChatbot,
    closeChatbot,
    isFullScreen,
    toggleFullScreen,
    isListening,
    toggleListening,
    isLoading,
    setIsLoading,
  };
  
  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  
  return context;
};