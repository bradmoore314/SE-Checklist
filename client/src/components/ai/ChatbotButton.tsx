import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion } from 'framer-motion';

/**
 * ChatbotButton - Floating button that opens the AI chatbot
 */
export function ChatbotButton() {
  const { isChatbotOpen, openChatbot } = useChatbot();

  // Don't show the button if the chatbot is already open
  if (isChatbotOpen) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
    >
      <Button 
        onClick={openChatbot}
        className="h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    </motion.div>
  );
}