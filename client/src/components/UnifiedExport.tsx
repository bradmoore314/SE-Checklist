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

interface UnifiedExportProps {
  projectId: number;
  projectName: string;
  disabled?: boolean;
  variant?: 'comprehensive' | 'sitewalk' | 'basic';
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

/**
 * Unified Export Component - Consolidates all export functionality
 * Supports comprehensive reports, site walk exports, and basic project exports
 */
const UnifiedExport: React.FC<UnifiedExportProps> = ({ 
  projectId, 
  projectName,
  disabled = false,
  variant = 'comprehensive',
  buttonText,
  buttonIcon
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sections, setSections] = useState<SectionOptions>({
    dashboardSummary: true,
    projectDetails: true,
    equipmentSchedules: variant !== 'basic',
    floorplans: variant !== 'basic',
    aiAnalysis: variant === 'comprehensive',
    meetingAgenda: variant === 'comprehensive',
    kvgDetails: variant !== 'basic',
    gatewayCalculator: variant !== 'basic',
    images: variant !== 'basic',
  });

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: isDialogOpen,
  });

  const { data: accessPoints = [] } = useQuery<AccessPoint[]>({
    queryKey: [`/api/projects/${projectId}/access-points`],
    enabled: isDialogOpen && sections.equipmentSchedules,
  });

  const { data: cameras = [] } = useQuery<Camera[]>({
    queryKey: [`/api/projects/${projectId}/cameras`],
    enabled: isDialogOpen && sections.equipmentSchedules,
  });

  const { data: elevators = [] } = useQuery<Elevator[]>({
    queryKey: [`/api/projects/${projectId}/elevators`],
    enabled: isDialogOpen && sections.equipmentSchedules,
  });

  const { data: intercoms = [] } = useQuery<Intercom[]>({
    queryKey: [`/api/projects/${projectId}/intercoms`],
    enabled: isDialogOpen && sections.equipmentSchedules,
  });

  const { data: kvgData } = useQuery<KvgFormData>({
    queryKey: [`/api/projects/${projectId}/kvg`],
    enabled: isDialogOpen && sections.kvgDetails,
  });

  const toggleSection = (section: keyof SectionOptions) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generatePDF = async () => {
    if (!project) return;

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const title = variant === 'sitewalk' ? 'Site Walk Report' : 
                    variant === 'basic' ? 'Project Summary' : 'Comprehensive Project Report';
      doc.text(title, 20, yPosition);
      yPosition += 15;

      // Add project name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(`Project: ${projectName}`, 20, yPosition);
      yPosition += 10;

      // Add date
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Project Details Section
      if (sections.projectDetails && project) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Details', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const projectDetails = [
          ['Address', project.address || 'Not specified'],
          ['Client Contact', project.clientContact || 'Not specified'],
          ['Status', project.status || 'Active'],
          ['Description', project.description || 'No description provided']
        ];

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Field', 'Value']],
          body: projectDetails,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Equipment Summary Section
      if (sections.equipmentSchedules) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Equipment Summary', 20, yPosition);
        yPosition += 10;

        const equipmentSummary = [
          ['Access Points', accessPoints.length.toString()],
          ['Cameras', cameras.length.toString()],
          ['Elevators', elevators.length.toString()],
          ['Intercoms', intercoms.length.toString()]
        ];

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Equipment Type', 'Count']],
          body: equipmentSummary,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // KVG Details Section
      if (sections.kvgDetails && kvgData) {
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('KVG Configuration', 20, yPosition);
        yPosition += 10;

        const kvgDetails = [
          ['Total Camera Streams', kvgData.totalCameraStreams?.toString() || '0'],
          ['Event Monitoring', kvgData.eventMonitoring ? 'Yes' : 'No'],
          ['Patrol Groups', kvgData.patrolGroups?.toString() || '0']
        ];

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Configuration', 'Value']],
          body: kvgDetails,
          theme: 'grid',
          headStyles: { fillColor: [155, 89, 182] },
          styles: { fontSize: 9 }
        });
      }

      // Save the PDF
      const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_')}_${variant}_report_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast({
        title: "Export Successful",
        description: `${title} has been downloaded successfully.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsDialogOpen(false);
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    return variant === 'sitewalk' ? 'Export Site Walk Report' :
           variant === 'basic' ? 'Export Summary' : 'Export Comprehensive Report';
  };

  const getButtonIcon = () => {
    if (buttonIcon) return buttonIcon;
    return variant === 'sitewalk' ? <Printer className="h-4 w-4" /> : <FileDown className="h-4 w-4" />;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Select which sections to include in your {variant} report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dashboardSummary"
              checked={sections.dashboardSummary}
              onCheckedChange={() => toggleSection('dashboardSummary')}
            />
            <label htmlFor="dashboardSummary" className="text-sm font-medium">
              Dashboard Summary
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectDetails"
              checked={sections.projectDetails}
              onCheckedChange={() => toggleSection('projectDetails')}
            />
            <label htmlFor="projectDetails" className="text-sm font-medium">
              Project Details
            </label>
          </div>

          {variant !== 'basic' && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="equipmentSchedules"
                  checked={sections.equipmentSchedules}
                  onCheckedChange={() => toggleSection('equipmentSchedules')}
                />
                <label htmlFor="equipmentSchedules" className="text-sm font-medium">
                  Equipment Schedules
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kvgDetails"
                  checked={sections.kvgDetails}
                  onCheckedChange={() => toggleSection('kvgDetails')}
                />
                <label htmlFor="kvgDetails" className="text-sm font-medium">
                  KVG Details
                </label>
              </div>
            </>
          )}

          {variant === 'comprehensive' && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aiAnalysis"
                  checked={sections.aiAnalysis}
                  onCheckedChange={() => toggleSection('aiAnalysis')}
                />
                <label htmlFor="aiAnalysis" className="text-sm font-medium">
                  AI Analysis
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meetingAgenda"
                  checked={sections.meetingAgenda}
                  onCheckedChange={() => toggleSection('meetingAgenda')}
                />
                <label htmlFor="meetingAgenda" className="text-sm font-medium">
                  Meeting Agenda
                </label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getButtonIcon()
            )}
            {isExporting ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedExport;