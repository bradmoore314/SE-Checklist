import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/ui/color-picker';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Eye, EyeOff, Lock, Unlock, Layers, Trash2, Plus, Settings } from 'lucide-react';

// Layer type matching the database schema
export interface FloorplanLayer {
  id: number;
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

interface NewLayer {
  floorplan_id: number;
  name: string;
  color: string;
  visible: boolean;
  order_index: number;
}

interface LayerManagerProps {
  floorplanId: number;
}

export function LayerManager({ floorplanId }: LayerManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('#3B82F6'); // Default blue color
  const [editingLayer, setEditingLayer] = useState<FloorplanLayer | null>(null);
  
  const { toast } = useToast();

  // Fetch layers
  const { 
    data: layers = [], 
    isLoading,
    isError, 
    error 
  } = useQuery<FloorplanLayer[]>({
    queryKey: ['/api/enhanced-floorplan', floorplanId, 'layers'],
    queryFn: async () => {
      const response = await fetch(`/api/enhanced-floorplan/${floorplanId}/layers`);
      if (!response.ok) {
        throw new Error('Failed to fetch layers');
      }
      return response.json();
    },
    enabled: !!floorplanId
  });

  // Add layer mutation
  const createLayerMutation = useMutation({
    mutationFn: async (layerData: NewLayer) => {
      const response = await apiRequest(
        'POST', 
        `/api/enhanced-floorplan/${floorplanId}/layers`, 
        layerData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Layer created',
        description: 'The layer has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan', floorplanId, 'layers'] });
      setIsCreateDialogOpen(false);
      setNewLayerName('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating layer',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update layer mutation
  const updateLayerMutation = useMutation({
    mutationFn: async (layer: FloorplanLayer) => {
      const { id, ...layerData } = layer;
      const response = await apiRequest(
        'PUT', 
        `/api/enhanced-floorplan/layers/${id}`, 
        layerData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Layer updated',
        description: 'The layer has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan', floorplanId, 'layers'] });
      setIsEditDialogOpen(false);
      setEditingLayer(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating layer',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete layer mutation
  const deleteLayerMutation = useMutation({
    mutationFn: async (layerId: number) => {
      await apiRequest(
        'DELETE', 
        `/api/enhanced-floorplan/layers/${layerId}`, 
        null
      );
    },
    onSuccess: () => {
      toast({
        title: 'Layer deleted',
        description: 'The layer has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-floorplan', floorplanId, 'layers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting layer',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle layer visibility toggle
  const toggleLayerVisibility = (layer: FloorplanLayer) => {
    const updatedLayer = { ...layer, visible: !layer.visible };
    updateLayerMutation.mutate(updatedLayer);
  };

  // Create new layer
  const handleCreateLayer = () => {
    if (!newLayerName.trim()) {
      toast({
        title: 'Error',
        description: 'Layer name is required.',
        variant: 'destructive',
      });
      return;
    }

    const newLayer: NewLayer = {
      floorplan_id: floorplanId,
      name: newLayerName,
      color: newLayerColor,
      visible: true,
      order_index: layers.length // Add to the end of the list
    };

    createLayerMutation.mutate(newLayer);
  };

  // Update existing layer
  const handleUpdateLayer = () => {
    if (!editingLayer) return;
    
    updateLayerMutation.mutate(editingLayer);
  };

  // Delete layer with confirmation
  const handleDeleteLayer = (layerId: number) => {
    if (window.confirm('Are you sure you want to delete this layer? This action cannot be undone.')) {
      deleteLayerMutation.mutate(layerId);
    }
  };

  // Start editing a layer
  const startEditingLayer = (layer: FloorplanLayer) => {
    setEditingLayer(layer);
    setIsEditDialogOpen(true);
  };

  // Update editing layer state
  const updateEditingLayer = (key: keyof FloorplanLayer, value: any) => {
    if (!editingLayer) return;
    setEditingLayer({ ...editingLayer, [key]: value });
  };
  
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Layers</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <div className="p-2 text-center">Loading layers...</div>
          ) : isError ? (
            <div className="p-2 text-center text-red-500">Error loading layers</div>
          ) : layers.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground">No layers found</div>
          ) : (
            <>
              {layers
                .sort((a, b) => a.order_index - b.order_index)
                .map(layer => (
                  <DropdownMenuItem key={layer.id} className="px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className={!layer.visible ? 'text-muted-foreground' : ''}>{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer);
                        }}
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingLayer(layer);
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))
              }
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Layer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Layer</DialogTitle>
            <DialogDescription>
              Add a new layer to organize your floorplan annotations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                className="col-span-3"
                placeholder="Enter layer name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border" 
                  style={{ backgroundColor: newLayerColor }}
                />
                <Input
                  id="color"
                  type="color"
                  value={newLayerColor}
                  onChange={(e) => setNewLayerColor(e.target.value)}
                  className="w-16 p-1 h-8"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLayer}
              disabled={createLayerMutation.isPending}
            >
              {createLayerMutation.isPending ? 'Creating...' : 'Create Layer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Layer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Layer</DialogTitle>
            <DialogDescription>
              Modify layer properties and settings.
            </DialogDescription>
          </DialogHeader>
          {editingLayer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingLayer.name}
                  onChange={(e) => updateEditingLayer('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-color" className="text-right">
                  Color
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: editingLayer.color }}
                  />
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingLayer.color}
                    onChange={(e) => updateEditingLayer('color', e.target.value)}
                    className="w-16 p-1 h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-visible" className="text-right">
                  Visible
                </Label>
                <div className="col-span-3">
                  <Checkbox
                    id="edit-visible"
                    checked={editingLayer.visible}
                    onCheckedChange={(checked) => 
                      updateEditingLayer('visible', checked === true)
                    }
                  />
                </div>
              </div>
              <div className="border-t pt-4 mt-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteLayer(editingLayer.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Layer
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateLayer}
              disabled={updateLayerMutation.isPending}
            >
              {updateLayerMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}