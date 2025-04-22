import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FOV_ACCESSIBILITY_OPTIONS } from "@/constants/fovAccessibility";

interface FOVAccessibilitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Dropdown selector for FOV Accessibility options with standardized values
 * Uses environment-based options instead of simple Yes/No
 */
export function FOVAccessibilitySelector({
  value,
  onChange,
  label = "FOV Accessibility",
  className = ""
}: FOVAccessibilitySelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select accessibility" />
        </SelectTrigger>
        <SelectContent>
          {FOV_ACCESSIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}