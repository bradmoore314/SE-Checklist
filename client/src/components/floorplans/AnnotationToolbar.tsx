import React, { useState, useEffect } from 'react';
import {
  Pointer,
  Hand,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Square,
  Circle,
  Type,
  LineChart,
  Ruler,
  Camera,
  DoorClosed,
  Magnet,
  X,
  Save,
  Trash2,
  Layers,
  Copy,
  FileOutput,
  Pipette,
  BrainCircuit,
  Pencil,
  StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import ChatbotButton from './ChatbotButton';

export type AnnotationTool = 
  | 'select' 
  | 'pan' 
  | 'zoom' 
  | 'measure' 
  | 'calibrate'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'freehand'
  | 'polygon'
  | 'polyline'  // Add polyline type to fix type errors
  | 'image'
  | 'highlight'
  | 'access_point'
  | 'camera'
  | 'intercom'
  | 'elevator'
  | 'note'
  | 'delete';

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onRotate: (direction: 'cw' | 'ccw') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onExport: () => void;
  onLayersToggle: () => void;
  onToggleLabels?: () => void;
  showLayers: boolean;
  visibleLabelTypes?: Record<string, boolean>;
  canDelete: boolean;
  canCopy: boolean;
  zoomLevel: number;
}

/**
 * Professional PDF annotation toolbar similar to Bluebeam's interface
 * With responsive design for mobile and tablet
 * 
 * Tools are color-coded to indicate their status:
 * - Green: Fully functional
 * - Orange: Partially functional
 * - Gray: Placeholder (not yet implemented)
 */
export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  onToolChange,
  onRotate,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onSave,
  onDelete,
  onCopy,
  onExport,
  onLayersToggle,
  onToggleLabels,
  showLayers,
  visibleLabelTypes = {},
  canDelete,
  canCopy,
  zoomLevel
}) => {
  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Tool status to indicate which tools are functional
  const toolStatus = {
    // Navigation tools - fully functional
    select: 'functional',
    pan: 'functional',
    
    // Equipment tools - fully functional
    access_point: 'functional',
    camera: 'functional',
    intercom: 'functional',
    elevator: 'functional',
    
    // Drawing tools - placeholders or partial
    rectangle: 'placeholder',
    circle: 'placeholder',
    line: 'placeholder',
    text: 'placeholder',
    measure: 'partial',
    calibrate: 'partial',
    
    // Note tool - fully functional
    note: 'functional',
    
    // Action tools - mixed functionality
    delete: canDelete ? 'functional' : 'disabled',
    
    // The rest are placeholders
    freehand: 'placeholder',
    polygon: 'placeholder',
    image: 'placeholder',
    highlight: 'placeholder'
  };
  
  // Add event listener for screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Mobile toolbar - collapsed state
  if (isMobile && !mobileMenuOpen) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-background border rounded-lg shadow-lg p-1.5 flex space-x-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center"
        >
          <Layers className="h-4 w-4 mr-1" />
          <span className="text-xs">Tools</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToolChange('pan')}
          className={activeTool === 'pan' ? 'bg-primary/20' : ''}
        >
          <Hand className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToolChange('access_point')}
          className={activeTool === 'access_point' ? 'bg-primary/20' : ''}
        >
          <DoorClosed className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  // Mobile toolbar - expanded state
  if (isMobile && mobileMenuOpen) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Annotation Tools</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileMenuOpen(false)}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Navigation</h4>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={activeTool === 'select' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('select')}
                className="h-9 w-full"
              >
                <Pointer className="h-4 w-4 mr-1" />
                <span className="text-xs">Select</span>
              </Button>
              
              <Button
                variant={activeTool === 'pan' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('pan')}
                className="h-9 w-full"
              >
                <Hand className="h-4 w-4 mr-1" />
                <span className="text-xs">Pan</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomIn}
                className="h-9 w-full"
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                <span className="text-xs">Zoom+</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomOut}
                className="h-9 w-full"
              >
                <ZoomOut className="h-4 w-4 mr-1" />
                <span className="text-xs">Zoom-</span>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Equipment</h4>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={activeTool === 'access_point' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('access_point')}
                className="h-9 w-full bg-green-50"
              >
                <DoorClosed className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-xs">Access</span>
              </Button>
              
              <Button
                variant={activeTool === 'camera' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('camera')}
                className="h-9 w-full bg-blue-50"
              >
                <Camera className="h-4 w-4 mr-1 text-blue-600" />
                <span className="text-xs">Camera</span>
              </Button>
              
              <Button
                variant={activeTool === 'intercom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('intercom')}
                className="h-9 w-full bg-purple-50"
              >
                <Magnet className="h-4 w-4 mr-1 text-purple-600" />
                <span className="text-xs">Intercom</span>
              </Button>
              
              <Button
                variant={activeTool === 'elevator' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('elevator')}
                className="h-9 w-full bg-orange-50"
              >
                <MoveHorizontal className="h-4 w-4 mr-1 text-orange-600" />
                <span className="text-xs">Elevator</span>
              </Button>
            </div>
            
            <div className="mt-2">
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">AI Assistant</h4>
              <div className="flex">
                <ChatbotButton className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Drawing</h4>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('rectangle')}
                className="h-9 w-full"
              >
                <Square className="h-4 w-4 mr-1" />
                <span className="text-xs">Rect</span>
              </Button>
              
              <Button
                variant={activeTool === 'circle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('circle')}
                className="h-9 w-full"
              >
                <Circle className="h-4 w-4 mr-1" />
                <span className="text-xs">Circle</span>
              </Button>
              
              <Button
                variant={activeTool === 'measure' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('measure')}
                className="h-9 w-full"
              >
                <Ruler className="h-4 w-4 mr-1" />
                <span className="text-xs">Measure</span>
              </Button>
              
              <Button
                variant={activeTool === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('text')}
                className="h-9 w-full"
              >
                <Type className="h-4 w-4 mr-1" />
                <span className="text-xs">Text</span>
              </Button>

              <Button
                variant={activeTool === 'note' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('note')}
                className="h-9 w-full bg-yellow-50"
              >
                <StickyNote className="h-4 w-4 mr-1 text-yellow-600" />
                <span className="text-xs">Note</span>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Actions</h4>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={visibleLabelTypes?.all ? 'default' : 'ghost'}
                size="sm"
                onClick={onToggleLabels}
                className="h-9 w-full"
                disabled={!onToggleLabels}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                  <path d="M4 9h16" />
                  <path d="M4 15h16" />
                  <path d="M10 3v18" />
                  <rect x="16" y="6" width="4" height="4" rx="1" />
                </svg>
                <span className="text-xs">Labels</span>
              </Button>
              
              <Button
                variant={showLayers ? 'default' : 'ghost'}
                size="sm"
                onClick={onLayersToggle}
                className="h-9 w-full"
              >
                <Layers className="h-4 w-4 mr-1" />
                <span className="text-xs">Layers</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="h-9 w-full"
              >
                <Save className="h-4 w-4 mr-1" />
                <span className="text-xs">Save</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onRotate.bind(null, 'cw')}
                className="h-9 w-full"
              >
                <RotateCw className="h-4 w-4 mr-1" />
                <span className="text-xs">Rotate</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={!canDelete}
                className="h-9 w-full"
              >
                <Trash2 className={`h-4 w-4 mr-1 ${!canDelete ? 'text-muted-foreground' : 'text-red-500'}`} />
                <span className="text-xs">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop view
  return (
    <TooltipProvider>
      <div className="bg-background border rounded-lg shadow-lg flex flex-row gap-2 p-2 w-full">
        <div className="flex items-center border-r pr-2 mr-2">
          <span className="text-xs font-semibold text-primary">Tools</span>
        </div>
        
        {/* Main toolbar with essential tools - now in horizontal layout */}
        <div className="flex flex-row items-center gap-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'select' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('select')}
                className="h-8 w-8 rounded-md"
              >
                <Pointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Select</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'pan' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('pan')}
                className="h-8 w-8 rounded-md"
              >
                <Hand className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Pan</TooltipContent>
          </Tooltip>
        
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon" 
                onClick={onZoomIn}
                className="h-8 w-8 rounded-md"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom In</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                className="h-8 w-8 rounded-md"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom Out</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomFit}
                className="h-8 w-8 rounded-md"
              >
                <div className="text-xs font-medium">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Fit to page</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Drawing and Measurement Tools */}
        <div className="flex flex-row items-center gap-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('rectangle')}
                className={`h-8 w-8 rounded-md ${toolStatus.rectangle === 'placeholder' ? 'bg-gray-100' : ''}`}
              >
                <Square className={`h-4 w-4 ${toolStatus.rectangle === 'placeholder' ? 'text-gray-400' : ''}`} />
                {toolStatus.rectangle === 'placeholder' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400 text-white rounded-full w-3 h-3 flex items-center justify-center">P</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Rectangle
              {toolStatus.rectangle === 'placeholder' && (
                <span className="ml-1 text-[9px] text-gray-400">(Coming Soon)</span>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('circle')}
                className={`h-8 w-8 rounded-md ${toolStatus.circle === 'placeholder' ? 'bg-gray-100' : ''}`}
              >
                <Circle className={`h-4 w-4 ${toolStatus.circle === 'placeholder' ? 'text-gray-400' : ''}`} />
                {toolStatus.circle === 'placeholder' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400 text-white rounded-full w-3 h-3 flex items-center justify-center">P</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Circle
              {toolStatus.circle === 'placeholder' && (
                <span className="ml-1 text-[9px] text-gray-400">(Coming Soon)</span>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'line' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('line')}
                className={`h-8 w-8 rounded-md ${toolStatus.line === 'placeholder' ? 'bg-gray-100' : ''}`}
              >
                <LineChart className={`h-4 w-4 ${toolStatus.line === 'placeholder' ? 'text-gray-400' : ''}`} />
                {toolStatus.line === 'placeholder' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400 text-white rounded-full w-3 h-3 flex items-center justify-center">P</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Line
              {toolStatus.line === 'placeholder' && (
                <span className="ml-1 text-[9px] text-gray-400">(Coming Soon)</span>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'text' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('text')}
                className={`h-8 w-8 rounded-md ${toolStatus.text === 'placeholder' ? 'bg-gray-100' : ''}`}
              >
                <Type className={`h-4 w-4 ${toolStatus.text === 'placeholder' ? 'text-gray-400' : ''}`} />
                {toolStatus.text === 'placeholder' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400 text-white rounded-full w-3 h-3 flex items-center justify-center">P</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Text
              {toolStatus.text === 'placeholder' && (
                <span className="ml-1 text-[9px] text-gray-400">(Coming Soon)</span>
              )}
            </TooltipContent>
          </Tooltip>
        
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'measure' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('measure')}
                className={`h-8 w-8 rounded-md ${toolStatus.measure === 'partial' ? 'bg-amber-50' : ''}`}
              >
                <Ruler className={`h-4 w-4 ${toolStatus.measure === 'partial' ? 'text-amber-600' : ''}`} />
                {toolStatus.measure === 'partial' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-white rounded-full w-3 h-3 flex items-center justify-center">B</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Measure
              {toolStatus.measure === 'partial' && (
                <span className="ml-1 text-[9px] text-amber-600">(Basic)</span>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'calibrate' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('calibrate')}
                className={`h-8 w-8 rounded-md ${toolStatus.calibrate === 'partial' ? 'bg-amber-50' : ''}`}
              >
                <Pipette className={`h-4 w-4 ${toolStatus.calibrate === 'partial' ? 'text-amber-600' : ''}`} />
                {toolStatus.calibrate === 'partial' && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-white rounded-full w-3 h-3 flex items-center justify-center">B</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Calibrate
              {toolStatus.calibrate === 'partial' && (
                <span className="ml-1 text-[9px] text-amber-600">(Basic)</span>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Equipment Tools */}
        <div className="flex flex-row items-center gap-1 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'access_point' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('access_point')}
                className={`h-8 w-8 rounded-md ${activeTool !== 'access_point' ? 'bg-green-50 hover:bg-green-100' : ''}`}
              >
                <DoorClosed className={`h-4 w-4 ${activeTool !== 'access_point' ? 'text-green-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">A</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Access Point</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'camera' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('camera')}
                className={`h-8 w-8 rounded-md ${activeTool !== 'camera' ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
              >
                <Camera className={`h-4 w-4 ${activeTool !== 'camera' ? 'text-blue-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">C</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Camera</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'intercom' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('intercom')}
                className={`h-8 w-8 rounded-md ${activeTool !== 'intercom' ? 'bg-purple-50 hover:bg-purple-100' : ''}`}
              >
                <Magnet className={`h-4 w-4 ${activeTool !== 'intercom' ? 'text-purple-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center">I</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Intercom</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'elevator' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('elevator')}
                className={`h-8 w-8 rounded-md ${activeTool !== 'elevator' ? 'bg-orange-50 hover:bg-orange-100' : ''}`}
              >
                <MoveHorizontal className={`h-4 w-4 ${activeTool !== 'elevator' ? 'text-orange-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">E</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Elevator</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'note' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('note')}
                className={`h-8 w-8 rounded-md ${activeTool !== 'note' ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}
              >
                <StickyNote className={`h-4 w-4 ${activeTool !== 'note' ? 'text-yellow-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center">N</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Quick Note</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-8 mx-1" />
          
          {/* AI Assistant Button */}
          <ChatbotButton className="h-8 w-8 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600" />
        </div>
        
        {/* File operations */}
        <div className="flex flex-row items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleLabels}
                className={`h-8 w-8 rounded-md ${showAllLabels ? 'bg-primary/10 border-primary' : ''}`}
                disabled={!onToggleLabels}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9h16" />
                  <path d="M4 15h16" />
                  <path d="M10 3v18" />
                  <rect x="16" y="6" width="4" height="4" rx="1" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Show All Labels</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLayersToggle}
                className={`h-8 w-8 rounded-md ${showLayers ? 'bg-primary/10' : ''}`}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Layers</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="h-8 w-8 rounded-md"
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Save</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-8 w-8 rounded-md"
              >
                <FileOutput className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={!canDelete}
                className="h-8 w-8 rounded-md"
              >
                <Trash2 className={`h-4 w-4 ${!canDelete ? 'opacity-50' : 'text-red-500'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AnnotationToolbar;