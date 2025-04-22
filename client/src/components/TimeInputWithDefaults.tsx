import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { setDefaultMinutes } from "@/lib/time-utils";

interface TimeInputWithDefaultsProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  defaultHour?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Time input component that enforces "00" minutes
 * Fixes the issue where time inputs get "20" minutes by default
 */
export function TimeInputWithDefaults({
  value,
  onChange,
  className = "",
  defaultHour = "08",
  placeholder = "Select time",
  disabled = false
}: TimeInputWithDefaultsProps) {
  // On initial render or when value changes, ensure minutes are set to "00"
  useEffect(() => {
    if (!value) {
      // If no value, set default
      onChange(`${defaultHour}:00`);
      return;
    }

    // If value exists but doesn't have ":00" minutes, update it
    if (value && !value.endsWith(":00")) {
      const updatedValue = setDefaultMinutes(value, "00");
      onChange(updatedValue);
    }
  }, []);

  // Handle change but enforce "00" minutes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // If the value is being cleared, set default
    if (!newValue) {
      newValue = `${defaultHour}:00`;
    } 
    // Otherwise force "00" minutes
    else if (newValue && !newValue.endsWith(":00")) {
      newValue = setDefaultMinutes(newValue, "00");
    }
    
    onChange(newValue);
  };

  return (
    <Input
      type="time"
      value={value || `${defaultHour}:00`}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}