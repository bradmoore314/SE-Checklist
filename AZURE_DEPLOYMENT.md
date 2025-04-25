# Azure Deployment Guide

This document outlines the steps required to deploy the Site Walk Checklist application to Azure.

## Prerequisites

1. An Azure account with access to create Web Apps and PostgreSQL databases
2. A Google Gemini API key for AI functionality

## Environment Variables

The following environment variables need to be set in the Azure Web App:

1. **DATABASE_URL**: PostgreSQL connection string
   - Format: `postgresql://username@server-name:password@server-name.postgres.database.azure.com:5432/database-name?sslmode=require`

2. **GEMINI_API_KEY**: Your Google Gemini API key

3. **SESSION_SECRET**: A random secure string for session encryption
   - Example: Generate using a password generator or use a UUID

4. **NODE_ENV**: Set to "production"

## Microsoft Integration (Optional)

If you want to use Microsoft Graph API and SharePoint integration:

1. **AZURE_CLIENT_ID**: Microsoft application client ID
2. **AZURE_CLIENT_SECRET**: Microsoft application client secret
3. **AZURE_TENANT_ID**: Microsoft tenant ID
4. **MS_REFRESH_TOKEN**: Microsoft refresh token

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

1. Push your code to GitHub
2. In Azure Portal, go to your Web App > Deployment Center
3. Choose GitHub as the source
4. Configure the build provider to use the GitHub Actions workflow
5. The included `.github/workflows/azure-deploy.yml` will handle the deployment

### Method 2: Manual ZIP Deploy

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Create a deployment package:
   ```bash
   mkdir -p deploy
   cp -r dist package.json azure-startup.js .deployment web.config deploy/
   cd deploy
   npm ci --production --no-optional
   cd ..
   zip -r deploy.zip deploy/
   ```

3. In Azure Portal, go to your Web App > Deployment Center
4. Choose "Manual Deployment" > "ZIP Deploy"
5. Upload the `deploy.zip` file

## Troubleshooting

1. **Deployment fails with SCM container restart**:
   - Wait 5-10 minutes after making configuration changes before attempting deployment
   - Try reducing the package size by ensuring `node_modules` is not included

2. **Application starts but shows database errors**:
   - Verify the DATABASE_URL is correct
   - Check that the database server allows connections from Azure services

3. **AI features don't work**:
   - Verify the GEMINI_API_KEY is correctly set
   - Check the application logs for specific error messages

## Database Migration

The application will automatically create necessary database tables on first run.

## First-Time Login

When the application first starts, it will create a default admin user:
- Username: admin
- Password: (Check logs for initial password or set using environment variables)

## Questions or Issues

For questions or issues related to deployment, please contact the development team.