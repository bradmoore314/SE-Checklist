import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { MapPin, Info } from 'lucide-react';

interface UnifiedAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

/**
 * Unified Address Input Component
 * 
 * A single, streamlined address input that works with or without external APIs.
 * Provides intelligent suggestions when possible, graceful manual entry when not.
 */
export default function UnifiedAddressInput({ 
  value, 
  onChange, 
  placeholder = "Enter address", 
  className = "",
  id,
  name,
  disabled = false
}: UnifiedAddressInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasApiAccess, setHasApiAccess] = useState<boolean | null>(null);

  // Debounced search for address suggestions
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'OK' && data.predictions?.length > 0) {
            // Success - show real suggestions
            const addressSuggestions = data.predictions.map((p: any) => p.description);
            setSuggestions(addressSuggestions);
            setShowSuggestions(true);
            setHasApiAccess(true);
          } else {
            // No API access - provide helpful fallback
            setSuggestions([]);
            setShowSuggestions(false);
            setHasApiAccess(false);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setHasApiAccess(false);
        }
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
        setHasApiAccess(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full">
      <Input
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {/* Address suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md border border-gray-200 shadow-lg">
          <Command>
            <CommandList>
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSuggestionSelect(suggestion)}
                    className="flex items-center cursor-pointer hover:bg-gray-100 p-2 text-sm"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{suggestion}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      
      {/* Helpful status message when API isn't available */}
      {hasApiAccess === false && value.length >= 3 && (
        <div className="mt-1 text-xs flex items-start p-2 bg-blue-50 text-blue-700 rounded border border-blue-200">
          <Info className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
          <span>Address suggestions unavailable. You can still enter addresses manually.</span>
        </div>
      )}
    </div>
  );
}