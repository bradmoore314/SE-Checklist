import React, { useRef } from 'react';
import { 
  DownloadIcon, 
  FileSpreadsheetIcon, 
  FileTextIcon, 
  FileIcon,
  FilePdf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportData, ExportFormat, exportElementToPDF } from '@/utils/exportUtils';

interface ExportMenuProps {
  data: any[];
  filename: string;
  title?: string;
  elementId?: string; // Optional ID of element to export as PDF
  columns?: { header: string; dataKey: string }[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ExportMenu = ({
  data,
  filename,
  title,
  elementId,
  columns,
  disabled = false,
  variant = 'outline',
  size = 'default'
}: ExportMenuProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      if (format === 'pdf' && elementId) {
        // Export the specific element to PDF if elementId is provided
        const element = document.getElementById(elementId);
        if (element) {
          await exportElementToPDF(element, filename, title);
          return;
        }
      }
      
      // Otherwise export the data in the specified format
      await exportData(data, format, filename, title, columns);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div ref={targetRef}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={disabled}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Choose format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FilePdf className="h-4 w-4 mr-2 text-red-600" />
            <span>PDF Document</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheetIcon className="h-4 w-4 mr-2 text-green-600" />
            <span>Excel Spreadsheet</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileTextIcon className="h-4 w-4 mr-2 text-blue-600" />
            <span>CSV File</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileIcon className="h-4 w-4 mr-2 text-orange-600" />
            <span>JSON File</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportMenu;