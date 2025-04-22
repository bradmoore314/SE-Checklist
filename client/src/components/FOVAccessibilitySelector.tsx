import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FOV_ACCESSIBILITY_OPTIONS } from "@/constants/fovAccessibility";

interface FOVAccessibilitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FOVAccessibilitySelector({ value, onChange }: FOVAccessibilitySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fov-accessibility" className="text-base">FOV Accessibility</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="fov-accessibility" className="w-full">
          <SelectValue placeholder="Select FOV accessibility" />
        </SelectTrigger>
        <SelectContent>
          {FOV_ACCESSIBILITY_OPTIONS.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}