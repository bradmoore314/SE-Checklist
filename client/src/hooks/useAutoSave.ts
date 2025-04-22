import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for automatically saving form data with debounce
 * 
 * @param saveCallback Function to call when saving data
 * @param debounceMs Debounce time in milliseconds (default: 1000)
 * @param showToast Whether to show toast notifications (default: true)
 * @returns Object with methods to control autosave behavior
 */
export function useAutoSave<T>(
  saveCallback: (data: T) => Promise<any>,
  debounceMs = 1000,
  showToast = true
) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<T | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Save the data immediately, canceling any pending debounced save
   */
  const saveNow = async (data: T) => {
    // Cancel any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      setIsSaving(true);
      await saveCallback(data);
      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Changes saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      
      if (showToast) {
        toast({
          title: "Failed to save changes",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Schedule a save after the debounce period
   * If called multiple times, only the last call will trigger a save
   */
  const scheduleSave = (data: T) => {
    // Store the latest data
    latestDataRef.current = data;

    // Cancel any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule a new save
    timeoutRef.current = setTimeout(() => {
      if (latestDataRef.current) {
        saveNow(latestDataRef.current);
      }
    }, debounceMs);
  };

  /**
   * Cancel any pending save
   */
  const cancelPendingSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    isSaving,
    lastSaved,
    saveNow,
    scheduleSave,
    cancelPendingSave,
  };
}