import React from 'react';
import { FileDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportData, ExportFormat } from '@/utils/exportUtils';

interface EquipmentExportButtonProps {
  data: any[];
  equipmentType: string;
  projectName?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const EquipmentExportButton = ({
  data,
  equipmentType,
  projectName = 'Project',
  disabled = false,
  variant = 'outline',
  size = 'sm'
}: EquipmentExportButtonProps) => {
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    try {
      const filename = `${projectName}_${equipmentType.replace(/\s+/g, '_')}`;
      const title = `${projectName} - ${equipmentType} Data`;
      
      await exportData(data, format, filename, title);
      
      toast({
        title: 'Export Complete',
        description: `${equipmentType} data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data',
        variant: 'destructive'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled}>
          <FileDownIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export {equipmentType}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EquipmentExportButton;