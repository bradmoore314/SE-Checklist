import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, Ruler } from 'lucide-react';

interface CalibrationData {
  id?: number;
  floorplan_id: number;
  page: number;
  real_world_distance: number;
  pdf_distance: number;
  unit: string;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
}

interface CalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floorplanId: number;
  currentPage: number;
  calibrationLine: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    pdfDistance: number;
  } | null;
  onCalibrationComplete: () => void;
}

export const CalibrationDialog: React.FC<CalibrationDialogProps> = ({
  open,
  onOpenChange,
  floorplanId,
  currentPage,
  calibrationLine,
  onCalibrationComplete
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realWorldDistance, setRealWorldDistance] = useState<number>(0);
  const [unit, setUnit] = useState<string>('ft');
  
  // Reset form on open
  useEffect(() => {
    if (open && calibrationLine) {
      setRealWorldDistance(0);
      setUnit('ft');
    }
  }, [open, calibrationLine]);
  
  const createCalibrationMutation = useMutation({
    mutationFn: async (data: CalibrationData) => {
      const res = await apiRequest(
        'POST',
        `/api/floorplans/${floorplanId}/calibrations/${currentPage}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/floorplans/${floorplanId}/calibrations/${currentPage}`]
      });
      toast({
        title: 'Success',
        description: 'Calibration saved successfully',
      });
      onOpenChange(false);
      onCalibrationComplete();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save calibration: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleSaveCalibration = () => {
    if (!calibrationLine) {
      toast({
        title: 'Error',
        description: 'No calibration line drawn',
        variant: 'destructive',
      });
      return;
    }
    
    if (realWorldDistance <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid real-world distance',
        variant: 'destructive',
      });
      return;
    }
    
    createCalibrationMutation.mutate({
      floorplan_id: floorplanId,
      page: currentPage,
      real_world_distance: realWorldDistance,
      pdf_distance: calibrationLine.pdfDistance,
      unit,
      start_x: calibrationLine.startX,
      start_y: calibrationLine.startY,
      end_x: calibrationLine.endX,
      end_y: calibrationLine.endY,
    });
  };
  
  // Calculate line length in pixels
  const lineLength = calibrationLine
    ? Math.sqrt(
        Math.pow(calibrationLine.endX - calibrationLine.startX, 2) +
        Math.pow(calibrationLine.endY - calibrationLine.startY, 2)
      ).toFixed(2)
    : 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Calibrate Floorplan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Calibration Line</p>
              <p className="text-sm text-muted-foreground">
                Line length: {lineLength} pixels
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="real-world-distance" className="text-right">
              Real-world distance
            </Label>
            <Input
              id="real-world-distance"
              type="number"
              min="0.01"
              step="0.01"
              value={realWorldDistance}
              onChange={(e) => setRealWorldDistance(parseFloat(e.target.value))}
              className="col-span-2"
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inches</SelectItem>
                <SelectItem value="ft">Feet</SelectItem>
                <SelectItem value="m">Meters</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Scale Calculation</p>
              <p className="text-sm text-muted-foreground">
                {realWorldDistance > 0
                  ? `1 ${unit} = ${(parseFloat(lineLength) / realWorldDistance).toFixed(2)} pixels`
                  : 'Enter a real-world distance to calculate scale'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveCalibration}>Save Calibration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalibrationDialog;