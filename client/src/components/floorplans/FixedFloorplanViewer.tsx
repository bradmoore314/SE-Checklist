import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDevice } from '@/hooks/use-device';
import { 
  ChevronDown, 
  Loader2, 
  Plus, 
  PlusCircle, 
  X, 
  Edit, 
  Trash, 
  Check, 
  FileUp,
  Download,
  ZoomIn,
  Copy,
  ZoomOut,
  Minimize,
  Info,
  MoreHorizontal
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ButtonGroup } from '@/components/ui/button-group';
import { Document, Page } from 'react-pdf';
// Import worker configuration from dedicated file
import '@/lib/pdf-worker';

// Import PDF-specific styles
import '@/styles/pdf.css';

// Import the equipment-specific modals
import AddAccessPointModal from '@/components/modals/AddAccessPointModal';
import AddCameraModal from '@/components/modals/AddCameraModal';
import AddElevatorModal from '@/components/modals/AddElevatorModal';
import AddIntercomModal from '@/components/modals/AddIntercomModal';

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

// Helper function to get a readable name for a marker type
const getMarkerTypeName = (type: string): string => {
  switch (type) {
    case 'access_point': return 'Access Point';
    case 'camera': return 'Camera';
    case 'elevator': return 'Elevator';
    case 'intercom': return 'Intercom';
    case 'note': return 'Note';
    default: return type;
  }
};

