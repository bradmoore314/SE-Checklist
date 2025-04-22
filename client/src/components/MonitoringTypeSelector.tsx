import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MonitoredScheduleModal } from "./MonitoredScheduleModal";

interface Schedule {
  startTime: string;
  endTime: string;
}

interface MonitoringTypeSelectorProps {
  monitoringType: "patrol" | "event";
  onMonitoringTypeChange: (type: "patrol" | "event") => void;
  patrolSchedule: Schedule;
  onPatrolScheduleChange: (schedule: Schedule) => void;
  eventSchedule: {
    weekday: Schedule;
    weekend: Schedule;
  };
  onEventScheduleChange: (weekday: Schedule, weekend: Schedule) => void;
  className?: string;
}

/**
 * Component for selecting between Patrol and Event monitoring types
 * with appropriate schedule settings for each
 */
export function MonitoringTypeSelector({
  monitoringType,
  onMonitoringTypeChange,
  patrolSchedule,
  onPatrolScheduleChange,
  eventSchedule,
  onEventScheduleChange,
  className = ""
}: MonitoringTypeSelectorProps) {
  const [isPatrolExpanded, setIsPatrolExpanded] = useState(true);
  const [isEventExpanded, setIsEventExpanded] = useState(monitoringType === "event");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const handleMonitoringTypeChange = (value: string) => {
    const type = value as "patrol" | "event";
    onMonitoringTypeChange(type);
    
    // Expand the selected section
    if (type === "patrol") {
      setIsPatrolExpanded(true);
    } else if (type === "event") {
      setIsEventExpanded(true);
    }
  };
  
  const formatTimeRange = (start: string, end: string): string => {
    return `${start} - ${end}`;
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <RadioGroup
        value={monitoringType}
        onValueChange={handleMonitoringTypeChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="patrol" id="monitoring-patrol" />
          <Label htmlFor="monitoring-patrol" className="text-base font-medium">Patrol Monitoring</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="event" id="monitoring-event" />
          <Label htmlFor="monitoring-event" className="text-base font-medium">Event Monitoring</Label>
        </div>
      </RadioGroup>
      
      {/* Patrol Settings */}
      <Collapsible
        open={isPatrolExpanded}
        onOpenChange={setIsPatrolExpanded}
        className={`border rounded-md p-3 ${monitoringType === "patrol" ? "border-primary" : "border-muted"}`}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <h3 className="text-sm font-medium">Patrol Settings</h3>
            {isPatrolExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Patrol Schedule</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  // Open time picker or directly update
                  const newStart = prompt("Enter start time (HH:MM)", patrolSchedule.startTime) || patrolSchedule.startTime;
                  const newEnd = prompt("Enter end time (HH:MM)", patrolSchedule.endTime) || patrolSchedule.endTime;
                  onPatrolScheduleChange({ startTime: newStart, endTime: newEnd });
                }}
              >
                Change
              </Button>
            </div>
            <div className="text-sm font-medium">
              {formatTimeRange(patrolSchedule.startTime, patrolSchedule.endTime)}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Event Monitoring Settings */}
      <Collapsible
        open={isEventExpanded}
        onOpenChange={setIsEventExpanded}
        className={`border rounded-md p-3 ${monitoringType === "event" ? "border-primary" : "border-muted"}`}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <h3 className="text-sm font-medium">Event Monitoring Settings</h3>
            {isEventExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Weekday Schedule (Mon-Fri)</Label>
            </div>
            <div className="text-sm font-medium">
              {formatTimeRange(eventSchedule.weekday.startTime, eventSchedule.weekday.endTime)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Weekend Schedule (Sat-Sun)</Label>
            </div>
            <div className="text-sm font-medium">
              {formatTimeRange(eventSchedule.weekend.startTime, eventSchedule.weekend.endTime)}
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            className="w-full"
          >
            Configure Schedules
          </Button>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Schedule Modal */}
      <MonitoredScheduleModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        weekdaySchedule={eventSchedule.weekday}
        weekendSchedule={eventSchedule.weekend}
        onSave={onEventScheduleChange}
      />
    </div>
  );
}