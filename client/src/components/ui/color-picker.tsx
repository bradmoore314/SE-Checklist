import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange, ...props }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded border" 
        style={{ backgroundColor: value }}
      />
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 p-1 h-8"
        {...props}
      />
    </div>
  );
}