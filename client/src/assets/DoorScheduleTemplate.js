// This script will generate a template Excel file
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create headers - matches the Kastle template format
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

// Add some sample data to demonstrate formatting
const sampleData = [
  [1, 'Main Entry', '1', 'Alarm', 'Takeover', 'KR-100', '', '', 'Single Mag', '', '', '', '', '', '', '', '', ''],
  [2, 'Loading Dock', '1', 'Prop', 'New Install', 'KR-100', '', '', 'Single Standard', '', '', '', '', '', '', '', '', ''],
  [3, '1st Floor Stairwell', '1', 'Prop', 'Installed/Existing Lock', 'KR-100', '', '', 'Single Mag', '', '', '', '', '', '', '', '', '']
];

// Add sample data rows
sampleData.forEach((row, idx) => {
  const rowRef = idx + 2; // Start at row 2 (after headers)
  row.forEach((cell, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: rowRef - 1, c: colIdx });
    ws[cellRef] = { t: typeof cell === 'number' ? 'n' : 's', v: cell };
  });
});

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, ws, 'Door Schedule');

// Make sure the directory exists
const outputDir = path.resolve('public/assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Set the output path
const outputPath = path.join(outputDir, 'DoorScheduleTemplate.xlsx');

// Write the workbook to a file
XLSX.writeFile(workbook, outputPath);

console.log(`Template file generated at: ${outputPath}`);