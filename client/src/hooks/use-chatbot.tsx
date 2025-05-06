import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { SpeechService } from "@/services/speech-service";

// Initialize speech service
const speechService = new SpeechService();

// Define types for chat messages
export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

// Define the context type
interface ChatbotContextProps {
  // Chat state
  messages: ChatMessage[];
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

// Create initial context value
const initialContext: ChatbotContextProps = {
  // Chat state
  messages: [],
  addMessage: () => {},
  clearMessages: () => {},
  
  // UI state
  isChatbotOpen: false,
  openChatbot: () => {},
  closeChatbot: () => {},
  isFullScreen: false,
  toggleFullScreen: () => {},
  
  // Speech state
  isListening: false,
  toggleListening: () => {},
  
  // Loading state
  isLoading: false,
  setIsLoading: () => {},
};

// Create context
export const ChatbotContext = createContext<ChatbotContextProps>(initialContext);

// Define provider props
interface ChatbotProviderProps {
  children: ReactNode;
}

// Create provider component
export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Add initial welcome message when the component mounts
  useEffect(() => {
    // This simulates a welcome message from the assistant
    const welcomeMessage: ChatMessage = {
      content: "Hello! I'm your Security Assistant. How can I help you with your security equipment today?",
      role: 'assistant',
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Add a message to the chat and handle response
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    
    // If it's a user message, get a response from the API
    if (message.role === 'user') {
      setIsLoading(true);
      
      // Prepare the message history to send to the API
      const messageHistory = [...messages, message];
      
      // Call the API endpoint
      fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory,
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // The API response contains the AI message and recommendations
          const aiResponse: ChatMessage = {
            content: data.message,
            role: 'assistant',
          };
          
          setMessages(prev => [...prev, aiResponse]);
          
          // If there are recommendations, we could process them here
          // For example, update UI or store them for later use
          if (data.recommendations && data.recommendations.length > 0) {
            console.log('Equipment recommendations:', data.recommendations);
          }
          
          // Text-to-speech for the response if browser supports it
          if (speechService.isSynthesisSupported()) {
            speechService.speak(aiResponse.content);
          }
        })
        .catch(error => {
          console.error('Error fetching chatbot response:', error);
          
          // Add an error message
          const errorResponse: ChatMessage = {
            content: 'Sorry, I encountered an error while processing your request. Please try again.',
            role: 'assistant',
          };
          
          setMessages(prev => [...prev, errorResponse]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [messages]);
  
  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    
    // Add back the welcome message
    const welcomeMessage: ChatMessage = {
      content: "Hello! I'm your Security Assistant. How can I help you with your security equipment today?",
      role: 'assistant',
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // UI state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const openChatbot = useCallback(() => setIsChatbotOpen(true), []);
  const closeChatbot = useCallback(() => {
    setIsChatbotOpen(false);
    setIsFullScreen(false);
  }, []);
  
  const toggleFullScreen = useCallback(() => setIsFullScreen(prev => !prev), []);
  
  // Speech state
  const [isListening, setIsListening] = useState(false);
  
  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (!speechService.isRecognitionSupported()) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }
    
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const success = speechService.startListening((transcript) => {
        // Add the transcript as a user message
        if (transcript.trim()) {
          addMessage({
            content: transcript,
            role: 'user',
          });
        }
        // Stop listening after getting a transcript
        speechService.stopListening();
        setIsListening(false);
      });
      
      setIsListening(success);
    }
  }, [isListening, addMessage]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Create context value
  const contextValue: ChatbotContextProps = {
    // Chat state
    messages,
    addMessage,
    clearMessages,
    
    // UI state
    isChatbotOpen,
    openChatbot,
    closeChatbot,
    isFullScreen,
    toggleFullScreen,
    
    // Speech state
    isListening,
    toggleListening,
    
    // Loading state
    isLoading,
    setIsLoading,
  };
  
  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Custom hook to use the chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  
  return context;
};