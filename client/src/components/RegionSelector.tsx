import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/constants/regions";

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="region-selector" className="text-base">Region</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="region-selector" className="w-full">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map(region => (
            <SelectItem key={region.id} value={region.id}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}