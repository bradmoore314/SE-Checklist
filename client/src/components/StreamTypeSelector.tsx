import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CAMERA_TYPES } from "@/constants/cameraTypes";

interface StreamTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Dropdown selector for stream types with standard values
 * Uses updated camera types that include "Stream" wording
 */
export function StreamTypeSelector({
  value,
  onChange,
  label = "Stream Type",
  className = ""
}: StreamTypeSelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select stream type" />
        </SelectTrigger>
        <SelectContent>
          {CAMERA_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}