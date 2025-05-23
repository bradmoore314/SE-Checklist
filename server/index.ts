import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes, registerPublicRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
// Supabase auth will be handled client-side

const app = express();
// Increase JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Register public routes before authentication
// These will be accessible without authentication
registerPublicRoutes(app);

// Session setup
const SessionStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'securityequipmentchecklist',
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

// No server-side authentication - using Supabase client-side auth
// All API routes are now publicly accessible

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to ensure projects are associated with users
async function migrateProjectOwners() {
  try {
    console.log('Checking project ownership associations...');
    
    // Get all projects
    const projects = await storage.getProjects();
    if (projects.length === 0) {
      console.log('No projects found in the system. Migration not needed.');
      return;
    }
    
    // Track how many projects were updated
    let updatedCount = 0;
    
    // For each project, check if it has owners
    for (const project of projects) {
      const collaborators = await storage.getProjectCollaborators(project.id);
      
      if (collaborators.length === 0) {
        // Project has no owners, find a suitable owner
        
        // Try to find an admin user
        let users = await storage.getUsers();
        let adminUser = users.find(user => user?.role === 'admin');
        
        if (adminUser) {
          // Add the admin user as the owner
          await storage.addProjectCollaborator({
            project_id: project.id,
            user_id: adminUser.id,
            permission: 'admin'
          });
          updatedCount++;
          console.log(`Added admin user (ID: ${adminUser.id}) as owner for project ${project.id} (${project.name})`);
        } else if (users.length > 0) {
          // If no admin, add the first user
          const firstUser = users[0];
          await storage.addProjectCollaborator({
            project_id: project.id,
            user_id: firstUser.id,
            permission: 'admin'
          });
          updatedCount++;
          console.log(`Added user ${firstUser.username} (ID: ${firstUser.id}) as owner for project ${project.id} (${project.name})`);
        } else {
          console.log(`No users found to associate with project ${project.id} (${project.name})`);
        }
      }
    }
    
    if (updatedCount > 0) {
      console.log(`Migration complete: Associated ${updatedCount} projects with users.`);
    } else {
      console.log('No projects needed ownership updates.');
    }
  } catch (error) {
    console.error('Error during project owner migration:', error);
  }
}

(async () => {
  const server = await registerRoutes(app);
  
  // After routes are registered but before starting the server,
  // run the migration to ensure projects are associated with users
  await migrateProjectOwners();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
