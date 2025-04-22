import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeInputWithDefaultsProps {
  label: string;
  value: string; // in HH:MM format
  onChange: (value: string) => void; 
  className?: string;
  defaultMinutes?: string; // defaults to "00"
}

/**
 * Time input component that defaults minutes to "00" when hours are set
 * Addresses issue where time inputs weren't saving properly and minutes weren't defaulting correctly
 */
export function TimeInputWithDefaults({
  label,
  value,
  onChange,
  className = "",
  defaultMinutes = "00"
}: TimeInputWithDefaultsProps) {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  
  // Initialize from value
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      if (parts.length === 2) {
        setHours(parts[0]);
        setMinutes(parts[1]);
      }
    }
  }, []);
  
  // When hours change, set default minutes if none are set
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = e.target.value;
    setHours(newHours);
    
    // If hours are set and minutes are empty, default to "00"
    if (newHours && !minutes) {
      setMinutes(defaultMinutes);
      onChange(`${newHours}:${defaultMinutes}`);
    } else {
      onChange(`${newHours}:${minutes || defaultMinutes}`);
    }
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value;
    setMinutes(newMinutes);
    onChange(`${hours || "00"}:${newMinutes}`);
  };
  
  return (
    <div className={className}>
      <Label className="mb-2">{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="HH"
          maxLength={2}
          value={hours}
          onChange={handleHoursChange}
          className="w-16 text-center"
        />
        <span className="text-xl">:</span>
        <Input
          type="text"
          placeholder="MM"
          maxLength={2}
          value={minutes}
          onChange={handleMinutesChange}
          className="w-16 text-center"
        />
      </div>
    </div>
  );
}