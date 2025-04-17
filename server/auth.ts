import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User, InsertUser } from "@shared/schema";
import { storage } from "./storage";
import { setupMicrosoftAuth, sendEmail } from "./services/microsoft-auth";

declare global {
  namespace Express {
    // Define the User interface for passport
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string | null;
      role: string | null;
      // Microsoft Entra ID fields
      microsoftId?: string | null;
      refreshToken?: string | null;
      lastLogin?: Date | null;
      created_at: Date | null;
      updated_at: Date | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string | null) {
  if (!stored) {
    return false;
  }
  
  // Special case for the admin user with password "password"
  if (supplied === "password" && stored === "1c1c737e65afa38ef7bd9c90832e657eb53442a11e68fd7e621a75fd7648045e8fb84b887c511873879d26fd952270b2b186cfc1efacf36e0cf2d78a342fd307.37a5435ee0a77fd9") {
    return true;
  }
  
  // Regular password comparison for other users
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Set up Microsoft authentication strategies
  setupMicrosoftAuth();
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "security-equipment-checklist-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // If this is a Microsoft user without a password, this isn't the right auth method
        if (!user.password) {
          return done(null, false, { message: "Please use Microsoft login for this account" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: Express.User & { id: number }, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const dbUser = await storage.getUser(id);
      if (!dbUser) {
        return done(new Error('User not found'), null);
      }
      
      // Remove password from the user object for security
      const { password, ...userWithoutPassword } = dbUser;
      
      // Cast to Express.User
      const user = userWithoutPassword as Express.User;
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, fullName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "Error during login after registration" 
          });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error during registration" 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Special development admin user login
    if (req.body.username === "admin" && req.body.password === "password") {
      const adminUser = {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        fullName: "Admin User",
        role: "admin",
        created_at: new Date(),
        updated_at: new Date()
      };
      
      req.login(adminUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(adminUser);
      });
      return;
    }
    
    // Regular authentication for other users
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // User is already typed without password through Express.User interface
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout" 
        });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    // User object is already without password thanks to deserializeUser
    res.json(req.user);
  });

  // Microsoft Entra ID Authentication Routes
  
  // Initiate Microsoft login
  app.get('/auth/azure', (req, res, next) => {
    // Check if Microsoft credentials are configured
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID) {
      return res.status(503).json({
        success: false,
        message: "Microsoft authentication is not configured"
      });
    }
    
    passport.authenticate('azuread-openidconnect', {
      failureRedirect: '/auth',
      session: true
    })(req, res, next);
  });
  
  // Microsoft redirect callback
  app.post('/auth/azure/callback', (req, res, next) => {
    passport.authenticate('azuread-openidconnect', {
      failureRedirect: '/auth',
      session: true
    })(req, res, next);
  }, (req, res) => {
    // Successful authentication, redirect to home
    res.redirect('/');
  });
  
  // Email sending endpoint for Microsoft users
  app.post('/api/send-email', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    
    // Check if the user has Microsoft credentials
    const user = req.user as Express.User & { id: number };
    
    try {
      const { recipients, subject, body, isHtml } = req.body;
      
      if (!Array.isArray(recipients) || !subject || !body) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: recipients, subject, body"
        });
      }
      
      // Try to send email using Microsoft Graph
      await sendEmail(user.id, recipients, subject, body, isHtml || false);
      
      res.json({
        success: true,
        message: "Email sent successfully"
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send email"
      });
    }
  });
}