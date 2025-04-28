import { createContext, useContext, useState, ReactNode } from 'react';
import { Stream } from '@shared/schema';

type DragContextType = {
  draggedStream: Stream | null;
  setDraggedStream: (stream: Stream | null) => void;
};

const DragContext = createContext<DragContextType | undefined>(undefined);

export function DragContextProvider({ children }: { children: ReactNode }) {
  const [draggedStream, setDraggedStream] = useState<Stream | null>(null);

  return (
    <DragContext.Provider value={{ draggedStream, setDraggedStream }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragContextProvider');
  }
  return context;
}