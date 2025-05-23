/**
 * PDF.js Worker Configuration
 * 
 * This file handles the initialization of the PDF.js worker,
 * ensuring consistent use across the application.
 */

import { pdfjs } from 'react-pdf';

// Configure proper worker source - use CDN for reliability with specific version
// Do not use dynamic versioning to ensure consistency across components
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// Export worker configuration - keeping as separate file for easier debugging
export default pdfjs;