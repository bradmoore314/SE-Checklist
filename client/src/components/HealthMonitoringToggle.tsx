import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HealthMonitoringToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  streamCount: number;
  onStreamCountChange: (value: number) => void;
  className?: string;
}

/**
 * Toggle component for health monitoring with auto-stream count setting
 * When enabled, automatically sets the stream count to the appropriate value
 */
export function HealthMonitoringToggle({
  value,
  onChange,
  streamCount,
  onStreamCountChange,
  className = ""
}: HealthMonitoringToggleProps) {
  const [previousStreamCount, setPreviousStreamCount] = useState<number>(streamCount);
  
  // Set the default stream count when health monitoring is toggled on
  useEffect(() => {
    if (value && streamCount === 0) {
      // When turned on and no streams, set to default of 2
      onStreamCountChange(2);
    }
  }, [value]);
  
  const handleToggleChange = (toggled: boolean) => {
    if (toggled) {
      // Store previous count before enabling
      setPreviousStreamCount(streamCount);
      
      // When turning on, set a minimum of 2 streams if current count is less
      if (streamCount < 2) {
        onStreamCountChange(2);
      }
    } else {
      // When turning off, we keep the current count
      // Optionally could restore previous count: onStreamCountChange(previousStreamCount);
    }
    
    onChange(toggled);
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        id="health-monitoring"
        checked={value}
        onCheckedChange={handleToggleChange}
      />
      <Label 
        htmlFor="health-monitoring"
        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Health Monitoring {value ? "(Enabled)" : "(Disabled)"}
      </Label>
    </div>
  );
}