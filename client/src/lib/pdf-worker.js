// This file explicitly sets up the PDF.js worker
import { pdfjs } from 'react-pdf';

// Import the worker directly
import 'pdfjs-dist/build/pdf.worker.entry';

console.log('PDF.js worker loaded successfully');
console.log(`Using PDF.js version: ${pdfjs.version}`);