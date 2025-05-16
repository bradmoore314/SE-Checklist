import { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  DoorClosed, 
  Camera, 
  Phone, 
  ArrowUpDown, 
  Ruler, 
  Text, 
  Square, 
  Circle, 
  PenTool, 
  Move, 
  Maximize,
  X,
  ChevronUp,
  ChevronDown,
  MousePointer,
  CornerUpLeft
} from 'lucide-react';
import { AnnotationTool } from './AnnotationToolbar';

interface MobileToolbarProps {
  currentTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const MobileToolbar = ({
  currentTool,
  onToolSelect,
  onZoomIn,
  onZoomOut,
  onReset
}: MobileToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  
  // Simplified toolbar with just the essential tools in one always-visible bar
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg py-2">
        {/* Simplified toolbar - main tools moved to top toolbar */}
        <div className="px-3 flex items-center justify-center">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Tool buttons moved to top toolbar</p>
          </div>
        </div>
        
        {/* Bottom controls - Enhanced for iPad with larger touch targets */}
        <div className="mt-2 px-3 flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={onZoomIn}
              className="h-14 w-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md"
              onTouchStart={onZoomIn}
              aria-label="Zoom In"
            >
              <ZoomIn className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>
            <button 
              onClick={onZoomOut}
              className="h-14 w-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md"
              onTouchStart={onZoomOut}
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={onReset}
              className="h-14 w-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md"
              onTouchStart={onReset}
              aria-label="Reset View"
            >
              <RotateCcw className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex">
            <button 
              className="bg-primary text-white h-14 px-6 flex items-center justify-center font-medium rounded-lg shadow-md text-base"
              onClick={() => {
                // Use proper React state for visual feedback
                // We don't need to create DOM elements manually
                console.log('Changes saved');
              }}
              onTouchStart={() => {
                console.log('Changes saved');
              }}
              aria-label="Save Changes"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Auto-Saved
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated tool button component with a cleaner, more modern look
const ToolButton = ({ 
  icon, 
  label, 
  active, 
  onClick,
  tooltip
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center py-1 px-2 rounded-md
        ${active 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
        }
      `}
      title={tooltip}
    >
      <div className="h-5 w-5">
        {icon}
      </div>
      <span className="text-[10px] font-medium whitespace-nowrap mt-1">{label}</span>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
        </div>
      )}
    </button>
  );
};