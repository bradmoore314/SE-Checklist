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
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed', data.status);
      return null;
    }
    
    const result = data.results[0];
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
 * Get weather data for a location using OpenWeather API
 */
export async function getWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }
  
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json() as WeatherData;
    
    return data;
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