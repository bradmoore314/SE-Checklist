import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TECHNOLOGY_TYPES } from "@/constants/technology";

interface TechnologyTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TechnologyTypeSelector({ value, onChange }: TechnologyTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="technology-selector" className="text-base">Technology Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="technology-selector" className="w-full">
          <SelectValue placeholder="Select technology type" />
        </SelectTrigger>
        <SelectContent>
          {TECHNOLOGY_TYPES.map(tech => (
            <SelectItem key={tech.id} value={tech.id}>
              {tech.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}