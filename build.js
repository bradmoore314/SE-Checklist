/**
 * Custom build script for Azure deployment
 * This script is used during the Azure deployment process to build the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log the start of the build process
console.log('Starting build process for Azure deployment...');

try {
  // Install production dependencies only
  console.log('Installing production dependencies...');
  execSync('npm ci --production --no-optional', { stdio: 'inherit' });

  // Run the build script
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Create a .env file with placeholders to ensure the app starts
  if (!fs.existsSync('.env')) {
    console.log('Creating placeholder .env file...');
    const envContent = `
# This file was auto-generated during deployment
# Actual values will be provided by Azure App Service environment variables
NODE_ENV=production
    `;
    fs.writeFileSync('.env', envContent.trim());
  }

  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}