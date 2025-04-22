import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { timeStringToMinutes, minutesToTimeString } from "@/lib/time-utils";

interface Schedule {
  startTime: string;
  endTime: string;
}

interface MonitoredScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekdaySchedule: Schedule;
  weekendSchedule: Schedule;
  onSave: (weekdaySchedule: Schedule, weekendSchedule: Schedule) => void;
}

/**
 * Modal component for configuring separate weekday and weekend monitoring schedules
 */
export function MonitoredScheduleModal({
  open,
  onOpenChange,
  weekdaySchedule,
  weekendSchedule,
  onSave
}: MonitoredScheduleProps) {
  const [localWeekdaySchedule, setLocalWeekdaySchedule] = useState<Schedule>(weekdaySchedule);
  const [localWeekendSchedule, setLocalWeekendSchedule] = useState<Schedule>(weekendSchedule);
  const [activeTab, setActiveTab] = useState<"weekday" | "weekend">("weekday");
  
  // Reset form when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalWeekdaySchedule(weekdaySchedule);
      setLocalWeekendSchedule(weekendSchedule);
      setActiveTab("weekday");
    }
    onOpenChange(newOpen);
  };
  
  // Handle time input changes
  const handleWeekdayChange = (field: keyof Schedule, value: string) => {
    setLocalWeekdaySchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleWeekendChange = (field: keyof Schedule, value: string) => {
    setLocalWeekendSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Validate time ranges and save
  const handleSave = () => {
    // Convert times to minutes for validation
    const weekdayStart = timeStringToMinutes(localWeekdaySchedule.startTime);
    const weekdayEnd = timeStringToMinutes(localWeekdaySchedule.endTime);
    const weekendStart = timeStringToMinutes(localWeekendSchedule.startTime);
    const weekendEnd = timeStringToMinutes(localWeekendSchedule.endTime);
    
    // Validate weekday range
    let validWeekday = localWeekdaySchedule;
    if (weekdayStart >= weekdayEnd) {
      validWeekday = {
        startTime: "08:00",
        endTime: "18:00"
      };
    }
    
    // Validate weekend range
    let validWeekend = localWeekendSchedule;
    if (weekendStart >= weekendEnd) {
      validWeekend = {
        startTime: "08:00",
        endTime: "18:00"
      };
    }
    
    onSave(validWeekday, validWeekend);
    onOpenChange(false);
  };
  
  // Time picker component to keep UI consistent
  const TimePicker = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void 
  }) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Monitored Schedule</DialogTitle>
          <DialogDescription>
            Configure separate monitoring schedules for weekdays and weekends.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "weekday" | "weekend")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekday">Weekdays (Mon-Fri)</TabsTrigger>
            <TabsTrigger value="weekend">Weekends (Sat-Sun)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekday" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                label="Start Time"
                value={localWeekdaySchedule.startTime}
                onChange={(value) => handleWeekdayChange("startTime", value)}
              />
              <TimePicker
                label="End Time"
                value={localWeekdaySchedule.endTime}
                onChange={(value) => handleWeekdayChange("endTime", value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="weekend" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                label="Start Time"
                value={localWeekendSchedule.startTime}
                onChange={(value) => handleWeekendChange("startTime", value)}
              />
              <TimePicker
                label="End Time"
                value={localWeekendSchedule.endTime}
                onChange={(value) => handleWeekendChange("endTime", value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}