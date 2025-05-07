import React from 'react';
import { 
  DoorClosed, 
  Camera, 
  Phone, 
  ArrowUpDown, 
  Move, 
  X,
  Ruler,
  MousePointer
} from 'lucide-react';
import { AnnotationTool } from './AnnotationToolbar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TopToolbarProps {
  currentTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
}

/**
 * Horizontal toolbar component for the top of the page
 * This contains the essential marker tools moved from the bottom toolbar
 */
export const TopToolbar: React.FC<TopToolbarProps> = ({
  currentTool,
  onToolSelect
}) => {
  // Simple horizontal tool buttons without labels to save space
  return (
    <div className="flex items-center space-x-1 ml-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('select')}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Select Tool</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'access_point' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('access_point')}
          >
            <DoorClosed className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Add Access Point</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'camera' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('camera')}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Add Camera</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'intercom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('intercom')}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Add Intercom</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'elevator' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('elevator')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Add Elevator</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'pan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('pan')}
          >
            <Move className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Move/Select</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'delete' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('delete')}
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Delete</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={currentTool === 'measure' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect('measure')}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Measure</TooltipContent>
      </Tooltip>
    </div>
  );
};