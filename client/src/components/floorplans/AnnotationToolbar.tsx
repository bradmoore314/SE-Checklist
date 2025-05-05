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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    <div className="flex flex-col p-1 bg-background border rounded-md shadow-sm">
      {/* Navigation Tools */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('select')}
              className="h-8 w-8"
            >
              <Pointer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select (V)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'pan' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('pan')}
              className="h-8 w-8"
            >
              <Hand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pan (H)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'zoom' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('zoom')}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom (Z)</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator className="my-1" />
      
      {/* Zoom Controls */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomIn}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In (+)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomOut}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4 transform rotate-180" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out (-)</TooltipContent>
        </Tooltip>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomFit}
              className="h-8 text-xs"
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-40">
            <p className="text-xs">Click to fit to page</p>
            <p className="text-xs text-muted-foreground">Current zoom: {Math.round(zoomLevel * 100)}%</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      {/* Rotation Controls */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onRotate('ccw')}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rotate Counter-Clockwise</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onRotate('cw')}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rotate Clockwise</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator className="my-1" />
      
      {/* Drawing Tools */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('rectangle')}
              className="h-8 w-8"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rectangle (R)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('circle')}
              className="h-8 w-8"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Circle (C)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'line' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('line')}
              className="h-8 w-8"
            >
              <LineChart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Line (L)</TooltipContent>
        </Tooltip>
      </div>
      
      {/* More Drawing Tools */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'freehand' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('freehand')}
              className="h-8 w-8"
            >
              <PenTool className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Freehand (F)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'text' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('text')}
              className="h-8 w-8"
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Text (T)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'highlight' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('highlight')}
              className="h-8 w-8"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Highlight (H)</TooltipContent>
        </Tooltip>
      </div>
      
      {/* Measurement Tools */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'measure' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('measure')}
              className="h-8 w-8"
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Measure (M)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'calibrate' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('calibrate')}
              className="h-8 w-8"
            >
              <Pipette className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Calibrate</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator className="my-1" />
      
      {/* Equipment Tools */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'access_point' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('access_point')}
              className="h-8 w-8"
            >
              <DoorClosed className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Access Point (A)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'camera' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('camera')}
              className="h-8 w-8"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Camera (C)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'image' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('image')}
              className="h-8 w-8"
            >
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Image (I)</TooltipContent>
        </Tooltip>
      </div>
      
      <Separator className="my-1" />
      
      {/* Operations */}
      <div className="flex space-x-1 mb-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onSave}
              className="h-8 w-8"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Ctrl+S)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onLayersToggle}
              className={`h-8 w-8 ${showLayers ? 'bg-accent' : ''}`}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Layers Panel</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              className="h-8 w-8"
            >
              <FileOutput className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export (Ctrl+E)</TooltipContent>
        </Tooltip>
      </div>
      
      {/* Edit Operations */}
      <div className="flex space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              disabled={!canCopy}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy (Ctrl+C)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              disabled={!canDelete}
              className="h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete (Del)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default AnnotationToolbar;