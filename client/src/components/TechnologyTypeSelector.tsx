import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TECHNOLOGY_TYPES } from "@/constants/technology";

interface TechnologyTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Dropdown selector for technology types with standard values
 * Uses updated technology types like KV Gateway + KVG, Avigilon, etc.
 */
export function TechnologyTypeSelector({
  value,
  onChange,
  label = "Technology",
  className = ""
}: TechnologyTypeSelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select technology type" />
        </SelectTrigger>
        <SelectContent>
          {TECHNOLOGY_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}