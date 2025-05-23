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
        else if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST' || 
                 data.status === 'FALLBACK' || data.status === 'ERROR') {
          // API access issues - show error message
          console.error('Places API error:', data.error_message || data.status);
          setAddressSuggestions([]);
          setAddressApiStatus({
            status: 'unauthorized',
            message: data.error_message || 'Google Maps API access denied. Please check API key permissions.'
          });
        }
        else if (data.status === 'ZERO_RESULTS') {
          // No matching addresses found - this is a normal case
          console.log('No matching addresses found for query:', query);
          setAddressSuggestions([]);
          setAddressApiStatus({ status: 'idle' });
        }
        else {
          // No suggestions found - other case
          console.log('No address suggestions found');
          setAddressSuggestions([]);
          setAddressApiStatus({ status: 'idle' });
        }
      } else {
        console.warn('Place autocomplete API request failed:', response.status);
        setAddressSuggestions([]);
        setAddressApiStatus({
          status: 'error',
          message: `Request failed with status: ${response.status}`
        });
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setAddressApiStatus({
        status: 'error',
        message: (error as Error).message || 'Unknown error occurred'
      });
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

  // Handle adding satellite image or custom uploaded file as floorplan
  const handleAddToFloorplan = async () => {
    if ((!mapData?.url && !customFloorplanData) || !floorplanName) return;
    
    try {
      let base64Result;
      
      // Handle based on source - either satellite image or custom upload
      if (customFloorplanData) {
        // Custom uploaded file - already processed to base64
        base64Result = customFloorplanData;
        
        // Create success message with file type
        const successMessage = customFloorplanType 
          ? `${customFloorplanType.split('/')[1].toUpperCase()} file saved as floorplan.`
          : 'File saved as floorplan.';
            
        // Create floorplan with the uploaded data
        await createFloorplanMutation.mutateAsync({
          project_id: project.id,
          name: floorplanName,
          pdf_data: base64Result,
          page_count: 1
        });
        
        // Show success toast with specific message
        toast({
          title: 'Floorplan Created',
          description: successMessage,
        });
      } 
      else if (mapData?.url) {
        // Satellite image - need to fetch and process
        const response = await fetch(mapData.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // First convert the image to base64 for processing
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const base64data = reader.result as string;
              resolve(base64data);
            } catch (err) {
              reject(new Error('Failed to process image data'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsDataURL(blob);
        });
        
        // Create an image element to get dimensions
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image for processing'));
          img.src = imageBase64;
        });
        
        // Import jsPDF dynamically
        const { jsPDF } = await import('jspdf');
        
        // Create a new PDF with the image dimensions (converted from px to mm)
        // Use a 1:1 ratio for better quality
        const pdfWidth = img.width * 0.264583; // convert pixels to mm (1 px = 0.264583 mm)
        const pdfHeight = img.height * 0.264583;
        
        // Create PDF document
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        
        // Add the image to the PDF
        pdf.addImage(
          imageBase64,
          'PNG',
          0,
          0,
          pdfWidth,
          pdfHeight
        );
        
        // Convert PDF to base64
        base64Result = pdf.output('datauristring').split(',')[1];
        
        // Create floorplan with the satellite image as PDF
        await createFloorplanMutation.mutateAsync({
          project_id: project.id,
          name: floorplanName,
          pdf_data: base64Result,
          page_count: 1
        });
        
        // Show success toast for satellite image
        toast({
          title: 'Floorplan Created',
          description: 'Satellite image has been saved as a floorplan.',
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
          
          {/* Map Section - Mobile Responsive */}
          {coordinates && mapData && (
            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={mapData.url} 
                  alt="Map of site location" 
                  className="w-full h-full object-cover rounded-md border cursor-pointer" 
                  onClick={() => setShowMapFullscreen(true)}
                />
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
      
      {/* Address Edit Dialog - Mobile Responsive */}
      <Dialog open={showAddressEditDialog} onOpenChange={setShowAddressEditDialog}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Update Site Address</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter a new address to update the location information and weather data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="address" className="text-xs sm:text-sm font-medium text-gray-700">
                Site Address
              </label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="Start typing an address..."
                  value={pendingAddress}
                  onChange={(e) => setPendingAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10"
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* API Status Information - Mobile Responsive */}
              {addressApiStatus.status === 'unauthorized' && (
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-start p-2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">API Authentication Required</p>
                    <p className="text-[10px] sm:text-xs">{addressApiStatus.message || 'Google Places API needs proper authentication for address suggestions.'}</p>
                  </div>
                </div>
              )}
              
              {addressApiStatus.status === 'error' && (
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-start p-2 bg-red-50 text-red-700 rounded border border-red-200">
                  <AlertOctagon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error retrieving address suggestions</p>
                    <p className="text-[10px] sm:text-xs">{addressApiStatus.message || 'Please try again later'}</p>
                  </div>
                </div>
              )}
              
              {addressSuggestions.length > 0 && (
                <Command className="border rounded-md shadow-md mt-1">
                  <CommandList>
                    <CommandGroup heading="Suggestions" className="text-xs sm:text-sm">
                      {addressSuggestions.map((suggestion, index) => (
                        <CommandItem 
                          key={index} 
                          onSelect={() => handleAddressSelect(suggestion)}
                          className="flex items-center cursor-pointer hover:bg-gray-100 p-1 sm:p-2 text-xs sm:text-sm"
                        >
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500" />
                          <span className="line-clamp-2">{suggestion}</span>
                          {pendingAddress === suggestion && (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 ml-auto text-green-500 flex-shrink-0" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2 sm:mt-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-9"
              onClick={() => setShowAddressEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-9"
              onClick={handleAddressUpdate}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fullscreen Map Dialog - Mobile Responsive */}
      <Dialog open={showMapFullscreen} onOpenChange={setShowMapFullscreen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Site Location - Satellite View</DialogTitle>
          </DialogHeader>
          
          {coordinates && (
            <div className="w-full h-[40vh] sm:h-[60vh] overflow-hidden rounded">
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
                setShowMapFullscreen(false);
                setShowAddToFloorplanDialog(true);
              }}
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add to Floorplans
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
                  {mapData && (
                    <div className="border rounded overflow-hidden">
                      <img 
                        src={mapData.url} 
                        alt="Satellite view preview" 
                        className="w-full h-auto"
                      />
                      <div className="p-2 bg-gray-50 text-[10px] sm:text-xs text-gray-500">
                        Satellite image will be saved as a floorplan for this location
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
                       (!mapData && !customFloorplanData)}
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