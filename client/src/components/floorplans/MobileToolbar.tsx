import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
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
  CloudLightning
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to determine if a tool is functional or a placeholder
  const isFunctionalTool = (tool: AnnotationTool): boolean => {
    const functionalTools = ['select', 'access_point', 'camera', 'intercom', 'elevator', 'measure'];
    return functionalTools.includes(tool);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      {/* Collapsed state - just shows handle */}
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-full py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          aria-label="Show tools"
        >
          <ChevronUp className="h-6 w-6 text-gray-500" />
          <span className="ml-2 text-sm font-medium">Tools</span>
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe">
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-3">
            <h3 className="text-base font-medium">Annotation Tools</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Hide tools"
            >
              <ChevronDown className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Tool grid */}
          <div className="p-0.5">
            <div className="grid grid-cols-6 gap-0.5 mb-1">
              <ToolButton 
                icon={<DoorClosed />} 
                label="Door" 
                active={currentTool === 'access_point'} 
                functional={true}
                onClick={() => onToolSelect('access_point')} 
              />
              <ToolButton 
                icon={<Camera />} 
                label="Camera" 
                active={currentTool === 'camera'} 
                functional={true}
                onClick={() => onToolSelect('camera')} 
              />
              <ToolButton 
                icon={<Phone />} 
                label="Intercom" 
                active={currentTool === 'intercom'} 
                functional={true}
                onClick={() => onToolSelect('intercom')} 
              />
              <ToolButton 
                icon={<ArrowUpDown />} 
                label="Elevator" 
                active={currentTool === 'elevator'} 
                functional={true}
                onClick={() => onToolSelect('elevator')} 
              />
              <ToolButton 
                icon={<Ruler />} 
                label="Measure" 
                active={currentTool === 'measure'} 
                functional={true}
                onClick={() => onToolSelect('measure')} 
              />
              <ToolButton 
                icon={<Text />} 
                label="Text" 
                active={currentTool === 'text'} 
                functional={false}
                onClick={() => onToolSelect('text')} 
              />
              <ToolButton 
                icon={<Square />} 
                label="Rectangle" 
                active={currentTool === 'rectangle'} 
                functional={false}
                onClick={() => onToolSelect('rectangle')} 
              />
              <ToolButton 
                icon={<Circle />} 
                label="Circle" 
                active={currentTool === 'circle'} 
                functional={false}
                onClick={() => onToolSelect('circle')} 
              />
            </div>
            
            {/* Viewport controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-around">
                <button 
                  onClick={onZoomIn}
                  className="flex flex-col items-center py-1 px-2"
                >
                  <ZoomIn className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">Zoom In</span>
                </button>
                <button 
                  onClick={onZoomOut}
                  className="flex flex-col items-center py-1 px-2"
                >
                  <ZoomOut className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">Zoom Out</span>
                </button>
                <button 
                  onClick={onReset}
                  className="flex flex-col items-center py-1 px-2"
                >
                  <RotateCcw className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual tool button component
const ToolButton = ({ 
  icon, 
  label, 
  active, 
  functional,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  functional: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-1 px-0.5 rounded-md max-w-[38px] w-full
        ${active 
          ? 'bg-primary/20 text-primary border-primary' 
          : functional 
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' 
            : 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
        }
      `}
      disabled={!functional}
    >
      <div className="h-4 w-4 mb-0.5">
        {icon}
      </div>
      <span className="text-[9px] leading-tight line-clamp-1">{label}</span>
      
      {/* Badge for non-functional tools */}
      {!functional && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
          !
        </div>
      )}
    </button>
  );
};