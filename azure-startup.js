/**
 * Azure Startup Script
 * 
 * This script runs when the application starts on Azure.
 * It sets production environment variables and launches the application.
 */

// Use CommonJS syntax for compatibility
const fs = require('fs');
const path = require('path');

// Set environment variables specific to production
process.env.NODE_ENV = 'production';

// Enable auth bypass for initial deployment
process.env.ALLOW_INITIAL_SETUP = 'true';

// Log startup info
console.log('Starting Azure application...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Auth bypass: ${process.env.ALLOW_INITIAL_SETUP}`);

// Check if the dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory not found. Make sure the build completed successfully.');
  process.exit(1);
}

// Start the application using production build
const startApp = async () => {
  try {
    // Dynamic import to support ESM
    const { default: app } = await import('./dist/index.js');
    console.log('Application started successfully');
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
};

startApp();