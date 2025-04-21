# Deployment Guide for Site Walk Checklist Application

This guide provides instructions for deploying the Site Walk Checklist application to production environments like Azure.

## Pre-Deployment Checklist

1. Ensure you have built the application properly:
   ```bash
   npm run build
   ```

2. Make sure you have set the necessary environment variables:
   - `NODE_ENV=production` - Important to enable production mode
   - `SESSION_SECRET` - A secure random string for sessions
   - `DATABASE_URL` - Connection string to your PostgreSQL database
   - `ALLOW_INITIAL_SETUP=true` - Set this for the first deployment to enable the setup admin user

3. If using Microsoft authentication, ensure these variables are set:
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET` 
   - `AZURE_TENANT_ID`
   - `AZURE_REDIRECT_URI`

## GitHub Actions Deployment (Azure)

If you're deploying with GitHub Actions to Azure, add these to your workflow YAML:

```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'your-app-name'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

## Troubleshooting

If your app shows a blank page after deployment, check the following:

1. **Application Logs**: Review logs in the Azure portal to identify specific errors.

2. **Authentication Issues**: The app needs proper authentication configuration in production. Set `ALLOW_INITIAL_SETUP=true` for the first login.

3. **Static Files**: Make sure the build process created the necessary static files and they're being served correctly.

4. **Environment Variables**: Double-check all required environment variables are set correctly in your Azure App Service Configuration.

5. **CORS Settings**: If your API and frontend are deployed separately, ensure proper CORS settings.

## Azure Specific Configuration

In the Azure Portal:

1. Go to your App Service
2. Navigate to Configuration
3. Add the following Application settings:
   - `NODE_ENV`: `production`
   - `WEBSITE_NODE_DEFAULT_VERSION`: `~20`
   - `SESSION_SECRET`: (your secure random string)
   - `DATABASE_URL`: (your database connection string)
   - `ALLOW_INITIAL_SETUP`: `true` (for first deployment only)

4. Under "General settings", ensure:
   - Platform: Node.js
   - Startup Command: `node server/index.js`

## Database Migration

The first time you run the application, it will automatically create the necessary tables if they don't exist.

## Post-Deployment Steps

After successful deployment:

1. Access the application and create your first admin user
2. Set `ALLOW_INITIAL_SETUP` to `false` once you have created admin users
3. Configure any additional settings through the application interface
