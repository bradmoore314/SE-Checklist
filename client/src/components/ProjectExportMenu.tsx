import React, { useState } from 'react';
import { DownloadIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { exportData, generateProjectReport, ExportFormat } from '@/utils/exportUtils';
import { useQuery } from '@tanstack/react-query';

interface ProjectExportMenuProps {
  projectId: number;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ProjectExportMenu = ({
  projectId,
  disabled = false,
  variant = 'outline',
  size = 'default'
}: ProjectExportMenuProps) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    projectInfo: true,
    accessPoints: true,
    cameras: true,
    elevators: true,
    intercoms: true,
    aiAnalysis: true,
    floorplans: true
  });
  const { toast } = useToast();

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId
  });

  // Fetch access points data
  const { data: accessPoints } = useQuery({
    queryKey: [`/api/projects/${projectId}/access-points`],
    enabled: !!projectId
  });

  // Fetch cameras data
  const { data: cameras } = useQuery({
    queryKey: [`/api/projects/${projectId}/cameras`],
    enabled: !!projectId
  });

  // Fetch elevators data
  const { data: elevators } = useQuery({
    queryKey: [`/api/projects/${projectId}/elevators`],
    enabled: !!projectId
  });

  // Fetch intercoms data
  const { data: intercoms } = useQuery({
    queryKey: [`/api/projects/${projectId}/intercoms`],
    enabled: !!projectId
  });

  const handleToggleSection = (section: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleQuickExport = async (format: ExportFormat) => {
    try {
      setLoading(true);
      // Build the data array based on equipment type
      const allData = [
        ...(accessPoints || []).map((ap: any) => ({ type: 'Access Point', ...ap })),
        ...(cameras || []).map((cam: any) => ({ type: 'Camera', ...cam })),
        ...(elevators || []).map((elev: any) => ({ type: 'Elevator', ...elev })),
        ...(intercoms || []).map((int: any) => ({ type: 'Intercom', ...int }))
      ];
      
      // Export all equipment in a single file
      await exportData(
        allData, 
        format, 
        `${project?.name || 'Project'}_Equipment`,
        `${project?.name || 'Project'} - Equipment Export`
      );
      
      toast({
        title: 'Export Complete',
        description: `Project data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the project data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomExport = async (format: ExportFormat) => {
    try {
      setLoading(true);
      
      // Determine what data to include based on selected sections
      let exportData: any[] = [];
      
      if (selectedSections.accessPoints && accessPoints?.length > 0) {
        exportData = [...exportData, ...accessPoints.map((ap: any) => ({ type: 'Access Point', ...ap }))];
      }
      
      if (selectedSections.cameras && cameras?.length > 0) {
        exportData = [...exportData, ...cameras.map((cam: any) => ({ type: 'Camera', ...cam }))];
      }
      
      if (selectedSections.elevators && elevators?.length > 0) {
        exportData = [...exportData, ...elevators.map((elev: any) => ({ type: 'Elevator', ...elev }))];
      }
      
      if (selectedSections.intercoms && intercoms?.length > 0) {
        exportData = [...exportData, ...intercoms.map((int: any) => ({ type: 'Intercom', ...int }))];
      }
      
      if (exportData.length === 0) {
        toast({
          title: 'No Data Selected',
          description: 'Please select at least one section to export',
          variant: 'destructive'
        });
        return;
      }
      
      // For PDF specifically, look for elements to include
      if (format === 'pdf' && selectedSections.floorplans) {
        // Get floorplan element for PDF export
        const floorplanElement = document.getElementById('floorplan-container');
        const projectInfoElement = document.getElementById('project-info-container');
        const aiAnalysisElement = document.getElementById('site-walk-analysis-container');
        
        // Collect sections to include in the PDF
        const sections = [];
        
        if (selectedSections.projectInfo && projectInfoElement) {
          sections.push({ element: projectInfoElement, title: 'Project Information' });
        }
        
        if (selectedSections.floorplans && floorplanElement) {
          sections.push({ element: floorplanElement, title: 'Floorplans' });
        }
        
        if (selectedSections.aiAnalysis && aiAnalysisElement) {
          sections.push({ element: aiAnalysisElement, title: 'AI Analysis' });
        }
        
        if (sections.length > 0) {
          // Generate a comprehensive PDF report with multiple sections
          await generateProjectReport(
            project,
            sections,
            `${project?.name || 'Project'}_Complete_Report`
          );
        } else {
          // Fall back to regular data export if no elements found
          await exportData(
            exportData, 
            format, 
            `${project?.name || 'Project'}_Selected_Data`,
            `${project?.name || 'Project'} - Custom Export`
          );
        }
      } else {
        // For non-PDF formats, export the data directly
        await exportData(
          exportData, 
          format, 
          `${project?.name || 'Project'}_Selected_Data`,
          `${project?.name || 'Project'} - Custom Export`
        );
      }
      
      toast({
        title: 'Export Complete',
        description: `Selected project data exported successfully as ${format.toUpperCase()}`,
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Custom export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the selected data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={disabled || loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleQuickExport('pdf')}>
            Export All as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('excel')}>
            Export All as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
            Export All as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            Custom Export...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Custom Export</DialogTitle>
            <DialogDescription>
              Select the sections you want to include in your export
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="format" className="flex-1">Format</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="projectInfo" 
                    checked={selectedSections.projectInfo}
                    onCheckedChange={() => handleToggleSection('projectInfo')}
                  />
                  <label htmlFor="projectInfo" className="cursor-pointer">Project Information</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accessPoints" 
                    checked={selectedSections.accessPoints}
                    onCheckedChange={() => handleToggleSection('accessPoints')}
                  />
                  <label htmlFor="accessPoints" className="cursor-pointer">Access Points ({accessPoints?.length || 0})</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cameras" 
                    checked={selectedSections.cameras}
                    onCheckedChange={() => handleToggleSection('cameras')}
                  />
                  <label htmlFor="cameras" className="cursor-pointer">Cameras ({cameras?.length || 0})</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="elevators" 
                    checked={selectedSections.elevators}
                    onCheckedChange={() => handleToggleSection('elevators')}
                  />
                  <label htmlFor="elevators" className="cursor-pointer">Elevators ({elevators?.length || 0})</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="intercoms" 
                    checked={selectedSections.intercoms}
                    onCheckedChange={() => handleToggleSection('intercoms')}
                  />
                  <label htmlFor="intercoms" className="cursor-pointer">Intercoms ({intercoms?.length || 0})</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="floorplans" 
                    checked={selectedSections.floorplans}
                    onCheckedChange={() => handleToggleSection('floorplans')}
                  />
                  <label htmlFor="floorplans" className="cursor-pointer">Floorplans (PDF only)</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="aiAnalysis" 
                    checked={selectedSections.aiAnalysis}
                    onCheckedChange={() => handleToggleSection('aiAnalysis')}
                  />
                  <label htmlFor="aiAnalysis" className="cursor-pointer">AI Analysis (PDF only)</label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="format" className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleCustomExport('pdf')}
                  disabled={loading}
                >
                  <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                    <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                    <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
                  </svg>
                  <span>PDF Document</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleCustomExport('excel')}
                  disabled={loading}
                >
                  <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 3V21" stroke="currentColor" strokeWidth="2" />
                    <path d="M10.5 13L8 15.5L10.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 13L16.5 15.5L14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Excel Spreadsheet</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleCustomExport('csv')}
                  disabled={loading}
                >
                  <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 7L11 12L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>CSV File</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => handleCustomExport('json')}
                  disabled={loading}
                >
                  <svg className="h-8 w-8 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M6.5 8.5L8 10L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.5 12.5L16 14L17.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>JSON File</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectExportMenu;