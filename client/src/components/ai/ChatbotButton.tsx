import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from '@/hooks/use-chatbot';

/**
 * ChatbotButton - A floating action button to open the AI chatbot
 * This button appears in the bottom-right corner of the dashboard
 */
export function ChatbotButton() {
  const { openChatbot, isChatbotOpen } = useChatbot();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={openChatbot}
        size="lg"
        className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg transition-all duration-300 hover:scale-105"
        aria-label="Open AI assistant"
      >
        <MessageSquareText className="h-6 w-6" />
      </Button>
    </div>
  );
}