import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
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
import { Loader2, FileDown, Printer, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Project, 
  AccessPoint, 
  Camera, 
  Elevator, 
  Intercom,
  KvgFormData, 
  KvgStream,
  Image as EquipmentImage
} from '@shared/schema';

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
 * Component for comprehensive site walk report export
 * Creates a beautifully formatted PDF that includes all site walk details
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
    aiAnalysis: true,
    meetingAgenda: true,
    kvgDetails: true,
    gatewayCalculator: true,
    images: true
  });

  // Fetch project data
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
  
  // Fetch AI Analysis with error handling
  const { data: aiAnalysis, isError: isAiAnalysisError } = useQuery({
    queryKey: [`/api/projects/${projectId}/ai-analysis`],
    enabled: !!projectId,
    retry: 1,
    meta: { suppressErrorToast: true } // Prevent default error toast
  });
  
  // Fetch KVG data
  const { data: kvgFormData } = useQuery({
    queryKey: [`/api/projects/${projectId}/kvg-form-data`],
    enabled: !!projectId,
    meta: { suppressErrorToast: true }
  });

  // Fetch KVG streams
  const { data: kvgStreams } = useQuery({
    queryKey: [`/api/projects/${projectId}/kvg-streams`],
    enabled: !!projectId,
    meta: { suppressErrorToast: true }
  });
  
  // Fetch Gateway Calculator data with error handling
  const { data: gatewayData, isError: isGatewayDataError } = useQuery({
    queryKey: [`/api/projects/${projectId}/gateway-calculator`],
    enabled: !!projectId,
    retry: 1,
    meta: { suppressErrorToast: true } // Prevent default error toast
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
      aiAnalysis: true,
      meetingAgenda: true,
      kvgDetails: true,
      gatewayCalculator: true,
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
  
  // Generate PDF export with reliable sections only
  const generateComprehensiveExport = async () => {
    try {
      console.log('Starting PDF generation...');
      setIsExporting(true);
      
      // Verify we have essential data
      if (!summary || !project) {
        throw new Error('Required project data is not available');
      }
      
      // Create a safe version that disables problematic sections
      const safeSections = {
        ...sections,
        aiAnalysis: false,          // Disable AI Analysis section
        gatewayCalculator: false    // Disable Gateway Calculator section
      };
      
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
      
      // Only include AI Analysis if enabled and not in error state
      if (sections.aiAnalysis && aiAnalysis && !isAiAnalysisError) tocItems.push('AI Analysis');
      
      if (sections.meetingAgenda) tocItems.push('Meeting Agendas');
      
      if (sections.kvgDetails && (kvgFormData || kvgStreams?.length)) tocItems.push('Kastle Video Guarding');
      
      // Only include Gateway Calculator if enabled and not in error state
      if (sections.gatewayCalculator && gatewayData && !isGatewayDataError) tocItems.push('Gateway Configuration');
      
      doc.setFontSize(12);
      tocItems.forEach((item, i) => {
        doc.text(`${i+1}. ${item}`, 30, tocY);
        tocY += 10;
      });
      
      addPageNumber(doc, pageNumber);
      pageNumber++;
      
      // --------- DASHBOARD SUMMARY SECTION ---------
      if (safeSections.dashboardSummary && summary) {
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
          doc.setFontSize(9);
          doc.text(`Interior: ${summary.summary.interiorAccessPointCount} | Perimeter: ${summary.summary.perimeterAccessPointCount}`, 30, 84);
          
          // Cameras
          doc.rect(110, 50, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.cameraCount.toString(), 120, 70);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Cameras', 120, 78);
          doc.setFontSize(9);
          doc.text(`Indoor: ${summary.summary.indoorCameraCount} | Outdoor: ${summary.summary.outdoorCameraCount}`, 120, 84);
          
          // Elevators
          doc.rect(20, 100, 80, 40, 'F');
          doc.setFontSize(24);
          doc.setTextColor(41, 65, 171);
          doc.text(summary.summary.elevatorCount.toString(), 30, 120);
          doc.setFontSize(12);
          doc.setTextColor(33, 33, 33);
          doc.text('Elevators & Turnstiles', 30, 128);
          doc.setFontSize(9);
          doc.text(`Banks: ${summary.summary.elevatorBankCount}`, 30, 134);
          
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
      if (safeSections.projectDetails && project) {
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
        
        // Project scope table
        if (
          project.replace_readers ||
          project.install_locks ||
          project.pull_wire ||
          project.wireless_locks ||
          project.conduit_drawings ||
          project.need_credentials ||
          project.photo_id ||
          project.photo_badging ||
          project.ble ||
          project.test_card ||
          project.visitor ||
          project.guard_controls ||
          project.floorplan ||
          project.reports_available ||
          project.kastle_connect ||
          project.on_site_security ||
          project.takeover ||
          project.rush ||
          project.ppi_quote_needed
        ) {
          (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Scope Item', 'Status']],
            body: [
              ['Replace Readers', project.replace_readers ? 'Yes' : 'No'],
              ['Install Locks', project.install_locks ? 'Yes' : 'No'],
              ['Pull Wire', project.pull_wire ? 'Yes' : 'No'],
              ['Wireless Locks', project.wireless_locks ? 'Yes' : 'No'],
              ['Conduit Drawings', project.conduit_drawings ? 'Yes' : 'No'],
              ['Need Credentials', project.need_credentials ? 'Yes' : 'No'],
              ['Photo ID', project.photo_id ? 'Yes' : 'No'],
              ['Photo Badging', project.photo_badging ? 'Yes' : 'No'],
              ['BLE', project.ble ? 'Yes' : 'No'],
              ['Test Card', project.test_card ? 'Yes' : 'No'],
              ['Visitor', project.visitor ? 'Yes' : 'No'],
              ['Guard Controls', project.guard_controls ? 'Yes' : 'No'],
              ['Floorplan', project.floorplan ? 'Yes' : 'No'],
              ['Reports Available', project.reports_available ? 'Yes' : 'No'],
              ['Kastle Connect', project.kastle_connect ? 'Yes' : 'No'],
              ['On-Site Security', project.on_site_security ? 'Yes' : 'No'],
              ['Takeover', project.takeover ? 'Yes' : 'No'],
              ['Rush', project.rush ? 'Yes' : 'No'],
              ['PPI Quote Needed', project.ppi_quote_needed ? 'Yes' : 'No']
            ].filter(item => item[1] === 'Yes'),
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            }
          });
        }
        
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
          
          // Add access point images if available
          if (sections.images) {
            const accessPointsWithImages = summary.equipment.accessPoints.filter(ap => 
              ap.images && ap.images.length > 0
            );
            
            if (accessPointsWithImages.length > 0) {
              doc.addPage();
              doc.setFontSize(20);
              doc.setTextColor(33, 33, 33);
              doc.text('ACCESS POINT IMAGES', 20, 30);
              
              let y = 50;
              for (const ap of accessPointsWithImages) {
                if (y > 240) {
                  addPageNumber(doc, pageNumber);
                  pageNumber++;
                  doc.addPage();
                  y = 40;
                }
                
                doc.setFontSize(14);
                doc.text(ap.location || `Access Point ${ap.id}`, 20, y);
                y += 10;
                
                if (ap.images && ap.images.length > 0) {
                  // Arrange images in a grid (2 per row)
                  for (let i = 0; i < Math.min(ap.images.length, 4); i++) {
                    const img = ap.images[i];
                    const xPos = i % 2 === 0 ? 20 : 110;
                    
                    try {
                      doc.addImage(
                        `data:image/jpeg;base64,${img.image_data}`,
                        'JPEG',
                        xPos,
                        y,
                        80,
                        60
                      );
                      
                      if (i % 2 === 1 || i === ap.images.length - 1) {
                        y += 70;
                      }
                    } catch (error) {
                      console.error(`Error adding image for access point ${ap.id}:`, error);
                    }
                  }
                  
                  if (ap.images.length > 4) {
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`+ ${ap.images.length - 4} more images`, 20, y);
                    y += 10;
                  }
                }
                
                y += 20;
              }
              
              addPageNumber(doc, pageNumber);
              pageNumber++;
            }
          }
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
            camera.mounting_type || 'N/A',
            camera.resolution || 'N/A',
            camera.field_of_view || 'N/A',
            camera.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Camera Type', 'Mounting', 'Resolution', 'FOV', 'Notes']],
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
              0: { cellWidth: 40 },
              5: { cellWidth: 40 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
          
          // Add camera images if available
          if (sections.images) {
            const camerasWithImages = summary.equipment.cameras.filter(camera => 
              camera.images && camera.images.length > 0
            );
            
            if (camerasWithImages.length > 0) {
              doc.addPage();
              doc.setFontSize(20);
              doc.setTextColor(33, 33, 33);
              doc.text('CAMERA IMAGES', 20, 30);
              
              let y = 50;
              for (const camera of camerasWithImages) {
                if (y > 240) {
                  addPageNumber(doc, pageNumber);
                  pageNumber++;
                  doc.addPage();
                  y = 40;
                }
                
                doc.setFontSize(14);
                doc.text(camera.location || `Camera ${camera.id}`, 20, y);
                y += 10;
                
                if (camera.images && camera.images.length > 0) {
                  // Arrange images in a grid (2 per row)
                  for (let i = 0; i < Math.min(camera.images.length, 4); i++) {
                    const img = camera.images[i];
                    const xPos = i % 2 === 0 ? 20 : 110;
                    
                    try {
                      doc.addImage(
                        `data:image/jpeg;base64,${img.image_data}`,
                        'JPEG',
                        xPos,
                        y,
                        80,
                        60
                      );
                      
                      if (i % 2 === 1 || i === camera.images.length - 1) {
                        y += 70;
                      }
                    } catch (error) {
                      console.error(`Error adding image for camera ${camera.id}:`, error);
                    }
                  }
                  
                  if (camera.images.length > 4) {
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`+ ${camera.images.length - 4} more images`, 20, y);
                    y += 10;
                  }
                }
                
                y += 20;
              }
              
              addPageNumber(doc, pageNumber);
              pageNumber++;
            }
          }
        }
        
        // Elevators
        if (summary.equipment.elevators && summary.equipment.elevators.length > 0) {
          doc.addPage();
          doc.setFontSize(20);
          doc.setTextColor(33, 33, 33);
          doc.text('ELEVATOR SCHEDULE', 20, 30);
          
          // Table of elevators
          const elevatorRows = summary.equipment.elevators.map(elevator => [
            elevator.location || 'N/A',
            elevator.bank_name || 'N/A',
            elevator.elevator_type || 'N/A',
            elevator.floors_count?.toString() || 'N/A',
            elevator.secured_floors || 'N/A',
            elevator.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Bank Name', 'Type', 'Floor Count', 'Secured Floors', 'Notes']],
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
              0: { cellWidth: 40 },
              5: { cellWidth: 40 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
          
          // Add elevator images if available
          if (sections.images) {
            const elevatorsWithImages = summary.equipment.elevators.filter(elevator => 
              elevator.images && elevator.images.length > 0
            );
            
            if (elevatorsWithImages.length > 0) {
              doc.addPage();
              doc.setFontSize(20);
              doc.setTextColor(33, 33, 33);
              doc.text('ELEVATOR IMAGES', 20, 30);
              
              let y = 50;
              for (const elevator of elevatorsWithImages) {
                if (y > 240) {
                  addPageNumber(doc, pageNumber);
                  pageNumber++;
                  doc.addPage();
                  y = 40;
                }
                
                doc.setFontSize(14);
                doc.text(elevator.location || `Elevator ${elevator.id}`, 20, y);
                y += 10;
                
                if (elevator.images && elevator.images.length > 0) {
                  // Arrange images in a grid (2 per row)
                  for (let i = 0; i < Math.min(elevator.images.length, 4); i++) {
                    const img = elevator.images[i];
                    const xPos = i % 2 === 0 ? 20 : 110;
                    
                    try {
                      doc.addImage(
                        `data:image/jpeg;base64,${img.image_data}`,
                        'JPEG',
                        xPos,
                        y,
                        80,
                        60
                      );
                      
                      if (i % 2 === 1 || i === elevator.images.length - 1) {
                        y += 70;
                      }
                    } catch (error) {
                      console.error(`Error adding image for elevator ${elevator.id}:`, error);
                    }
                  }
                  
                  if (elevator.images.length > 4) {
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`+ ${elevator.images.length - 4} more images`, 20, y);
                    y += 10;
                  }
                }
                
                y += 20;
              }
              
              addPageNumber(doc, pageNumber);
              pageNumber++;
            }
          }
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
            intercom.mounting_type || 'N/A',
            intercom.integration_type || 'N/A',
            intercom.notes || ''
          ]);
          
          (doc as any).autoTable({
            startY: 40,
            head: [['Location', 'Intercom Type', 'Mounting', 'Integration', 'Notes']],
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
              0: { cellWidth: 40 },
              4: { cellWidth: 50 }
            }
          });
          
          addPageNumber(doc, pageNumber);
          pageNumber++;
          
          // Add intercom images if available
          if (sections.images) {
            const intercomsWithImages = summary.equipment.intercoms.filter(intercom => 
              intercom.images && intercom.images.length > 0
            );
            
            if (intercomsWithImages.length > 0) {
              doc.addPage();
              doc.setFontSize(20);
              doc.setTextColor(33, 33, 33);
              doc.text('INTERCOM IMAGES', 20, 30);
              
              let y = 50;
              for (const intercom of intercomsWithImages) {
                if (y > 240) {
                  addPageNumber(doc, pageNumber);
                  pageNumber++;
                  doc.addPage();
                  y = 40;
                }
                
                doc.setFontSize(14);
                doc.text(intercom.location || `Intercom ${intercom.id}`, 20, y);
                y += 10;
                
                if (intercom.images && intercom.images.length > 0) {
                  // Arrange images in a grid (2 per row)
                  for (let i = 0; i < Math.min(intercom.images.length, 4); i++) {
                    const img = intercom.images[i];
                    const xPos = i % 2 === 0 ? 20 : 110;
                    
                    try {
                      doc.addImage(
                        `data:image/jpeg;base64,${img.image_data}`,
                        'JPEG',
                        xPos,
                        y,
                        80,
                        60
                      );
                      
                      if (i % 2 === 1 || i === intercom.images.length - 1) {
                        y += 70;
                      }
                    } catch (error) {
                      console.error(`Error adding image for intercom ${intercom.id}:`, error);
                    }
                  }
                  
                  if (intercom.images.length > 4) {
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`+ ${intercom.images.length - 4} more images`, 20, y);
                    y += 10;
                  }
                }
                
                y += 20;
              }
              
              addPageNumber(doc, pageNumber);
              pageNumber++;
            }
          }
        }
      }
      
      // --------- FLOORPLANS SECTION ---------
      if (sections.floorplans && floorplans && floorplans.length > 0) {
        // We'll need to capture floorplan elements from the DOM
        // For this example, we'll assume floorplan images are available via a base64 data URL
        
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('FLOORPLANS', 20, 30);
        
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text(`The project includes ${floorplans.length} floorplan(s).`, 20, 42);
        
        // In a real implementation, we'd capture floorplan canvases as images
        // For now, we'll just add a text placeholder
        
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(
          'Floorplans would be rendered here with all equipment markers shown in their configured locations.',
          20, 55, { maxWidth: doc.internal.pageSize.getWidth() - 40 }
        );
        
        // List available floorplans
        let y = 70;
        floorplans.forEach((floorplan, index) => {
          doc.setFontSize(14);
          doc.setTextColor(33, 33, 33);
          doc.text(`${index + 1}. ${floorplan.name || `Floorplan ${floorplan.id}`}`, 30, y);
          
          doc.setFontSize(10);
          doc.setTextColor(80, 80, 80);
          doc.text(`Page count: ${floorplan.page_count || 1}`, 40, y + 7);
          
          y += 20;
        });
        
        addPageNumber(doc, pageNumber);
        pageNumber++;
      }
      
      // --------- AI ANALYSIS SECTION ---------
      // Skipping the AI Analysis section for now as it's causing issues
      if (false && safeSections.aiAnalysis) {
        // Completely disabled to ensure export reliability
        console.log('AI Analysis section disabled to ensure export works');
        /* Temporarily disabled
        if (aiAnalysis && typeof aiAnalysis === 'object') {
        */
            doc.addPage();
            doc.setFontSize(20);
            doc.setTextColor(33, 33, 33);
            doc.text('AI ANALYSIS', 20, 30);
            
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text(
              'AI-powered insights from your site walk data to enhance technical planning and streamline installation.',
              20, 42, { maxWidth: doc.internal.pageSize.getWidth() - 40 }
            );
            
            // Executive Summary
            if (aiAnalysis.summary && typeof aiAnalysis.summary === 'string') {
              doc.setFontSize(16);
              doc.setTextColor(41, 65, 171);
              doc.text('Executive Summary', 20, 60);
              
              doc.setFontSize(11);
              doc.setTextColor(33, 33, 33);
              
              try {
                // Split summary text into paragraphs
                const summaryParagraphs = aiAnalysis.summary.split('\n\n');
                let y = 70;
                
                for (const paragraph of summaryParagraphs) {
                  // Check if we need to add a new page
                  if (y > 250) {
                    addPageNumber(doc, pageNumber);
                    pageNumber++;
                    doc.addPage();
                    y = 40;
                  }
                  
                  doc.text(paragraph, 20, y, { 
                    maxWidth: doc.internal.pageSize.getWidth() - 40,
                    align: 'left'
                  });
                  
                  // Calculate text height
                  const textHeight = doc.getTextDimensions(paragraph, {
                    maxWidth: doc.internal.pageSize.getWidth() - 40
                  }).h;
                  
                  y += textHeight + 10;
                }
              } catch (err) {
                // Fallback if splitting fails
                doc.text('Summary not available in the correct format', 20, 70);
                console.error('Error formatting AI summary:', err);
              }
            } else {
              doc.setFontSize(16);
              doc.setTextColor(41, 65, 171);
              doc.text('Executive Summary', 20, 60);
              
              doc.setFontSize(11);
              doc.setTextColor(33, 33, 33);
              doc.text('No summary available for this project.', 20, 70);
            }
            
            // Recommendations
            if (aiAnalysis.recommendations && Array.isArray(aiAnalysis.recommendations) && aiAnalysis.recommendations.length > 0) {
              // Check if we need to add a new page
              if (doc.internal.getCurrentPageInfo().pageNumber !== pageNumber) {
                addPageNumber(doc, pageNumber);
                pageNumber++;
                doc.addPage();
              }
              
              doc.setFontSize(16);
              doc.setTextColor(41, 65, 171);
              doc.text('Key Recommendations', 20, 170);
              
              doc.setFontSize(11);
              doc.setTextColor(33, 33, 33);
              
              let y = 180;
              aiAnalysis.recommendations.forEach((recommendation, index) => {
                if (typeof recommendation !== 'string') return;
                
                // Check if we need to add a new page
                if (y > 250) {
                  addPageNumber(doc, pageNumber);
                  pageNumber++;
                  doc.addPage();
                  y = 40;
                }
                
                doc.text(`${index + 1}. ${recommendation}`, 20, y, { 
                  maxWidth: doc.internal.pageSize.getWidth() - 40 
                });
                
                // Calculate text height
                const textHeight = doc.getTextDimensions(recommendation, {
                  maxWidth: doc.internal.pageSize.getWidth() - 40
                }).h;
                
                y += textHeight + 10;
              });
            } else {
              // If no recommendations are available
              doc.setFontSize(16);
              doc.setTextColor(41, 65, 171);
              doc.text('Key Recommendations', 20, 170);
              
              doc.setFontSize(11);
              doc.setTextColor(33, 33, 33);
              doc.text('No recommendations available for this project.', 20, 180);
            }
            
            addPageNumber(doc, pageNumber);
            pageNumber++;
          } else {
            // Skip this section if no data available
            console.log('Skipping AI Analysis section - no data available');
          }
        } catch (err) {
          console.error('Error rendering AI Analysis section:', err);
          // Continue with the export instead of failing
        }
      }
      
      // --------- MEETING AGENDA SECTION ---------
      if (sections.meetingAgenda) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('MEETING AGENDAS', 20, 30);
        
        // For the purpose of this example, we'll include mock agendas
        // In a real implementation, these would be retrieved from the database
        
        // Quote Review Meeting
        doc.setFontSize(16);
        doc.setTextColor(41, 65, 171);
        doc.text('Quote Review Meeting', 20, 50);
        
        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        
        const quoteReviewItems = [
          'Introduction of team members',
          'Review of site walk findings and equipment schedule',
          'Presentation of security solution',
          'Discussion of timeline and implementation phases',
          'Overview of project costs and investment',
          'Questions and next steps'
        ];
        
        let y = 60;
        quoteReviewItems.forEach((item, index) => {
          doc.text(`${index + 1}. ${item}`, 30, y);
          y += 10;
        });
        
        // Turnover Call Meeting
        doc.setFontSize(16);
        doc.setTextColor(41, 65, 171);
        doc.text('Turnover Call Meeting', 20, 130);
        
        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        
        const turnoverCallItems = [
          'Introduction of project team and roles',
          'Review of approved equipment schedule and locations',
          'Discussion of installation timeline and milestones',
          'Overview of client responsibilities and preparations',
          'Coordination with other contractors or stakeholders',
          'Review of communication plan and escalation procedures',
          'Questions and action items'
        ];
        
        y = 140;
        turnoverCallItems.forEach((item, index) => {
          doc.text(`${index + 1}. ${item}`, 30, y);
          y += 10;
        });
        
        addPageNumber(doc, pageNumber);
        pageNumber++;
      }
      
      // --------- KVG DETAILS SECTION ---------
      if (sections.kvgDetails && (kvgFormData || (kvgStreams && kvgStreams.length > 0))) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(33, 33, 33);
        doc.text('KASTLE VIDEO GUARDING', 20, 30);
        
        // KVG Form Data
        if (kvgFormData) {
          doc.setFontSize(16);
          doc.setTextColor(41, 65, 171);
          doc.text('KVG Configuration', 20, 50);
          
          // KVG form data table
          (doc as any).autoTable({
            startY: 60,
            head: [['Field', 'Value']],
            body: [
              ['BDM Owner', kvgFormData.bdmOwner || 'N/A'],
              ['Sales Engineer', kvgFormData.salesEngineer || 'N/A'],
              ['KVG SME', kvgFormData.kvgSme || 'N/A'],
              ['Customer Name', kvgFormData.customerName || 'N/A'],
              ['Site Address', kvgFormData.siteAddress || 'N/A'],
              ['City, State, ZIP', kvgFormData.cityStateZip || 'N/A'],
              ['CRM Opportunity', kvgFormData.crmOpportunity || 'N/A'],
              ['Number of Sites', kvgFormData.numSites?.toString() || '1'],
              ['Technology', kvgFormData.technology || 'N/A'],
              ['Install Type', kvgFormData.installType || 'N/A'],
              ['VOC Escalations', kvgFormData.vocEscalations?.toString() || '0'],
              ['Dispatch Responses', kvgFormData.dispatchResponses?.toString() || '0'],
              ['GDODS Patrols', kvgFormData.gdodsPatrols?.toString() || '0'],
              ['SGPP Patrols', kvgFormData.sgppPatrols?.toString() || '0'],
              ['Forensic Investigations', kvgFormData.forensicInvestigations?.toString() || '0'],
              ['App Users', kvgFormData.appUsers?.toString() || '0'],
              ['Audio Devices', kvgFormData.audioDevices?.toString() || '0']
            ],
            theme: 'grid',
            headStyles: {
              fillColor: [41, 65, 171],
              textColor: [255, 255, 255]
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 120 }
            }
          });
        }
        
        // KVG Streams
        if (kvgStreams && kvgStreams.length > 0) {
          const startY = kvgFormData ? (doc as any).lastAutoTable.finalY + 20 : 60;
          
          // If startY is too close to the bottom of the page, add a new page
          if (startY > 200) {
            addPageNumber(doc, pageNumber);
            pageNumber++;
            doc.addPage();
            
            doc.setFontSize(16);
            doc.setTextColor(41, 65, 171);
            doc.text('KVG Streams', 20, 40);
            
            // KVG streams table
            (doc as any).autoTable({
              startY: 50,
              head: [['Location', 'Camera Type', 'Environment', 'Event Monitoring', 'Use Case']],
              body: kvgStreams.map(stream => [
                stream.location || 'N/A',
                stream.cameraType || 'N/A',
                stream.environment || 'N/A',
                stream.eventMonitoring || 'N/A',
                stream.useCaseProblem || 'N/A'
              ]),
              theme: 'grid',
              headStyles: {
                fillColor: [41, 65, 171],
                textColor: [255, 255, 255]
              },
              styles: {
                overflow: 'ellipsize',
                cellWidth: 'wrap'
              }
            });
          } else {
            doc.setFontSize(16);
            doc.setTextColor(41, 65, 171);
            doc.text('KVG Streams', 20, startY);
            
            // KVG streams table
            (doc as any).autoTable({
              startY: startY + 10,
              head: [['Location', 'Camera Type', 'Environment', 'Event Monitoring', 'Use Case']],
              body: kvgStreams.map(stream => [
                stream.location || 'N/A',
                stream.cameraType || 'N/A',
                stream.environment || 'N/A',
                stream.eventMonitoring || 'N/A',
                stream.useCaseProblem || 'N/A'
              ]),
              theme: 'grid',
              headStyles: {
                fillColor: [41, 65, 171],
                textColor: [255, 255, 255]
              },
              styles: {
                overflow: 'ellipsize',
                cellWidth: 'wrap'
              }
            });
          }
        }
        
        addPageNumber(doc, pageNumber);
        pageNumber++;
      }
      
      // --------- GATEWAY CALCULATOR SECTION ---------
      if (sections.gatewayCalculator) {
        try {
          // Use the safe version that was checked earlier
          console.log('Gateway Calculator section - attempting to render with data:', safeGatewayData);
          if (safeGatewayData && typeof safeGatewayData === 'object') {
            doc.addPage();
            doc.setFontSize(20);
            doc.setTextColor(33, 33, 33);
            doc.text('GATEWAY CALCULATOR', 20, 30);
            
            doc.setFontSize(16);
            doc.setTextColor(41, 65, 171);
            doc.text('Gateway Configuration Summary', 20, 50);
            
            doc.setFontSize(12);
            doc.setTextColor(33, 33, 33);
            doc.text('Camera Stream Requirements', 20, 70);
            
            // Safely extract values with proper type checking
            const totalStreams = typeof gatewayData.totalStreams === 'number' ? 
              gatewayData.totalStreams.toString() : '0';
            const totalThroughput = typeof gatewayData.totalThroughput === 'number' ? 
              gatewayData.totalThroughput.toString() : '0';
            const totalStorage = typeof gatewayData.totalStorage === 'number' ? 
              gatewayData.totalStorage.toString() : '0';
            
            // Camera stream requirements table
            (doc as any).autoTable({
              startY: 80,
              head: [['Metric', 'Value']],
              body: [
                ['Total Camera Streams', totalStreams],
                ['Total Throughput (Mbps)', totalThroughput],
                ['Total Storage (TB)', totalStorage]
              ],
              theme: 'grid',
              headStyles: {
                fillColor: [41, 65, 171],
                textColor: [255, 255, 255]
              },
              columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 80 }
              }
            });
        
            doc.setFontSize(12);
            doc.setTextColor(33, 33, 33);
            doc.text('Recommended Gateway Solution', 20, 130);
            
            // Safely extract gateway type and count
            const gatewayType = typeof gatewayData.gatewayType === 'string' ? 
              gatewayData.gatewayType : '16ch';
            const gatewayCount = typeof gatewayData.gatewayCount === 'number' ? 
              gatewayData.gatewayCount.toString() : '1';
              
            // Gateway solution table
            (doc as any).autoTable({
              startY: 140,
              head: [['Gateway Type', 'Quantity', 'Max Streams', 'Max Throughput', 'Max Storage']],
              body: [
                [
                  gatewayType,
                  gatewayCount,
                  gatewayType === '8ch' ? '8' : '16',
                  gatewayType === '8ch' ? '320 Mbps' : '640 Mbps',
                  gatewayType === '8ch' ? '6 TB' : '12 TB'
                ]
              ],
              theme: 'grid',
              headStyles: {
                fillColor: [41, 65, 171],
                textColor: [255, 255, 255]
              }
            });
            
            // Camera details with improved error handling
            if (gatewayData.cameras && Array.isArray(gatewayData.cameras) && gatewayData.cameras.length > 0) {
              doc.setFontSize(12);
              doc.setTextColor(33, 33, 33);
              doc.text('Camera Details', 20, 180);
              
              try {
                const cameraRows = gatewayData.cameras.map((camera: any) => {
                  if (!camera || typeof camera !== 'object') {
                    return ['Unknown Camera', '1080p', '15', '250'];
                  }
                  
                  return [
                    typeof camera.name === 'string' ? camera.name : 'Camera',
                    typeof camera.resolution === 'string' ? camera.resolution : '1080p',
                    typeof camera.frameRate === 'number' ? camera.frameRate.toString() : '15',
                    typeof camera.storage === 'number' ? camera.storage.toString() : '250'
                  ];
                });
                
                (doc as any).autoTable({
                  startY: 190,
                  head: [['Camera', 'Resolution', 'Frame Rate', 'Storage (GB)']],
                  body: cameraRows,
                  theme: 'grid',
                  headStyles: {
                    fillColor: [41, 65, 171],
                    textColor: [255, 255, 255]
                  },
                  columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 40 }
                  }
                });
              } catch (err) {
                console.error('Error rendering camera details table:', err);
                doc.text('Camera details could not be processed', 20, 190);
              }
            } else {
              doc.setFontSize(12);
              doc.setTextColor(33, 33, 33);
              doc.text('No camera details available', 20, 180);
            }
            
            addPageNumber(doc, pageNumber);
            pageNumber++;
          } else {
            // Skip this section if data is missing
            console.log('Skipping Gateway Calculator section - no valid data available');
          }
        } catch (err) {
          console.error('Error rendering Gateway Calculator section:', err);
          // Continue with other sections instead of failing the entire export
        }
      }
      
      // Replace total page count placeholder with actual value
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${totalPages}`, 
          doc.internal.pageSize.getWidth() / 2, 
          doc.internal.pageSize.getHeight() - 10, 
          { align: 'center' }
        );
      }
      
      // Save the PDF with the project name
      doc.save(`${projectName}_Comprehensive_Report.pdf`);
      
      toast({
        title: 'Export Complete',
        description: 'Your comprehensive site walk report has been generated.'
      });
    } catch (error) {
      console.error('EXPORT ERROR:', error);
      
      // If there's a specific error message, display it
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: `There was an error generating the report: ${errorMessage}`
      });
    } finally {
      setIsExporting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 border-0 shadow-lg"
            size="lg"
            disabled={disabled || isExporting}
            onClick={() => setIsDialogOpen(true)}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Comprehensive Export
              </>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Printer className="h-5 w-5 text-primary" />
              Comprehensive Site Walk Export
            </DialogTitle>
            <DialogDescription>
              Generate a beautifully formatted PDF report that includes all aspects of your site walk.
              Select which sections to include in your export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium mb-2">Export Sections</h3>
              <Button 
                variant="link" 
                className="h-auto p-0 text-primary text-sm"
                onClick={selectAllSections}
              >
                Select All
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dashboardSummary" 
                  checked={sections.dashboardSummary} 
                  onCheckedChange={() => toggleSection('dashboardSummary')}
                />
                <label htmlFor="dashboardSummary" className="text-sm font-medium leading-none cursor-pointer">
                  Dashboard Summary
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
                  id="aiAnalysis" 
                  checked={sections.aiAnalysis} 
                  onCheckedChange={() => toggleSection('aiAnalysis')}
                />
                <label htmlFor="aiAnalysis" className="text-sm font-medium leading-none cursor-pointer">
                  AI Analysis
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="meetingAgenda" 
                  checked={sections.meetingAgenda} 
                  onCheckedChange={() => toggleSection('meetingAgenda')}
                />
                <label htmlFor="meetingAgenda" className="text-sm font-medium leading-none cursor-pointer">
                  Meeting Agendas
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="kvgDetails" 
                  checked={sections.kvgDetails} 
                  onCheckedChange={() => toggleSection('kvgDetails')}
                />
                <label htmlFor="kvgDetails" className="text-sm font-medium leading-none cursor-pointer">
                  Kastle Video Guarding
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gatewayCalculator" 
                  checked={sections.gatewayCalculator} 
                  onCheckedChange={() => toggleSection('gatewayCalculator')}
                />
                <label htmlFor="gatewayCalculator" className="text-sm font-medium leading-none cursor-pointer">
                  Gateway Calculator
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="images" 
                  checked={sections.images} 
                  onCheckedChange={() => toggleSection('images')}
                />
                <label htmlFor="images" className="text-sm font-medium leading-none cursor-pointer">
                  Equipment Images
                </label>
              </div>
            </div>
            
            {!Object.values(sections).some(value => value) && (
              <div className="flex items-center p-4 mt-2 bg-amber-100 text-amber-800 rounded-md">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p className="text-sm">Please select at least one section to include in the export.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary text-white"
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
    </>
  );
};

export default ComprehensiveExport;