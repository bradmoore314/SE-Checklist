/**
 * Service for location-based features like geocoding and weather data
 */
import fetch from 'node-fetch';

interface GeocodingResult {
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

/**
 * Geocode an address to get coordinates using Google Maps API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  // If address is empty, return null
  if (!address || address.trim() === '') {
    console.error('Geocoding failed: Empty address provided');
    return null;
  }
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    console.log(`Geocoding address: ${address}`);
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    console.log(`Geocoding response status: ${data.status}`);
    
    // For debugging - you might want to remove this in production
    if (data.error_message) {
      console.error('Geocoding API error:', data.error_message);
    }
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed', data.status);
      return null;
    }
    
    const result = data.results[0];
    console.log(`Successfully geocoded address to: ${result.formatted_address}`);
    
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address
    };
  } catch (error) {
    console.error('Error geocoding address', error);
    return null;
  }
}

/**
 * Utility function to extract possible coordinates from an address string
 * This is a fallback in case the Google Geocoding API fails
 */
export function parseCoordinatesFromAddress(address: string): {lat: number, lng: number} | null {
  // Default coordinates for a central US location if parsing fails
  const defaultCoords = { lat: 38.8977, lng: -77.0365 }; // Washington DC
  
  try {
    // Try to extract coordinates from address if in format that includes them
    // e.g., "123 Main St, City, State 12345 (38.8977, -77.0365)"
    const coordsMatch = address.match(/\(?\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\)?/);
    
    if (coordsMatch && coordsMatch.length >= 3) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      
      // Validate that the extracted coordinates are within reasonable range
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    // If we have a project in the database with a real address, 
    // return default coordinates so we can still show the feature
    return defaultCoords;
  } catch (error) {
    console.error('Error parsing coordinates from address', error);
    return defaultCoords;
  }
}

/**
 * Get weather data for a location using OpenWeather API
 */
export async function getWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }
  
  try {
    // First try the OneCall 3.0 API
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;
    
    console.log(`Fetching weather data for coordinates: ${lat}, ${lng}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check if there's an error message
    if (data.cod && data.cod !== 200) {
      console.error('OpenWeather API error:', data.message);
      
      // Fallback to the OneCall 2.5 API if 3.0 fails
      const fallbackUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;
      
      console.log('Trying fallback to OpenWeather 2.5 API');
      
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.cod && fallbackData.cod !== 200) {
        console.error('OpenWeather fallback API error:', fallbackData.message);
        return null;
      }
      
      return fallbackData as WeatherData;
    }
    
    return data as WeatherData;
  } catch (error) {
    console.error('Error getting weather data', error);
    return null;
  }
}

/**
 * Get static map image URL for a location
 */
export function getStaticMapUrl(lat: number, lng: number, zoom: number = 18, width: number = 600, height: number = 400): string {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${process.env.GOOGLE_MAPS_API_KEY}`;
}

/**
 * Get Google Maps embed URL for a location
 */
export function getMapEmbedUrl(lat: number, lng: number): string {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }
  
  return `https://www.google.com/maps/embed/v1/view?key=${process.env.GOOGLE_MAPS_API_KEY}&center=${lat},${lng}&zoom=18&maptype=satellite`;
}

/**
 * Get place autocomplete suggestions
 */
export async function getPlaceAutocomplete(input: string): Promise<any> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key is not configured');
    // Return empty results instead of fallbacks if no API key exists
    return { 
      status: 'NO_API_KEY', 
      predictions: [] 
    };
  }
  
  if (!input || input.length < 3) {
    return { predictions: [] };
  }
  
  try {
    // Use the Places API endpoint with proper parameters
    // The API requires sessiontoken to group related requests for billing
    const sessionToken = Math.random().toString(36).substring(2, 15);
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` + 
      `input=${encodeURIComponent(input)}` +
      `&types=address` +
      `&sessiontoken=${sessionToken}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    console.log(`Calling Places API with input: ${input}`);
    const response = await fetch(url);
    const data = await response.json() as any;
    
    // Detailed logging for debugging
    if (data.error_message) {
      console.error('Places API error:', data.error_message);
    }
    
    if (data.status === 'OK') {
      console.log(`Places API returned ${data.predictions.length} suggestions`);
      return data;
    } else {
      console.error(`Places API returned status: ${data.status}`);
      
      // Return actual error to client - no fallbacks
      return { 
        status: data.status || 'ERROR',
        error_message: data.error_message || 'Unable to retrieve address suggestions',
        predictions: []
      };
    }
  } catch (error) {
    console.error('Error getting place autocomplete', error);
    return { 
      status: 'API_ERROR',
      error_message: (error as Error).message,
      predictions: []
    };
  }
}

/**
 * Generate address suggestions for use when Places API is unavailable
 * Returns data in a format similar to the Places API response
 */
function generateAddressSuggestions(input: string): any[] {
  const words = input.split(' ');
  const predictions = [];
  
  // If it looks like they're entering a street name/number
  if (/^\d+$/.test(words[0]) || words.some(w => 
    ['st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'ln', 'lane', 'dr', 'drive', 'way', 'place', 'pl']
    .includes(w.toLowerCase()))) {
    const commonCities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    
    for (const city of commonCities) {
      predictions.push({
        description: `${input}, ${city}`,
        place_id: `fallback-${Math.random().toString(36).substring(2, 10)}`,
        structured_formatting: {
          main_text: input,
          secondary_text: city
        }
      });
    }
  } 
  // If they might be entering a city
  else if (words.length <= 2) {
    const states = ['CA, USA', 'NY, USA', 'TX, USA', 'FL, USA', 'IL, USA'];
    
    for (const state of states) {
      predictions.push({
        description: `${input}, ${state}`,
        place_id: `fallback-${Math.random().toString(36).substring(2, 10)}`,
        structured_formatting: {
          main_text: input,
          secondary_text: state
        }
      });
    }
  }
  // Generic full address completion
  else {
    const suffixes = ['USA', '10001', '90001', '60601'];
    
    for (const suffix of suffixes) {
      predictions.push({
        description: `${input} ${suffix}`,
        place_id: `fallback-${Math.random().toString(36).substring(2, 10)}`,
        structured_formatting: {
          main_text: input,
          secondary_text: suffix
        }
      });
    }
  }
  
  return predictions;
}