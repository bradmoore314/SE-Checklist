import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkerData } from './types/MarkerTypes';

interface MobileMarkerControlsProps {
  marker: MarkerData;
  onDelete: (markerId: number) => void;
  onMove: (markerId: number, deltaX: number, deltaY: number) => void;
  onDone: () => void;
}

export function MobileMarkerControls({
  marker,
  onDelete,
  onMove,
  onDone
}: MobileMarkerControlsProps) {
  const { toast } = useToast();
  const moveStep = 5; // How many units to move the marker for each arrow press
  
  // Handle delete confirmation
  const handleDelete = () => {
    onDelete(marker.id);
    toast({
      title: "Marker deleted",
      description: "The marker has been removed from the floorplan",
      duration: 2000
    });
    onDone();
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 flex flex-col items-center space-y-4">
      <div className="text-sm font-medium text-center">
        {marker.label || `${marker.marker_type} marker`}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* First row - Up arrow */}
        <div></div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onMove(marker.id, 0, -moveStep)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div></div>
        
        {/* Second row - Left, Delete, Right */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onMove(marker.id, -moveStep, 0)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="destructive" 
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onMove(marker.id, moveStep, 0)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        {/* Third row - Down arrow and Done */}
        <div></div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onMove(marker.id, 0, moveStep)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div></div>
      </div>
      
      <Button 
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={onDone}
      >
        <Check className="h-4 w-4 mr-2" />
        Done
      </Button>
      
      <div className="text-xs text-gray-500 mt-1">
        Use arrows to precisely position the marker
      </div>
    </div>
  );
}