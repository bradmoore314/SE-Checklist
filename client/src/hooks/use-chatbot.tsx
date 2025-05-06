import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatbotContextType {
  isChatbotOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'I am your security equipment configuration assistant. How can I help you today?'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => {
    setIsChatbotOpen(false);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const toggleListening = () => setIsListening(!isListening);

  return (
    <ChatbotContext.Provider
      value={{
        isChatbotOpen,
        openChatbot,
        closeChatbot,
        isFullScreen,
        toggleFullScreen,
        messages,
        addMessage,
        isListening,
        toggleListening,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}