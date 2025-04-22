import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimeInputWithDefaults } from "./TimeInputWithDefaults";

interface ScheduleConfig {
  weekdays: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  weekends: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface MonitoredScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: ScheduleConfig) => void;
  initialSchedule?: ScheduleConfig;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  weekdays: {
    enabled: true,
    startTime: "17:00",
    endTime: "08:00"
  },
  weekends: {
    enabled: true,
    startTime: "00:00",
    endTime: "23:59"
  }
};

/**
 * Modal for configuring weekday and weekend monitoring schedules
 * Allows for different time ranges on different days
 */
export function MonitoredScheduleModal({
  isOpen,
  onClose,
  onSave,
  initialSchedule = DEFAULT_SCHEDULE
}: MonitoredScheduleModalProps) {
  const [schedule, setSchedule] = useState<ScheduleConfig>(initialSchedule);
  const [activeTab, setActiveTab] = useState<string>("weekdays");
  
  // Handle schedule updates
  const updateWeekdayEnabled = (enabled: boolean) => {
    setSchedule({
      ...schedule,
      weekdays: {
        ...schedule.weekdays,
        enabled
      }
    });
  };
  
  const updateWeekendEnabled = (enabled: boolean) => {
    setSchedule({
      ...schedule,
      weekends: {
        ...schedule.weekends,
        enabled
      }
    });
  };
  
  const updateWeekdayStartTime = (startTime: string) => {
    setSchedule({
      ...schedule,
      weekdays: {
        ...schedule.weekdays,
        startTime
      }
    });
  };
  
  const updateWeekdayEndTime = (endTime: string) => {
    setSchedule({
      ...schedule,
      weekdays: {
        ...schedule.weekdays,
        endTime
      }
    });
  };
  
  const updateWeekendStartTime = (startTime: string) => {
    setSchedule({
      ...schedule,
      weekends: {
        ...schedule.weekends,
        startTime
      }
    });
  };
  
  const updateWeekendEndTime = (endTime: string) => {
    setSchedule({
      ...schedule,
      weekends: {
        ...schedule.weekends,
        endTime
      }
    });
  };
  
  // Handle save
  const handleSave = () => {
    onSave(schedule);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Monitoring Schedule</DialogTitle>
          <DialogDescription>
            Set up different monitoring schedules for weekdays and weekends
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekdays">Weekdays (Mon-Fri)</TabsTrigger>
            <TabsTrigger value="weekends">Weekends (Sat-Sun)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekdays" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekday-enabled" className="font-medium">
                Enable weekday monitoring
              </Label>
              <Switch
                id="weekday-enabled"
                checked={schedule.weekdays.enabled}
                onCheckedChange={updateWeekdayEnabled}
              />
            </div>
            
            {schedule.weekdays.enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <TimeInputWithDefaults
                  label="Start Time"
                  value={schedule.weekdays.startTime}
                  onChange={updateWeekdayStartTime}
                  className="w-full"
                />
                
                <TimeInputWithDefaults
                  label="End Time"
                  value={schedule.weekdays.endTime}
                  onChange={updateWeekdayEndTime}
                  className="w-full"
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weekends" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekend-enabled" className="font-medium">
                Enable weekend monitoring
              </Label>
              <Switch
                id="weekend-enabled"
                checked={schedule.weekends.enabled}
                onCheckedChange={updateWeekendEnabled}
              />
            </div>
            
            {schedule.weekends.enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <TimeInputWithDefaults
                  label="Start Time" 
                  value={schedule.weekends.startTime}
                  onChange={updateWeekendStartTime}
                  className="w-full"
                />
                
                <TimeInputWithDefaults
                  label="End Time"
                  value={schedule.weekends.endTime}
                  onChange={updateWeekendEndTime}
                  className="w-full"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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