import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface HealthMonitoringToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  onStreamCountChange?: (count: number) => void;
  streamType?: string;
  className?: string;
}

/**
 * A toggle component for health monitoring with auto stream count setting
 * for Event monitoring streams
 */
export function HealthMonitoringToggle({
  value,
  onChange,
  onStreamCountChange,
  streamType = "",
  className = ""
}: HealthMonitoringToggleProps) {
  // When enabled and stream type is for event monitoring, auto-set stream count
  useEffect(() => {
    if (onStreamCountChange && value && streamType.toLowerCase().includes("event")) {
      // Set default stream count for event monitoring
      onStreamCountChange(3); // Default to 3 streams for event monitoring
    }
  }, [value, streamType, onStreamCountChange]);
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        id="health-monitoring"
        checked={value}
        onCheckedChange={onChange}
      />
      <Label htmlFor="health-monitoring" className="text-base cursor-pointer">
        Health Monitoring
      </Label>
    </div>
  );
}