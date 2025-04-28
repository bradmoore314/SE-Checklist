// This script will generate a template Excel file
import * as XLSX from 'xlsx';

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create headers
const headers = [
  'Door Number',
  'Door Name',
  'Floor',
  'Monitoring Type',
  'Install Type',
  'Reader Type',
  'Motion Reader',
  'Exit Reader',
  'Lock Type',
  'Connect',
  'REX',
  'Push To Exit',
  'Push To Enter',
  'Door Detail',
  'HUB Location',
  'Module Location',
  'Associated Camera',
  'Notes'
];

// Create a worksheet
const ws = XLSX.utils.aoa_to_sheet([headers]);

// Format column widths
const colWidths = [
  { wch: 10 }, // Door Number
  { wch: 25 }, // Door Name
  { wch: 10 }, // Floor
  { wch: 15 }, // Monitoring Type
  { wch: 20 }, // Install Type
  { wch: 15 }, // Reader Type
  { wch: 15 }, // Motion Reader
  { wch: 15 }, // Exit Reader
  { wch: 15 }, // Lock Type
  { wch: 10 }, // Connect
  { wch: 10 }, // REX
  { wch: 15 }, // Push To Exit
  { wch: 15 }, // Push To Enter
  { wch: 15 }, // Door Detail
  { wch: 15 }, // HUB Location
  { wch: 15 }, // Module Location
  { wch: 20 }, // Associated Camera
  { wch: 30 }  // Notes
];

ws['!cols'] = colWidths;

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, ws, 'Door Schedule');

// Write the workbook to a file
XLSX.writeFile(workbook, 'public/assets/DoorScheduleTemplate.xlsx');

console.log('Template file generated: public/assets/DoorScheduleTemplate.xlsx');