import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColorPicker } from '@/components/ui/color-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Annotation } from './AdvancedPdfViewer';
import { 
  Square, 
  Circle, 
  MousePointer, 
  Stamp as StampIcon, 
  Type, 
  Ruler, 
  Image, 
  ArrowRight, 
  Hand, 
  Pen, 
  Pencil, 
  SquareCheck,
  CheckSquare
} from 'lucide-react';

// Types
type ToolType = 'select' | 'pan' | 'stamp' | 'text' | 'shape' | 'measurement' | 'image';
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'polygon';

type StampConfig = {
  id: string;
  label: string;
  color: string;
  icon: string;
  category: string;
};

interface AdvancedAnnotationToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedAnnotationIds: string[];
  pageNumber: number;
}

// Predefined stamps
const STAMPS: StampConfig[] = [
  // Security Equipment
  { id: 'camera', label: 'Camera', color: '#0369A1', icon: '📷', category: 'Security Equipment' },
  { id: 'door_access', label: 'Door Access', color: '#166534', icon: '🚪', category: 'Security Equipment' },
  { id: 'motion_sensor', label: 'Motion Sensor', color: '#9333EA', icon: '👁️', category: 'Security Equipment' },
  { id: 'intercom', label: 'Intercom', color: '#0891B2', icon: '🔊', category: 'Security Equipment' },
  { id: 'security_desk', label: 'Security Desk', color: '#0F766E', icon: '👮', category: 'Security Equipment' },
  
  // Status Stamps
  { id: 'approved', label: 'APPROVED', color: '#16A34A', icon: '✓', category: 'Status Stamps' },
  { id: 'rejected', label: 'REJECTED', color: '#DC2626', icon: '✗', category: 'Status Stamps' },
  { id: 'pending', label: 'PENDING', color: '#F59E0B', icon: '⏱️', category: 'Status Stamps' },
  { id: 'revised', label: 'REVISED', color: '#8B5CF6', icon: '⟳', category: 'Status Stamps' },
  
  // Location Stamps
  { id: 'entrance', label: 'Entrance', color: '#2563EB', icon: '🚶', category: 'Location Stamps' },
  { id: 'exit', label: 'Exit', color: '#2563EB', icon: '🚶‍♂️', category: 'Location Stamps' },
  { id: 'elevator', label: 'Elevator', color: '#0D9488', icon: '🔼', category: 'Location Stamps' },
  { id: 'stairway', label: 'Stairway', color: '#0D9488', icon: '🪜', category: 'Location Stamps' },
];

// Group stamps by category
const groupedStamps = STAMPS.reduce<Record<string, StampConfig[]>>((groups, stamp) => {
  if (!groups[stamp.category]) {
    groups[stamp.category] = [];
  }
  groups[stamp.category].push(stamp);
  return groups;
}, {});

