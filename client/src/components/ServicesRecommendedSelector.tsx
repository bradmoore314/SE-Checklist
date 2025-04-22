import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SERVICE_TYPES } from "@/constants/serviceTypes";

interface ServicesRecommendedSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Dropdown selector for recommended service types
 * Uses updated service types with Events/Health, Patrols, etc.
 */
export function ServicesRecommendedSelector({
  value,
  onChange,
  label = "Services Recommended",
  className = ""
}: ServicesRecommendedSelectorProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select services" />
        </SelectTrigger>
        <SelectContent>
          {SERVICE_TYPES.map((service) => (
            <SelectItem key={service.value} value={service.value}>
              {service.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}