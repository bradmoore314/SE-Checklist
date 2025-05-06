import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address',
  className = '',
  disabled = false
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch address suggestions
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
          // Extract real address suggestions from Google
          const newSuggestions = data.predictions.map((p: any) => p.description);
          setSuggestions(newSuggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        console.warn('Place autocomplete request failed:', response.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue) {
        searchAddresses(inputValue);
      }
    }, 500); // 500ms debounce
    
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // Handle selection
  const handleSelect = (address: string) => {
    onChange(address);
    setInputValue(address);
    setSuggestions([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (e.target.value.length > 0) {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (inputValue.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full">
          <Command className="rounded-lg border shadow-md mt-1 bg-white">
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading suggestions...</span>
                </div>
              ) : (
                <>
                  {suggestions.length === 0 ? (
                    <CommandEmpty className="p-2 text-sm text-muted-foreground">
                      No suggestions found
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleSelect(suggestion)}
                          className="text-sm cursor-pointer"
                        >
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}