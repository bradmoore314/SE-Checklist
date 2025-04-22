import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinusIcon, PlusIcon } from "lucide-react";

interface StreamCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

/**
 * A numeric selector component for stream counts
 * Features a clean numeric field with increment/decrement buttons
 */
export function StreamCountSelector({
  value,
  onChange,
  min = 0,
  max = 100,
  label = "Stream Count",
  className = ""
}: StreamCountSelectorProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  
  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only update the actual value if it's a valid number
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };
  
  // Handle blur to ensure input value matches actual value
  const handleBlur = () => {
    let numValue = parseInt(inputValue, 10);
    
    // If input is not a valid number, reset to current value
    if (isNaN(numValue)) {
      setInputValue(value.toString());
      return;
    }
    
    // Clamp value between min and max
    numValue = Math.max(min, Math.min(max, numValue));
    setInputValue(numValue.toString());
    onChange(numValue);
  };
  
  // Handle increment and decrement
  const handleIncrement = () => {
    if (value < max) {
      const newValue = value + 1;
      setInputValue(newValue.toString());
      onChange(newValue);
    }
  };
  
  const handleDecrement = () => {
    if (value > min) {
      const newValue = value - 1;
      setInputValue(newValue.toString());
      onChange(newValue);
    }
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-base">{label}</Label>}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-9 w-9"
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          className="w-20 text-center"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-9 w-9"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}