// The component
const FixedFloorplanViewer: React.FC<FixedFloorplanViewerProps> = ({ projectId, onMarkersUpdated }) => {
  // Refs for the container and PDF elements
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<HTMLDivElement>(null);
  
  // Auth context for login
  const { user, bypassAuth } = useAuth();
  const { toast } = useToast();
  
  // Get device-specific data (allows syncing between floorplan markers and device forms)
  const { 
    accessPoints, 
    cameras, 
    elevators, 
    intercoms,
    createAccessPoint,
    createCamera,
    createElevator,
    createIntercom,
  } = useDevice();
  
  // Function to get next marker number for a specific type
  const getNextMarkerNumber = (type: string): number => {
    const typeMarkers = (markers as FloorplanMarker[]).filter(m => m.marker_type === type);
    
    // If no markers of this type exist, start at 1
    if (typeMarkers.length === 0) return 1;
    
    // Find the highest number and increment
    const numbers = typeMarkers.map(m => {
      // Extract number from label if it exists
      if (m.label && /^\d+$/.test(m.label)) {
        return parseInt(m.label, 10);
      }
      return 0;
    });
    
    const maxNumber = Math.max(...numbers);
    return maxNumber + 1;
  };
  
  // Get marker number (index + 1) for a specific marker type
  const getMarkerNumber = (markerId: number): number => {
    const marker = (markers as FloorplanMarker[]).find(m => m.id === markerId);
    if (!marker) return 0;
    
    // For notes, use the label text directly
    if (marker.marker_type === 'note') {
      return 0; // Notes don't get numbers
    }
    
    // Get all markers of the same type
    const typeMarkers = (markers as FloorplanMarker[]).filter(m => m.marker_type === marker.marker_type);
    
    // Sort by creation date
    typeMarkers.sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    // Find index of this marker and use its position for the number
    const index = typeMarkers.findIndex(m => m.id === markerId);
    
    // Return 1-based index
    return index >= 0 ? index + 1 : 1;
  };
  
  // Zoom control functions with safety limits to prevent PDF.js errors
  const MAX_ZOOM = 2.5; // Reduced from 3.0 to prevent PDF.js "sendWithPromise" errors
  const MIN_ZOOM = 0.25;
  
  const zoomIn = () => {
    // Apply a more conservative upper limit to prevent PDF.js from breaking
    // This prevents the "Cannot read properties of null (reading 'sendWithPromise')" error
    setPdfScale(prev => {
      const newScale = prev + 0.1;
      if (newScale > MAX_ZOOM) {
        // Show warning toast when reaching max zoom
        toast({
          title: "Maximum zoom reached",
          description: "You've reached the maximum safe zoom level",
          variant: "default",
        });
        return MAX_ZOOM;
      }
      return newScale;
    });
  };
  
  const zoomOut = () => {
    setPdfScale(prev => Math.max(MIN_ZOOM, prev - 0.1));
  };
  
  const resetZoom = () => {
    setPdfScale(1.0);
  };
  
  // State for floorplan data and selection
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<number | null>(null);
  const [pdfScale, setPdfScale] = useState<number>(1);
  
  // State for upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFloorplanName, setNewFloorplanName] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // State for marker placement
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [markerDialogOpen, setMarkerDialogOpen] = useState<boolean>(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false);
  const [markerType, setMarkerType] = useState<string>('access_point');
  const [markerLabel, setMarkerLabel] = useState<string>('');
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number, y: number } | null>(null);
  
  // State for marker interactions
  const [draggedMarker, setDraggedMarker] = useState<number | null>(null);
  const [resizingMarker, setResizingMarker] = useState<number | null>(null);
  const [initialResizeData, setInitialResizeData] = useState<{
    size: { width: number, height: number };
    mousePos: { x: number, y: number };
  } | null>(null);
  
  // Default marker sizes
  const defaultMarkerSizes: Record<string, number | { width: number, height: number }> = {
    'access_point': 36,
    'camera': 36,
    'elevator': 36,
    'intercom': 36,
    'note': { width: 150, height: 40 }
  };
  
  // State for marker sizes (specifically for resizable notes)
  const [markerSize, setMarkerSize] = useState<Record<number, { width: number, height: number }>>({});
  
  // State for equipment marker scale - this affects all numbered markers (access points, cameras, etc.)
  const [equipmentMarkerScale, setEquipmentMarkerScale] = useState<number>(1.0);
  
  // State for equipment modal
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState<boolean>(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string | null>(null);
  
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
  
  // Check for authentication when the component loads
  useEffect(() => {
    // If no user is found, use bypass authentication in development
    if (!user) {
      console.log('Component loaded without auth, using bypass authentication');
      bypassAuth();
    }
  }, [user, bypassAuth]);

  // Auto-select the first floorplan if none is selected
  useEffect(() => {
    if (floorplans.length > 0 && !selectedFloorplanId) {
      setSelectedFloorplanId(floorplans[0].id);
    }
  }, [floorplans, selectedFloorplanId]);
  
  // Get the selected floorplan object
  const selectedFloorplan = (floorplans as Floorplan[]).find(f => f.id === selectedFloorplanId) || null;
  
  // Fetch markers for the selected floorplan
  const { 
    data: markers = [], 
    isLoading: isLoadingMarkers 
  } = useQuery<FloorplanMarker[]>({
    queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'],
    queryFn: async () => {
      if (!selectedFloorplan) return [];
      
      const response = await apiRequest('GET', `/api/floorplans/${selectedFloorplan.id}/markers`);
      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }
      return response.json();
    },
    enabled: !!selectedFloorplan
  });
  
  // Force the markers to refresh with sequential numbers when markers list changes
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    
    // Wait for DOM to update with new markers
    const timer = setTimeout(() => {
      const markerElements = document.querySelectorAll('[id^="marker-"]');
      
      markerElements.forEach((element) => {
        const markerId = parseInt(element.id.replace('marker-', ''));
        const marker = markers.find(m => m.id === markerId);
        
        if (marker && marker.marker_type !== 'note') {
          // Find position in same-type markers (sorted by creation date)
          const sameTypeMarkers = markers
            .filter(m => m.marker_type === marker.marker_type)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          const position = sameTypeMarkers.findIndex(m => m.id === markerId);
          
          if (position >= 0 && element.textContent !== (position + 1).toString()) {
            element.textContent = (position + 1).toString();
          }
        }
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [markers]);
  
  // The worker is already initialized via the import above
  // No need for additional worker configuration
  
  // Handle floorplan changes
  useEffect(() => {
    if (selectedFloorplan) {
      console.log('Selected floorplan changed:', selectedFloorplan.name);
    }
  }, [selectedFloorplan]);
  
  // Mutation for uploading a floorplan
  const uploadFloorplanMutation = useMutation({
    mutationFn: async (data: { name: string, pdf_data: string, project_id: number, page_count: number }) => {
      const response = await apiRequest('POST', '/api/floorplans', data);
      if (!response.ok) {
        throw new Error('Failed to upload floorplan');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Reset upload form
      setNewFloorplanName('');
      setPdfFile(null);
      setUploadDialogOpen(false);
      
      // Refresh floorplans list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      
      // Select the new floorplan
      setSelectedFloorplanId(data.id);
      
      toast({
        title: "Success",
        description: `Floorplan "${data.name}" uploaded successfully`,
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a floorplan
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      const response = await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
      if (!response.ok) {
        throw new Error('Failed to delete floorplan');
      }
      return response.json();
    },
    onSuccess: () => {
      // Reset selection
      setSelectedFloorplanId(null);
      
      // Refresh floorplans list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'floorplans'] });
      
      toast({
        title: "Success",
        description: "Floorplan deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  });
  
  // Mutation for creating a marker
  const createMarkerMutation = useMutation({
    mutationFn: async (data: {
      floorplan_id: number,
      page: number,
      marker_type: string,
      equipment_id: number,
      position_x: number,
      position_y: number,
      label: string | null
    }) => {
      console.log('Creating marker with data:', data);
      
      // Check for authentication
      if (!user) {
        console.log('No user found, using bypass authentication for development');
        // Use the bypass auth feature for development
        bypassAuth();
      }
      
      // Validate required fields before API call
      if (data.floorplan_id === undefined || data.floorplan_id === null) {
        throw new Error('floorplan_id is required');
      }
      if (data.marker_type === undefined || data.marker_type === null) {
        throw new Error('marker_type is required');
      }
      if (data.equipment_id === undefined || data.equipment_id === null) {
        throw new Error('equipment_id is required');
      }
      if (data.position_x === undefined || data.position_x === null) {
        throw new Error('position_x is required');
      }
      if (data.position_y === undefined || data.position_y === null) {
        throw new Error('position_y is required');
      }
      
      // Additional validation for specific marker types
      if (data.marker_type === 'note' && data.equipment_id !== -1) {
        console.warn('Notes should have equipment_id set to -1, fixing...');
        data.equipment_id = -1;
      }
      
      try {
        const response = await apiRequest('POST', '/api/floorplan-markers', data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Marker creation API error:', { 
            status: response.status, 
            data: errorData,
            sentData: data
          });
          
          // If we get an auth error, try logging in automatically and retry
          if (response.status === 401) {
            console.log('Authentication error, trying to bypass for development');
            bypassAuth();
            // Retry the request
            const retryResponse = await apiRequest('POST', '/api/floorplan-markers', data);
            if (!retryResponse.ok) {
              throw new Error(`API Error after auth retry (${retryResponse.status})`);
            }
            return retryResponse.json();
          }
          
          throw new Error(`API Error (${response.status}): ${errorData?.message || response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Error creating marker:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Marker created successfully:', data);
      
      // Reset marker adding state
      setIsAddingMarker(false);
      setMarkerDialogOpen(false);
      setMarkerLabel('');
      setNewMarkerPosition(null);
      
      // Refresh markers list
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      
      // Notify parent component
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      toast({
        title: "Success",
        description: "Marker added successfully",
      });
    },
    onError: (error) => {
      console.error('Marker creation error:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add marker',
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a marker
  const deleteMarkerMutation = useMutation({
    mutationFn: async (markerId: number) => {
      const response = await apiRequest('DELETE', `/api/floorplan-markers/${markerId}`);
      if (!response.ok) {
        throw new Error('Failed to delete marker');
      }
      return response.json();
    },
    onSuccess: () => {
      // Refresh markers list
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      
      // Notify parent component
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      toast({
        title: "Success",
        description: "Marker deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete marker',
        variant: "destructive",
      });
    }
  });
  
  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  // Handle floorplan upload
  const handleUploadFloorplan = async () => {
    if (!newFloorplanName || !pdfFile) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Make sure we're uploading a PDF file
    if (!pdfFile.type.includes('pdf')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file (application/pdf)",
        variant: "destructive",
      });
      return;
    }

    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      
      // Extract just the base64 data part
      const base64Content = base64Data.split(',')[1];
      
      // Using a default page count of 1, which will be updated after the PDF is loaded
      await uploadFloorplanMutation.mutateAsync({
        name: newFloorplanName,
        pdf_data: base64Content,
        project_id: projectId,
        page_count: 1 // Default value, will be updated when the PDF is loaded
      });
    };
    reader.readAsDataURL(pdfFile);
  };
  
  // Handle floorplan selection change
  const handleFloorplanChange = (floorplanId: string) => {
    setSelectedFloorplanId(parseInt(floorplanId, 10));
  };
  
  // Handle PDF document loaded event
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF document loaded successfully with ${numPages} pages`);
    
    // Update the page count in our local state if needed
    if (selectedFloorplan && selectedFloorplan.page_count !== numPages) {
      console.log(`Updating page count from ${selectedFloorplan.page_count} to ${numPages}`);
    }
  };
  
  // Handle PDF document load error
  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF document load error:', error);
    toast({
      title: "Error Loading PDF",
      description: `${error.message}. Check console for details.`,
      variant: "destructive",
    });
  };
  
  // Handle marker placement on PDF
  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !pdfDocumentRef.current) return;
    
    // Get the PDF container's position and dimensions
    const rect = pdfDocumentRef.current.getBoundingClientRect();
    
    // Calculate the position in PDF coordinates
    // We divide by pdfScale to convert screen coordinates back to PDF coordinates
    const x = Math.round((e.clientX - rect.left) / pdfScale);
    const y = Math.round((e.clientY - rect.top) / pdfScale);
    
    console.log(`Clicked on PDF at (${x}, ${y}) with scale ${pdfScale}`);
    
    // Store the PDF-space coordinates
    setNewMarkerPosition({ x, y });
    
    if (markerType === 'note') {
      setNoteDialogOpen(true);
    } else {
      if (['access_point', 'camera', 'elevator', 'intercom'].includes(markerType)) {
        setSelectedEquipmentType(markerType);
        setShowAddEquipmentModal(true);
      } else {
        // For other marker types or if we want to just add a simple marker
        setMarkerDialogOpen(true);
      }
    }
  };
  
  // Handle opening the equipment modal to add a marker from scratch
  const handleAddEquipment = (type: string) => {
    setMarkerType(type);
    setIsAddingMarker(true);
  };
  
  // Handle starting the drag of a marker
  const handleMarkerMouseDown = (
    e: MouseEvent | React.MouseEvent<HTMLDivElement>, 
    markerId: number, 
    isResizeHandle = false
  ) => {
    console.log("MOUSE DOWN START", markerId, isResizeHandle);
    
    // Ensure event propagation is stopped
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }
    
    // Prevent default behavior like text selection
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    
    if (isResizeHandle) {
      // We're resizing a marker
      setResizingMarker(markerId);
      
      // Get the current size of the marker
      const marker = markers.find(m => m.id === markerId);
      if (marker) {
        const size = markerSize[markerId] || 
          (typeof defaultMarkerSizes[marker.marker_type] === 'object'
            ? defaultMarkerSizes[marker.marker_type] as { width: number, height: number }
            : { width: defaultMarkerSizes[marker.marker_type] as number, height: defaultMarkerSizes[marker.marker_type] as number }
          );
        
        // Get mouse position from appropriate event
        const clientX = 'clientX' in e ? e.clientX : 0;
        const clientY = 'clientY' in e ? e.clientY : 0;
        
        setInitialResizeData({
          size,
          mousePos: { x: clientX, y: clientY }
        });
      }
      
      // Add resize event listeners
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
    } else {
      // New simplified drag implementation
      console.log(`Started dragging marker ${markerId}`);
      
      // Get the marker data
      const marker = markers.find(m => m.id === markerId);
      if (!marker) {
        console.error('Marker not found:', markerId);
        return;
      }
      
      // Store original coordinates for the drag operation
      const originalX = marker.position_x;
      const originalY = marker.position_y;
      
      // Track initial mouse position
      const initialMouseX = 'clientX' in e ? e.clientX : 0;
      const initialMouseY = 'clientY' in e ? e.clientY : 0;
      
      console.log('Initial marker position:', { x: originalX, y: originalY });
      console.log('Initial mouse position:', { x: initialMouseX, y: initialMouseY });
      
      // Set the dragged marker ID in state
      setDraggedMarker(markerId);
      
      // Function to handle mouse move during drag
      const handleDrag = (moveEvent: MouseEvent) => {
        // Calculate how far the mouse has moved since the drag started
        const deltaX = moveEvent.clientX - initialMouseX;
        const deltaY = moveEvent.clientY - initialMouseY;
        
        // Calculate the new position, adjusting for scale
        const newX = originalX + (deltaX / pdfScale);
        const newY = originalY + (deltaY / pdfScale);
        
        console.log('Dragging to:', { newX, newY, deltaX, deltaY });
        
        // Apply the position visually
        const markerEl = document.getElementById(`marker-${markerId}`);
        if (markerEl) {
          markerEl.style.left = `${newX}px`;
          markerEl.style.top = `${newY}px`;
        }
      };
      
      // Function to handle the end of the drag
      const handleDragEnd = (upEvent: MouseEvent) => {
        console.log('Drag ended');
        
        // Calculate final position
        const deltaX = upEvent.clientX - initialMouseX;
        const deltaY = upEvent.clientY - initialMouseY;
        
        const finalX = Math.floor(originalX + (deltaX / pdfScale));
        const finalY = Math.floor(originalY + (deltaY / pdfScale));
        
        console.log('Final marker position:', { x: finalX, y: finalY });
        
        // Update the marker position in the database
        updateMarkerPosition(markerId, finalX, finalY)
          .then(() => console.log('Updated marker position in database'))
          .catch(error => console.error('Failed to update marker position:', error));
        
        // Clean up
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        setDraggedMarker(null);
      };
      
      // Add the event listeners
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    }
  };
  
  // Handle dragging a marker
  function handleDragMouseMove(e: MouseEvent) {
    if (draggedMarker === null) {
      console.log('No dragged marker in handleDragMouseMove');
      return;
    }
    
    if (!pdfDocumentRef.current) {
      console.log('No PDF document reference in handleDragMouseMove');
      return;
    }
    
    // Prevent default behavior to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();
    
    const marker = markers.find(m => m.id === draggedMarker);
    if (!marker) {
      console.log('Marker not found in markers array during drag move');
      return;
    }
    
    // Get PDF container position
    const rect = pdfDocumentRef.current.getBoundingClientRect();
    
    // Calculate position in PDF coordinates, adjusting for scale
    // We divide by pdfScale to convert from screen coordinates to PDF coordinates
    const x = Math.floor((e.clientX - rect.left) / pdfScale);
    const y = Math.floor((e.clientY - rect.top) / pdfScale);
    
    // Make sure the position is within bounds of the PDF
    if (x < 0 || y < 0 || !Number.isInteger(x) || !Number.isInteger(y)) {
      console.log('Position out of bounds during drag move:', { x, y });
      return;
    }
    
    console.log(`Dragging marker to (${x}, ${y}) at scale ${pdfScale}`);
    
    // Update marker position visually - use direct DOM manipulation for smoother dragging
    const markerElement = document.getElementById(`marker-${draggedMarker}`);
    if (markerElement) {
      markerElement.style.left = `${x}px`;
      markerElement.style.top = `${y}px`;
    } else {
      console.log(`Could not find marker element with ID: marker-${draggedMarker}`);
    }
  }
  
  // Handle releasing a marker after dragging
  function handleDragMouseUp(e: MouseEvent) {
    console.log('Drag ended - handleDragMouseUp called');
    
    // Prevent default behavior 
    e.preventDefault();
    e.stopPropagation();
    
    // Always clean up event listeners first to prevent memory leaks
    document.removeEventListener('mousemove', handleDragMouseMove);
    document.removeEventListener('mouseup', handleDragMouseUp);
    
    // If we don't have a dragged marker or PDF ref, exit early
    if (draggedMarker === null || !pdfDocumentRef.current) {
      console.log('No dragged marker or PDF ref - exiting early');
      setDraggedMarker(null);
      return;
    }
    
    const marker = markers.find(m => m.id === draggedMarker);
    if (!marker) {
      console.log('Marker not found in markers array - exiting');
      setDraggedMarker(null);
      return;
    }
    
    // Get PDF container position
    const rect = pdfDocumentRef.current.getBoundingClientRect();
    console.log('PDF container rect:', rect);
    
    // Calculate position in PDF coordinates, accounting for scale
    const x = Math.floor((e.clientX - rect.left) / pdfScale);
    const y = Math.floor((e.clientY - rect.top) / pdfScale);
    console.log('Calculated coordinates:', { x, y, clientX: e.clientX, clientY: e.clientY, scale: pdfScale });
    
    // Store the marker ID before resetting state
    const markerId = draggedMarker;
    
    // Reset dragged marker state immediately to avoid UI issues
    setDraggedMarker(null);
    
    // Make sure the position is within bounds of the PDF and valid
    if (x >= 0 && y >= 0 && Number.isInteger(x) && Number.isInteger(y)) {
      // Log the update
      console.log(`Updating marker ${markerId} position to:`, { x, y });
      
      // Show a toast to indicate the update is happening
      toast({
        title: "Updating marker position",
        description: "Saving new position to database",
      });
      
      try {
        // Update marker position in database with integer values
        updateMarkerPosition(markerId, x, y)
          .then(() => {
            console.log('Marker position update successful');
          })
          .catch(err => {
            console.error("Error in marker position update:", err);
          });
      } catch (error) {
        console.error('Error calling updateMarkerPosition:', error);
      }
    } else {
      console.log('Invalid position - outside PDF bounds');
      toast({
        title: "Invalid position",
        description: "Marker position must be within the floorplan boundaries",
        variant: "destructive"
      });
    }
  }
  
  // Handle resizing a marker (for notes)
  function handleResizeMouseMove(e: MouseEvent) {
    if (resizingMarker === null || !initialResizeData) return;
    
    const marker = markers.find(m => m.id === resizingMarker);
    if (!marker || marker.marker_type !== 'note') return;
    
    const dx = e.clientX - initialResizeData.mousePos.x;
    const dy = e.clientY - initialResizeData.mousePos.y;
    
    const newWidth = Math.max(100, initialResizeData.size.width + dx);
    const newHeight = Math.max(30, initialResizeData.size.height + dy);
    
    // Update marker size visually
    const markerElement = document.getElementById(`marker-${resizingMarker}`);
    if (markerElement) {
      markerElement.style.width = `${newWidth}px`;
      markerElement.style.height = `${newHeight}px`;
    }
  }
  
  // Handle releasing a marker after resizing
  function handleResizeMouseUp(e: MouseEvent) {
    if (resizingMarker === null || !initialResizeData) {
      setResizingMarker(null);
      setInitialResizeData(null);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      return;
    }
    
    const marker = markers.find(m => m.id === resizingMarker);
    if (!marker || marker.marker_type !== 'note') {
      setResizingMarker(null);
      setInitialResizeData(null);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      return;
    }
    
    const dx = e.clientX - initialResizeData.mousePos.x;
    const dy = e.clientY - initialResizeData.mousePos.y;
    
    const newWidth = Math.max(100, initialResizeData.size.width + dx);
    const newHeight = Math.max(30, initialResizeData.size.height + dy);
    
    // Save the new size in state
    setMarkerSize({
      ...markerSize,
      [resizingMarker]: { width: newWidth, height: newHeight }
    });
    
    // We could save the size to the database here, but currently the schema doesn't support that
    // Instead, we're just keeping it in component state
    
    setResizingMarker(null);
    setInitialResizeData(null);
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  }
  
  // Update marker position in the database
  const updateMarkerPosition = async (markerId: number, x: number, y: number) => {
    try {
      // Make sure we have authentication
      await bypassAuth();
      
      // Find the marker in the current markers list
      const marker = markers.find(m => m.id === markerId);
      if (!marker) {
        console.error('Cannot update position: Marker not found:', markerId);
        return;
      }
      
      // Log the update
      console.log(`Updating marker ${markerId} position to:`, { x, y });
      
      // Use our API request helper function that handles auth
      const response = await apiRequest('PUT', `/api/floorplan-markers/${markerId}`, {
        floorplan_id: marker.floorplan_id,
        page: marker.page,
        marker_type: marker.marker_type,
        equipment_id: marker.equipment_id,
        position_x: x,
        position_y: y,
        label: marker.label
      });
      
      if (!response.ok) {
        throw new Error(`API Error (${response.status})`);
      }
      
      // Refresh markers list
      queryClient.invalidateQueries({ queryKey: ['/api/floorplans', selectedFloorplan?.id, 'markers'] });
      
      // Success toast
      toast({
        title: "Position updated",
        description: "Marker position saved successfully", 
      });
      
      // Call onMarkersUpdated if provided
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
    } catch (error) {
      console.error('Error updating marker position:', error);
      toast({
        title: "Error updating position",
        description: error instanceof Error ? error.message : "Failed to update marker position.",
        variant: "destructive",
      });
    }
  };
  
  // Create a new marker
  const handleCreateMarker = async () => {
    if (!selectedFloorplan || !newMarkerPosition) {
      console.error('Missing required data for creating marker');
      return;
    }
    
    // Get auto-generated label if none provided
    let label = markerLabel;
    if (!label && markerType !== 'note') {
      // Auto-number the marker based on type
      label = getNextMarkerNumber(markerType).toString();
    }
    
    // Default equipment ID for non-note markers
    const defaultEquipmentId = -1;
    
    // Create the marker with integer positions 
    await createMarkerMutation.mutateAsync({
      floorplan_id: selectedFloorplan.id,
      page: 1, // Default to first page for now
      marker_type: markerType,
      equipment_id: defaultEquipmentId,
      position_x: Math.floor(newMarkerPosition.x),
      position_y: Math.floor(newMarkerPosition.y),
      label
    });
  };

  // Create a new marker with associated equipment
  const handleCreateMarkerWithEquipment = async (equipmentId: number) => {
    if (!selectedFloorplan || !newMarkerPosition) {
      console.error('Missing required data for creating marker');
      toast({
        title: "Error",
        description: "Missing floorplan or position data required for marker creation",
        variant: "destructive",
      });
      return;
    }
    
    if (!equipmentId) {
      console.error('Invalid equipment ID received:', equipmentId);
      toast({
        title: "Error",
        description: "Invalid equipment ID. Access point creation may have failed.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Calculate the next sequential number for this marker type
      let sequentialNumber = getNextMarkerNumber(selectedEquipmentType || 'access_point');
      
      // Use the sequential number as the label
      const label = sequentialNumber.toString();
      
      console.log(`Creating ${selectedEquipmentType} marker with equipment ID ${equipmentId} and sequential number: ${sequentialNumber}`);
      
      // Create the marker with integer positions
      await createMarkerMutation.mutateAsync({
        floorplan_id: selectedFloorplan.id,
        page: 1, // Default to first page for now
        marker_type: selectedEquipmentType!,
        equipment_id: equipmentId,
        position_x: Math.floor(newMarkerPosition.x),
        position_y: Math.floor(newMarkerPosition.y),
        label
      });
      
      toast({
        title: "Success",
        description: `Added ${selectedEquipmentType} marker with ID #${label}`,
      });
      
      // Close the equipment modal
      setShowAddEquipmentModal(false);
      setSelectedEquipmentType(null);
    } catch (error) {
      console.error('Error creating marker:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create marker on floorplan",
        variant: "destructive",
      });
    }
  };
  
  // Get marker color based on type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'access_point':
        // Changed from teal to red as requested
        return '#dc2626';
      case 'camera':
        // Blue
        return '#3b82f6';
      case 'elevator':
        // Purple
        return '#a855f7';
      case 'intercom':
        // Pink
        return '#ec4899';
      case 'note':
        // Amber/Yellow background with red border
        return '#f59e0b';
      default:
        // Gray fallback
        return '#6b7280';
    }
  };

  // Get text color for marker (white for most, red for notes)
  const getMarkerTextColor = (type: string) => {
    switch (type) {
      case 'note':
        // Red text for notes
        return '#dc2626';
      default:
        // White text for others
        return '#ffffff';
    }
  };
  
  // Get border color for marker (same as background, except for notes)
  const getMarkerBorderColor = (type: string) => {
    if (type === 'note') {
      // Red border for notes
      return '#dc2626';
    }
    
    // Same as background for others
    return getMarkerColor(type);
  };
  
  // Function to export floorplan with markers as PDF
  const exportFloorplanWithMarkers = async () => {
    if (!selectedFloorplan || !containerRef.current) {
      toast({
        title: "Error",
        description: "No floorplan selected or container not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create a temporary container for the export
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '-9999px';
      document.body.appendChild(exportContainer);
      
      // Clone the PDF container
      const pdfContainer = containerRef.current.querySelector('.pdf-container')?.cloneNode(true) as HTMLElement;
      if (!pdfContainer) {
        throw new Error('PDF container not found');
      }
      
      // Reset styles for clean export
      pdfContainer.style.transform = 'none';
      pdfContainer.style.width = 'auto';
      pdfContainer.style.height = 'auto';
      pdfContainer.style.position = 'relative';
      pdfContainer.style.overflow = 'visible';
      
      // Add it to the export container
      exportContainer.appendChild(pdfContainer);
      
      // Force recalculation of layout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas to capture the container
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      // Create a PDF with the canvas contents
      const imgData = canvas.toDataURL('image/png');
      
      // Use the PDF's original dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Clean up the temporary container
      document.body.removeChild(exportContainer);
      
      // Download the PDF
      const filename = `${selectedFloorplan.name}_with_markers.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Export Successful",
        description: `Exported as ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting floorplan with markers:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isLoadingFloorplans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading floorplans...</span>
      </div>
    );
  }
  
  // Render the component
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {floorplans.length === 0 ? (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>No Floorplans Found</CardTitle>
            <CardDescription>
              Upload a floorplan PDF to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setUploadDialogOpen(true)}
              className="mt-4"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload Floorplan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* Floorplan selection and controls */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Floorplan Controls</CardTitle>
                  <CardDescription>
                    Select a floorplan and manage markers
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={selectedFloorplanId?.toString() || ''}
                    onValueChange={handleFloorplanChange}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select a floorplan" />
                    </SelectTrigger>
                    <SelectContent>
                      {floorplans.map((floorplan: Floorplan) => (
                        <SelectItem 
                          key={floorplan.id} 
                          value={floorplan.id.toString()}
                        >
                          {floorplan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => setUploadDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  
                  {selectedFloorplan && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={exportFloorplanWithMarkers}
                          className="flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export with Markers
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${selectedFloorplan.name}"?`)) {
                              deleteFloorplanMutation.mutate(selectedFloorplan.id);
                            }
                          }}
                          className="text-red-500 flex items-center"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete Floorplan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              {/* Marker counts and types */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex justify-between items-center">
                        <span>Access Points</span>
                        <Badge variant="secondary" className="ml-2">
                          {markers.filter((m: FloorplanMarker) => m.marker_type === 'access_point').length}
                        </Badge>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Door readers, credentials
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex justify-between items-center">
                        <span>Cameras</span>
                        <Badge variant="secondary" className="ml-2">
                          {markers.filter((m: FloorplanMarker) => m.marker_type === 'camera').length}
                        </Badge>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Security cameras, video surveillance
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex justify-between items-center">
                        <span>Elevators</span>
                        <Badge variant="secondary" className="ml-2">
                          {markers.filter((m: FloorplanMarker) => m.marker_type === 'elevator').length}
                        </Badge>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Elevator access control
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex justify-between items-center">
                        <span>Intercoms</span>
                        <Badge variant="secondary" className="ml-2">
                          {markers.filter((m: FloorplanMarker) => m.marker_type === 'intercom').length}
                        </Badge>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Entry phones, visitor stations
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex justify-between items-center">
                        <span>Notes</span>
                        <Badge variant="secondary" className="ml-2">
                          {markers.filter((m: FloorplanMarker) => m.marker_type === 'note').length}
                        </Badge>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Text notes and annotations
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Marker controls */}
              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                <div>
                  <ButtonGroup variant="outline" size="sm">
                    <Button 
                      variant={isAddingMarker && markerType === 'access_point' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setMarkerType('access_point');
                        setIsAddingMarker(true);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Add Access Point
                    </Button>
                    
                    <Button 
                      variant={isAddingMarker && markerType === 'camera' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setMarkerType('camera');
                        setIsAddingMarker(true);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Add Camera
                    </Button>
                    
                    <Button 
                      variant={isAddingMarker && markerType === 'elevator' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setMarkerType('elevator');
                        setIsAddingMarker(true);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      Add Elevator
                    </Button>
                    
                    <Button 
                      variant={isAddingMarker && markerType === 'intercom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setMarkerType('intercom');
                        setIsAddingMarker(true);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                      Add Intercom
                    </Button>
                    
                    <Button 
                      variant={isAddingMarker && markerType === 'note' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setMarkerType('note');
                        setIsAddingMarker(true);
                      }}
                      className="flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-amber-500 border border-red-500 mr-2"></div>
                      Add Note
                    </Button>
                  </ButtonGroup>
                  
                  {isAddingMarker && (
                    <div className="mt-2 flex items-center">
                      <Badge variant="outline" className="bg-amber-50">
                        Click on the floorplan to place a {getMarkerTypeName(markerType)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsAddingMarker(false)}
                        className="h-6 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <ButtonGroup variant="outline" size="sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomIn}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom In</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomOut}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Zoom Out</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetZoom}
                          >
                            <Minimize className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset Zoom</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </ButtonGroup>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* PDF viewer */}
          {selectedFloorplan ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div 
                  className="overflow-auto p-4 relative min-h-[600px] pdf-container"
                  onClick={handlePdfClick}
                  style={{ 
                    cursor: isAddingMarker ? 'crosshair' : 'default' 
                  }}
                >
                  <div 
                    ref={pdfDocumentRef}
                    style={{
                      transform: `scale(${pdfScale})`,
                      transformOrigin: 'top left',
                      position: 'relative',
                      background: 'white'
                    }}
                  >
                    {selectedFloorplan?.pdf_data ? (
                      <Document
                        file={`data:application/pdf;base64,${selectedFloorplan.pdf_data}`}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        onLoadError={handleDocumentLoadError}
                        className="react-pdf__Document bg-white"
                        options={{
                          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                          cMapPacked: true,
                          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
                          // Add these options to improve stability and prevent sendWithPromise errors
                          isEvalSupported: false,
                          disableStream: true,
                          disableAutoFetch: true
                        }}
                        loading={
                          <div className="flex flex-col items-center justify-center p-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Loading PDF...</p>
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center p-8 text-red-500 border border-red-200 rounded-md">
                            <p className="font-semibold mb-2">Error loading PDF</p>
                            <p className="text-sm">The PDF file could not be loaded. Try uploading again.</p>
                          </div>
                        }
                        noData={
                          <div className="flex flex-col items-center justify-center p-8 text-amber-500 border border-amber-200 rounded-md">
                            <p className="font-semibold mb-2">No PDF Data</p>
                            <p className="text-sm">The floorplan may be corrupted. Try uploading again.</p>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={1} 
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          scale={pdfScale}
                          canvasBackground="white"
                          className="pdf-page"
                          // The error component must be a React node, not a function
                          error={
                            <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
                              <p>Error rendering page</p>
                              <p className="text-sm mt-2">Try resetting the zoom level.</p>
                            </div>
                          }
                        />
                      </Document>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-md">
                        <p className="text-slate-500 mb-2">No Floorplan Selected</p>
                        <p className="text-sm text-slate-400">Please select or upload a floorplan</p>
                      </div>
                    )}
                    
                    {/* Render markers */}
                    {!isLoadingMarkers && markers.map((marker: FloorplanMarker) => {
                      const isNote = marker.marker_type === 'note';
                      const markerNumber = marker.label || getMarkerNumber(marker.id).toString();
                      const backgroundColor = getMarkerColor(marker.marker_type);
                      const textColor = getMarkerTextColor(marker.marker_type);
                      const borderColor = getMarkerBorderColor(marker.marker_type);
                      
                      // Default size for this marker type
                      const defaultSize = defaultMarkerSizes[marker.marker_type];
                      
                      // Calculate actual size
                      let width, height;
                      if (isNote) {
                        // Notes can be resized, check if we have a custom size
                        const customSize = markerSize[marker.id];
                        if (customSize) {
                          width = customSize.width;
                          height = customSize.height;
                        } else if (typeof defaultSize === 'object') {
                          width = defaultSize.width;
                          height = defaultSize.height;
                        } else {
                          width = defaultSize as number;
                          height = defaultSize as number;
                        }
                      } else {
                        // Regular markers are always square
                        const size = typeof defaultSize === 'number' ? defaultSize : defaultSize.width;
                        const scaledSize = size * equipmentMarkerScale;
                        width = scaledSize;
                        height = scaledSize;
                      }
                      
                      return (
                        <div
                          key={marker.id}
                          id={`marker-${marker.id}`}
                          className={`absolute flex items-center justify-center select-none group ${
                            isNote ? 'flex-col' : ''
                          } ${marker.id === draggedMarker ? 'z-20' : 'z-10'}`}
                          style={{
                            left: `${marker.position_x}px`,
                            top: `${marker.position_y}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            backgroundColor: backgroundColor,
                            color: textColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: isNote ? '4px' : '50%',
                            cursor: 'move',
                            fontSize: isNote ? '12px' : '14px',
                            fontWeight: 'bold',
                            transform: `translate(-50%, -50%) scale(${1/pdfScale})`,
                            transformOrigin: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); 
                            handleMarkerMouseDown(e.nativeEvent, marker.id);
                          }}
                        >
                          {marker.label !== null ? (
                            isNote ? (
                              <div className="p-2 w-full h-full overflow-hidden whitespace-normal break-words">
                                {marker.label}
                                
                                {/* Add resize handle for notes */}
                                <div
                                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
                                  style={{
                                    backgroundColor: borderColor,
                                    borderTopLeftRadius: '4px'
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleMarkerMouseDown(e.nativeEvent, marker.id, true);
                                  }}
                                />
                              </div>
                            ) : (
                              marker.label
                            )
                          ) : (
                            getMarkerNumber(marker.id)
                          )}
                          
                          {/* Tooltip with marker context menu - only visible on hover */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute -top-3 -right-3 h-6 w-6 p-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => {
                                  // Edit marker implementation
                                  toast({
                                    title: "Edit Marker",
                                    description: "Editing functionality is coming soon",
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Duplicate marker at a slightly offset position
                                  if (selectedFloorplan) {
                                    const offsetX = marker.position_x + 20;
                                    const offsetY = marker.position_y + 20;
                                    
                                    createMarkerMutation.mutate({
                                      floorplan_id: selectedFloorplan.id,
                                      page: marker.page,
                                      marker_type: marker.marker_type,
                                      equipment_id: marker.equipment_id,
                                      position_x: offsetX,
                                      position_y: offsetY,
                                      label: marker.label
                                    });
                                    
                                    toast({
                                      title: "Marker Duplicated",
                                      description: "Created a copy with slight offset"
                                    });
                                  }
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this marker?')) {
                                    deleteMarkerMutation.mutate(marker.id);
                                  }
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-6">
              <CardContent>
                <p className="text-muted-foreground">Please select a floorplan to view</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Floorplan</DialogTitle>
            <DialogDescription>
              Upload a PDF floorplan to add to this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for this floorplan"
                value={newFloorplanName}
                onChange={(e) => setNewFloorplanName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFloorplan} 
              disabled={uploadFloorplanMutation.isPending}
            >
              {uploadFloorplanMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Marker Dialog */}
      <Dialog open={markerDialogOpen} onOpenChange={setMarkerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {getMarkerTypeName(markerType)}</DialogTitle>
            <DialogDescription>
              Enter details for this marker
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="Enter a label for this marker"
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank for auto-numbering
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setMarkerDialogOpen(false);
              setIsAddingMarker(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMarker} 
              disabled={createMarkerMutation.isPending}
            >
              {createMarkerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Marker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Enter text for this note
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-text">Note Text</Label>
              <Textarea
                id="note-text"
                placeholder="Enter note text"
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNoteDialogOpen(false);
              setIsAddingMarker(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMarker} 
              disabled={createMarkerMutation.isPending || !markerLabel}
            >
              {createMarkerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Equipment modals */}
      {selectedEquipmentType === 'access_point' && (
        <AddAccessPointModal
          open={showAddEquipmentModal}
          onOpenChange={setShowAddEquipmentModal}
          onCancel={() => {
            setShowAddEquipmentModal(false);
            setIsAddingMarker(false);
          }}
          onSave={(id) => handleCreateMarkerWithEquipment(id)}
          projectId={projectId}
        />
      )}
      
      {selectedEquipmentType === 'camera' && (
        <AddCameraModal
          open={showAddEquipmentModal}
          onOpenChange={setShowAddEquipmentModal}
          onCancel={() => {
            setShowAddEquipmentModal(false);
            setIsAddingMarker(false);
          }}
          onSave={(id) => handleCreateMarkerWithEquipment(id)}
          projectId={projectId}
        />
      )}
      
      {selectedEquipmentType === 'elevator' && (
        <AddElevatorModal
          open={showAddEquipmentModal}
          onOpenChange={setShowAddEquipmentModal}
          onCancel={() => {
            setShowAddEquipmentModal(false);
            setIsAddingMarker(false);
          }}
          onSave={(id) => handleCreateMarkerWithEquipment(id)}
          projectId={projectId}
        />
      )}
      
      {selectedEquipmentType === 'intercom' && (
        <AddIntercomModal
          open={showAddEquipmentModal}
          onOpenChange={setShowAddEquipmentModal}
          onCancel={() => {
            setShowAddEquipmentModal(false);
            setIsAddingMarker(false);
          }}
          onSave={(id) => handleCreateMarkerWithEquipment(id)}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default FixedFloorplanViewer;