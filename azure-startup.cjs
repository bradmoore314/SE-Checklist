/**
 * Azure Startup Script
 * 
 * This script runs when the application starts on Azure.
 * It sets production environment variables and launches the application.
 */

// Use CommonJS syntax for compatibility
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

// Log environment variables for debugging (without showing sensitive values)
console.log('--- ENVIRONMENT INFO ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set (value hidden)' : 'Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set (value hidden)' : 'Not set');
console.log('NODE_VERSION:', process.version);
console.log('WORKING_DIRECTORY:', process.cwd());
console.log('FILES IN DIRECTORY:');
try {
  console.log(fs.readdirSync(process.cwd()).join(', '));
} catch (err) {
  console.error('Error listing directory:', err.message);
}

// Set environment variables specific to production if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Enable auth bypass for initial deployment
process.env.ALLOW_INITIAL_SETUP = 'true';

console.log('Starting Azure application in', process.env.NODE_ENV, 'mode...');

// Check if the dist directory exists and contains the server and client folders
const distPath = path.join(__dirname, 'dist');
const serverDistPath = path.join(distPath, 'server');
const clientDistPath = path.join(distPath, 'client');

console.log('Checking dist directories:');
console.log('- dist:', fs.existsSync(distPath) ? 'Exists' : 'Missing');
if (fs.existsSync(distPath)) {
  console.log('- dist content:', fs.readdirSync(distPath).join(', '));
}
console.log('- dist/server:', fs.existsSync(serverDistPath) ? 'Exists' : 'Missing');
console.log('- dist/client:', fs.existsSync(clientDistPath) ? 'Exists' : 'Missing');

// If the dist directory doesn't exist or is incomplete, try to build the app
if (!fs.existsSync(distPath) || !fs.existsSync(serverDistPath) || !fs.existsSync(clientDistPath)) {
  console.log('Dist directory not found or incomplete. Running build...');
  
  // First install any missing production dependencies
  console.log('Installing production dependencies...');
  try {
    execSync('npm ci --omit=dev', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (err) {
    console.error('Failed to install dependencies:', err.message);
    // Continue even if dependencies fail, as they might already be installed
  }
  
  // Then try to build the application
  try {
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully');
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
}

// Start the application with proper error handling
console.log('Starting server application...');

// Look for server entry point
const possibleEntryPoints = [
  './dist/server/index.js',
  './dist/index.js',
  './dist/server.js',
  './index.js'
];

let entryPoint = null;
for (const ep of possibleEntryPoints) {
  if (fs.existsSync(path.resolve(__dirname, ep))) {
    entryPoint = ep;
    console.log(`Found entry point: ${entryPoint}`);
    break;
  }
}

if (!entryPoint) {
  console.error('No entry point found. Checked:', possibleEntryPoints.join(', '));
  process.exit(1);
}

try {
  // Use child_process.spawn to run the app as a separate process
  // This is more reliable than using require() or import()
  const child = spawn('node', [entryPoint], {
    stdio: 'inherit',
    env: process.env
  });
  
  child.on('error', (err) => {
    console.error('Failed to start application:', err.message);
    process.exit(1);
  });
  
  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`Application exited with code ${code} and signal ${signal}`);
      process.exit(code || 1);
    }
  });
  
  console.log('Application started successfully');
  
  // Monitor application health
  if (process.env.WEBSITE_HOSTNAME) {
    setInterval(() => {
      http.get(`http://localhost:${process.env.PORT || 5000}/api/health`, (res) => {
        console.log(`Health check: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('Health check failed:', err.message);
      });
    }, 30000); // Check every 30 seconds
  }
} catch (err) {
  console.error('Failed to start application:', err.message);
  console.error(err.stack);
  process.exit(1);
}