export function AdvancedAnnotationToolbar({
  currentTool,
  onToolChange,
  onAddAnnotation,
  selectedAnnotationIds,
  pageNumber
}: AdvancedAnnotationToolbarProps) {
  // States
  const [selectedStamp, setSelectedStamp] = useState<StampConfig | null>(null);
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>('rectangle');
  const [textContent, setTextContent] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [color, setColor] = useState<string>('#000000');
  const [opacity, setOpacity] = useState<number>(1);
  const [selectedLayer, setSelectedLayer] = useState<string>('annotations');
  
  // Handle tool button click
  const handleToolClick = (tool: ToolType) => {
    onToolChange(tool);
  };
  
  // Handle stamp selection
  const handleStampSelect = (stamp: StampConfig) => {
    setSelectedStamp(stamp);
    setColor(stamp.color);
    onToolChange('stamp');
  };
  
  // Handle shape type selection
  const handleShapeTypeSelect = (shapeType: ShapeType) => {
    setSelectedShapeType(shapeType);
    onToolChange('shape');
  };
  
  // Handle adding text annotation
  const handleAddTextAnnotation = () => {
    if (!textContent.trim()) return;
    
    onAddAnnotation({
      type: 'text',
      x: 100, // Default position, will be updated when user clicks
      y: 100, // Default position, will be updated when user clicks
      content: textContent,
      color,
      opacity,
      fontSize,
      fontFamily,
      page: pageNumber,
      layer: selectedLayer
    });
    
    // Clear the text input
    setTextContent('');
  };
  
  // Helper function to get the icon for the current tool
  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'select': return <MousePointer className="h-4 w-4" />;
      case 'pan': return <Hand className="h-4 w-4" />;
      case 'stamp': return <StampIcon className="h-4 w-4" />;
      case 'text': return <Type className="h-4 w-4" />;
      case 'shape': return <Square className="h-4 w-4" />;
      case 'measurement': return <Ruler className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <MousePointer className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="px-4 py-2 space-y-0">
        <CardTitle className="text-base">Annotation Tools</CardTitle>
      </CardHeader>
      
      <Separator />
      
      {/* Tool Selection Buttons */}
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant={currentTool === 'select' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('select')}
          title="Select Tool"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'pan' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('pan')}
          title="Pan Tool"
        >
          <Hand className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'stamp' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('stamp')}
          title="Stamp Tool"
        >
          <StampIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'text' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('text')}
          title="Text Tool"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'shape' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('shape')}
          title="Shape Tool"
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'measurement' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('measurement')}
          title="Measurement Tool"
        >
          <Ruler className="h-4 w-4" />
        </Button>
        
        <Button
          variant={currentTool === 'image' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('image')}
          title="Image Tool"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator />
      
      {/* Tool Properties */}
      <ScrollArea className="flex-1 h-[calc(100vh-330px)]">
        <div className="p-4 space-y-4">
          {/* Display properties based on selected tool */}
          {currentTool === 'stamp' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Stamp Tool</h3>
              
              <div className="space-y-2">
                {Object.entries(groupedStamps).map(([category, stamps]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {stamps.map(stamp => (
                        <Button
                          key={stamp.id}
                          variant={selectedStamp?.id === stamp.id ? 'default' : 'outline'}
                          size="sm"
                          className="h-auto py-2 justify-start"
                          onClick={() => handleStampSelect(stamp)}
                        >
                          <div 
                            className="w-6 h-6 flex items-center justify-center mr-2 rounded-sm"
                            style={{ backgroundColor: stamp.color }}
                          >
                            <span>{stamp.icon}</span>
                          </div>
                          <span className="text-xs">{stamp.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedStamp && (
                <div className="space-y-2 border rounded-md p-2">
                  <Label className="text-xs">Stamp Color</Label>
                  <ColorPicker 
                    color={color} 
                    onChange={setColor} 
                  />
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Opacity</Label>
                    <Slider
                      value={[opacity]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={([value]) => setOpacity(value)}
                    />
                    <div className="text-xs text-right text-muted-foreground">
                      {Math.round(opacity * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentTool === 'text' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Text Tool</h3>
              
              <div className="space-y-2">
                <Label className="text-xs" htmlFor="text-content">Text Content</Label>
                <Textarea 
                  id="text-content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter text here..."
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Font</Label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Font Size</Label>
                <Slider
                  value={[fontSize]}
                  min={8}
                  max={72}
                  step={1}
                  onValueChange={([value]) => setFontSize(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {fontSize}px
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <ColorPicker 
                  color={color} 
                  onChange={setColor} 
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Opacity</Label>
                <Slider
                  value={[opacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => setOpacity(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {Math.round(opacity * 100)}%
                </div>
              </div>
              
              <Button 
                onClick={handleAddTextAnnotation}
                disabled={!textContent.trim()}
                className="w-full"
              >
                Add Text
              </Button>
            </div>
          )}
          
          {currentTool === 'shape' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Shape Tool</h3>
              
              <div className="space-y-2">
                <Label className="text-xs">Shape Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedShapeType === 'rectangle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeTypeSelect('rectangle')}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    <span className="text-xs">Rectangle</span>
                  </Button>
                  
                  <Button
                    variant={selectedShapeType === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeTypeSelect('circle')}
                  >
                    <Circle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Circle</span>
                  </Button>
                  
                  <Button
                    variant={selectedShapeType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeTypeSelect('line')}
                  >
                    <Pen className="h-4 w-4 mr-1" />
                    <span className="text-xs">Line</span>
                  </Button>
                  
                  <Button
                    variant={selectedShapeType === 'arrow' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeTypeSelect('arrow')}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">Arrow</span>
                  </Button>
                  
                  <Button
                    variant={selectedShapeType === 'polygon' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShapeTypeSelect('polygon')}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    <span className="text-xs">Polygon</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Stroke Color</Label>
                <ColorPicker 
                  color={color} 
                  onChange={setColor} 
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Stroke Width</Label>
                <Slider
                  value={[strokeWidth]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => setStrokeWidth(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {strokeWidth}px
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Opacity</Label>
                <Slider
                  value={[opacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => setOpacity(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {Math.round(opacity * 100)}%
                </div>
              </div>
            </div>
          )}
          
          {currentTool === 'measurement' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Measurement Tool</h3>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Click and drag to create a measurement line. The distance will be calculated based on the document scale.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Line Color</Label>
                <ColorPicker 
                  color={color} 
                  onChange={setColor} 
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Line Width</Label>
                <Slider
                  value={[strokeWidth]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) => setStrokeWidth(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {strokeWidth}px
                </div>
              </div>
            </div>
          )}
          
          {currentTool === 'image' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Image Tool</h3>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Select an image file to place on the document.
                </p>
                
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="text-xs" 
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Opacity</Label>
                <Slider
                  value={[opacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => setOpacity(value)}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {Math.round(opacity * 100)}%
                </div>
              </div>
            </div>
          )}
          
          {(currentTool === 'select' || currentTool === 'pan') && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{currentTool === 'select' ? 'Selection Tool' : 'Pan Tool'}</h3>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {currentTool === 'select' 
                    ? 'Click on annotations to select them. Use Shift+Click to select multiple annotations.' 
                    : 'Click and drag to pan around the document.'}
                </p>
              </div>
              
              {currentTool === 'select' && selectedAnnotationIds.length > 0 && (
                <div className="space-y-2 border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Selected Annotations</span>
                    <span className="text-xs text-muted-foreground">{selectedAnnotationIds.length} selected</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      Bring to Front
                    </Button>
                    <Button variant="outline" size="sm">
                      Send to Back
                    </Button>
                    <Button variant="outline" size="sm">
                      Group
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Layer Selection - shown for all tools except pan */}
          {currentTool !== 'pan' && (
            <div className="space-y-2 mt-4 pt-4 border-t">
              <Label className="text-xs">Target Layer</Label>
              <select
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="annotations">Annotations</option>
                <option value="measurements">Measurements</option>
                <option value="markup">Markup</option>
              </select>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}