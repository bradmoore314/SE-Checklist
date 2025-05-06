import { useEffect, useState, useRef } from 'react';

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

interface ResizeObserverOptions {
  box?: 'border-box' | 'content-box' | 'device-pixel-content-box';
}

interface Size {
  width: number;
  height: number;
}

export function useResizeObserver<T extends Element>(
  ref: React.RefObject<T>,
  options?: ResizeObserverOptions
): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    observerRef.current = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (!Array.isArray(entries) || !entries.length) return;
      
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      
      setSize({ width, height });
    });
    
    observerRef.current.observe(element, options);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, options]);

  return size;
}