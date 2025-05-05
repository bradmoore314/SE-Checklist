import React from 'react';
import {
  Pointer,
  Hand,
  MoveHorizontal,
  ZoomIn,
  RotateCcw,
  RotateCw,
  Square,
  Circle,
  Highlighter,
  PenTool,
  Type,
  LineChart,
  Ruler,
  Image,
  Camera,
  DoorClosed,
  Magnet,
  X,
  Save,
  Trash2,
  Layers,
  Copy,
  FileOutput,
  FileCheck,
  Pipette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
  | 'image'
  | 'highlight'
  | 'access_point'
  | 'camera'
  | 'intercom'
  | 'elevator'
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
  showLayers: boolean;
  canDelete: boolean;
  canCopy: boolean;
  zoomLevel: number;
}

/**
 * Professional PDF annotation toolbar similar to Bluebeam's interface
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
  showLayers,
  canDelete,
  canCopy,
  zoomLevel
}) => {
  return (
    <TooltipProvider>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 bg-background border rounded-lg shadow-lg flex flex-col p-2 space-y-2">
        {/* Toolbar header with title */}
        <div className="flex items-center justify-center border-b pb-1 mb-1">
          <span className="text-xs font-semibold text-primary">Annotation Tools</span>
        </div>
        
        {/* Main toolbar with essential tools */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'select' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('select')}
                className="h-9 w-9 rounded-md"
              >
                <Pointer className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Select (V)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'pan' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('pan')}
                className="h-9 w-9 rounded-md"
              >
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Pan (H)</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Zoom & View Controls in a small area */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon" 
                onClick={onZoomIn}
                className="h-9 w-9 rounded-md"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Zoom In (+)</TooltipContent>
          </Tooltip>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomFit}
                className="h-9 w-9 rounded-md"
              >
                <div className="text-xs font-medium">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-40" side="right">
              <p className="text-xs">Click to fit to page</p>
              <p className="text-xs text-muted-foreground">Current zoom: {Math.round(zoomLevel * 100)}%</p>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <Separator className="my-1" />
        
        {/* Drawing Tools Section */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('rectangle')}
                className="h-9 w-9 rounded-md"
              >
                <Square className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Rectangle (R)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('circle')}
                className="h-9 w-9 rounded-md"
              >
                <Circle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Circle (C)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'line' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('line')}
                className="h-9 w-9 rounded-md"
              >
                <LineChart className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Line (L)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'text' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('text')}
                className="h-9 w-9 rounded-md"
              >
                <Type className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Text (T)</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Measurement */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'measure' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('measure')}
                className="h-9 w-9 rounded-md"
              >
                <Ruler className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Measure (M)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'calibrate' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('calibrate')}
                className="h-9 w-9 rounded-md"
              >
                <Pipette className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Calibrate</TooltipContent>
          </Tooltip>
        </div>
        
        <Separator className="my-1" />
        
        {/* Equipment Tools with colored buttons */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'access_point' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('access_point')}
                className={`h-9 w-9 rounded-md ${activeTool !== 'access_point' ? 'bg-green-50 hover:bg-green-100' : ''}`}
              >
                <DoorClosed className={`h-5 w-5 ${activeTool !== 'access_point' ? 'text-green-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Access Point (A)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'camera' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('camera')}
                className={`h-9 w-9 rounded-md ${activeTool !== 'camera' ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
              >
                <Camera className={`h-5 w-5 ${activeTool !== 'camera' ? 'text-blue-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Camera (C)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'intercom' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('intercom')}
                className={`h-9 w-9 rounded-md ${activeTool !== 'intercom' ? 'bg-purple-50 hover:bg-purple-100' : ''}`}
              >
                <Magnet className={`h-5 w-5 ${activeTool !== 'intercom' ? 'text-purple-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Intercom</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'elevator' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange('elevator')}
                className={`h-9 w-9 rounded-md ${activeTool !== 'elevator' ? 'bg-orange-50 hover:bg-orange-100' : ''}`}
              >
                <MoveHorizontal className={`h-5 w-5 ${activeTool !== 'elevator' ? 'text-orange-600' : ''}`} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">4</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Elevator</TooltipContent>
          </Tooltip>
        </div>
        
        <Separator className="my-1" />
        
        {/* File operations */}
        <div className="grid grid-cols-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLayersToggle}
                className={`h-9 w-9 rounded-md ${showLayers ? 'bg-primary/10' : ''}`}
              >
                <Layers className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle Layers Panel</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="h-9 w-9 rounded-md"
              >
                <Save className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Save (Ctrl+S)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-9 w-9 rounded-md"
              >
                <FileOutput className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Export (Ctrl+E)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={!canDelete}
                className="h-9 w-9 rounded-md"
              >
                <Trash2 className={`h-5 w-5 ${!canDelete ? 'opacity-50' : 'text-red-500'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Delete (Del)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AnnotationToolbar;