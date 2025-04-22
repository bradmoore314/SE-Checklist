import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CAMERA_TYPES } from "@/constants/cameraTypes";

interface StreamTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StreamTypeSelector({ value, onChange }: StreamTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Camera Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        {CAMERA_TYPES.map((type) => (
          <div key={type.id} className="flex items-center space-x-2">
            <RadioGroupItem value={type.id} id={`camera-type-${type.id}`} />
            <Label htmlFor={`camera-type-${type.id}`} className="text-sm">
              {type.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}