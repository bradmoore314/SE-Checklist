import { useEffect } from 'react';
import { AnnotationTool } from './AnnotationToolbar';

interface UseAnnotationShortcutsProps {
  activeTool: AnnotationTool;
  setActiveTool: (tool: AnnotationTool) => void;
  onSave: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onExport: () => void;
  canDelete: boolean;
  canCopy: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  rotate: (direction: 'cw' | 'ccw') => void;
}

/**
 * Hook to handle keyboard shortcuts for the PDF annotation tools
 * Inspired by Bluebeam's shortcut system
 */
export const useAnnotationShortcuts = ({
  activeTool,
  setActiveTool,
  onSave,
  onDelete,
  onCopy,
  onExport,
  canDelete,
  canCopy,
  zoomIn,
  zoomOut,
  zoomFit,
  rotate
}: UseAnnotationShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is on an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Prevent default for certain keys
      if (['v', 'h', 'z', 'm', 'r', 'c', 't', 'f', 'l', 'p', 'a', '+', '-', '0'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      // Tool selection shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'z':
          setActiveTool('zoom');
          break;
        case 'm':
          setActiveTool('measure');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 'c':
          setActiveTool('circle');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 'f':
          setActiveTool('freehand');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'a':
          setActiveTool('access_point');
          break;
        case 'delete':
        case 'backspace':
          if (canDelete) {
            onDelete();
          }
          break;
        case '+':
        case '=': // '=' is on the same key as '+' on most keyboards
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          zoomFit();
          break;
      }
      
      // Ctrl/Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            onSave();
            break;
          case 'c':
            if (canCopy) {
              e.preventDefault();
              onCopy();
            }
            break;
          case 'e':
            e.preventDefault();
            onExport();
            break;
          case '[':
            e.preventDefault();
            rotate('ccw');
            break;
          case ']':
            e.preventDefault();
            rotate('cw');
            break;
        }
      }
    };
    
    // Add event listener for keyboard shortcuts
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeTool,
    setActiveTool,
    onSave,
    onDelete,
    onCopy,
    onExport,
    canDelete,
    canCopy,
    zoomIn,
    zoomOut,
    zoomFit,
    rotate
  ]);
};

export default useAnnotationShortcuts;