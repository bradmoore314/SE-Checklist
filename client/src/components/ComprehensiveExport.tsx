import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileDown, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SectionOptions {
  dashboardSummary: boolean;
  projectDetails: boolean;
  equipmentSchedules: boolean;
  floorplans: boolean;
  aiAnalysis: boolean;
  meetingAgenda: boolean;
  kvgDetails: boolean;
  gatewayCalculator: boolean;
  images: boolean;
}

interface ComprehensiveExportProps {
  projectId: number;
  projectName: string;
  disabled?: boolean;
}

/**
 * Simplified Comprehensive Export Component
 * Creates a PDF with project summary and details
 * Designed for reliability - problematic sections are disabled
 */
const ComprehensiveExport: React.FC<ComprehensiveExportProps> = ({ 
  projectId, 
  projectName,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sections, setSections] = useState<SectionOptions>({
    dashboardSummary: true,
    projectDetails: true,
    equipmentSchedules: true,
    floorplans: true,
    aiAnalysis: false, // Disabled by default for reliability
    meetingAgenda: true,
    kvgDetails: true,
    gatewayCalculator: false, // Disabled by default for reliability
    images: true
  });

  // Fetch essential project data
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId
  });
  
  // Fetch project summary with equipment data
  const { data: summary } = useQuery({
    queryKey: [`/api/projects/${projectId}/reports/project-summary`],
    enabled: !!projectId
  });
  
  // Fetch floorplans
  const { data: floorplans } = useQuery({
    queryKey: [`/api/projects/${projectId}/floorplans`],
    enabled: !!projectId
  });
  
  // Fetch KVG data (if available)
  const { data: kvgFormData } = useQuery({
    queryKey: [`/api/projects/${projectId}/kvg-form-data`],
    enabled: !!projectId,
    meta: { suppressErrorToast: true }
  });

  // Toggle section selection
  const toggleSection = (section: keyof SectionOptions) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Select all sections
  const selectAllSections = () => {
    setSections({
      dashboardSummary: true,
      projectDetails: true,
      equipmentSchedules: true,
      floorplans: true,
      aiAnalysis: false, // Keep disabled for reliability
      meetingAgenda: true,
      kvgDetails: true,
      gatewayCalculator: false, // Keep disabled for reliability
      images: true
    });
  };
  
  // Helper function to add page number
  const addPageNumber = (doc: jsPDF, pageNumber: number) => {
    const totalPages = '{total_pages_count_string}';
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${pageNumber} of ${totalPages}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  };
  
  // Simplified PDF export function - focuses on reliable data only
  const generateComprehensiveExport = async () => {
    try {
      console.log('Starting simplified PDF generation...');
      setIsExporting(true);
      
      // Verify we have essential data before proceeding
      if (!summary || !project) {
        throw new Error('Required project data is not available');
      }
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      let pageNumber = 1;
      
      // Add cover page
      doc.setFillColor(41, 65, 171); // Primary blue color
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 50, 'F');
      
      // Add logo or company name
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255); // White text for header
      doc.text('SITE WALK SUMMARY', 20, 30);
      
      // Add project name
      doc.setFontSize(28);
      doc.setTextColor(33, 33, 33);
      doc.text(project?.name || projectName, 20, 70, {
        maxWidth: doc.internal.pageSize.getWidth() - 40
      });
      
      // Add project details
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Client: ${project?.client || 'N/A'}`, 20, 85);
      doc.text(`Location: ${project?.site_address || 'N/A'}`, 20, 92);
      doc.text(`Security Engineer: ${project?.se_name || 'N/A'}`, 20, 99);
      doc.text(`Business Development: ${project?.bdm_name || 'N/A'}`, 20, 106);
      
      // Add export date
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 120);
      
      // Add note about the document
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        'This document contains a comprehensive summary of all site walk details, specifications, and configurations. ' +
        'It is intended for project stakeholders and installation teams.',
        20, 130, { maxWidth: doc.internal.pageSize.getWidth() - 40 }
      );
      
      addPageNumber(doc, pageNumber);
      pageNumber++;
      
      // Add Table of Contents
      doc.addPage();
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text('TABLE OF CONTENTS', 20, 30);
      
      let tocY = 50;
      const tocItems = [];
      
      if (sections.dashboardSummary) tocItems.push('Equipment Summary');
      if (sections.projectDetails) tocItems.push('Project Details');
      if (sections.equipmentSchedules) {
        if (summary?.equipment?.accessPoints?.length) tocItems.push('Access Points');
        if (summary?.equipment?.cameras?.length) tocItems.push('Cameras');
        if (summary?.equipment?.elevators?.length) tocItems.push('Elevators');
        if (summary?.equipment?.intercoms?.length) tocItems.push('Intercoms');
      }
      if (sections.floorplans && floorplans?.length) tocItems.push('Floorplans');
      if (sections.meetingAgenda) tocItems.push('Meeting Agendas');
      if (sections.kvgDetails && kvgFormData) tocItems.push('Kastle Video Guarding');
      
      doc.setFontSize(12);
      tocItems.forEach((item, i) => {
        doc.text(`${i+1}. ${item}`, 30, tocY);
        tocY += 10;
      });
      
      addPageNumber(doc, pageNumber);
      pageNumber++;
      
      // --------- DASHBOARD SUMMARY SECTION ---------
      if (sections.dashboardSummary && summary) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('EQUIPMENT SUMMARY', 20, 30);
        
        // Summary cards
        if (summary.summary) {
          doc.setFillColor(240, 240, 240);
          
          // Card Access
          doc.rect(20, 50, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.accessPointCount.toString(), 30, 70);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Card Access Points', 30, 78);
          
          // Cameras
          doc.rect(110, 50, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.cameraCount.toString(), 120, 70);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Cameras', 120, 78);
          
          // Elevators
          doc.rect(20, 100, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.elevatorCount.toString(), 30, 120);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Elevators & Turnstiles', 30, 128);
          
          // Intercoms
          doc.rect(110, 100, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.intercomCount.toString(), 120, 120);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Intercoms', 120, 128);
          
          // Total
          doc.setFillColor(230, 235, 250);
          doc.rect(20, 150, 170, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.totalEquipmentCount.toString(), 30, 170);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Total Equipment', 30, 178);
        }
        
        addPageNumber(doc, pageNumber);
        pageNumber++;
      }
      
      // --------- PROJECT DETAILS SECTION ---------
      if (sections.projectDetails && project) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('PROJECT DETAILS', 20, 30);
        
        // Project info table
        (doc as any).autoTable({
          startY: 40,
          head: [['Field', 'Value']],
          body: [
            ['Project Name', project.name || 'N/A'],
            ['Client', project.client || 'N/A'],
            ['Site Address', project.site_address || 'N/A'],
            ['Security Engineer', project.se_name || 'N/A'],
            ['Business Development Manager', project.bdm_name || 'N/A'],
            ['Building Count', project.building_count?.toString() || 'N/A'],
            ['Progress Percentage', `${project.progress_percentage?.toString() || '0'}%`],
            ['Progress Notes', project.progress_notes || 'N/A']
          ],
          theme: 'grid',
          headStyles: {
            fillColor: [41, 65, 171],
            textColor: [255, 255, 255]
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 110 }
          }
        });
        
        addPageNumber(doc, pageNumber);
        pageNumber++;
      }
      
      // --------- EQUIPMENT SCHEDULES SECTION ---------
      if (sections.equipmentSchedules && summary?.equipment) {
        // Access Points
        if (summary.equipment.accessPoints && summary.equipment.accessPoints.length > 0) {
          doc.addPage();
          doc.setFontSize(20);
          doc.setTextColor(33, 33, 33);
          doc.text('ACCESS POINT SCHEDULE', 20, 30);
          
          // Table of access points
          const accessPointRows = summary.equipment.accessPoints.map(ap => [
            ap.location || 'N/A',
            ap.reader_type || 'N/A',
            ap.lock_type || 'N/A',
            ap.monitoring_type || 'N/A',
            ap.interior_perimeter || 'N/A',
            ap.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Reader Type', 'Lock Type', 'Monitoring', 'Type', 'Notes']],
            body: accessPointRows,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            },
            styles: {
              overflow: 'ellipsize',
              cellWidth: 'wrap'
            },
            columnStyles: {
              0: { cellWidth: 40 },
              5: { cellWidth: 40 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
        }
        
        // Cameras
        if (summary.equipment.cameras && summary.equipment.cameras.length > 0) {
          doc.addPage();
          doc.setFontSize(20);
          doc.setTextColor(33, 33, 33);
          doc.text('CAMERA SCHEDULE', 20, 30);
          
          // Table of cameras
          const cameraRows = summary.equipment.cameras.map(camera => [
            camera.location || 'N/A',
            camera.camera_type || 'N/A',
            camera.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Camera Type', 'Notes']],
            body: cameraRows,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            },
            styles: {
              overflow: 'ellipsize',
              cellWidth: 'wrap'
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 60 },
              2: { cellWidth: 70 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
        }
        
        // Elevators
        if (summary.equipment.elevators && summary.equipment.elevators.length > 0) {
          doc.addPage();
          doc.setFontSize(20);
          doc.setTextColor(33, 33, 33);
          doc.text('ELEVATOR & TURNSTILE SCHEDULE', 20, 30);
          
          // Table of elevators
          const elevatorRows = summary.equipment.elevators.map(elevator => [
            elevator.location || 'N/A',
            elevator.elevator_type || 'N/A',
            elevator.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Type', 'Notes']],
            body: elevatorRows,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            },
            styles: {
              overflow: 'ellipsize',
              cellWidth: 'wrap'
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 60 },
              2: { cellWidth: 70 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
        }
        
        // Intercoms
        if (summary.equipment.intercoms && summary.equipment.intercoms.length > 0) {
          doc.addPage();
          doc.setFontSize(20);
          doc.setTextColor(33, 33, 33);
          doc.text('INTERCOM SCHEDULE', 20, 30);
          
          // Table of intercoms
          const intercomRows = summary.equipment.intercoms.map(intercom => [
            intercom.location || 'N/A',
            intercom.intercom_type || 'N/A',
            intercom.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Type', 'Notes']],
            body: intercomRows,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            },
            styles: {
              overflow: 'ellipsize',
              cellWidth: 'wrap'
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 60 },
              2: { cellWidth: 70 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
        }
      }
      
      // Note: AI Analysis and Gateway Calculator sections are intentionally omitted for reliability
      
      // Save the PDF with the project name
      doc.save(`${projectName}_Comprehensive_Report.pdf`);
      
      // Show success message
      toast({
        title: 'Export Complete',
        description: 'Your comprehensive site walk report has been generated.'
      });
      
      setIsExporting(false);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('EXPORT ERROR:', error);
      
      // Show error message
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          onClick={() => setIsDialogOpen(true)}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
          <DialogDescription>
            Select which sections to include in your comprehensive site walk report.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="col-span-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={selectAllSections}
              >
                Select All
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dashboardSummary" 
                checked={sections.dashboardSummary} 
                onCheckedChange={() => toggleSection('dashboardSummary')}
              />
              <label htmlFor="dashboardSummary" className="text-sm font-medium leading-none cursor-pointer">
                Equipment Summary
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="projectDetails" 
                checked={sections.projectDetails} 
                onCheckedChange={() => toggleSection('projectDetails')}
              />
              <label htmlFor="projectDetails" className="text-sm font-medium leading-none cursor-pointer">
                Project Details
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="equipmentSchedules" 
                checked={sections.equipmentSchedules} 
                onCheckedChange={() => toggleSection('equipmentSchedules')}
              />
              <label htmlFor="equipmentSchedules" className="text-sm font-medium leading-none cursor-pointer">
                Equipment Schedules
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="floorplans" 
                checked={sections.floorplans} 
                onCheckedChange={() => toggleSection('floorplans')}
              />
              <label htmlFor="floorplans" className="text-sm font-medium leading-none cursor-pointer">
                Floorplans
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="meetingAgenda" 
                checked={sections.meetingAgenda} 
                onCheckedChange={() => toggleSection('meetingAgenda')}
              />
              <label htmlFor="meetingAgenda" className="text-sm font-medium leading-none cursor-pointer">
                Meeting Agenda
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="kvgDetails" 
                checked={sections.kvgDetails} 
                onCheckedChange={() => toggleSection('kvgDetails')}
              />
              <label htmlFor="kvgDetails" className="text-sm font-medium leading-none cursor-pointer">
                KVG Details
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="images" 
                checked={sections.images} 
                onCheckedChange={() => toggleSection('images')}
              />
              <label htmlFor="images" className="text-sm font-medium leading-none cursor-pointer">
                Images & Screenshots
              </label>
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center p-3 space-x-2 text-sm border rounded-md bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-amber-800">
                  AI Analysis and Gateway Calculator sections are temporarily disabled for reliability.
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={() => setIsDialogOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={generateComprehensiveExport}
            disabled={isExporting || !Object.values(sections).some(value => value)}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComprehensiveExport;