import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatbot } from '@/components/ai/ChatbotProvider';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

interface ChatbotButtonProps {
  className?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ className = '' }) => {
  const { isOpen, openChatbot } = useChatbot();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={openChatbot}
          className={`relative ${className} ${isOpen ? 'bg-primary/10' : ''}`}
        >
          <MicrophoneIcon className="h-5 w-5" />
          {isOpen && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Configure equipment with voice (AI Assistant)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ChatbotButton;