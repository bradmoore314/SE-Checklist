import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ChromePicker } from 'react-color';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarkerData {
  id: number;
  floorplan_id: number;
  unique_id: string;
  page: number;
  marker_type: string;
  equipment_id?: number;
  layer_id?: number;
  position_x: number;
  position_y: number;
  end_x?: number;
  end_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  fill_color?: string;
  opacity?: number;
  line_width?: number;
  label?: string;
  text_content?: string;
  font_size?: number;
  font_family?: string;
  points?: Array<{x: number, y: number}>;
  author_id?: number;
  author_name?: string;
  version: number;
  parent_id?: number;
}

interface LayerData {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order: number;
}

interface MarkerPropertiesPanelProps {
  marker: MarkerData | null;
  layers: LayerData[];
  onUpdateMarker: (updatedMarker: MarkerData) => void;
  floorplanId: number;
}

export const MarkerPropertiesPanel: React.FC<MarkerPropertiesPanelProps> = ({
  marker,
  layers,
  onUpdateMarker,
  floorplanId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localMarker, setLocalMarker] = useState<MarkerData | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  
  useEffect(() => {
    setLocalMarker(marker);
  }, [marker]);
  
  const updateMarkerMutation = useMutation({
    mutationFn: async (data: MarkerData) => {
      const res = await apiRequest(
        'PUT',
        `/api/enhanced-floorplan/markers/${data.id}`,
        data
      );
      return await res.json();
    },
    onSuccess: (updatedMarker) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/enhanced-floorplan/${floorplanId}/markers`]
      });
      toast({
        title: 'Success',
        description: 'Marker updated successfully',
      });
      onUpdateMarker(updatedMarker);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update marker: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  if (!localMarker) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-3 w-64">
        <p className="text-sm text-center text-muted-foreground py-4">
          Select a marker to view properties
        </p>
      </div>
    );
  }
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalMarker((prev) => {
      if (!prev) return null;
      
      // Handle numeric values
      if (
        [
          'position_x',
          'position_y',
          'end_x',
          'end_y',
          'width',
          'height',
          'rotation',
          'opacity',
          'line_width',
          'font_size',
        ].includes(name)
      ) {
        return {
          ...prev,
          [name]: parseFloat(value),
        };
      }
      
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setLocalMarker((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: checked,
      };
    });
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    setLocalMarker((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value[0],
      };
    });
  };
  
  const handleColorChange = (color: { hex: string }, isStroke = true) => {
    setLocalMarker((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [isStroke ? 'color' : 'fill_color']: color.hex,
      };
    });
  };
  
  const handleLayerChange = (layerId: string) => {
    setLocalMarker((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        layer_id: parseInt(layerId),
      };
    });
  };
  
  const handleApplyChanges = () => {
    if (!localMarker) return;
    updateMarkerMutation.mutate(localMarker);
  };
  
  const markerTypeDisplay = {
    'access_point': 'Access Point',
    'camera': 'Camera',
    'rectangle': 'Rectangle',
    'circle': 'Circle',
    'line': 'Line',
    'text': 'Text',
    'freehand': 'Freehand',
    'polygon': 'Polygon',
    'highlight': 'Highlight',
    'image': 'Image',
    'measure': 'Measurement'
  };
  
  return (
    <div className="bg-background border rounded-md shadow-sm p-3 w-64">
      <h3 className="text-sm font-medium mb-3">Marker Properties</h3>
      
      <div className="space-y-4">
        {/* Marker Type */}
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <div className="text-sm font-medium">
            {markerTypeDisplay[localMarker.marker_type as keyof typeof markerTypeDisplay] || localMarker.marker_type}
          </div>
        </div>
        
        {/* Layer Selection */}
        <div className="space-y-1">
          <Label htmlFor="layer_id" className="text-xs">Layer</Label>
          <Select
            value={localMarker.layer_id?.toString() || ''}
            onValueChange={handleLayerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select layer" />
            </SelectTrigger>
            <SelectContent>
              {layers.map((layer) => (
                <SelectItem key={layer.id} value={layer.id.toString()}>
                  {layer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="position_x" className="text-xs">Position X</Label>
            <Input
              id="position_x"
              name="position_x"
              type="number"
              value={localMarker.position_x}
              onChange={handleInputChange}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="position_y" className="text-xs">Position Y</Label>
            <Input
              id="position_y"
              name="position_y"
              type="number"
              value={localMarker.position_y}
              onChange={handleInputChange}
              className="h-8 text-xs"
            />
          </div>
        </div>
        
        {/* End Position (for line, rectangle) */}
        {(localMarker.end_x !== undefined && localMarker.end_y !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="end_x" className="text-xs">End X</Label>
              <Input
                id="end_x"
                name="end_x"
                type="number"
                value={localMarker.end_x}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end_y" className="text-xs">End Y</Label>
              <Input
                id="end_y"
                name="end_y"
                type="number"
                value={localMarker.end_y}
                onChange={handleInputChange}
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}
        
        {/* Width and Height (for rectangle, circle) */}
        {(localMarker.width !== undefined || localMarker.height !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            {localMarker.width !== undefined && (
              <div className="space-y-1">
                <Label htmlFor="width" className="text-xs">Width</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  value={localMarker.width}
                  onChange={handleInputChange}
                  className="h-8 text-xs"
                />
              </div>
            )}
            {localMarker.height !== undefined && (
              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs">Height</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={localMarker.height}
                  onChange={handleInputChange}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Rotation */}
        {localMarker.rotation !== undefined && (
          <div className="space-y-1">
            <Label htmlFor="rotation" className="text-xs">Rotation (°)</Label>
            <Input
              id="rotation"
              name="rotation"
              type="number"
              min="0"
              max="360"
              value={localMarker.rotation}
              onChange={handleInputChange}
              className="h-8 text-xs"
            />
          </div>
        )}
        
        {/* Stroke Color */}
        {localMarker.color !== undefined && (
          <div className="space-y-1">
            <Label className="text-xs">Stroke Color</Label>
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: localMarker.color || '#000000' }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <Input
                name="color"
                value={localMarker.color || '#000000'}
                onChange={handleInputChange}
                className="h-8 text-xs ml-2"
              />
              {showColorPicker && (
                <div className="absolute z-10 mt-2" style={{ marginTop: '100px' }}>
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <ChromePicker
                    color={localMarker.color || '#000000'}
                    onChange={(color) => handleColorChange(color)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Fill Color */}
        {localMarker.fill_color !== undefined && (
          <div className="space-y-1">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: localMarker.fill_color || 'transparent' }}
                onClick={() => setShowFillColorPicker(!showFillColorPicker)}
              />
              <Input
                name="fill_color"
                value={localMarker.fill_color || ''}
                onChange={handleInputChange}
                className="h-8 text-xs ml-2"
                placeholder="transparent"
              />
              {showFillColorPicker && (
                <div className="absolute z-10 mt-2" style={{ marginTop: '100px' }}>
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowFillColorPicker(false)}
                  />
                  <ChromePicker
                    color={localMarker.fill_color || '#00000000'}
                    onChange={(color) => handleColorChange(color, false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Opacity */}
        {localMarker.opacity !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="opacity" className="text-xs">
                Opacity
              </Label>
              <span className="text-xs">
                {Math.round((localMarker.opacity || 1) * 100)}%
              </span>
            </div>
            <Slider
              id="opacity"
              value={[localMarker.opacity || 1]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => handleSliderChange('opacity', value)}
            />
          </div>
        )}
        
        {/* Line Width */}
        {localMarker.line_width !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="line_width" className="text-xs">
                Line Width
              </Label>
              <span className="text-xs">{localMarker.line_width || 1}px</span>
            </div>
            <Slider
              id="line_width"
              value={[localMarker.line_width || 1]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={(value) => handleSliderChange('line_width', value)}
            />
          </div>
        )}
        
        {/* Label */}
        {localMarker.label !== undefined && (
          <div className="space-y-1">
            <Label htmlFor="label" className="text-xs">Label</Label>
            <Input
              id="label"
              name="label"
              value={localMarker.label || ''}
              onChange={handleInputChange}
              className="h-8 text-xs"
            />
          </div>
        )}
        
        {/* Text Content */}
        {localMarker.text_content !== undefined && (
          <div className="space-y-1">
            <Label htmlFor="text_content" className="text-xs">Text Content</Label>
            <Textarea
              id="text_content"
              name="text_content"
              value={localMarker.text_content || ''}
              onChange={handleInputChange}
              className="text-xs min-h-[80px]"
            />
          </div>
        )}
        
        {/* Font Settings */}
        {localMarker.font_size !== undefined && (
          <div className="space-y-1">
            <Label htmlFor="font_size" className="text-xs">Font Size</Label>
            <Input
              id="font_size"
              name="font_size"
              type="number"
              min="8"
              max="72"
              value={localMarker.font_size || 12}
              onChange={handleInputChange}
              className="h-8 text-xs"
            />
          </div>
        )}
        
        {localMarker.font_family !== undefined && (
          <div className="space-y-1">
            <Label htmlFor="font_family" className="text-xs">Font Family</Label>
            <Select
              value={localMarker.font_family || 'Arial'}
              onValueChange={(value) => 
                setLocalMarker(prev => 
                  prev ? { ...prev, font_family: value } : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Version Info */}
        <div className="space-y-1">
          <Label className="text-xs">Version</Label>
          <div className="text-xs text-muted-foreground">
            v{localMarker.version || 1}
            {localMarker.author_name && ` by ${localMarker.author_name}`}
          </div>
        </div>
        
        <Button onClick={handleApplyChanges} className="w-full">
          Apply Changes
        </Button>
      </div>
    </div>
  );
};

export default MarkerPropertiesPanel;