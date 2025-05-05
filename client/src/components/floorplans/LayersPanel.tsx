import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff, Plus, Trash2, Settings, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ChromePicker } from 'react-color';
import { useToast } from '@/hooks/use-toast';

interface LayerData {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order_index: number;
}

interface LayersPanelProps {
  floorplanId: number;
  layers: LayerData[];
  isLoading: boolean;
  onLayerVisibilityToggle: (layerId: number, visible: boolean) => void;
  onLayerDelete: (layerId: number) => void;
  onLayerCreate: (layer: Partial<LayerData>) => void;
  onLayerUpdate: (layer: LayerData) => void;
  onLayerReorder: (layers: LayerData[]) => void;
  activeLayerId: number | null;
  setActiveLayerId: (id: number | null) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  floorplanId,
  layers,
  isLoading,
  onLayerVisibilityToggle,
  onLayerDelete,
  onLayerCreate,
  onLayerUpdate,
  onLayerReorder,
  activeLayerId,
  setActiveLayerId
}) => {
  const { toast } = useToast();
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('#3b82f6');
  const [editingLayer, setEditingLayer] = useState<LayerData | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Sort layers by order_index
  const sortedLayers = [...layers].sort((a, b) => a.order_index - b.order_index);
  
  const createLayerMutation = useMutation({
    mutationFn: async (layer: Partial<LayerData>) => {
      const res = await apiRequest(
        'POST', 
        `/api/enhanced-floorplan/${floorplanId}/layers`, 
        layer
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enhanced-floorplan/${floorplanId}/layers`] });
      setNewLayerName('');
      setNewLayerColor('#3b82f6');
      toast({
        title: 'Success',
        description: 'Layer created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create layer: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const updateLayerMutation = useMutation({
    mutationFn: async (layer: LayerData) => {
      const res = await apiRequest(
        'PUT', 
        `/api/enhanced-floorplan/layers/${layer.id}`, 
        layer
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enhanced-floorplan/${floorplanId}/layers`] });
      setEditingLayer(null);
      toast({
        title: 'Success',
        description: 'Layer updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update layer: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const deleteLayerMutation = useMutation({
    mutationFn: async (layerId: number) => {
      await apiRequest('DELETE', `/api/enhanced-floorplan/layers/${layerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enhanced-floorplan/${floorplanId}/layers`] });
      toast({
        title: 'Success',
        description: 'Layer deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete layer: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleLayerDragStart = (e: React.DragEvent, layerId: number) => {
    e.dataTransfer.setData('text/plain', layerId.toString());
    setDraggingLayerId(layerId);
  };
  
  const handleLayerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleLayerDrop = (e: React.DragEvent, targetLayerId: number) => {
    e.preventDefault();
    const sourceLayerId = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceLayerId === targetLayerId) return;
    
    const sourceLayer = layers.find(l => l.id === sourceLayerId);
    const targetLayer = layers.find(l => l.id === targetLayerId);
    
    if (!sourceLayer || !targetLayer) return;
    
    const newLayers = [...layers];
    
    // Swap orders
    const updatedLayers = newLayers.map(layer => {
      if (layer.id === sourceLayerId) {
        return { ...layer, order_index: targetLayer.order_index };
      }
      if (layer.id === targetLayerId) {
        return { ...layer, order_index: sourceLayer.order_index };
      }
      return layer;
    });
    
    onLayerReorder(updatedLayers);
    
    // Update in database
    updateLayerMutation.mutate({ ...sourceLayer, order_index: targetLayer.order_index });
    updateLayerMutation.mutate({ ...targetLayer, order_index: sourceLayer.order_index });
    
    setDraggingLayerId(null);
  };
  
  const handleCreateLayer = () => {
    if (!newLayerName.trim()) {
      toast({
        title: 'Error',
        description: 'Layer name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    const maxOrder = Math.max(...layers.map(l => l.order_index), -1);
    
    createLayerMutation.mutate({
      floorplan_id: floorplanId,
      name: newLayerName,
      color: newLayerColor,
      visible: true,
      order_index: maxOrder + 1,
    });
  };
  
  const handleUpdateLayer = () => {
    if (!editingLayer) return;
    
    updateLayerMutation.mutate(editingLayer);
  };
  
  const handleDeleteLayer = (layerId: number) => {
    if (layers.length <= 1) {
      toast({
        title: 'Error',
        description: 'Cannot delete the last layer',
        variant: 'destructive',
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this layer? All markers in this layer will also be deleted.')) {
      deleteLayerMutation.mutate(layerId);
      if (activeLayerId === layerId) {
        setActiveLayerId(null);
      }
    }
  };
  
  const handleToggleVisibility = (layer: LayerData) => {
    const updatedLayer = { ...layer, visible: !layer.visible };
    updateLayerMutation.mutate(updatedLayer);
    onLayerVisibilityToggle(layer.id, !layer.visible);
  };
  
  const handleSetActiveLayer = (layerId: number) => {
    setActiveLayerId(activeLayerId === layerId ? null : layerId);
  };
  
  return (
    <div className="bg-background border rounded-md shadow-sm p-3 w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Layers</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Layer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Name
                </label>
                <Input
                  id="name"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="color" className="text-right text-sm">
                  Color
                </label>
                <div className="col-span-3 flex items-center">
                  <div
                    className="w-10 h-5 rounded border cursor-pointer"
                    style={{ backgroundColor: newLayerColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <span className="ml-2 text-sm">{newLayerColor}</span>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-1" style={{ top: '100%' }}>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <ChromePicker
                        color={newLayerColor}
                        onChange={(color) => setNewLayerColor(color.hex)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateLayer}>
                Create Layer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-center py-2">Loading layers...</div>
        ) : sortedLayers.length === 0 ? (
          <div className="text-sm text-center py-2">No layers found</div>
        ) : (
          sortedLayers.map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center p-2 rounded ${
                activeLayerId === layer.id ? 'bg-accent' : 'hover:bg-muted'
              } ${draggingLayerId === layer.id ? 'opacity-50' : ''}`}
              draggable
              onDragStart={(e) => handleLayerDragStart(e, layer.id)}
              onDragOver={handleLayerDragOver}
              onDrop={(e) => handleLayerDrop(e, layer.id)}
              onClick={() => handleSetActiveLayer(layer.id)}
            >
              <div className="flex items-center flex-1">
                <GripVertical className="h-4 w-4 mr-1 text-muted-foreground cursor-move" />
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm truncate">{layer.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(layer);
                      }}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {layer.visible ? 'Hide Layer' : 'Show Layer'}
                  </TooltipContent>
                </Tooltip>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLayer(layer);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {editingLayer && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Edit Layer</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-name" className="text-right text-sm">
                              Name
                            </label>
                            <Input
                              id="edit-name"
                              value={editingLayer.name}
                              onChange={(e) =>
                                setEditingLayer({
                                  ...editingLayer,
                                  name: e.target.value,
                                })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-color" className="text-right text-sm">
                              Color
                            </label>
                            <div className="col-span-3 flex items-center">
                              <div
                                className="w-10 h-5 rounded border cursor-pointer"
                                style={{ backgroundColor: editingLayer.color }}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                              />
                              <span className="ml-2 text-sm">{editingLayer.color}</span>
                              {showColorPicker && (
                                <div className="absolute z-10 mt-1" style={{ top: '100%' }}>
                                  <div
                                    className="fixed inset-0"
                                    onClick={() => setShowColorPicker(false)}
                                  />
                                  <ChromePicker
                                    color={editingLayer.color}
                                    onChange={(color) =>
                                      setEditingLayer({
                                        ...editingLayer,
                                        color: color.hex,
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-visible" className="text-right text-sm">
                              Visible
                            </label>
                            <div className="col-span-3">
                              <Checkbox
                                id="edit-visible"
                                checked={editingLayer.visible}
                                onCheckedChange={(checked) =>
                                  setEditingLayer({
                                    ...editingLayer,
                                    visible: checked as boolean,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={handleUpdateLayer}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Layer</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayersPanel;