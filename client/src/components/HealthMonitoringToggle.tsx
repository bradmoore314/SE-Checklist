import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HealthMonitoringToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  onStreamCountChange?: (count: number) => void;
  streamCount?: number;
  className?: string;
}

/**
 * Toggle component for health monitoring with automatic stream count setting
 * Sets stream count to match total stream count when enabled
 */
export function HealthMonitoringToggle({
  enabled,
  onChange,
  onStreamCountChange,
  streamCount = 0,
  className = ""
}: HealthMonitoringToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  // Update component state when prop changes
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);
  
  // Handle toggle changes
  const handleToggleChange = (checked: boolean) => {
    setIsEnabled(checked);
    onChange(checked);
    
    // If enabled and we have a streamCount and a callback, update the stream count
    if (checked && streamCount > 0 && onStreamCountChange) {
      onStreamCountChange(streamCount);
    }
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        id="health-monitoring-toggle"
        checked={isEnabled}
        onCheckedChange={handleToggleChange}
      />
      <Label htmlFor="health-monitoring-toggle" className="cursor-pointer">
        Health Monitoring
      </Label>
      {isEnabled && streamCount > 0 && (
        <span className="text-sm text-muted-foreground ml-2">
          ({streamCount} streams monitored)
        </span>
      )}
    </div>
  );
}