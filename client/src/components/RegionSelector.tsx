import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { REGIONS } from "@/constants/regions";

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Dropdown selector for regions with standard values
 */
export function RegionSelector({
  value,
  onChange,
  label = "Region",
  className = ""
}: RegionSelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}