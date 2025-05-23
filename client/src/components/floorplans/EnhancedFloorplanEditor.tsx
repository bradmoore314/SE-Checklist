import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Download, ZoomIn, ZoomOut, Stamp as StampIcon, Type, Trash2, Save, Plus, ListChecks, Sparkles, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnplacedEquipmentPanel, UnplacedEquipment } from './UnplacedEquipmentPanel';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Configure pdfjs worker source - using specific version to avoid mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PdfEditorProps {
  floorplanId?: number;
  projectId?: number;
  onMarkersUpdated?: () => void;
}

type StampConfig = {
  id: string;
  label: string;
  color: string;
  icon: string;
};

type Annotation = {
  id: number;
  type: 'stamp' | 'text';
  x: number;
  y: number;
  content?: string;
  color: string;
  stampId?: string;
  stampLabel?: string;
  stampIcon?: string;
  page: number;
};

export function EnhancedFloorplanEditor({ floorplanId, projectId, onMarkersUpdated }: PdfEditorProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'stamp' | 'text'>('select');
  const [selectedStamp, setSelectedStamp] = useState<StampConfig | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [addToListDialogOpen, setAddToListDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [equipmentDetails, setEquipmentDetails] = useState({
    location: '',
    notes: ''
  });
  const [showEquipmentPanel, setShowEquipmentPanel] = useState<boolean>(false);
  const [selectedExistingEquipment, setSelectedExistingEquipment] = useState<UnplacedEquipment | null>(null);
  const [placingExistingEquipment, setPlacingExistingEquipment] = useState<boolean>(false);
  
  // AI auto-detection states
  const [aiDetectionDialogOpen, setAiDetectionDialogOpen] = useState<boolean>(false);
  const [aiDetectionProcessing, setAiDetectionProcessing] = useState<boolean>(false);
  const [aiDetectionResults, setAiDetectionResults] = useState<any>(null);
  const [aiAutoPlace, setAiAutoPlace] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Predefined stamps
  const STAMPS: Record<string, StampConfig[]> = {
    "Security Equipment": [
      { id: "camera", label: "Camera", color: "#0369A1", icon: "📷" },
      { id: "door_access", label: "Door Access", color: "#166534", icon: "🚪" },
      { id: "motion_sensor", label: "Motion Sensor", color: "#9333EA", icon: "👁️" },
      { id: "intercom", label: "Intercom", color: "#0891B2", icon: "🔊" }
    ],
    "Status Stamps": [
      { id: "approved", label: "APPROVED", color: "#16A34A", icon: "✓" },
      { id: "rejected", label: "REJECTED", color: "#DC2626", icon: "✗" },
      { id: "pending", label: "PENDING", color: "#F59E0B", icon: "⏱️" },
      { id: "revised", label: "REVISED", color: "#8B5CF6", icon: "⟳" }
    ]
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setPageNumber(1);
      setAnnotations([]);
      
      toast({
        title: "PDF loaded",
        description: `${selectedFile.name} loaded successfully.`
      });
    }
  };

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Handle page navigation
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  // Handle canvas click for adding annotations
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Get coordinates relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Special handling for placing existing equipment
    if (placingExistingEquipment && selectedExistingEquipment) {
      handlePlaceExistingEquipment(x, y);
      return;
    }
    
    if (selectedTool === 'stamp' && selectedStamp) {
      // Add a stamp annotation
      const newAnnotation: Annotation = {
        id: Date.now(),
        type: 'stamp',
        x,
        y,
        color: selectedStamp.color,
        stampId: selectedStamp.id,
        stampLabel: selectedStamp.label,
        stampIcon: selectedStamp.icon,
        page: pageNumber
      };
      
      setAnnotations([...annotations, newAnnotation]);
      
      toast({
        title: "Stamp added",
        description: `${selectedStamp.label} stamp added to the PDF.`
      });
    } else if (selectedTool === 'text' && textInput.trim()) {
      // Add a text annotation
      const newAnnotation: Annotation = {
        id: Date.now(),
        type: 'text',
        x,
        y,
        content: textInput,
        color: '#000000',
        page: pageNumber
      };
      
      setAnnotations([...annotations, newAnnotation]);
      
      toast({
        title: "Text added",
        description: "Text annotation added to the PDF."
      });
    } else if (selectedTool === 'select') {
      // Handle selection logic
      let found = false;
      
      // Find if we clicked on an annotation
      for (let i = annotations.length - 1; i >= 0; i--) {
        const annotation = annotations[i];
        if (annotation.page !== pageNumber) continue;
        
        // Simple hit testing (could be improved)
        const hitSize = 50; // Size of hit area
        if (
          x >= annotation.x - hitSize/2 && 
          x <= annotation.x + hitSize/2 && 
          y >= annotation.y - hitSize/2 && 
          y <= annotation.y + hitSize/2
        ) {
          setSelectedAnnotation(annotation.id);
          found = true;
          break;
        }
      }
      
      if (!found) {
        setSelectedAnnotation(null);
      }
    }
  };
  
  // Handle placing an existing equipment item on the floorplan
  const handlePlaceExistingEquipment = async (x: number, y: number) => {
    if (!projectId || !floorplanId || !selectedExistingEquipment) return;
    
    setIsProcessing(true);
    
    try {
      // Create a marker for the existing equipment
      const response = await apiRequest('POST', `/api/enhanced-floorplan/${floorplanId}/markers`, {
        project_id: projectId,
        floorplan_id: floorplanId,
        page: pageNumber,
        marker_type: selectedExistingEquipment.type,
        equipment_id: selectedExistingEquipment.id,
        position_x: x,
        position_y: y,
        label: selectedExistingEquipment.label || selectedExistingEquipment.location || '',
      });
      
      if (!response.ok) {
        throw new Error('Failed to place equipment on floorplan');
      }
      
      // Create a visual annotation for the equipment
      const equipmentTypeToStampMap: Record<string, string> = {
        'camera': 'camera',
        'access_point': 'door_access',
        'intercom': 'intercom',
        'elevator': 'door_access'
      };
      
      const stampType = equipmentTypeToStampMap[selectedExistingEquipment.type] || 'door_access';
      const stampConfig = Object.values(STAMPS).flat().find(s => s.id === stampType);
      
      if (stampConfig) {
        const newAnnotation: Annotation = {
          id: Date.now(),
          type: 'stamp',
          x,
          y,
          color: stampConfig.color,
          stampId: stampConfig.id,
          stampLabel: selectedExistingEquipment.label || selectedExistingEquipment.location || stampConfig.label,
          stampIcon: stampConfig.icon,
          page: pageNumber
        };
        
        setAnnotations([...annotations, newAnnotation]);
      }
      
      toast({
        title: "Equipment placed",
        description: `${selectedExistingEquipment.label || selectedExistingEquipment.type} placed on floorplan.`
      });
      
      // Reset after placing
      setPlacingExistingEquipment(false);
      setSelectedExistingEquipment(null);
      
      // Notify parent component that markers have been updated
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
    } catch (error) {
      console.error("Error placing equipment:", error);
      toast({
        title: "Error",
        description: "Failed to place equipment on floorplan.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle selecting equipment from the unplaced equipment panel
  const handleSelectExistingEquipment = (equipment: UnplacedEquipment) => {
    setSelectedExistingEquipment(equipment);
    setPlacingExistingEquipment(true);
    
    toast({
      title: "Place equipment",
      description: `Click on the floorplan to place the ${equipment.label || equipment.type}.`,
    });
  };

  // Delete selected annotation
  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation === null) return;
    
    setAnnotations(annotations.filter(a => a.id !== selectedAnnotation));
    setSelectedAnnotation(null);
    
    toast({
      title: "Annotation deleted",
      description: "Annotation has been removed."
    });
  };
  
  // Handle adding equipment to the list
  const handleAddToEquipmentList = () => {
    if (selectedAnnotation === null) return;
    
    const annotation = annotations.find(a => a.id === selectedAnnotation);
    if (!annotation || annotation.type !== 'stamp') return;
    
    // Only equipment stamps can be added to the list
    if (!['camera', 'door_access', 'intercom', 'motion_sensor'].includes(annotation.stampId || '')) {
      toast({
        title: "Invalid selection",
        description: "Only security equipment stamps can be added to the list.",
        variant: "destructive"
      });
      return;
    }
    
    // Open dialog to collect equipment details
    setEquipmentDetails({
      location: '',
      notes: ''
    });
    setAddToListDialogOpen(true);
  };
  
  // Save equipment to the database
  const saveEquipmentToList = async () => {
    if (!projectId || !floorplanId || selectedAnnotation === null) return;
    
    const annotation = annotations.find(a => a.id === selectedAnnotation);
    if (!annotation || annotation.type !== 'stamp') return;
    
    setIsProcessing(true);
    
    try {
      // Map stamp types to equipment types in the database
      const equipmentTypeMap: Record<string, string> = {
        'camera': 'camera',
        'door_access': 'access_point',
        'intercom': 'intercom',
        'motion_sensor': 'motion_sensor'
      };
      
      const equipmentType = equipmentTypeMap[annotation.stampId || ''];
      if (!equipmentType) throw new Error("Invalid equipment type");
      
      // Create the marker in the database
      const response = await apiRequest('POST', `/api/enhanced-floorplan/${floorplanId}/markers`, {
        project_id: projectId,
        floorplan_id: floorplanId,
        page: annotation.page,
        marker_type: equipmentType,
        position_x: annotation.x,
        position_y: annotation.y,
        label: equipmentDetails.location,
        notes: equipmentDetails.notes
      });
      
      if (!response.ok) {
        throw new Error('Failed to save marker');
      }
      
      toast({
        title: "Equipment added",
        description: `${annotation.stampLabel} added to the equipment list.`
      });
      
      // Notify parent component that markers have been updated
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      setAddToListDialogOpen(false);
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast({
        title: "Error",
        description: "Failed to add equipment to the list.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Select a stamp
  const selectStamp = (category: string, stampIndex: number) => {
    setSelectedStamp(STAMPS[category][stampIndex]);
    setSelectedTool('stamp');
  };

  // Handle zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  // Handle PDF download
  const handleDownload = () => {
    if (!file) {
      toast({
        title: "No PDF loaded",
        description: "Please load a PDF file first.",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, we would use pdf-lib to apply annotations before download
    // For now, we'll just download the original file
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "PDF downloaded",
      description: "PDF file has been downloaded."
    });
  };
  
  // Function to run AI auto-detection
  const runAiAutoDetection = async () => {
    if (!projectId || !floorplanId) return;
    
    try {
      setAiDetectionProcessing(true);
      
      // Get the current PDF page as an image
      const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Could not capture PDF page');
      }
      
      // Convert canvas to base64 image data
      const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
      
      // Call the API to auto-detect equipment
      const response = await apiRequest('POST', `/api/projects/${projectId}/floorplans/${floorplanId}/auto-detect`, {
        page: pageNumber,
        autoPlace: aiAutoPlace,
        imageBase64
      });
      
      if (!response.ok) {
        throw new Error('Failed to run auto-detection');
      }
      
      const result = await response.json();
      setAiDetectionResults(result);
      
      // Add annotations for newly created equipment
      if (result.equipment && result.equipment.length > 0) {
        const newAnnotations = result.equipment
          .filter((equip: any) => equip.position_x !== null && equip.position_y !== null)
          .map((equip: any) => {
            // Map equipment types to stamp types
            const typeToStampMap: Record<string, string> = {
              'camera': 'camera',
              'access_point': 'door_access',
              'intercom': 'intercom',
              'elevator': 'door_access'
            };
            
            const stampId = typeToStampMap[equip.type] || 'door_access';
            const stampConfig = Object.values(STAMPS).flat().find(s => s.id === stampId);
            
            if (!stampConfig) return null;
            
            return {
              id: Date.now() + Math.random(), // Ensure unique ID
              type: 'stamp' as const,
              x: equip.position_x,
              y: equip.position_y,
              color: stampConfig.color,
              stampId: stampConfig.id,
              stampLabel: equip.label || equip.type,
              stampIcon: stampConfig.icon,
              page: pageNumber
            };
          })
          .filter(Boolean); // Remove nulls
          
        if (newAnnotations.length > 0) {
          setAnnotations(prev => [...prev, ...newAnnotations as Annotation[]]);
        }
      }
      
      // Notify parent that markers have been updated
      if (onMarkersUpdated) {
        onMarkersUpdated();
      }
      
      toast({
        title: "AI Detection Complete",
        description: `Found and added ${result.equipment?.length || 0} equipment items`,
      });
      
      // Close the dialog
      setAiDetectionDialogOpen(false);
    } catch (error) {
      console.error('Error in AI detection:', error);
      toast({
        title: "AI Detection Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setAiDetectionProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Enhanced Floorplan Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* File upload/download controls */}
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
              />
              
              <Button
                onClick={handleDownload}
                variant="outline"
                disabled={!file}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            
            {/* PDF viewer */}
            {file ? (
              <div className="flex flex-col gap-4">
                {/* Toolbar */}
                <div className="flex gap-2 p-2 bg-muted rounded-md">
                  {/* Tool selection */}
                  <div className="flex gap-2 border-r pr-2">
                    <Button
                      size="sm"
                      variant={selectedTool === 'select' ? 'default' : 'outline'}
                      onClick={() => setSelectedTool('select')}
                    >
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTool === 'text' ? 'default' : 'outline'}
                      onClick={() => setSelectedTool('text')}
                    >
                      <Type className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTool === 'stamp' ? 'default' : 'outline'}
                      onClick={() => setSelectedTool('stamp')}
                    >
                      <StampIcon className="h-4 w-4 mr-1" />
                      Stamp
                    </Button>
                    
                    {/* Equipment panel toggle button */}
                    {floorplanId && projectId && (
                      <Button
                        size="sm"
                        variant={showEquipmentPanel ? "secondary" : "outline"}
                        onClick={() => setShowEquipmentPanel(!showEquipmentPanel)}
                        className="ml-2"
                      >
                        <ListChecks className="h-4 w-4 mr-1" />
                        {showEquipmentPanel ? "Hide Equipment" : "Show Equipment"}
                      </Button>
                    )}
                  </div>
                  
                  {/* Page navigation */}
                  <div className="flex items-center gap-2 border-r pr-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pageNumber} of {numPages || '-'}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => changePage(1)}
                      disabled={!numPages || pageNumber >= numPages}
                    >
                      Next
                    </Button>
                  </div>
                  
                  {/* Zoom controls */}
                  <div className="flex items-center gap-2 border-r pr-2">
                    <Button size="sm" variant="outline" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* AI Auto-detection button */}
                  {floorplanId && projectId && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        onClick={() => setAiDetectionDialogOpen(true)}
                        disabled={aiDetectionProcessing}
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        AI Auto-Detect
                      </Button>
                    </div>
                  )}
                  

                  
                  {/* Annotation-specific controls */}
                  {selectedTool === 'text' && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="text-input" className="text-sm">Text:</Label>
                      <Input
                        id="text-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Enter text annotation..."
                      />
                    </div>
                  )}
                  
                  {selectedTool === 'stamp' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Stamp:</Label>
                      <select 
                        className="h-8 rounded-md border text-sm" 
                        onChange={(e) => {
                          const [category, index] = e.target.value.split('|');
                          selectStamp(category, parseInt(index));
                        }}
                        value={selectedStamp ? `${Object.keys(STAMPS).find(cat => 
                          STAMPS[cat].some(s => s.id === selectedStamp.id))}|${
                          STAMPS[Object.keys(STAMPS).find(cat => 
                            STAMPS[cat].some(s => s.id === selectedStamp.id)) || '']
                            .findIndex(s => s.id === selectedStamp.id)}` : ''}
                      >
                        <option value="">Select a stamp</option>
                        {Object.entries(STAMPS).map(([category, stamps]) => (
                          <optgroup label={category} key={category}>
                            {stamps.map((stamp, index) => (
                              <option value={`${category}|${index}`} key={stamp.id}>
                                {stamp.icon} {stamp.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Action buttons for selected annotations */}
                  {selectedAnnotation !== null && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deleteSelectedAnnotation}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      
                      {/* Add to List button - only for security equipment stamps */}
                      {annotations.find(a => a.id === selectedAnnotation)?.type === 'stamp' && 
                       ['camera', 'door_access', 'intercom', 'motion_sensor'].includes(
                         annotations.find(a => a.id === selectedAnnotation)?.stampId || '') && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={handleAddToEquipmentList}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to List
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Main content area - PDF + Equipment Panel */}
                <div className="flex gap-4">
                  {/* Unplaced equipment panel - shown when toggle is active */}
                  {showEquipmentPanel && floorplanId && projectId && (
                    <div className="w-1/4 border rounded-md bg-white">
                      <UnplacedEquipmentPanel 
                        projectId={projectId} 
                        floorplanId={floorplanId}
                        onSelectEquipment={(equipment) => {
                          setSelectedExistingEquipment(equipment);
                          setPlacingExistingEquipment(true);
                          setSelectedTool('select'); // Switch to select tool
                          toast({
                            title: "Equipment selected",
                            description: `Click on the floorplan to place ${equipment.type}: ${equipment.name || equipment.label || 'Unnamed'}`,
                          });
                        }}
                      />
                    </div>
                  )}
                  
                  {/* PDF rendering container */}
                  <div 
                    className={`border rounded-md overflow-auto relative bg-white ${showEquipmentPanel ? 'w-3/4' : 'w-full'}`}
                    style={{ height: '600px' }}
                    onClick={handleCanvasClick}
                    ref={containerRef}
                  >
                    <div style={{ position: 'relative', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                        <Page 
                          pageNumber={pageNumber} 
                          renderTextLayer={true} 
                          renderAnnotationLayer={true}
                        />
                      </Document>
                      
                      {/* Render annotations for the current page */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {annotations
                          .filter(ann => ann.page === pageNumber)
                          .map(annotation => (
                            <div 
                              key={annotation.id}
                              className={`absolute ${selectedAnnotation === annotation.id ? 'ring-2 ring-blue-500' : ''}`}
                              style={{ 
                                left: annotation.x,
                                top: annotation.y,
                                color: annotation.color,
                                pointerEvents: 'auto',  // Make annotations clickable
                                cursor: selectedTool === 'select' ? 'pointer' : 'default'
                              }}
                            >
                              {annotation.type === 'stamp' && (
                                <div className="flex flex-col items-center text-center">
                                  <div style={{ fontSize: '24px' }}>{annotation.stampIcon}</div>
                                  <div style={{ 
                                    background: annotation.color,
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {annotation.stampLabel}
                                  </div>
                                </div>
                              )}
                              
                              {annotation.type === 'text' && (
                                <div className="max-w-[200px] bg-white p-2 border rounded shadow-sm">
                                  {annotation.content}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border rounded-md p-8 mt-4 bg-muted/20">
                <p className="text-muted-foreground text-center mb-2">No PDF file loaded</p>
                <p className="text-sm text-muted-foreground text-center">
                  Upload a PDF file to get started with annotations
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog for adding equipment to list */}
      <Dialog open={addToListDialogOpen} onOpenChange={setAddToListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Equipment List</DialogTitle>
            <DialogDescription>
              Enter location and notes for this equipment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Main Entrance, North Corridor"
                value={equipmentDetails.location}
                onChange={(e) => setEquipmentDetails({...equipmentDetails, location: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional information"
                value={equipmentDetails.notes}
                onChange={(e) => setEquipmentDetails({...equipmentDetails, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddToListDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveEquipmentToList} 
              disabled={isProcessing || !equipmentDetails.location.trim()}
            >
              {isProcessing ? 'Saving...' : 'Add to List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Auto-detection Dialog */}
      <AlertDialog open={aiDetectionDialogOpen} onOpenChange={setAiDetectionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Equipment Auto-Detection</AlertDialogTitle>
            <AlertDialogDescription>
              The AI will analyze the current floorplan page and automatically detect equipment placement.
              This process may take a few moments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center space-x-2 my-4">
            <input
              type="checkbox"
              id="auto-place"
              checked={aiAutoPlace}
              onChange={(e) => setAiAutoPlace(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="auto-place">
              Auto-place detected equipment on floorplan
            </Label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={aiDetectionProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runAiAutoDetection}
              disabled={aiDetectionProcessing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {aiDetectionProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Start AI Detection
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}