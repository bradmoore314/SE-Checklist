import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/hooks/use-device';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Document, Page } from 'react-pdf';
import '@/lib/pdf-worker';

// Import PDF-specific styles
import '@/styles/pdf.css';

// Type definition for floorplan
interface Floorplan {
  id: number;
  project_id: number;
  name: string;
  pdf_data: string;
  page_count: number;
  created_at: string;
  updated_at: string;
}

// Type definition for marker
interface FloorplanMarker {
  id: number;
  floorplan_id: number;
  page: number;
  marker_type: 'access_point' | 'camera' | 'elevator' | 'intercom' | 'note';
  equipment_id: number;
  position_x: number;
  position_y: number;
  label: string | null;
  created_at: string;
}

// Props for the component
interface FixedFloorplanViewerProps {
  projectId: number;
  onMarkersUpdated?: () => void;
}

// Simplified component version to isolate the issue
const FixedFloorplanViewerTemp: React.FC<FixedFloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [pdfScale, setPdfScale] = useState<number>(1);
  
  // Fetch floorplans for this project
  const { 
    data: floorplans = [], 
    isLoading: isLoadingFloorplans 
  } = useQuery<Floorplan[]>({
    queryKey: ['/api/projects', projectId, 'floorplans'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/floorplans`);
      if (!response.ok) {
        throw new Error('Failed to fetch floorplans');
      }
      return response.json();
    }
  });

  // Loading state
  if (isLoadingFloorplans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading floorplans...</span>
      </div>
    );
  }

  // Render a simplified component structure
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <Card className="p-6 text-center">
        <CardTitle>PDF.js Issue Isolator</CardTitle>
        <CardDescription>
          This is a temporary component to fix the JSX structure issues
        </CardDescription>
        <CardContent>
          <p>Found {floorplans.length} floorplans for this project</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FixedFloorplanViewerTemp;