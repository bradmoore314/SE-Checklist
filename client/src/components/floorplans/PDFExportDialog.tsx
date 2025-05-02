import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import exportAnnotatedPDF from '@/utils/pdfExporter';
import { MarkerData, LayerData, CalibrationData, PDFExportData, ExportOptions } from '@/types/floorplan';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { DownloadCloud, FilePlus2, FileCheck, FileWarning, Loader2 } from 'lucide-react';

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floorplanId: number;
  floorplanName: string;
  pdfDataUrl: string;
  markers: MarkerData[];
  layers: LayerData[];
  calibration?: CalibrationData;
  pageWidth: number;
  pageHeight: number;
  currentPage: number;
  totalPages: number;
  projectName: string;
}

export const PDFExportDialog = ({
  open,
  onOpenChange,
  floorplanId,
  floorplanName,
  pdfDataUrl,
  markers,
  layers,
  calibration,
  pageWidth,
  pageHeight,
  currentPage,
  totalPages,
  projectName
}: PDFExportDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [fileName, setFileName] = useState(`${floorplanName.replace(/\s+/g, '_')}_export`);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedPdfUrl, setExportedPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('options');
  
  // Export options
  const [options, setOptions] = useState<ExportOptions>({
    includeLayers: true,
    includeOnlyVisibleLayers: true,
    includeCalibration: true,
    includeProperties: true,
    includeComments: false,
    qualityLevel: 'high',
    addWatermark: false,
    watermarkText: '',
    pageSize: 'auto',
    orientation: 'landscape',
    compression: true,
  });
  
  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions((prev: ExportOptions) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare export data
      const exportData: PDFExportData = {
        pdfDataUrl,
        markers,
        layers,
        calibration,
        pageWidth,
        pageHeight,
        currentPage,
        totalPages,
        projectName,
        userName: user?.username || 'Unknown User',
        exportDate: new Date(),
      };
      
      // Update file name in options
      const exportOptions: ExportOptions = {
        ...options,
        fileName,
      };
      
      // Generate the PDF
      const pdfDataUri = await exportAnnotatedPDF(exportData, exportOptions);
      
      // Set the exported PDF URL for download
      setExportedPdfUrl(pdfDataUri);
      
      // Switch to the download tab
      setActiveTab('download');
      
      toast({
        title: 'Export Successful',
        description: 'Your PDF has been generated successfully.',
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Error generating PDF: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDownload = () => {
    if (!exportedPdfUrl) return;
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = exportedPdfUrl;
    link.download = `${fileName}.pdf`;
    link.click();
    
    toast({
      title: 'Download Started',
      description: 'Your PDF download has started.',
    });
  };
  
  const handleClose = () => {
    // Reset state when closing
    setExportedPdfUrl(null);
    setActiveTab('options');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Floorplan as PDF</DialogTitle>
          <DialogDescription>
            Configure export options and generate a PDF with all annotations.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="options">Export Options</TabsTrigger>
            <TabsTrigger value="download" disabled={!exportedPdfUrl}>
              Download PDF
            </TabsTrigger>
          </TabsList>
          
          {/* Options Tab */}
          <TabsContent value="options" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select
                    value={options.pageSize}
                    onValueChange={(value) => handleOptionChange('pageSize', value)}
                  >
                    <SelectTrigger id="pageSize">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Match Original)</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="tabloid">Tabloid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select
                    value={options.orientation}
                    onValueChange={(value) => handleOptionChange('orientation', value as 'portrait' | 'landscape')}
                  >
                    <SelectTrigger id="orientation">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qualityLevel">Quality</Label>
                  <Select
                    value={options.qualityLevel}
                    onValueChange={(value) => handleOptionChange('qualityLevel', value as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger id="qualityLevel">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLayers"
                    checked={options.includeLayers}
                    onCheckedChange={(checked) => handleOptionChange('includeLayers', !!checked)}
                  />
                  <Label htmlFor="includeLayers">Include Layers</Label>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <Checkbox
                    id="includeOnlyVisibleLayers"
                    checked={options.includeOnlyVisibleLayers}
                    disabled={!options.includeLayers}
                    onCheckedChange={(checked) => handleOptionChange('includeOnlyVisibleLayers', !!checked)}
                  />
                  <Label htmlFor="includeOnlyVisibleLayers" className={!options.includeLayers ? 'text-muted-foreground' : ''}>
                    Only Visible Layers
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCalibration"
                    checked={options.includeCalibration}
                    onCheckedChange={(checked) => handleOptionChange('includeCalibration', !!checked)}
                  />
                  <Label htmlFor="includeCalibration">Include Calibration</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeProperties"
                    checked={options.includeProperties}
                    onCheckedChange={(checked) => handleOptionChange('includeProperties', !!checked)}
                  />
                  <Label htmlFor="includeProperties">Include Properties</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeComments"
                    checked={options.includeComments}
                    onCheckedChange={(checked) => handleOptionChange('includeComments', !!checked)}
                  />
                  <Label htmlFor="includeComments">Include Comments</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compression"
                    checked={options.compression}
                    onCheckedChange={(checked) => handleOptionChange('compression', !!checked)}
                  />
                  <Label htmlFor="compression">Compress PDF</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addWatermark"
                    checked={options.addWatermark}
                    onCheckedChange={(checked) => handleOptionChange('addWatermark', !!checked)}
                  />
                  <Label htmlFor="addWatermark">Add Watermark</Label>
                </div>
                
                {options.addWatermark && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      id="watermarkText"
                      value={options.watermarkText}
                      onChange={(e) => handleOptionChange('watermarkText', e.target.value)}
                      placeholder="DRAFT"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Download Tab */}
          <TabsContent value="download" className="space-y-6 py-4">
            {exportedPdfUrl ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <FileCheck className="h-16 w-16 text-primary" />
                <h3 className="text-lg font-semibold">PDF Generated Successfully</h3>
                <p className="text-center text-muted-foreground">
                  Your PDF has been generated successfully. Click the button below to download it.
                </p>
                <div className="w-full max-w-xs">
                  <Button 
                    onClick={handleDownload} 
                    className="w-full"
                    size="lg"
                  >
                    <DownloadCloud className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-8">
                <FileWarning className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No PDF Available</h3>
                <p className="text-center text-muted-foreground">
                  Please go back to the options tab and generate a PDF first.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          {activeTab === 'options' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            </>
          )}
          {activeTab === 'download' && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExportDialog;