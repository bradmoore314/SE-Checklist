import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupData } from "./data/lookupData";
import { analyzeProject, generateProjectAnalysis } from './services/project-questions-analysis';
import { 
  generateQuoteReviewAgenda as generateAzureQuoteReviewAgenda, 
  generateTurnoverCallAgenda as generateAzureTurnoverCallAgenda,
  testAzureOpenAI 
} from './utils/azure-openai';
import { generateQuoteReviewAgenda } from './services/quote-review-agenda-service';
import { compressImage, createThumbnail } from './utils/image-utils';
import { isAzureConfigured, uploadImageToAzure, deleteImageFromAzure } from './azure-storage';
import { 
  geocodeAddress, 
  getWeatherData, 
  getStaticMapUrl, 
  getMapEmbedUrl, 
  parseCoordinatesFromAddress,
  getPlaceAutocomplete
} from './services/location-services';
import { recognizeSpeech, textToSpeech } from './speech-api';
import { setupEquipmentCreationRoutes } from './routes/equipment-creation-routes';
import { setupEquipmentConfigurationRoutes } from './routes/equipment-configuration-routes';
import { autoDetectionRoutes } from './routes/auto-detection-routes';
import { 
  insertProjectSchema, 
  insertAccessPointSchema,
  insertCameraSchema,
  insertElevatorSchema,
  insertIntercomSchema,
  insertFeedbackSchema,
  insertProjectCollaboratorSchema,
  InsertAccessPoint,
  InsertCamera,
  InsertElevator,
  InsertIntercom,
  InsertFeedback,
  InsertProjectCollaborator,
  PERMISSION
} from "@shared/schema";
import { z } from "zod";

// Mock schemas for types that haven't been added to schema.ts yet
const insertImageSchema = z.object({
  project_id: z.number(),
  equipment_type: z.string(),
  equipment_id: z.number(),
  image_data: z.string(),
  filename: z.string().optional().nullable(),
});
type InsertImage = z.infer<typeof insertImageSchema> & {
  thumbnail_data?: string | null;
  storage_type?: string;
  blob_url?: string;
  blob_name?: string;
};

const insertKvgFormDataSchema = z.object({
  project_id: z.number(),
  form_type: z.string(),
  form_data: z.record(z.string(), z.any())
});
type InsertKvgFormData = z.infer<typeof insertKvgFormDataSchema>;

const insertKvgStreamSchema = z.object({
  project_id: z.number(),
  stream_type: z.string(),
  stream_name: z.string(),
  stream_data: z.record(z.string(), z.any())
});
type InsertKvgStream = z.infer<typeof insertKvgStreamSchema>;

const insertStreamImageSchema = z.object({
  project_id: z.number(),
  stream_id: z.number(),
  image_data: z.string()
});
type InsertStreamImage = z.infer<typeof insertStreamImageSchema>;
import { setupAuth } from "./auth";
import { linkProjectToCrm, getCrmSystem } from "./services/crm-integration";
import { isSharePointConfigured, areAzureCredentialsAvailable } from "./services/microsoft-graph";
import crmRoutes from "./routes/crm-routes";
import { dataverseIntegration } from "./services/dataverse-integration";
import { setupAIRoutes } from "./routes/ai-routes";
import miscRoutes from "./routes/misc-routes";

