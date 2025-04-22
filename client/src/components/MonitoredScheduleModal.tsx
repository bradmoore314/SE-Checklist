import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TimeInputWithDefaults } from "./TimeInputWithDefaults";
import { setDefaultMinutes } from "@/lib/time-utils";
import { Clock } from "lucide-react";

interface Schedule {
  startTime: string;
  endTime: string;
}

interface MonitoredScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekdaySchedule: Schedule;
  weekendSchedule: Schedule;
  onSave: (weekday: Schedule, weekend: Schedule) => void;
}

/**
 * Modal for setting advanced weekday/weekend monitoring schedules
 * Ensures minutes are set to "00" for all time inputs
 */
export function MonitoredScheduleModal({
  open,
  onOpenChange,
  weekdaySchedule,
  weekendSchedule,
  onSave
}: MonitoredScheduleModalProps) {
  const [weekdayStart, setWeekdayStart] = useState(weekdaySchedule.startTime || "08:00");
  const [weekdayEnd, setWeekdayEnd] = useState(weekdaySchedule.endTime || "18:00");
  const [weekendStart, setWeekendStart] = useState(weekendSchedule.startTime || "08:00");
  const [weekendEnd, setWeekendEnd] = useState(weekendSchedule.endTime || "18:00");
  
  // Sync internal state with props
  useEffect(() => {
    if (open) {
      setWeekdayStart(weekdaySchedule.startTime || "08:00");
      setWeekdayEnd(weekdaySchedule.endTime || "18:00");
      setWeekendStart(weekendSchedule.startTime || "08:00");
      setWeekendEnd(weekendSchedule.endTime || "18:00");
    }
  }, [open, weekdaySchedule, weekendSchedule]);
  
  // Ensure all times use "00" minutes
  useEffect(() => {
    if (weekdayStart && !weekdayStart.endsWith(":00")) {
      setWeekdayStart(setDefaultMinutes(weekdayStart, "00"));
    }
    if (weekdayEnd && !weekdayEnd.endsWith(":00")) {
      setWeekdayEnd(setDefaultMinutes(weekdayEnd, "00"));
    }
    if (weekendStart && !weekendStart.endsWith(":00")) {
      setWeekendStart(setDefaultMinutes(weekendStart, "00"));
    }
    if (weekendEnd && !weekendEnd.endsWith(":00")) {
      setWeekendEnd(setDefaultMinutes(weekendEnd, "00"));
    }
  }, []);
  
  const handleSave = () => {
    onSave(
      { startTime: weekdayStart, endTime: weekdayEnd },
      { startTime: weekendStart, endTime: weekendEnd }
    );
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Monitoring Schedule Configuration
          </DialogTitle>
          <DialogDescription>
            Set different monitoring schedules for weekdays and weekends.
            All times will use "00" minutes for standardization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Weekday Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Weekday Schedule (Monday - Friday)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekday-start" className="text-xs">Start Time</Label>
                <TimeInputWithDefaults
                  value={weekdayStart}
                  onChange={setWeekdayStart}
                  defaultHour="08"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekday-end" className="text-xs">End Time</Label>
                <TimeInputWithDefaults
                  value={weekdayEnd}
                  onChange={setWeekdayEnd}
                  defaultHour="18"
                  className="h-9"
                />
              </div>
            </div>
          </div>
          
          {/* Weekend Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Weekend Schedule (Saturday - Sunday)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekend-start" className="text-xs">Start Time</Label>
                <TimeInputWithDefaults
                  value={weekendStart}
                  onChange={setWeekendStart}
                  defaultHour="08"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekend-end" className="text-xs">End Time</Label>
                <TimeInputWithDefaults
                  value={weekendEnd}
                  onChange={setWeekendEnd}
                  defaultHour="18"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
        
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