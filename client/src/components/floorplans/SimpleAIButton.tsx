import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

interface SimpleAIButtonProps {
  className?: string;
  onClick?: () => void;
}

/**
 * A simplified version of the AI button that doesn't depend on ChatbotProvider
 * Used in contexts where the ChatbotProvider might not be available
 */
const SimpleAIButton: React.FC<SimpleAIButtonProps> = ({ 
  className = '',
  onClick = () => {}
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          className={`relative ${className}`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Configure equipment with voice (AI Assistant)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SimpleAIButton;