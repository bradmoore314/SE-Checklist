import React, { createContext, useState, useContext, useEffect } from 'react';
import ChatbotWindow from './ChatbotWindow';
import FullPageChatbot from './FullPageChatbot';

interface ChatbotContextType {
  isOpen: boolean;
  isExpanded: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  expandChatbot: () => void;
  minimizeChatbot: () => void;
  addEquipmentFromChat: (type: string, properties: Record<string, any>) => void;
}

interface ChatbotProviderProps {
  children: React.ReactNode;
  projectId?: number;
  onAddMarker?: (type: string, properties: Record<string, any>) => void;
}

const ChatbotContext = createContext<ChatbotContextType>({
  isOpen: false,
  isExpanded: false,
  openChatbot: () => {},
  closeChatbot: () => {},
  expandChatbot: () => {},
  minimizeChatbot: () => {},
  addEquipmentFromChat: () => {},
});

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ 
  children, 
  projectId,
  onAddMarker 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const openChatbot = () => setIsOpen(true);
  const closeChatbot = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };
  
  const expandChatbot = () => setIsExpanded(true);
  const minimizeChatbot = () => setIsExpanded(false);

  const addEquipmentFromChat = (type: string, properties: Record<string, any>) => {
    if (onAddMarker) {
      onAddMarker(type, properties);
    }
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        isExpanded,
        openChatbot,
        closeChatbot,
        expandChatbot,
        minimizeChatbot,
        addEquipmentFromChat,
      }}
    >
      {children}
      
      {isOpen && !isExpanded && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatbotWindow
            projectId={projectId}
            onExpand={expandChatbot}
            onMinimize={closeChatbot}
            onAddMarker={onAddMarker}
          />
        </div>
      )}
      
      {isOpen && isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-[90vw] h-[90vh] max-w-6xl">
            <FullPageChatbot
              projectId={projectId}
              onClose={minimizeChatbot}
              onAddMarker={onAddMarker}
            />
          </div>
        </div>
      )}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;