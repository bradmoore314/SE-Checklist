import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from '@/hooks/use-chatbot';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatbotButton - Floating action button to open/close the chat
 */
export function ChatbotButton() {
  const { isChatbotOpen, openChatbot, closeChatbot } = useChatbot();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (isChatbotOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {isHovered && !isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-14 top-2 bg-primary text-primary-foreground rounded-md py-1 px-3 whitespace-nowrap"
          >
            Ask Security Assistant
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isChatbotOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isChatbotOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}