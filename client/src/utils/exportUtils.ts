import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Define export format types
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Convert project data to CSV format
 */
export const convertToCSV = (data: any[]): string => {
  if (!data || !data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Handle strings with commas by wrapping in quotes
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : String(value);
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string): void => {
  const csvString = convertToCSV(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  
  // Append link, trigger click, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel file
 */
export const exportToExcel = (data: any[], filename: string): void => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export data to JSON file
 */
export const exportToJSON = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  
  // Append link, trigger click, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export table data to PDF
 */
export const exportTableToPDF = (
  data: any[], 
  filename: string, 
  title: string = 'Export Report',
  columns?: { header: string; dataKey: string }[]
): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  
  // Add date
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    30
  );
  
  // Add table
  (doc as any).autoTable({
    startY: 38,
    head: columns ? [columns.map(col => col.header)] : [Object.keys(data[0])],
    body: columns 
      ? data.map(row => columns.map(col => row[col.dataKey] || ''))
      : data.map(row => Object.values(row)),
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    }
  });
  
  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export a DOM element to PDF
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  filename: string,
  title: string = 'Export Report'
): Promise<void> => {
  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Increase resolution
    useCORS: true, // Enable cross-origin images
    logging: false,
    backgroundColor: '#ffffff'
  });
  
  // Calculate dimensions and orientation
  const imgWidth = 210; // A4 width in mm (210mm)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let orientation: 'portrait' | 'landscape' = 'portrait';
  
  if (canvas.width > canvas.height) {
    orientation = 'landscape';
  }
  
  const doc = new jsPDF(orientation, 'mm', 'a4');
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  
  // Add date
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    30
  );
  
  // Calculate position for center alignment
  const marginX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
  
  // Add image
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(imgData, 'JPEG', marginX, 38, imgWidth, imgHeight);
  
  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Generate a comprehensive project report as PDF
 */
export const generateProjectReport = async (
  projectData: any,
  sections: {
    element: HTMLElement;
    title: string;
  }[],
  filename: string
): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add cover page
  doc.setFontSize(24);
  doc.text('Project Report', 105, 80, { align: 'center' });
  doc.setFontSize(16);
  doc.text(projectData.name || 'Unnamed Project', 105, 100, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 115, { align: 'center' });
  doc.text(`Client: ${projectData.client || 'N/A'}`, 105, 125, { align: 'center' });
  doc.text(`Location: ${projectData.site_address || 'N/A'}`, 105, 135, { align: 'center' });
  
  let currentPage = 1;
  
  // Process each section
  for (const section of sections) {
    try {
      // Capture the section as a canvas
      const canvas = await html2canvas(section.element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Add new page
      if (currentPage > 1) {
        doc.addPage();
      } else {
        currentPage++;
      }
      
      // Calculate dimensions
      const imgWidth = 180; // Width in mm with margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add section title
      doc.setFontSize(16);
      doc.text(section.title, 15, 20);
      
      // Add section content as image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(imgData, 'JPEG', 15, 30, imgWidth, imgHeight);
    } catch (error) {
      console.error(`Error processing section "${section.title}":`, error);
    }
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export door schedule data to a Kastle Excel template
 */
export const exportDoorScheduleToTemplate = async (
  doors: any[], 
  projectName: string,
  templateUrl: string = '/assets/DoorScheduleTemplate.xlsx'
): Promise<void> => {
  try {
    // Fetch the template file
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to load template file: ${response.statusText}`);
    }
    
    const templateArrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(templateArrayBuffer, { type: 'array' });
    
    // Get the first sheet in the workbook
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Fill in the data rows in the template
    doors.forEach((door, index) => {
      // Start from row 2 (row index 1) since row 1 is the header in the template
      const rowIndex = index + 1;
      
      // Door Number (column A)
      worksheet[`A${rowIndex + 1}`] = { t: 'n', v: index + 1 };
      
      // Door Name/Location (column B)
      worksheet[`B${rowIndex + 1}`] = { t: 's', v: door.location || '' };
      
      // Floor (column C)
      worksheet[`C${rowIndex + 1}`] = { t: 's', v: door.floor || '1' };
      
      // Monitoring Type (column D)
      const monitoringType = mapMonitoringType(door.monitoring_type);
      worksheet[`D${rowIndex + 1}`] = { t: 's', v: monitoringType };
      
      // Install Type (column E)
      const installType = mapInstallType(door.takeover || 'New');
      worksheet[`E${rowIndex + 1}`] = { t: 's', v: installType };
      
      // Reader Type (column F)
      const readerType = mapReaderType(door.reader_type);
      worksheet[`F${rowIndex + 1}`] = { t: 's', v: readerType };
      
      // Lock Type (column I)
      const lockType = mapLockType(door.lock_type);
      worksheet[`I${rowIndex + 1}`] = { t: 's', v: lockType };
      
      // Notes (column Q)
      worksheet[`Q${rowIndex + 1}`] = { t: 's', v: door.notes || '' };
    });
    
    // Generate and download the file
    XLSX.writeFile(workbook, `${projectName} - Door Schedule.xlsx`);
  } catch (error) {
    console.error('Error exporting to template:', error);
    alert('Failed to export to template. Please try again or contact support.');
  }
};

// Helper mapping functions to convert our terms to Kastle template terms
function mapMonitoringType(type: string): string {
  switch (type) {
    case 'Monitored': return 'Alarm';
    case 'Request to Exit': return 'Prop';
    case 'None': return '';
    default: return type || '';
  }
}

function mapInstallType(takeover: string): string {
  switch (takeover) {
    case 'Yes': return 'Takeover';
    case 'No': return 'New Install';
    case 'Existing': return 'Installed/Existing Lock';
    default: return takeover || '';
  }
}

function mapReaderType(type: string): string {
  switch (type) {
    case 'Standard HID Reader': return 'KR-100';
    case 'Mullion Reader': return 'KR-100';
    case 'Keypad': return 'KR-100';
    default: return type || '';
  }
}

function mapLockType(type: string): string {
  switch (type) {
    case 'Mag Lock': return 'Single Mag';
    case 'Electric Strike': return 'Single Standard';
    case 'Electric Mortise': return 'Single Standard';
    default: return type || '';
  }
}

/**
 * Export data to the specified format
 */
export const exportData = async (
  data: any[],
  format: ExportFormat,
  filename: string,
  title?: string,
  columns?: { header: string; dataKey: string }[]
): Promise<void> => {
  switch (format) {
    case 'pdf':
      exportTableToPDF(data, filename, title, columns);
      break;
    case 'excel':
      exportToExcel(data, filename);
      break;
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    default:
      console.error('Unsupported export format');
  }
};