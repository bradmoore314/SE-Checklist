/**
 * Azure Startup Script
 * 
 * This script runs when the application starts on Azure.
 * It sets production environment variables and launches the application.
 */

// Set environment variables specific to production
process.env.NODE_ENV = 'production';

// Enable auth bypass for initial deployment
process.env.ALLOW_INITIAL_SETUP = 'true';

// Log startup info
console.log('Starting Azure application...');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Auth bypass: ${process.env.ALLOW_INITIAL_SETUP}`);

// Start the application using production build
import('./dist/index.js').catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});