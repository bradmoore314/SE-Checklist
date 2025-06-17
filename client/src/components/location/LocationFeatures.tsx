import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Project } from '@shared/schema';
import { Loader2, MapPin, Search, Cloud, CloudRain, Sun, Thermometer, Wind, PlusCircle, Check, AlertTriangle, AlertOctagon } from 'lucide-react';
import InteractiveMap from './InteractiveMap';

interface LocationFeaturesProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

interface Coordinates {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind_speed: number;
    clouds: number;
    uvi: number;
  };
  daily: {
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind_speed: number;
  }[];
}

// Utility to format date from timestamp
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Function to get weather icon URL
function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export default function LocationFeatures({ project, onProjectUpdate }: LocationFeaturesProps) {
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);
  const [showAddToFloorplanDialog, setShowAddToFloorplanDialog] = useState(false);
  const [floorplanName, setFloorplanName] = useState('');
  const [customFloorplanData, setCustomFloorplanData] = useState<string | null>(null);
  const [customFloorplanType, setCustomFloorplanType] = useState<string | null>(null);
  const [customFloorplanPreview, setCustomFloorplanPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Mutation for updating the project
  const updateProjectMutation = useMutation({
    mutationFn: async (updatedData: Partial<Project>) => {
      const response = await apiRequest('PUT', `/api/projects/${project.id}`, updatedData);
      return await response.json();
    },
    onSuccess: (updatedProject: Project) => {
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      // Show success toast
      toast({
        title: 'Project Updated',
        description: 'Project details have been successfully updated.',
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Address editing removed - now read-only
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for creating a floorplan from satellite image
  const createFloorplanMutation = useMutation({
    mutationFn: async (floorplanData: { 
      project_id: number; 
      name: string; 
      pdf_data: string;
      page_count: number;
    }) => {
      const response = await apiRequest('POST', '/api/floorplans', floorplanData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Floorplan Created',
        description: 'Satellite image has been saved as a floorplan.',
      });
      
      // Invalidate floorplans queries
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/floorplans`] });
      
      // Reset state and close dialog
      setFloorplanName('');
      setShowAddToFloorplanDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Floorplan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Query for geocoded coordinates
  const { 
    data: coordinates, 
    isLoading: isLoadingCoordinates,
    isError: isErrorCoordinates,
    refetch: refetchCoordinates
  } = useQuery({
    queryKey: ['/api/geocode', project.site_address],
    enabled: !!project.site_address,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/geocode?address=${encodeURIComponent(project.site_address || '')}`);
        
        if (!response.ok) {
          // If the API returns a 404, it means the address couldn't be geocoded
          if (response.status === 404) {
            throw new Error('Address not found');
          }
          throw new Error(`Geocoding failed: ${response.status}`);
        }
        
        return response.json() as Promise<Coordinates>;
      } catch (error) {
        console.error('Error fetching geocode data:', error);
        throw error; // Let React Query handle the error state
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  // We no longer need to query for static map URL
  // as we're using the interactive map component directly

  // Query for weather data - gracefully handle when API keys aren't available
  const { 
    data: weatherData,
    isLoading: isLoadingWeather,
    isError: isErrorWeather
  } = useQuery({
    queryKey: ['/api/weather', coordinates?.lat, coordinates?.lng],
    enabled: !!coordinates,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/weather?lat=${coordinates?.lat}&lng=${coordinates?.lng}`);
        
        if (!response.ok) {
          // Return null instead of throwing to avoid error messages
          return null;
        }
        
        return response.json() as Promise<WeatherData>;
      } catch (error) {
        // Return null instead of throwing to avoid error messages  
        return null;
      }
    },
    retry: false // Don't retry failed weather requests
  });

  // State for tracking address search API status
  const [addressApiStatus, setAddressApiStatus] = useState<{
    status: 'idle' | 'error' | 'unauthorized';
    message?: string;
  }>({
    status: 'idle'
  });

  // Function to search for address suggestions
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setAddressApiStatus({ status: 'idle' });
      return;
    }
    
    setIsSearching(true);
    setAddressApiStatus({ status: 'idle' });
    
    try {
      // Call our server's Places API endpoint
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle potential API errors based on the status field
        if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
          // Success - extract real address suggestions from Google
          const suggestions = data.predictions.map((p: any) => p.description);
          setAddressSuggestions(suggestions);
          setAddressApiStatus({ status: 'idle' });
        } 
        else if (data.status === 'NO_API_KEY') {
          // No API key configured - show helpful message but don't treat as error
          setAddressSuggestions([]);
          setAddressApiStatus({
            status: 'no_key',
            message: 'Address suggestions require a Google Maps API key. You can still enter addresses manually.'
          });
        }
        else if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST' || 
                 data.status === 'FALLBACK' || data.status === 'ERROR') {
          // API access issues - show helpful message but allow manual entry
          setAddressSuggestions([]);
          setAddressApiStatus({
            status: 'no_key',
            message: 'Address suggestions unavailable. You can still enter addresses manually.'
          });
        }
        else {
          // No suggestions found or zero results - this is normal
          setAddressSuggestions([]);
          setAddressApiStatus({ status: 'idle' });
        }
      } else {
        // API request failed - show helpful message but allow manual entry
        setAddressSuggestions([]);
        setAddressApiStatus({
          status: 'no_key',
          message: 'Address suggestions unavailable. You can still enter addresses manually.'
        });
      }
    } catch (error) {
      // Network error - show helpful message but allow manual entry
      setAddressSuggestions([]);
      setAddressApiStatus({
        status: 'no_key',
        message: 'Address suggestions unavailable. You can still enter addresses manually.'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Address search removed - now read-only display

  // Handle adding satellite view or custom uploaded file as floorplan
  const handleAddToFloorplan = async () => {
    // For satellite view from the "Save to Floorplans" button, we may not have customFloorplanData
    // but we need to have a floorplan name
    if (!floorplanName) return;
    
    try {
      // Check if we're saving from the satellite view (called from the Save to Floorplans button)
      // or from the upload dialog
      if (!customFloorplanData && coordinates) {
        // We're saving a satellite view screenshot directly
        
        // Fetch the satellite image data from the server
        const response = await fetch(`/api/projects/${project.id}/satellite-image`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch satellite image');
        }
        
        const imageData = await response.json();
        
        if (!imageData || !imageData.base64) {
          throw new Error('No satellite image data available');
        }
        
        // Extract the base64 data
        const base64Result = imageData.base64.split(',')[1] || imageData.base64;
        
        // Create floorplan with the satellite image
        await createFloorplanMutation.mutateAsync({
          project_id: project.id,
          name: floorplanName,
          pdf_data: base64Result,
          page_count: 1,
          is_satellite_image: true, // Mark this as a satellite image for proper handling
          content_type: 'image/jpeg' // Explicitly set the content type for proper rendering
        });
        
        // Show success toast
        toast({
          title: 'Satellite View Saved',
          description: 'Satellite view saved as floorplan successfully.',
        });
      } 
      // Handle custom uploaded file from the upload dialog
      else if (customFloorplanData) {
        // Custom uploaded file - already processed to base64
        const base64Result = customFloorplanData;
        
        // Create success message with file type
        const successMessage = customFloorplanType 
          ? `${customFloorplanType.split('/')[1].toUpperCase()} file saved as floorplan.`
          : 'File saved as floorplan.';
            
        // Create floorplan with the uploaded data
        await createFloorplanMutation.mutateAsync({
          project_id: project.id,
          name: floorplanName,
          pdf_data: base64Result,
          page_count: 1,
          content_type: customFloorplanType || 'application/pdf'
        });
        
        // Show success toast with specific message
        toast({
          title: 'Floorplan Created',
          description: successMessage,
        });
      }
      
      // Reset all state and close dialog after successful upload
      setFloorplanName('');
      setCustomFloorplanData(null);
      setCustomFloorplanType(null);
      setCustomFloorplanPreview(null);
      setShowAddToFloorplanDialog(false);
      
    } catch (error) {
      console.error('Error creating floorplan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save image as floorplan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Widget Card - Moved to top */}
      {coordinates && (
        <Card className="border rounded-lg shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Weather Conditions</CardTitle>
            <CardDescription>
              Current conditions at site location
            </CardDescription>
          </CardHeader>
          
          {isLoadingWeather ? (
            <CardContent className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </CardContent>
          ) : isErrorWeather ? (
            <CardContent>
              <div className="text-sm text-red-500">
                Unable to fetch weather data. Please try again later.
              </div>
            </CardContent>
          ) : weatherData && (
            <>
              {/* Current Weather */}
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={getWeatherIconUrl(weatherData.current.weather[0].icon)} 
                      alt={weatherData.current.weather[0].description} 
                      className="h-16 w-16"
                    />
                    <div>
                      <div className="text-3xl font-bold">
                        {Math.round(weatherData.current.temp)}°F
                      </div>
                      <div className="text-gray-500 capitalize">
                        {weatherData.current.weather[0].description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">Feels like: {Math.round(weatherData.current.feels_like)}°F</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">Wind: {Math.round(weatherData.current.wind_speed)} mph</span>
                    </div>
                    <div className="flex items-center">
                      <Cloud className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">Humidity: {weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">UV Index: {Math.round(weatherData.current.uvi)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* 7-Day Forecast */}
              <div className="px-6 pb-4 pt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">7-Day Forecast</h4>
                <div className="flex overflow-x-auto pb-2 space-x-4">
                  {weatherData.daily.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex flex-col items-center min-w-[60px]">
                      <div className="text-xs font-medium">
                        {index === 0 ? 'Today' : formatDate(day.dt)}
                      </div>
                      <img 
                        src={getWeatherIconUrl(day.weather[0].icon)} 
                        alt={day.weather[0].description} 
                        className="h-10 w-10"
                      />
                      <div className="text-xs flex space-x-1">
                        <span className="font-medium">{Math.round(day.temp.max)}°</span>
                        <span className="text-gray-500">{Math.round(day.temp.min)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>
      )}
      
      {/* Location Information Card - Moved below weather */}
      <Card className="border rounded-lg shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Site Address</div>
              <div className="text-gray-700 mt-1">
                {project.site_address || 'No address specified'}
              </div>
            </div>
          </div>
          
          {isErrorCoordinates && project.site_address && (
            <div className="text-sm text-red-500">
              Unable to locate address on map. Please check the address format.
            </div>
          )}
          
          {/* Map Section - Mobile Responsive */}
          {coordinates && (
            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              <div className="relative aspect-square overflow-hidden">
                {/* Interactive Map thumbnail that supports interactions */}
                <div 
                  className="w-full h-full rounded-md border cursor-pointer" 
                  onClick={() => setShowMapFullscreen(true)}
                >
                  <InteractiveMap 
                    lat={coordinates.lat} 
                    lng={coordinates.lng} 
                    zoom={17}
                    height="100%"
                    width="100%"
                  />
                </div>
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/70 hover:bg-white/90 text-xs sm:text-sm py-1 h-auto sm:h-9 px-2 sm:px-3"
                    onClick={() => setShowAddToFloorplanDialog(true)}
                  >
                    <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline">Add to </span>Floorplans
                  </Button>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                {coordinates.formattedAddress}
              </div>
            </div>
          )}
          
          {/* Loading State for Map */}
          {isLoadingCoordinates && project.site_address && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </CardContent>
      </Card>
      

      
      {/* Fullscreen Map Dialog - Mobile Responsive */}
      <Dialog open={showMapFullscreen} onOpenChange={setShowMapFullscreen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Site Location - Satellite View</DialogTitle>
          </DialogHeader>
          
          {coordinates && (
            <div className="w-full h-[40vh] sm:h-[60vh] overflow-hidden rounded">
              {/* Interactive Map with support for zooming, tilting, panning, and rotating */}
              <InteractiveMap 
                lat={coordinates.lat} 
                lng={coordinates.lng} 
                zoom={18}
                height="100%"
                width="100%"
                className="border rounded"
              />
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-3 sm:mt-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-auto sm:h-9"
              onClick={() => setShowMapFullscreen(false)}
            >
              Close
            </Button>
            <Button 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-auto sm:h-9"
              onClick={() => {
                // Close fullscreen dialog and capture satellite view directly
                setShowMapFullscreen(false);
                
                // Auto-generate a name for the floorplan
                const defaultName = "Satellite View";
                setFloorplanName(defaultName);
                
                // Handle saving the satellite view directly
                if (coordinates) {
                  handleAddToFloorplan();
                } else {
                  toast({
                    title: "Error",
                    description: "Couldn't get location coordinates",
                    variant: "destructive"
                  });
                }
              }}
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Save to Floorplans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to Floorplan Dialog - Mobile Responsive */}
      <Dialog open={showAddToFloorplanDialog} onOpenChange={setShowAddToFloorplanDialog}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Add Floorplan</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Add the satellite view or upload your own image file as a floorplan for marking equipment locations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="floorplan-name" className="text-xs sm:text-sm font-medium text-gray-700">
                Floorplan Name
              </label>
              <Input
                id="floorplan-name"
                placeholder="e.g., Site Satellite View"
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
                className="w-full text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-medium text-gray-700">Floorplan Source</label>
              </div>
              
              <Tabs defaultValue="satellite" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8 sm:h-10">
                  <TabsTrigger value="satellite" className="text-xs sm:text-sm">Use Satellite View</TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs sm:text-sm">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="satellite" className="mt-2 sm:mt-4">
                  {coordinates && (
                    <div className="border rounded overflow-hidden">
                      <div className="aspect-video relative">
                        <InteractiveMap 
                          lat={coordinates.lat} 
                          lng={coordinates.lng} 
                          zoom={18}
                          height="100%"
                          width="100%"
                        />
                      </div>
                      <div className="p-2 bg-gray-50 text-[10px] sm:text-xs text-gray-500">
                        Interactive satellite view for this location
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="upload" className="mt-2 sm:mt-4 space-y-2 sm:space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-3 sm:p-6 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      id="floorplan-file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64data = reader.result as string;
                            const base64Content = base64data.split(',')[1];
                            
                            // Save the content for later use in handleAddToFloorplan
                            setCustomFloorplanData(base64Content);
                            setCustomFloorplanType(file.type);
                            setCustomFloorplanPreview(base64data);
                          };
                          reader.readAsDataURL(file);
                          
                          // Auto-fill floorplan name if it's empty
                          if (!floorplanName) {
                            const fileName = file.name.split('.')[0];
                            setFloorplanName(fileName);
                          }
                        }
                      }}
                    />
                    {!customFloorplanPreview ? (
                      <div className="text-center">
                        <div className="mt-1 sm:mt-2">
                          <Button 
                            variant="outline"
                            className="text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10"
                            onClick={() => document.getElementById('floorplan-file')?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                        <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm text-gray-500">
                          Supported formats: JPEG, PNG, GIF, PDF
                        </p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="relative">
                          <img 
                            src={customFloorplanPreview} 
                            alt="Uploaded preview" 
                            className="max-h-48 sm:max-h-64 mx-auto object-contain"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 text-xs sm:text-sm py-0 px-2 h-6 sm:h-8"
                            onClick={() => {
                              setCustomFloorplanData(null);
                              setCustomFloorplanType(null);
                              setCustomFloorplanPreview(null);
                              // Reset the input
                              const fileInput = document.getElementById('floorplan-file') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                        <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm text-center text-gray-500">
                          {customFloorplanType?.split('/')[1].toUpperCase()} file selected
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2 sm:mt-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-9"
              onClick={() => {
                setShowAddToFloorplanDialog(false);
                // Reset uploaded file data when closing
                setCustomFloorplanData(null);
                setCustomFloorplanType(null);
                setCustomFloorplanPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-9"
              onClick={handleAddToFloorplan}
              disabled={createFloorplanMutation.isPending || !floorplanName || 
                       (!customFloorplanData && !coordinates)}
            >
              {createFloorplanMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save as Floorplan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}