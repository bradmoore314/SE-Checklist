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
        {/* Main toolbar - always visible */}
        <div className="px-3 flex items-center justify-between">
          {/* Left side tools */}
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            <ToolButton 
              icon={<MousePointer />} 
              label="Select"
              active={currentTool === 'select'} 
              onClick={() => onToolSelect('select')} 
            />
            <ToolButton 
              icon={<DoorClosed />} 
              label="Door"
              active={currentTool === 'access_point'} 
              onClick={() => onToolSelect('access_point')} 
            />
            <ToolButton 
              icon={<Camera />} 
              label="Camera"
              active={currentTool === 'camera'} 
              onClick={() => onToolSelect('camera')} 
            />
            <ToolButton 
              icon={<Phone />} 
              label="Intercom"
              active={currentTool === 'intercom'} 
              onClick={() => onToolSelect('intercom')} 
            />
            <ToolButton 
              icon={<ArrowUpDown />} 
              label="Elevator"
              active={currentTool === 'elevator'} 
              onClick={() => onToolSelect('elevator')} 
            />
          </div>
          
          {/* Right side tools */}
          <div className="flex items-center space-x-1">
            <ToolButton 
              icon={<Move />}
              label="Move"
              active={currentTool === 'move'}
              onClick={() => onToolSelect('select')}
              tooltip="Select & drag marker"
            />
            <ToolButton 
              icon={<X />}
              label="Delete"
              active={currentTool === 'delete'}
              onClick={() => onToolSelect('delete')}
            />
            <ToolButton 
              icon={<Ruler />}
              label="Measure"
              active={currentTool === 'measure'}
              onClick={() => onToolSelect('measure')}
            />
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="mt-2 px-3 flex items-center justify-between">
          <div className="flex space-x-3">
            <button 
              onClick={onZoomIn}
              className="h-9 w-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow"
            >
              <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button 
              onClick={onZoomOut}
              className="h-9 w-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow"
            >
              <ZoomOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={onReset}
              className="h-9 w-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow"
            >
              <RotateCcw className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex">
            <button 
              className="bg-primary text-white h-9 px-3 flex items-center justify-center font-medium rounded-md shadow-md"
              onClick={() => {
                // Auto-save is already implemented, this is just visual feedback
                const savedToast = document.createElement('div');
                savedToast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-md text-sm';
                savedToast.textContent = '✓ Changes saved';
                document.body.appendChild(savedToast);
                setTimeout(() => {
                  savedToast.remove();
                }, 2000);
              }}
            >
              Auto-Saved
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