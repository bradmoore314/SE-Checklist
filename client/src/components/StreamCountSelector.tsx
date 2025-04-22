import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StreamCountSelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxCount?: number; // Maximum number of streams to show
  className?: string;
}

/**
 * Dropdown selector for numeric stream count values
 * Replaces problematic up/down arrow inputs with a cleaner dropdown interface
 */
export function StreamCountSelector({
  label,
  value,
  onChange,
  maxCount = 30, // Default to 30 as the maximum
  className = ""
}: StreamCountSelectorProps) {
  const [options, setOptions] = useState<number[]>([]);
  
  // Generate options from 0 to maxCount
  useEffect(() => {
    const numOptions: number[] = [];
    for (let i = 0; i <= maxCount; i++) {
      numOptions.push(i);
    }
    setOptions(numOptions);
  }, [maxCount]);

  return (
    <div className={className}>
      <Label className="mb-2">{label}</Label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onChange(parseInt(val, 10))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select count" />
        </SelectTrigger>
        <SelectContent>
          {options.map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}