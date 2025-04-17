import passport from 'passport';
import { BearerStrategy, IOIDCStrategyOptionWithRequest, OIDCStrategy } from 'passport-azure-ad';
import azureConfig from '../config/azure-auth-config';
import { User, users } from '@shared/schema';
import { storage } from '../storage';
import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

// Initialize MSAL configuration for token acquisition
const msalConfig = {
  auth: {
    clientId: azureConfig.credentials.clientID,
    authority: `https://${azureConfig.metadata.authority}/${azureConfig.credentials.tenantID}/${azureConfig.metadata.version}`,
    clientSecret: azureConfig.credentials.clientSecret,
  }
};

// Initialize MSAL application for acquiring tokens
const confidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);

// Create a Microsoft Graph client factory
export const getGraphClient = async (userId: number) => {
  const user = await storage.getUser(userId);
  
  if (!user || !user.microsoftId || !user.refreshToken) {
    throw new Error('User not found or missing Microsoft credentials');
  }
  
  // Use the refresh token to get a new access token
  const msalTokenRequest = {
    refreshToken: user.refreshToken,
    scopes: azureConfig.scopes,
  };
  
  try {
    const response = await confidentialClientApplication.acquireTokenByRefreshToken(msalTokenRequest);
    
    // Initialize the Graph client with the acquired token
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, response?.accessToken || '');
      }
    });
    
    return graphClient;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw new Error('Failed to authenticate with Microsoft Graph');
  }
};

// Configure OIDC strategy for authentication
const oidcStrategy = new OIDCStrategy(
  {
    identityMetadata: `https://${azureConfig.metadata.authority}/${azureConfig.credentials.tenantID}/${azureConfig.metadata.version}/${azureConfig.metadata.discovery}`,
    clientID: azureConfig.credentials.clientID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: azureConfig.redirectUrl,
    allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
    clientSecret: azureConfig.credentials.clientSecret,
    validateIssuer: azureConfig.settings.validateIssuer,
    passReqToCallback: azureConfig.settings.passReqToCallback as true,
    scope: azureConfig.scopes,
    loggingLevel: azureConfig.settings.loggingLevel as any,
    loggingNoPII: azureConfig.settings.loggingNoPII,
  } as IOIDCStrategyOptionWithRequest,
  async (req: any, iss: any, sub: any, profile: any, accessToken: string, refreshToken: string, done: Function) => {
    try {
      if (!profile.oid) {
        return done(new Error('No OID found in user profile'));
      }
      
      // Check if user exists in database
      let user = await storage.getUserByMicrosoftId(profile.oid);
      
      if (!user) {
        // If user does not exist, create new user
        const newUser = {
          username: profile.preferred_username || profile.upn || profile.emails?.[0] || '',
          email: profile.preferred_username || profile.upn || profile.emails?.[0] || '',
          fullName: profile.name || profile.displayName || '',
          role: 'user',
          password: '', // No password for Microsoft login
          microsoftId: profile.oid,
          refreshToken: refreshToken,
        };
        
        user = await storage.createUser(newUser);
      } else {
        // Update existing user's refresh token
        await storage.updateUserRefreshToken(user.id, refreshToken);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error during authentication:', error);
      return done(error);
    }
  }
);

// Configure Bearer strategy for API access
const bearerStrategy = new BearerStrategy(
  {
    identityMetadata: `https://${azureConfig.metadata.authority}/${azureConfig.credentials.tenantID}/${azureConfig.metadata.version}/${azureConfig.metadata.discovery}`,
    clientID: azureConfig.credentials.clientID,
    validateIssuer: azureConfig.settings.validateIssuer,
    passReqToCallback: false,
    loggingLevel: azureConfig.settings.loggingLevel as any,
    loggingNoPII: azureConfig.settings.loggingNoPII,
  },
  async (token: any, done: Function) => {
    try {
      // Find user by microsoft id
      const user = await storage.getUserByMicrosoftId(token.oid);
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      
      return done(null, user, token);
    } catch (error) {
      console.error('Error validating token:', error);
      return done(error);
    }
  }
);

export const setupMicrosoftAuth = () => {
  passport.use('azuread-openidconnect', oidcStrategy);
  passport.use(bearerStrategy);
  
  // Routes will be set up in server/auth.ts
};

// Email service using Microsoft Graph API
export const sendEmail = async (userId: number, recipients: string[], subject: string, body: string, isHtml: boolean = false) => {
  try {
    const graphClient = await getGraphClient(userId);
    
    const message = {
      subject: subject,
      body: {
        contentType: isHtml ? 'HTML' : 'Text',
        content: body
      },
      toRecipients: recipients.map(email => ({
        emailAddress: {
          address: email
        }
      }))
    };
    
    await graphClient
      .api('/me/sendMail')
      .post({ message: message });
      
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email via Microsoft Graph');
  }
};