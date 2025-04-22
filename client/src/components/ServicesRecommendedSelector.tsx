import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SERVICE_TYPES } from "@/constants/serviceTypes";

interface ServicesRecommendedSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ServicesRecommendedSelector({ value = [], onChange }: ServicesRecommendedSelectorProps) {
  const handleChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...value, id]);
    } else {
      onChange(value.filter(v => v !== id));
    }
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-3">Recommended Services</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SERVICE_TYPES.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`service-${option.id}`}
              checked={value.includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, !!checked)}
            />
            <Label htmlFor={`service-${option.id}`} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}