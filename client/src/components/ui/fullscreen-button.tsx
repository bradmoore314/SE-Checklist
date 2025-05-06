import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize } from 'lucide-react';

interface FullScreenButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showTooltip?: boolean;
}

export function FullScreenButton({
  targetRef,
  className = '',
  variant = 'outline',
  size = 'icon',
  showTooltip = true,
}: FullScreenButtonProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  useEffect(() => {
    // Update state when fullscreen changes from other sources (like Escape key)
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  const toggleFullScreen = () => {
    if (!targetRef.current) return;
    
    if (!document.fullscreenElement) {
      targetRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };
  
  return (
    <Button
      onClick={toggleFullScreen}
      variant={variant}
      size={size}
      className={className}
      title={isFullScreen ? "Exit full screen" : "View in full screen"}
    >
      {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </Button>
  );
}