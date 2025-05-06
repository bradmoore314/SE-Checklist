import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Save, Trash2, Settings, Video, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Stream {
  id: number;
  name: string;
  url: string;
  gateway_id: number;
  enabled: boolean;
  audio_enabled: boolean;
}

interface Gateway {
  id: number;
  project_id: number;
  name: string;
  ip_address: string;
  port: number;
  username: string;
  password: string;
  status: 'online' | 'offline' | 'unknown';
  streams: Stream[];
}

interface StreamImage {
  id?: number;
  stream_id: number;
  image_data: string;
  timestamp: string;
  label?: string;
}

interface CameraStreamGatewayProps {
  projectId: number;
}

const CameraStreamGateway: React.FC<CameraStreamGatewayProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('gateways');
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [newGateway, setNewGateway] = useState({
    name: '',
    ip_address: '',
    port: 80,
    username: '',
    password: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [newStream, setNewStream] = useState({
    name: '',
    url: '',
    enabled: true,
    audio_enabled: false,
  });
  const [streamPreviewActive, setStreamPreviewActive] = useState(false);
  const [streamImages, setStreamImages] = useState<StreamImage[]>([]);
  const [streamAudioEnabled, setStreamAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch gateways
  const { data: gateways = [], isLoading: isLoadingGateways } = useQuery({
    queryKey: ['/api/projects', projectId, 'gateways'],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}/gateways`).then(res => res.json()),
  });
  
  // Fetch stream images
  const { data: images = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ['/api/streams', selectedStream?.id, 'images'],
    queryFn: () => selectedStream 
      ? apiRequest('GET', `/api/streams/${selectedStream.id}/images`).then(res => res.json())
      : Promise.resolve([]),
    enabled: !!selectedStream,
  });
  
  // Create gateway mutation
  const createGatewayMutation = useMutation({
    mutationFn: async (gateway: Omit<Gateway, 'id' | 'status' | 'streams'>) => {
      const response = await apiRequest(
        'POST', 
        `/api/projects/${projectId}/gateways`, 
        { ...gateway, project_id: projectId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      setNewGateway({
        name: '',
        ip_address: '',
        port: 80,
        username: '',
        password: '',
      });
      toast({
        title: 'Gateway Added',
        description: 'Camera gateway has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Adding Gateway',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update gateway mutation
  const updateGatewayMutation = useMutation({
    mutationFn: async (gateway: Partial<Gateway>) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/gateways/${gateway.id}`, 
        gateway
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      setEditMode(false);
      toast({
        title: 'Gateway Updated',
        description: 'Camera gateway has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Gateway',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete gateway mutation
  const deleteGatewayMutation = useMutation({
    mutationFn: async (gatewayId: number) => {
      await apiRequest('DELETE', `/api/gateways/${gatewayId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      setSelectedGateway(null);
      toast({
        title: 'Gateway Deleted',
        description: 'Camera gateway has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Gateway',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create stream mutation
  const createStreamMutation = useMutation({
    mutationFn: async (stream: Omit<Stream, 'id'>) => {
      const response = await apiRequest(
        'POST', 
        `/api/gateways/${selectedGateway?.id}/streams`, 
        { ...stream, gateway_id: selectedGateway?.id }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      setNewStream({
        name: '',
        url: '',
        enabled: true,
        audio_enabled: false,
      });
      toast({
        title: 'Stream Added',
        description: 'Camera stream has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Adding Stream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update stream mutation
  const updateStreamMutation = useMutation({
    mutationFn: async (stream: Partial<Stream>) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/streams/${stream.id}`, 
        stream
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      toast({
        title: 'Stream Updated',
        description: 'Camera stream has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Stream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete stream mutation
  const deleteStreamMutation = useMutation({
    mutationFn: async (streamId: number) => {
      await apiRequest('DELETE', `/api/streams/${streamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'gateways'] });
      setSelectedStream(null);
      toast({
        title: 'Stream Deleted',
        description: 'Camera stream has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Stream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Start stream preview mutation
  const startStreamMutation = useMutation({
    mutationFn: async (streamId: number) => {
      const response = await apiRequest('POST', `/api/streams/${streamId}/start`);
      return response.json();
    },
    onSuccess: () => {
      setStreamPreviewActive(true);
      toast({
        title: 'Stream Started',
        description: 'Camera stream preview has started.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Starting Stream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Stop stream preview mutation
  const stopStreamMutation = useMutation({
    mutationFn: async (streamId: number) => {
      await apiRequest('POST', `/api/streams/${streamId}/stop`);
    },
    onSuccess: () => {
      setStreamPreviewActive(false);
      toast({
        title: 'Stream Stopped',
        description: 'Camera stream preview has been stopped.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Stopping Stream',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Test gateway connection mutation
  const testGatewayMutation = useMutation({
    mutationFn: async (gatewayId: number) => {
      const response = await apiRequest('POST', `/api/gateways/${gatewayId}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Connection Test',
        description: data.success 
          ? 'Successfully connected to the gateway' 
          : 'Failed to connect to the gateway',
        variant: data.success ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Test Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle gateway selection
  const handleGatewaySelect = (gateway: Gateway) => {
    setSelectedGateway(gateway);
    setEditMode(false);
    setNewGateway({
      name: gateway.name,
      ip_address: gateway.ip_address,
      port: gateway.port,
      username: gateway.username,
      password: '',  // Don't show the password in the UI
    });
  };
  
  // Handle gateway creation
  const handleCreateGateway = () => {
    createGatewayMutation.mutate(newGateway);
  };
  
  // Handle gateway update
  const handleUpdateGateway = () => {
    if (selectedGateway) {
      updateGatewayMutation.mutate({
        id: selectedGateway.id,
        ...newGateway,
        project_id: selectedGateway.project_id,
      });
    }
  };
  
  // Handle gateway deletion
  const handleDeleteGateway = () => {
    if (selectedGateway && window.confirm('Are you sure you want to delete this gateway?')) {
      deleteGatewayMutation.mutate(selectedGateway.id);
    }
  };
  
  // Handle stream selection
  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream);
    setNewStream({
      name: stream.name,
      url: stream.url,
      enabled: stream.enabled,
      audio_enabled: stream.audio_enabled,
    });
    setStreamAudioEnabled(stream.audio_enabled);
  };
  
  // Handle stream creation
  const handleCreateStream = () => {
    if (selectedGateway) {
      createStreamMutation.mutate({
        ...newStream,
        gateway_id: selectedGateway.id,
      });
    }
  };
  
  // Handle stream update
  const handleUpdateStream = () => {
    if (selectedStream) {
      updateStreamMutation.mutate({
        id: selectedStream.id,
        ...newStream,
        gateway_id: selectedStream.gateway_id,
      });
    }
  };
  
  // Handle stream deletion
  const handleDeleteStream = () => {
    if (selectedStream && window.confirm('Are you sure you want to delete this stream?')) {
      deleteStreamMutation.mutate(selectedStream.id);
    }
  };
  
  // Handle stream preview
  const handleStreamPreview = () => {
    if (selectedStream) {
      if (streamPreviewActive) {
        stopStreamMutation.mutate(selectedStream.id);
      } else {
        startStreamMutation.mutate(selectedStream.id);
      }
    }
  };
  
  // Handle audio toggle
  const handleAudioToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !streamAudioEnabled;
      setStreamAudioEnabled(!streamAudioEnabled);
      
      if (selectedStream) {
        updateStreamMutation.mutate({
          id: selectedStream.id,
          audio_enabled: !streamAudioEnabled,
        });
      }
    }
  };
  
  // Handle gateway connection test
  const handleTestConnection = () => {
    if (selectedGateway) {
      testGatewayMutation.mutate(selectedGateway.id);
    }
  };
  
  // Effect to update images when they are fetched
  useEffect(() => {
    if (images && images.length > 0) {
      setStreamImages(images);
    }
  }, [images]);
  
  // WebSocket connection for live stream updates
  useEffect(() => {
    if (!selectedStream || !streamPreviewActive) return;
    
    // WebSocket URL - adjust as needed based on your server setup
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/streams/${selectedStream.id}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'image') {
        setStreamImages(prev => [...prev, { 
          stream_id: selectedStream.id,
          image_data: data.image_data,
          timestamp: new Date().toISOString(),
        }].slice(-10)); // Keep only the last 10 images
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStreamPreviewActive(false);
      toast({
        title: 'Stream Connection Error',
        description: 'Failed to connect to the camera stream.',
        variant: 'destructive',
      });
    };
    
    socket.onclose = () => {
      setStreamPreviewActive(false);
    };
    
    return () => {
      socket.close();
    };
  }, [selectedStream, streamPreviewActive, toast]);
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-[300px]">
          <TabsTrigger value="gateways">
            Gateways
          </TabsTrigger>
          <TabsTrigger value="streams">
            Streams
          </TabsTrigger>
          <TabsTrigger value="preview">
            Preview
          </TabsTrigger>
        </TabsList>
        
        {/* Gateways Tab */}
        <TabsContent value="gateways">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gateways List */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Camera Gateways</CardTitle>
                <CardDescription>Manage your camera gateway devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoadingGateways ? (
                    <p>Loading gateways...</p>
                  ) : gateways.length > 0 ? (
                    <div className="space-y-2">
                      {gateways.map((gateway: Gateway) => (
                        <div 
                          key={gateway.id} 
                          className={`p-2 border rounded-md cursor-pointer hover:bg-muted flex items-center justify-between ${
                            selectedGateway?.id === gateway.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleGatewaySelect(gateway)}
                        >
                          <div>
                            <h4 className="font-medium">{gateway.name}</h4>
                            <p className="text-sm text-muted-foreground">{gateway.ip_address}:{gateway.port}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            gateway.status === 'online' ? 'bg-green-500' : 
                            gateway.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No gateways configured yet.</p>
                  )}
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      setSelectedGateway(null);
                      setEditMode(false);
                      setNewGateway({
                        name: '',
                        ip_address: '',
                        port: 80,
                        username: '',
                        password: '',
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Gateway
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Gateway Details/Edit Form */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedGateway ? (editMode ? 'Edit Gateway' : 'Gateway Details') : 'Add New Gateway'}
                </CardTitle>
                <CardDescription>
                  {selectedGateway ? 'View or edit gateway configuration' : 'Configure a new camera gateway'}
                </CardDescription>
                
                {selectedGateway && (
                  <div className="flex gap-2">
                    <Button 
                      variant={editMode ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {editMode ? 'Cancel Editing' : 'Edit Settings'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTestConnection}
                      disabled={!selectedGateway}
                    >
                      Test Connection
                    </Button>
                    
                    {editMode && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteGateway}
                        disabled={!selectedGateway}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form 
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedGateway && editMode) {
                      handleUpdateGateway();
                    } else if (!selectedGateway) {
                      handleCreateGateway();
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gateway-name">Gateway Name</Label>
                      <Input 
                        id="gateway-name"
                        value={newGateway.name}
                        onChange={(e) => setNewGateway({...newGateway, name: e.target.value})}
                        disabled={selectedGateway && !editMode}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gateway-ip">IP Address</Label>
                      <Input 
                        id="gateway-ip"
                        value={newGateway.ip_address}
                        onChange={(e) => setNewGateway({...newGateway, ip_address: e.target.value})}
                        disabled={selectedGateway && !editMode}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gateway-port">Port</Label>
                      <Input 
                        id="gateway-port"
                        type="number"
                        value={newGateway.port}
                        onChange={(e) => setNewGateway({...newGateway, port: parseInt(e.target.value)})}
                        disabled={selectedGateway && !editMode}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gateway-username">Username</Label>
                      <Input 
                        id="gateway-username"
                        value={newGateway.username}
                        onChange={(e) => setNewGateway({...newGateway, username: e.target.value})}
                        disabled={selectedGateway && !editMode}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gateway-password">Password</Label>
                      <Input 
                        id="gateway-password"
                        type="password"
                        value={newGateway.password}
                        onChange={(e) => setNewGateway({...newGateway, password: e.target.value})}
                        disabled={selectedGateway && !editMode}
                        placeholder={selectedGateway ? '••••••••' : ''}
                        required={!selectedGateway}
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedGateway && 'Leave blank to keep current password'}
                      </p>
                    </div>
                  </div>
                  
                  {(!selectedGateway || editMode) && (
                    <Button type="submit" className="mt-4">
                      <Save className="h-4 w-4 mr-2" />
                      {selectedGateway ? 'Save Changes' : 'Add Gateway'}
                    </Button>
                  )}
                </form>
                
                {selectedGateway && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Connected Streams</h3>
                    {selectedGateway.streams && selectedGateway.streams.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {selectedGateway.streams.map((stream: Stream) => (
                          <div 
                            key={stream.id}
                            className="border rounded-md p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              handleStreamSelect(stream);
                              setActiveTab('streams');
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{stream.name}</h4>
                                <p className="text-xs truncate w-40" title={stream.url}>{stream.url}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${stream.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No streams configured for this gateway.</p>
                    )}
                    
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => {
                        setSelectedStream(null);
                        setNewStream({
                          name: '',
                          url: '',
                          enabled: true,
                          audio_enabled: false,
                        });
                        setActiveTab('streams');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stream
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Streams Tab */}
        <TabsContent value="streams">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Streams List */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Camera Streams</CardTitle>
                <CardDescription>Manage your camera streams</CardDescription>
                
                <Select 
                  value={selectedGateway?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const gateway = gateways.find((g: Gateway) => g.id.toString() === value);
                    if (gateway) {
                      handleGatewaySelect(gateway);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    {gateways.map((gateway: Gateway) => (
                      <SelectItem key={gateway.id} value={gateway.id.toString()}>
                        {gateway.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {!selectedGateway ? (
                    <p className="text-muted-foreground">Please select a gateway first.</p>
                  ) : isLoadingGateways ? (
                    <p>Loading streams...</p>
                  ) : selectedGateway.streams && selectedGateway.streams.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGateway.streams.map((stream: Stream) => (
                        <div 
                          key={stream.id} 
                          className={`p-2 border rounded-md cursor-pointer hover:bg-muted flex items-center justify-between ${
                            selectedStream?.id === stream.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleStreamSelect(stream)}
                        >
                          <div>
                            <h4 className="font-medium">{stream.name}</h4>
                            <p className="text-xs truncate w-40" title={stream.url}>{stream.url}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${stream.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No streams configured for this gateway.</p>
                  )}
                  
                  <Button 
                    className="w-full mt-4"
                    disabled={!selectedGateway}
                    onClick={() => {
                      setSelectedStream(null);
                      setNewStream({
                        name: '',
                        url: '',
                        enabled: true,
                        audio_enabled: false,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Stream
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Stream Details/Edit Form */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedStream ? 'Edit Stream' : 'Add New Stream'}
                </CardTitle>
                <CardDescription>
                  {selectedStream ? 'Edit stream configuration' : 'Configure a new camera stream'}
                </CardDescription>
                
                {selectedStream && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('preview')}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteStream}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form 
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedStream) {
                      handleUpdateStream();
                    } else {
                      handleCreateStream();
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-name">Stream Name</Label>
                      <Input 
                        id="stream-name"
                        value={newStream.name}
                        onChange={(e) => setNewStream({...newStream, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stream-url">Stream URL</Label>
                      <Input 
                        id="stream-url"
                        value={newStream.url}
                        onChange={(e) => setNewStream({...newStream, url: e.target.value})}
                        placeholder="rtsp://username:password@192.168.1.100:554/stream"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="stream-enabled"
                        checked={newStream.enabled}
                        onCheckedChange={(checked) => setNewStream({...newStream, enabled: checked})}
                      />
                      <Label htmlFor="stream-enabled">Stream Enabled</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="audio-enabled"
                        checked={newStream.audio_enabled}
                        onCheckedChange={(checked) => setNewStream({...newStream, audio_enabled: checked})}
                      />
                      <Label htmlFor="audio-enabled">Audio Enabled</Label>
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    {selectedStream ? 'Save Changes' : 'Add Stream'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Camera Stream Preview</CardTitle>
              <CardDescription>
                View live feed and control camera streams
              </CardDescription>
              
              <div className="flex gap-2">
                <Select 
                  value={selectedStream?.id?.toString() || ''}
                  onValueChange={(value) => {
                    // Find the gateway first
                    let foundStream = null;
                    
                    for (const gateway of gateways) {
                      const stream = gateway.streams?.find((s: Stream) => s.id.toString() === value);
                      if (stream) {
                        setSelectedGateway(gateway);
                        foundStream = stream;
                        break;
                      }
                    }
                    
                    if (foundStream) {
                      handleStreamSelect(foundStream);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {gateways.map((gateway: Gateway) => (
                      <React.Fragment key={gateway.id}>
                        {gateway.streams && gateway.streams.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-sm font-semibold">{gateway.name}</div>
                            {gateway.streams.map((stream: Stream) => (
                              <SelectItem key={stream.id} value={stream.id.toString()}>
                                {stream.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedStream && (
                  <>
                    <Button 
                      variant={streamPreviewActive ? "default" : "outline"} 
                      size="sm" 
                      onClick={handleStreamPreview}
                    >
                      {streamPreviewActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAudioToggle}
                      disabled={!streamPreviewActive || !selectedStream.audio_enabled}
                    >
                      {streamAudioEnabled ? (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Mute
                        </>
                      ) : (
                        <>
                          <VolumeX className="h-4 w-4 mr-2" />
                          Unmute
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedStream ? (
                <div className="border rounded-md flex items-center justify-center h-[400px] bg-muted/20">
                  <p className="text-muted-foreground">Select a stream to preview</p>
                </div>
              ) : !streamPreviewActive ? (
                <div className="border rounded-md flex flex-col items-center justify-center h-[400px] bg-muted/20">
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click Start to begin stream preview</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  {/* This should be updated to display a real-time video stream */}
                  {/* For now, showing the most recent image */}
                  {streamImages.length > 0 ? (
                    <div className="relative">
                      <img 
                        src={`data:image/jpeg;base64,${streamImages[streamImages.length - 1].image_data}`} 
                        alt="Camera stream" 
                        className="w-full h-[400px] object-contain"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Live
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] bg-muted/20">
                      <p className="text-muted-foreground">Waiting for stream data...</p>
                    </div>
                  )}
                  
                  {/* This would be used for a real video stream */}
                  <video 
                    ref={videoRef}
                    className="hidden" 
                    autoPlay
                    muted={!streamAudioEnabled}
                  />
                </div>
              )}
              
              {/* Recent stream captures */}
              {selectedStream && streamImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Recent Captures</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {streamImages.slice().reverse().map((image, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <img 
                          src={`data:image/jpeg;base64,${image.image_data}`} 
                          alt={`Capture ${index + 1}`} 
                          className="w-full h-24 object-cover"
                        />
                        <div className="p-1 text-xs truncate">
                          {new Date(image.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraStreamGateway;