import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B'
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [tempColor, setTempColor] = useState<string>(color);
  const [red, setRed] = useState<number>(parseInt(color.slice(1, 3), 16));
  const [green, setGreen] = useState<number>(parseInt(color.slice(3, 5), 16));
  const [blue, setBlue] = useState<number>(parseInt(color.slice(5, 7), 16));

  const updateColor = (r: number, g: number, b: number) => {
    const hexColor = '#' + 
      r.toString(16).padStart(2, '0') + 
      g.toString(16).padStart(2, '0') + 
      b.toString(16).padStart(2, '0');
    setTempColor(hexColor);
    setRed(r);
    setGreen(g);
    setBlue(b);
  };

  const handleRedChange = (values: number[]) => {
    updateColor(values[0], green, blue);
  };

  const handleGreenChange = (values: number[]) => {
    updateColor(red, values[0], blue);
  };

  const handleBlueChange = (values: number[]) => {
    updateColor(red, green, values[0]);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setTempColor(value);
      setRed(parseInt(value.slice(1, 3), 16));
      setGreen(parseInt(value.slice(3, 5), 16));
      setBlue(parseInt(value.slice(5, 7), 16));
    }
  };

  const applyColor = () => {
    onChange(tempColor);
  };

  const selectPresetColor = (presetColor: string) => {
    setTempColor(presetColor);
    setRed(parseInt(presetColor.slice(1, 3), 16));
    setGreen(parseInt(presetColor.slice(3, 5), 16));
    setBlue(parseInt(presetColor.slice(5, 7), 16));
    onChange(presetColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-8 p-1 flex justify-between items-center border border-input"
        >
          <div 
            className="w-6 h-6 rounded-sm border border-input"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs">{color.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4 p-1">
          <div 
            className="w-full h-24 rounded-md"
            style={{ backgroundColor: tempColor }}
          />
          
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Red</Label>
                <span className="text-xs">{red}</span>
              </div>
              <Slider
                value={[red]}
                min={0}
                max={255}
                step={1}
                onValueChange={handleRedChange}
                onValueCommit={() => applyColor()}
                className="h-3"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Green</Label>
                <span className="text-xs">{green}</span>
              </div>
              <Slider
                value={[green]}
                min={0}
                max={255}
                step={1}
                onValueChange={handleGreenChange}
                onValueCommit={() => applyColor()}
                className="h-3"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Blue</Label>
                <span className="text-xs">{blue}</span>
              </div>
              <Slider
                value={[blue]}
                min={0}
                max={255}
                step={1}
                onValueChange={handleBlueChange}
                onValueCommit={() => applyColor()}
                className="h-3"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Hex Color</Label>
            <Input
              value={tempColor}
              onChange={handleHexChange}
              onBlur={applyColor}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Presets</Label>
            <div className="grid grid-cols-7 gap-1">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-6 h-6 rounded-sm border border-input"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => selectPresetColor(presetColor)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}