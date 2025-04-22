import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";

interface StreamCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  className?: string;
  size?: "default" | "sm";
}

/**
 * A numeric input component for selecting stream counts
 * Provides a cleaner interface than the default number input with arrows
 */
export function StreamCountSelector({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  className = "",
  size = "default"
}: StreamCountSelectorProps) {
  // List of predefined values for quick selection
  const quickValues = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50];
  const [displayMode, setDisplayMode] = useState<"input" | "select">("input");
  
  // Filter quick values to be within min and max range
  const filteredQuickValues = quickValues.filter(v => v >= min && v <= max);
  
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      // Ensure value is within min and max range
      const boundedValue = Math.min(Math.max(newValue, min), max);
      onChange(boundedValue);
    }
  };
  
  const inputHeight = size === "sm" ? "h-8" : "h-10";
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const labelSize = size === "sm" ? "text-xs" : "text-sm";
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <Label className={labelSize}>{label}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMode(displayMode === "input" ? "select" : "input")}
            className="h-6 px-2 text-xs"
          >
            {displayMode === "input" ? "Use Dropdown" : "Use Input"}
          </Button>
        </div>
      )}
      
      {displayMode === "input" ? (
        <div className="flex items-center">
          <Button
            variant="outline"
            size={size}
            onClick={handleDecrement}
            disabled={value <= min}
            className={`${buttonSize} p-0`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            className={`mx-2 text-center ${inputHeight}`}
            min={min}
            max={max}
          />
          
          <Button
            variant="outline"
            size={size}
            onClick={handleIncrement}
            disabled={value >= max}
            className={`${buttonSize} p-0`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Select
          value={value.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
        >
          <SelectTrigger className={inputHeight}>
            <SelectValue placeholder="Select count" />
          </SelectTrigger>
          <SelectContent>
            {filteredQuickValues.map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}