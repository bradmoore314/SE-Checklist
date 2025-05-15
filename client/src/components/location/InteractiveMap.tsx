import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  lat, 
  lng, 
  zoom = 18, 
  height = '400px', 
  width = '100%',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load the Google Maps JavaScript API
  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps || document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      setScriptLoaded(true);
      return;
    }

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      setMapError("Google Maps API key is not configured");
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initInteractiveMap`;
    script.async = true;
    script.defer = true;
    
    // Define the callback function
    window.initInteractiveMap = () => {
      setScriptLoaded(true);
    };

    // Handle errors
    script.onerror = () => {
      setMapError("Failed to load Google Maps API");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.initInteractiveMap) {
        // @ts-ignore - Cleanup the global function
        window.initInteractiveMap = undefined;
      }
      
      // Only remove the script if it's the one we added
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize the map once the script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    try {
      // Create the map instance
      const mapOptions = {
        center: { lat, lng },
        zoom,
        mapTypeId: 'satellite',
        tilt: 45, // Enable 45-degree imagery where available
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ['satellite', 'hybrid', 'roadmap']
        },
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Add a marker
      new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: "Project Location"
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }
  }, [scriptLoaded, lat, lng, zoom, mapRef]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded border">
          <div className="text-red-500 text-center p-4">
            <p>Error loading map: {mapError}</p>
          </div>
        </div>
      )}

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded border">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      <div 
        ref={mapRef} 
        className="w-full h-full rounded overflow-hidden"
        style={{ display: mapError ? 'none' : 'block' }}
      />
    </div>
  );
};

// Add type definition for the callback
declare global {
  interface Window {
    initInteractiveMap?: () => void;
    google?: {
      maps: any;
    };
  }
}

export default InteractiveMap;