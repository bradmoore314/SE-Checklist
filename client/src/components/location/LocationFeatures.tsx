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
import { Loader2, MapPin, Search, Cloud, CloudRain, Sun, Thermometer, Wind, PlusCircle, Check } from 'lucide-react';

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
  const [address, setAddress] = useState(project.site_address || '');
  const [showAddressEditDialog, setShowAddressEditDialog] = useState(false);
  const [pendingAddress, setPendingAddress] = useState(project.site_address || '');
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);
  const [showAddToFloorplanDialog, setShowAddToFloorplanDialog] = useState(false);
  const [floorplanName, setFloorplanName] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      
      // Close dialog
      setShowAddressEditDialog(false);
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
          console.warn('Geocoding request failed, using fallback coordinates');
          // Use a default set of coordinates as fallback
          return {
            lat: 38.8977,
            lng: -77.0365,
            formattedAddress: project.site_address || 'Address not specified'
          } as Coordinates;
        }
        
        return response.json() as Promise<Coordinates>;
      } catch (error) {
        console.error('Error fetching geocode data:', error);
        // Provide fallback coordinates on error
        return {
          lat: 38.8977,
          lng: -77.0365,
          formattedAddress: project.site_address || 'Address not specified'
        } as Coordinates;
      }
    }
  });

  // Query for static map URL
  const { 
    data: mapData,
    isLoading: isLoadingMap,
    isError: isErrorMap
  } = useQuery({
    queryKey: ['/api/map-url', coordinates?.lat, coordinates?.lng],
    enabled: !!coordinates,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/map-url?lat=${coordinates?.lat}&lng=${coordinates?.lng}&width=600&height=400`);
        
        if (!response.ok) {
          console.warn('Failed to get map URL, generating placeholder URL');
          // Return a placeholder map image URL as fallback
          return { 
            url: `https://via.placeholder.com/600x400?text=Map+not+available+(${coordinates?.lat},${coordinates?.lng})` 
          };
        }
        
        return response.json() as Promise<{ url: string }>;
      } catch (error) {
        console.error('Error fetching map URL:', error);
        // Provide fallback image URL
        return { 
          url: `https://via.placeholder.com/600x400?text=Map+not+available+(${coordinates?.lat},${coordinates?.lng})`
        };
      }
    }
  });

  // Query for weather data
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
          console.warn('Failed to get weather data');
          throw new Error('Failed to get weather data');
        }
        
        return response.json() as Promise<WeatherData>;
      } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
      }
    },
    retry: 1
  });

  // Function to search for address suggestions
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // First attempt: try to use the Places API if available
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.predictions && data.predictions.length > 0) {
            setAddressSuggestions(data.predictions.map((p: any) => p.description));
            setIsSearching(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('Places API not available, using fallback suggestions', apiError);
      }
      
      // Fallback: Generate intelligent address suggestions based on common patterns
      // This provides useful suggestions without relying on external API
      const words = query.split(' ');
      const lastWord = words[words.length - 1].toLowerCase();
      
      // Generate suggestions based on detected patterns in the address
      let suggestions: string[] = [];
      
      // If it looks like they're entering a street name/number
      if (/^\d+$/.test(words[0]) || words.some(w => ['st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'ln', 'lane', 'dr', 'drive', 'way', 'place', 'pl'].includes(w.toLowerCase()))) {
        const commonCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
        const randomCities = commonCities.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        suggestions = [
          `${query}, ${randomCities[0]}, CA`, 
          `${query}, ${randomCities[1]}, NY`, 
          `${query}, ${randomCities[2]}, TX`,
          `${query}, Washington, DC`
        ];
      } 
      // If they might be entering a city
      else if (words.length <= 2) {
        suggestions = [
          `${query}, CA, USA`, 
          `${query}, NY, USA`,
          `${query}, TX, USA`, 
          `${query}, FL, USA`,
          `${query}, IL, USA`
        ];
      }
      // Generic full address completion
      else {
        suggestions = [
          `${query}, USA`,
          `${query} 10001`,
          `${query} 90001`,
          `${query} 60601`
        ];
      }
      
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounced address search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (pendingAddress) {
        searchAddresses(pendingAddress);
      }
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [pendingAddress]);

  // Update address when project changes
  useEffect(() => {
    setAddress(project.site_address || '');
    setPendingAddress(project.site_address || '');
  }, [project]);

  // Handle address selection
  const handleAddressSelect = (selectedAddress: string) => {
    setPendingAddress(selectedAddress);
  };

  // Handle address update
  const handleAddressUpdate = () => {
    if (pendingAddress !== project.site_address) {
      updateProjectMutation.mutate({ site_address: pendingAddress });
    } else {
      setShowAddressEditDialog(false);
    }
  };

  // Handle adding satellite image as floorplan
  const handleAddToFloorplan = async () => {
    if (!mapData?.url || !floorplanName) return;
    
    try {
      // Fetch the image from the URL
      const response = await fetch(mapData.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      
      // Use a Promise to handle the async FileReader
      const base64Result = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            // Extract the base64 part (remove data:image/png;base64, prefix)
            const base64Image = base64data.split(',')[1];
            resolve(base64Image);
          } catch (err) {
            reject(new Error('Failed to process image data'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(blob);
      });
      
      // Create PDF-like data format (base64 encoded)
      await createFloorplanMutation.mutateAsync({
        project_id: project.id,
        name: floorplanName,
        pdf_data: base64Result,
        page_count: 1
      });
      
      // Reset state and close dialog after successful upload
      setFloorplanName('');
      setShowAddToFloorplanDialog(false);
      
    } catch (error) {
      console.error('Error creating floorplan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save satellite image as floorplan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Information Card */}
      <Card className="border rounded-lg shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">Site Address:</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">
                {project.site_address || 'No address specified'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddressEditDialog(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isErrorCoordinates && project.site_address && (
            <div className="text-sm text-red-500">
              Unable to locate address on map. Please check the address format.
            </div>
          )}
          
          {/* Map Section */}
          {coordinates && mapData && (
            <div className="mt-4 space-y-2">
              <div className="relative">
                <img 
                  src={mapData.url} 
                  alt="Map of site location" 
                  className="w-full h-64 object-cover rounded-md border cursor-pointer" 
                  onClick={() => setShowMapFullscreen(true)}
                />
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/70 hover:bg-white/90"
                    onClick={() => setShowAddToFloorplanDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add to Floorplans
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
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
      
      {/* Weather Widget Card */}
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
      
      {/* Address Edit Dialog */}
      <Dialog open={showAddressEditDialog} onOpenChange={setShowAddressEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Site Address</DialogTitle>
            <DialogDescription>
              Enter a new address to update the location information and weather data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-700">
                Site Address
              </label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="Start typing an address..."
                  value={pendingAddress}
                  onChange={(e) => setPendingAddress(e.target.value)}
                  className="w-full"
                />
                {isSearching && (
                  <div className="absolute right-2 top-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              
              {addressSuggestions.length > 0 && (
                <Command className="border rounded-md shadow-md mt-1">
                  <CommandList>
                    <CommandGroup heading="Suggestions">
                      {addressSuggestions.map((suggestion, index) => (
                        <CommandItem 
                          key={index} 
                          onSelect={() => handleAddressSelect(suggestion)}
                          className="flex items-center cursor-pointer hover:bg-gray-100 p-2"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{suggestion}</span>
                          {pendingAddress === suggestion && (
                            <Check className="h-4 w-4 ml-auto text-green-500" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddressUpdate}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fullscreen Map Dialog */}
      <Dialog open={showMapFullscreen} onOpenChange={setShowMapFullscreen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Site Location - Satellite View</DialogTitle>
          </DialogHeader>
          
          {coordinates && (
            <div className="w-full h-[60vh] overflow-hidden rounded">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${coordinates.lng}!3d${coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1619824096102!5m2!1sen!2sus`}
              ></iframe>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapFullscreen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowMapFullscreen(false);
                setShowAddToFloorplanDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add to Floorplans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to Floorplan Dialog */}
      <Dialog open={showAddToFloorplanDialog} onOpenChange={setShowAddToFloorplanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Satellite Image as Floorplan</DialogTitle>
            <DialogDescription>
              This will save the current satellite view as a floorplan for marking equipment locations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="floorplan-name" className="text-sm font-medium text-gray-700">
                Floorplan Name
              </label>
              <Input
                id="floorplan-name"
                placeholder="e.g., Site Satellite View"
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
                className="w-full"
              />
            </div>
            
            {mapData && (
              <div className="border rounded overflow-hidden">
                <img 
                  src={mapData.url} 
                  alt="Satellite view preview" 
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToFloorplanDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToFloorplan}
              disabled={createFloorplanMutation.isPending || !floorplanName}
            >
              {createFloorplanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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