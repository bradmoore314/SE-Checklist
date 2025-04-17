// Azure AD (Microsoft Entra ID) Configuration
export const azureConfig = {
  // These values will be populated from environment variables
  credentials: {
    tenantID: process.env.AZURE_TENANT_ID || '',
    clientID: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  },
  metadata: {
    authority: 'login.microsoftonline.com',
    discovery: '.well-known/openid-configuration',
    version: 'v2.0',
  },
  resourceURL: 'https://graph.microsoft.com', // Microsoft Graph API endpoint
  redirectUrl: process.env.AZURE_REDIRECT_URI || 'http://localhost:5000/auth/azure/callback',
  // Configure the scope for different Microsoft Graph API permissions
  scopes: [
    'user.read',         // Basic profile info
    'mail.send',         // Permission to send mail as the user
    'mail.readwrite',    // Permission to read mail
    'offline_access',    // For refresh tokens
  ],
  // Settings for OpenID Connect strategy
  settings: {
    validateIssuer: true,
    passReqToCallback: false,
    loggingLevel: 'info',
    loggingNoPII: true,
  },
};

export default azureConfig;