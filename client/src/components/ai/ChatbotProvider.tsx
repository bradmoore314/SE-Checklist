import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChatbotContextType {
  isOpen: boolean;
  isExpanded: boolean;
  projectId?: number;
  openChatbot: () => void;
  closeChatbot: () => void;
  expandChatbot: () => void;
  minimizeChatbot: () => void;
  addEquipmentFromChat: (type: string, properties: Record<string, any>) => void;
}

// Create context with a default value
const ChatbotContext = createContext<ChatbotContextType | null>(null);

interface ChatbotProviderProps {
  children: ReactNode;
  projectId?: number;
  onAddMarker?: (type: string, properties: Record<string, any>) => void;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ 
  children, 
  projectId,
  onAddMarker
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const openChatbot = () => {
    setIsOpen(true);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const expandChatbot = () => {
    setIsExpanded(true);
  };

  const minimizeChatbot = () => {
    setIsExpanded(false);
  };

  const addEquipmentFromChat = (type: string, properties: Record<string, any>) => {
    // Call the onAddMarker callback if provided
    if (onAddMarker) {
      onAddMarker(type, properties);
    } else {
      // If no callback is provided, just show a toast
      toast({
        title: 'Adding Equipment',
        description: `Adding ${type} with properties from AI chat`,
      });
    }
  };

  // Provide the context value to all children
  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        isExpanded,
        projectId,
        openChatbot,
        closeChatbot,
        expandChatbot,
        minimizeChatbot,
        addEquipmentFromChat,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

// Custom hook to use the chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};