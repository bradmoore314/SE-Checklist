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
      // Enhanced map options for photorealistic 3D tiles
      // Safely access Google Maps API
      const google = window.google;
      if (!google || !google.maps) {
        throw new Error("Google Maps API not loaded");
      }
      
      const mapOptions = {
        center: { lat, lng },
        zoom,
        mapTypeId: 'satellite',
        tilt: 45, // Enable 45-degree imagery where available
        heading: 0, // Initial heading (north)
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ['satellite', 'hybrid', 'roadmap']
        },
        // Enable all controls for full interaction
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        // Enhance default UI for better mobile experience
        gestureHandling: 'greedy', // Allows one-finger pan on mobile
        // Add keyboard shortcuts for accessibility
        keyboardShortcuts: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      
      // Add a marker at the project location
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: "Project Location",
        animation: google.maps.Animation.DROP,
        draggable: false
      });

      // Add info window to show coordinates
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-size:12px">
                    <strong>Project Location</strong><br>
                    Lat: ${lat.toFixed(6)}<br>
                    Lng: ${lng.toFixed(6)}
                  </div>`
      });

      // Show info window when marker is clicked
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Add toggle for tilt
      map.addListener('dblclick', () => {
        const currentTilt = map.getTilt();
        map.setTilt(currentTilt === 0 ? 45 : 0);
      });

      // Listen for map idle to handle map loaded state
      map.addListener('idle', () => {
        setMapLoaded(true);
      });

      // For enhanced 3D experience - using Photorealistic 3D Tiles where available
      map.setOptions({
        mapId: 'aad95e55d454eccc' // Generic Map ID that supports 3D features
      });

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
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading interactive map...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapRef} 
        className="w-full h-full rounded overflow-hidden"
        style={{ display: mapError ? 'none' : 'block' }}
      />
      
      {/* Map controls overlay */}
      {mapLoaded && !mapError && (
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-gray-700 pointer-events-none">
          <div className="flex flex-col gap-1">
            <span>• Double-click: Toggle 45° view</span>
            <span>• Drag: Pan map</span>
            <span>• Scroll: Zoom in/out</span>
            <span>• Ctrl+Drag: Rotate view</span>
            <span>• Click marker: Show coordinates</span>
          </div>
        </div>
      )}
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