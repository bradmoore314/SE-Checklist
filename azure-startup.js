/**
 * Azure Startup Script
 * 
 * This script runs when the application starts on Azure.
 * It sets production environment variables and launches the application.
 */

process.env.NODE_ENV = 'production';

// If this is the first deployment, enable the setup bypass
// for initial admin user creation
if (!process.env.DISABLE_INITIAL_SETUP) {
  console.log('Initial setup mode enabled for first deployment');
  process.env.ALLOW_INITIAL_SETUP = 'true';
}

// Start the server
console.log('Starting application in production mode...');
require('./server/index.js');