// No authentication required - all routes are public
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // All routes are now public - no authentication needed
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Use auto-detection routes
  app.use('/api', autoDetectionRoutes);
  app.use('/api', miscRoutes);

  // Authentication is already set up in index.ts
  
  // Session status endpoint
  app.get('/api/session-status', (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? req.user : null
    });
  });
  
  // Special dev endpoint to force login for development
  app.post("/api/dev-login", async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      return res.status(200).json(req.user);
    }
    
    // Create a mock admin user for the request
    req.user = {
      id: 999,
      username: 'dev-admin',
      email: 'dev@example.com',
      fullName: 'Development Admin',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    } as Express.User;
    
    // Set up the login session
    req.login(req.user, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json(req.user);
    });
  });

  // Lookup data endpoints
  app.get("/api/lookup", isAuthenticated, (req: Request, res: Response) => {
    res.json(lookupData);
  });
  
  // Lookup users by email
  app.get("/api/lookup/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email parameter is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only return necessary user info
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      });
    } catch (error) {
      console.error("Error looking up user by email:", error);
      res.status(500).json({ 
        message: "Failed to look up user",
        error: (error as Error).message
      });
    }
  });

  // Project endpoints - now public
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      // Get all projects (no authentication required)
      const projects = await storage.getProjects();
      
      // Add creator information to each project
      const projectsWithCreatorInfo = await Promise.all(projects.map(async (project) => {
        if (project.created_by) {
          const creator = await storage.getUser(project.created_by);
          return {
            ...project,
            creator_name: creator ? creator.fullName || creator.username : "Unknown"
          };
        }
        return {
          ...project,
          creator_name: "Unknown" // Default if no creator_by field
        };
      }));
      
      res.json(projectsWithCreatorInfo);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ 
        message: "Failed to fetch projects",
        error: (error as Error).message
      });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to this project
    if (!userProjectIds.includes(projectId)) {
      return res.status(403).json({ message: "You don't have permission to access this project" });
    }
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

      // Create the project (no authentication required)
      const project = await storage.createProject(result.data);

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create project",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to this project
    if (!userProjectIds.includes(projectId)) {
      return res.status(403).json({ message: "You don't have permission to update this project" });
    }

    try {
      const result = insertProjectSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

      const project = await storage.updateProject(projectId, result.data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update project",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const success = await storage.deleteProject(projectId);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).end();
  });

  // Places autocomplete endpoint
  app.get("/api/places/autocomplete", async (req: Request, res: Response) => {
    try {
      const input = req.query.input as string;
      
      if (!input) {
        return res.json({ status: 'INVALID_REQUEST', predictions: [] });
      }

      const result = await getPlaceAutocomplete(input);
      res.json(result);
    } catch (error) {
      console.error('Places autocomplete error:', error);
      res.json({ 
        status: 'API_ERROR', 
        error_message: (error as Error).message,
        predictions: [] 
      });
    }
  });

  // Floorplans endpoint (simplified - no longer stores floorplan data)
  app.get("/api/projects/:projectId/floorplans", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Return empty array since floorplans feature was removed
    res.json([]);
  });

  // Equipment endpoints (access points, cameras, elevators, intercoms)
  app.get("/api/projects/:projectId/access-points", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const accessPoints = await storage.getAccessPoints(projectId);
    res.json(accessPoints);
  });

  app.get("/api/projects/:projectId/cameras", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const cameras = await storage.getCameras(projectId);
    res.json(cameras);
  });

  app.get("/api/projects/:projectId/elevators", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const elevators = await storage.getElevators(projectId);
    res.json(elevators);
  });

  app.get("/api/projects/:projectId/intercoms", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const intercoms = await storage.getIntercoms(projectId);
    res.json(intercoms);
  });

  app.get("/api/projects/:projectId/reports/project-summary", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);

      res.json({
        project: project,
        summary: {
          accessPointCount: accessPoints.length,
          cameraCount: cameras.length,
          elevatorCount: elevators.length,
          intercomCount: intercoms.length,
          totalEquipmentCount: accessPoints.length + cameras.length + elevators.length + intercoms.length
        },
        equipment: {
          accessPoints: accessPoints,
          cameras: cameras,
          elevators: elevators,
          intercoms: intercoms
        }
      });
    } catch (error) {
      console.error("Error generating project summary:", error);
      res.status(500).json({ message: "Failed to generate project summary" });
    }
  });

  app.get("/api/projects/:projectId/marker-stats", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Return basic stats structure
      res.json({
        totalMarkers: 0,
        equipmentMarkers: 0,
        unassignedEquipment: 0,
        coverage: 100
      });
    } catch (error) {
      console.error("Error getting marker stats:", error);
      res.status(500).json({ message: "Failed to get marker statistics" });
    }
  });

  // Project collaborators endpoint
  app.get("/api/projects/:projectId/collaborators", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Return empty array - collaborators feature simplified
    res.json([]);
  });

  // Project permissions endpoint
  app.get("/api/projects/:projectId/permission", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Return basic permission structure
    res.json({
      canEdit: true,
      canDelete: true,
      canShare: true,
      role: "owner"
    });
  });

  const httpServer = createServer(app);
  
  // Simplified auth bypass for development
  const bypassAuth = (req: any, res: any, next: any) => {
    console.log("Auth bypass enabled, allowing authenticated routes");
    next();
  };
  
  setupEquipmentCreationRoutes(app, bypassAuth);
  setupEquipmentConfigurationRoutes(app, bypassAuth);
  setupAIRoutes(app, bypassAuth);
  
  // CRM integration routes
  app.use('/api', crmRoutes);

  return httpServer;
}