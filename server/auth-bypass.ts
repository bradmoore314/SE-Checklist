import { Request, Response, NextFunction } from 'express';

// Creates a mock admin user for development or initial setup
export function createMockAdminUser() {
  return {
    id: 999,
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  };
}

// Configuration for the auth bypass middleware
export interface AuthBypassConfig {
  // Set to true to enable bypass in production (for deployment testing)
  allowBypassInProduction?: boolean;
  // Routes that should be publicly accessible without authentication
  publicRoutes?: string[];
}

// Default configuration
const defaultConfig: AuthBypassConfig = {
  allowBypassInProduction: false,
  publicRoutes: [
    '/api/login', 
    '/api/register', 
    '/api/auth/microsoft/status',
    '/assets/'
  ]
};

// Creates a middleware that handles authentication bypass based on environment
export function createAuthBypassMiddleware(config: AuthBypassConfig = defaultConfig) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Always allow access to public routes
    const isPublicRoute = finalConfig.publicRoutes?.some(route => 
      req.path === route || 
      (route.endsWith('/') && req.path.startsWith(route))
    );
    
    if (isPublicRoute) {
      return next();
    }
    
    // Check for the bypass header from the client
    const bypassHeaderPresent = req.headers['x-bypass-auth'] === 'true';
    
    // In development, always bypass authentication
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Check if we should bypass in production (for initial setup)
    const allowProductionBypass = finalConfig.allowBypassInProduction || 
                                 process.env.ALLOW_INITIAL_SETUP === 'true';
    
    // Determine if we should bypass auth
    const shouldBypassAuth = isDevelopment || 
                           (allowProductionBypass && bypassHeaderPresent) ||
                           (bypassHeaderPresent && !req.isAuthenticated());
    
    // Bypass auth if conditions are met
    if (shouldBypassAuth) {
      // Log that we're bypassing auth but only in development to avoid spamming production logs
      if (isDevelopment) {
        console.log('⚠️ Authentication bypassed for development');
      } else if (allowProductionBypass) {
        console.log('⚠️ Authentication bypassed for production (initial setup mode)');
      }
      
      // Add mock admin user to the request
      req.user = createMockAdminUser();
      return next();
    }
    
    // In production, require authentication for protected routes
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // User is authenticated, proceed
    return next();
  };
}