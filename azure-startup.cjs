/**
 * Azure Startup Script
 * 
 * This script runs when the application starts on Azure.
 * It sets production environment variables and launches the application.
 */

// Use CommonJS syntax for compatibility
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  console.log('Dist directory not found. Running build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Start the application
console.log('Starting application...');
try {
  // Use require.main to execute the app directly
  require('./dist/index.js');
} catch (err) {
  console.error('Failed to start application:', err);
  
  // If requiring as CommonJS fails, try dynamic import for ESM
  import('./dist/index.js').catch(err => {
    console.error('Failed to start application with dynamic import:', err);
    process.exit(1);
  });
}