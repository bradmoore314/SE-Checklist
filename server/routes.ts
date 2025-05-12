import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupData } from "./data/lookupData";
import { analyzeProject, generateProjectAnalysis } from './services/project-questions-analysis';
import { proxyTestGemini } from './gemini-proxy';
import { proxyTestAzureOpenAI } from './azure-openai-proxy';
import { generateSiteWalkAnalysis as generateGeminiSiteWalkAnalysis, 
         generateQuoteReviewAgenda as generateGeminiQuoteReviewAgenda, 
         generateTurnoverCallAgenda as generateGeminiTurnoverCallAgenda } from './utils/gemini';
import { generateSiteWalkAnalysis as generateAzureSiteWalkAnalysis, 
         generateQuoteReviewAgenda as generateAzureQuoteReviewAgenda, 
         generateTurnoverCallAgenda as generateAzureTurnoverCallAgenda } from './utils/azure-openai';
import { generateSiteWalkAnalysis, generateQuoteReviewAgenda, generateTurnoverCallAgenda } from './services/ai-service';
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
import { registerEnhancedFloorplanRoutes } from './enhanced-floorplan-routes';
import { registerEnhancedMarkerAPI } from './enhanced-markers-api';
import { recognizeSpeech, textToSpeech } from './speech-api';
import chatbotGeminiService from './services/chatbot-gemini';
import { setupEquipmentCreationRoutes } from './routes/equipment-creation-routes';
import { setupEquipmentConfigurationRoutes } from './routes/equipment-configuration-routes';
import { autoDetectionRoutes } from './routes/auto-detection-routes';
import { 
  insertProjectSchema, 
  insertAccessPointSchema,
  insertCameraSchema,
  insertElevatorSchema,
  insertIntercomSchema,
  insertFloorplanSchema,
  insertFloorplanMarkerSchema,
  insertFeedbackSchema,
  insertProjectCollaboratorSchema,
  InsertAccessPoint,
  InsertCamera,
  InsertElevator,
  InsertIntercom,
  InsertFloorplan,
  InsertFloorplanMarker,
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
import { translateText } from "./services/gemini-translation";
import { linkProjectToCrm, getCrmSystem } from "./services/crm-integration";
import { isSharePointConfigured, areAzureCredentialsAvailable } from "./services/microsoft-graph";
import crmRoutes from "./routes/crm-routes";
import { dataverseIntegration } from "./services/dataverse-integration";
import { setupAIRoutes } from "./routes/ai-routes";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // If the user is authenticated, allow access
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check for development mode bypass in headers or query params
  const bypassHeaderAuth = req.headers['x-bypass-auth'] === 'true';
  const bypassQueryAuth = req.query.bypass_auth === 'true';
  
  // For development purposes only, allow bypassing authentication with a special header or query param
  if (bypassHeaderAuth || bypassQueryAuth) {
    console.log('⚠️ Authentication bypassed via explicit request');
    
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
    
    return next();
  }
  
  // Otherwise require authentication
  console.log('Auth required for', req.path);
  res.status(401).json({ 
    success: false,
    message: "Authentication required" 
  });
};

// Register completely public routes before the Express app is created
export function registerPublicRoutes(app: Express): void {
  // Health check endpoint for Azure monitoring
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      dbConnection: !!process.env.DATABASE_URL
    });
  });
  
  // Public Azure OpenAI endpoints (no authentication required)
  app.get("/api/public/azure/status", (req: Request, res: Response) => {
    console.log("Public Azure OpenAI status endpoint called");
    const isConfigured = !!process.env.AZURE_OPENAI_API_KEY;
    res.json({ 
      configured: isConfigured,
      model: isConfigured ? "gpt-4" : null,
      deployment: isConfigured ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME : null,
      endpoint: isConfigured ? "https://azuresearchservice2.openai.azure.com/" : null 
    });
  });

  app.post("/api/public/azure/test", (req: Request, res: Response) => {
    console.log("Public Azure OpenAI test endpoint called");
    proxyTestAzureOpenAI(req, res);
  });
  
  // Public endpoint for testing Azure OpenAI analysis
  app.post("/api/public/azure/analysis", async (req: Request, res: Response) => {
    console.log("Public Azure OpenAI analysis endpoint called");
    try {
      const { 
        projectName, 
        projectDescription, 
        buildingCount, 
        accessPointCount, 
        cameraCount, 
        clientRequirements, 
        specialConsiderations 
      } = req.body;
      
      const result = await generateSiteWalkAnalysis(
        projectName,
        projectDescription,
        buildingCount,
        accessPointCount,
        cameraCount,
        clientRequirements,
        specialConsiderations,
        'azure' // Force using Azure provider
      );
      
      res.json({ success: true, result });
    } catch (error) {
      console.error("Error testing Azure OpenAI analysis:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Use auto-detection routes
  app.use('/api', autoDetectionRoutes);

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

  // Project endpoints
  app.get("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    // Only return projects the user has access to
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get projects based on user permission
      const projects = await storage.getProjectsForUser(req.user.id);
      
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

  app.post("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

      // Add the creator ID to the project data
      const projectData = {
        ...result.data,
        created_by: req.user.id
      };

      // Create the project
      const project = await storage.createProject(projectData);
      
      // Associate the project with the current user as admin
      await storage.addProjectCollaborator({
        project_id: project.id,
        user_id: req.user.id,
        permission: 'admin'
      });

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

  app.delete("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
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
      return res.status(403).json({ message: "You don't have permission to delete this project" });
    }
    
    // For additional security, check if the user has admin rights for this project
    const permission = await storage.getUserProjectPermission(req.user.id, projectId);
    if (permission !== 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only project admins can delete projects" });
    }

    const success = await storage.deleteProject(projectId);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).end();
  });

  // Access Point endpoints
  app.get("/api/projects/:projectId/access-points", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.projectId);
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

    const accessPoints = await storage.getAccessPoints(projectId);
    res.json(accessPoints);
  });

  app.get("/api/access-points/:id", isAuthenticated, async (req: Request, res: Response) => {
    const accessPointId = parseInt(req.params.id);
    if (isNaN(accessPointId)) {
      return res.status(400).json({ message: "Invalid access point ID" });
    }

    const accessPoint = await storage.getAccessPoint(accessPointId);
    if (!accessPoint) {
      return res.status(404).json({ message: "Access point not found" });
    }

    res.json(accessPoint);
  });

  app.post("/api/access-points", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Creating access point with data:", req.body);
      const result = insertAccessPointSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid access point data:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid access point data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        console.error("Project not found:", result.data.project_id);
        return res.status(404).json({ message: "Project not found" });
      }

      // Add more detailed logging to diagnose issues
      try {
        const accessPoint = await storage.createAccessPoint(result.data);
        console.log("Successfully created access point:", accessPoint.id);
        res.status(201).json(accessPoint);
      } catch (storageError) {
        console.error("Storage error creating access point:", storageError);
        throw storageError;
      }
    } catch (error) {
      console.error("Failed to create access point:", error);
      res.status(500).json({ 
        message: "Failed to create access point",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/access-points/:id/duplicate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const accessPointId = parseInt(req.params.id);
      if (isNaN(accessPointId)) {
        return res.status(400).json({ message: "Invalid access point ID" });
      }
      
      // Get the existing access point
      const existingAccessPoint = await storage.getAccessPoint(accessPointId);
      if (!existingAccessPoint) {
        return res.status(404).json({ message: "Access point not found" });
      }
      
      // Create a copy with a modified location name
      const duplicateData: InsertAccessPoint = {
        project_id: existingAccessPoint.project_id,
        location: `${existingAccessPoint.location} (Copy)`,
        quick_config: existingAccessPoint.quick_config || 'Standard', // Include quick_config with a fallback
        reader_type: existingAccessPoint.reader_type,
        lock_type: existingAccessPoint.lock_type,
        monitoring_type: existingAccessPoint.monitoring_type,
        lock_provider: existingAccessPoint.lock_provider,
        takeover: existingAccessPoint.takeover,
        interior_perimeter: existingAccessPoint.interior_perimeter,
        exst_panel_location: existingAccessPoint.exst_panel_location,
        exst_panel_type: existingAccessPoint.exst_panel_type,
        exst_reader_type: existingAccessPoint.exst_reader_type,
        new_panel_location: existingAccessPoint.new_panel_location,
        new_panel_type: existingAccessPoint.new_panel_type,
        new_reader_type: existingAccessPoint.new_reader_type,
        notes: existingAccessPoint.notes
      };
      
      // Create the duplicate
      const duplicatedAccessPoint = await storage.createAccessPoint(duplicateData);
      
      res.status(201).json(duplicatedAccessPoint);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to duplicate access point",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/access-points/:id", isAuthenticated, async (req: Request, res: Response) => {
    const accessPointId = parseInt(req.params.id);
    if (isNaN(accessPointId)) {
      return res.status(400).json({ message: "Invalid access point ID" });
    }

    try {
      const result = insertAccessPointSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid access point data", 
          errors: result.error.errors 
        });
      }

      const accessPoint = await storage.updateAccessPoint(accessPointId, result.data);
      if (!accessPoint) {
        return res.status(404).json({ message: "Access point not found" });
      }

      res.json(accessPoint);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update access point",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/access-points/:id", isAuthenticated, async (req: Request, res: Response) => {
    const accessPointId = parseInt(req.params.id);
    if (isNaN(accessPointId)) {
      return res.status(400).json({ message: "Invalid access point ID" });
    }

    const success = await storage.deleteAccessPoint(accessPointId);
    if (!success) {
      return res.status(404).json({ message: "Access point not found" });
    }

    res.status(204).end();
  });

  // Camera endpoints
  app.get("/api/projects/:projectId/cameras", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.projectId);
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

    const cameras = await storage.getCameras(projectId);
    res.json(cameras);
  });
  
  // Add new camera to project
  app.post("/api/projects/:projectId/cameras", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Log the received data for debugging
      console.log("Received camera data:", req.body);
      
      // Extract image data first if present
      const { image_data, ...cameraData } = req.body;
      
      // Add project_id to the camera data
      const completeData = {
        ...cameraData,
        project_id: projectId
      };
      
      console.log("Complete camera data before validation:", completeData);
      
      const result = insertCameraSchema.safeParse(completeData);
      if (!result.success) {
        console.error("Camera validation failed:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid camera data", 
          errors: result.error.errors 
        });
      }
      
      console.log("Camera validation successful")

      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to this project
      if (!userProjectIds.includes(projectId)) {
        return res.status(403).json({ message: "You don't have permission to add cameras to this project" });
      }

      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create the camera first
      const camera = await storage.createCamera(result.data);
      
      // If image data was provided, compress and save it
      if (image_data) {
        try {
          // Import the image compression utility
          const { compressImage, createThumbnail } = require('./utils/image-utils');
          
          // Compress the image to save storage space
          let compressedImageData = image_data;
          let thumbnailData = '';
          
          if (image_data && image_data.startsWith('data:image')) {
            try {
              // Compress the main image (80% quality, max 1920px wide)
              compressedImageData = await compressImage(image_data, 80, 1920);
              
              // Create a thumbnail for potential future use
              thumbnailData = await createThumbnail(image_data, 300);
              
              console.log('Camera image compressed successfully');
            } catch (compressionError) {
              console.error('Image compression failed, using original image:', compressionError);
              // Continue with the original image if compression fails
            }
          }
          
          const imageInsert = {
            equipment_type: 'camera',
            equipment_id: camera.id,
            project_id: projectId,
            image_data: compressedImageData,
            filename: `camera_${camera.id}_image.jpg`,
            thumbnail_data: thumbnailData || null,
            storage_type: 'database'
          };
          
          await storage.saveImage(imageInsert);
          console.log(`Saved compressed image for camera ID: ${camera.id}`);
        } catch (imageError) {
          console.error('Failed to save camera image:', imageError);
          // Continue even if image saving fails
        }
      }
      
      res.status(201).json(camera);
    } catch (error) {
      console.error("Error creating camera:", error);
      res.status(500).json({ 
        message: "Failed to create camera",
        error: (error as Error).message
      });
    }
  });

  app.get("/api/cameras/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
    }

    const camera = await storage.getCamera(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this camera belongs to
    if (!userProjectIds.includes(camera.project_id)) {
      return res.status(403).json({ message: "You don't have permission to access this camera" });
    }

    res.json(camera);
  });

  app.post("/api/cameras", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Extract image data first if present
      const { image_data, ...cameraData } = req.body;
      
      const result = insertCameraSchema.safeParse(cameraData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid camera data", 
          errors: result.error.errors 
        });
      }

      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to this project
      if (!userProjectIds.includes(result.data.project_id)) {
        return res.status(403).json({ message: "You don't have permission to add cameras to this project" });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create the camera first
      const camera = await storage.createCamera(result.data);
      
      // If image data was provided, compress and save it
      if (image_data) {
        try {
          // Import the image compression utility
          const { compressImage, createThumbnail } = require('./utils/image-utils');
          
          // Compress the image to save storage space
          let compressedImageData = image_data;
          let thumbnailData = '';
          
          if (image_data && image_data.startsWith('data:image')) {
            try {
              // Compress the main image (80% quality, max 1920px wide)
              compressedImageData = await compressImage(image_data, 80, 1920);
              
              // Create a thumbnail for potential future use
              thumbnailData = await createThumbnail(image_data, 300);
              
              console.log('Camera image compressed successfully');
            } catch (compressionError) {
              console.error('Image compression failed, using original image:', compressionError);
              // Continue with the original image if compression fails
            }
          }
          
          const imageInsert = {
            equipment_type: 'camera',
            equipment_id: camera.id,
            project_id: result.data.project_id,
            image_data: compressedImageData,
            filename: `camera_${camera.id}_image.jpg`,
            thumbnail_data: thumbnailData || null,
            storage_type: 'database'
          };
          
          await storage.saveImage(imageInsert);
          console.log(`Saved compressed image for camera ID: ${camera.id}`);
        } catch (imageError) {
          console.error('Failed to save camera image:', imageError);
          // Continue even if image saving fails
        }
      }
      
      res.status(201).json(camera);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create camera",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/cameras/:id/duplicate", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cameraId = parseInt(req.params.id);
      if (isNaN(cameraId)) {
        return res.status(400).json({ message: "Invalid camera ID" });
      }
      
      // Get the existing camera
      const existingCamera = await storage.getCamera(cameraId);
      if (!existingCamera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      
      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to the project this camera belongs to
      if (!userProjectIds.includes(existingCamera.project_id)) {
        return res.status(403).json({ message: "You don't have permission to duplicate this camera" });
      }
      
      // Create a copy with a modified location name
      const duplicateData: InsertCamera = {
        project_id: existingCamera.project_id,
        location: `${existingCamera.location} (Copy)`,
        camera_type: existingCamera.camera_type,
        mounting_type: existingCamera.mounting_type,
        resolution: existingCamera.resolution,
        field_of_view: existingCamera.field_of_view,
        notes: existingCamera.notes
      };
      
      // Create the duplicate
      const duplicatedCamera = await storage.createCamera(duplicateData);
      
      res.status(201).json(duplicatedCamera);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to duplicate camera",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/cameras/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
    }

    // Get the existing camera to check permissions
    const existingCamera = await storage.getCamera(cameraId);
    if (!existingCamera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this camera belongs to
    if (!userProjectIds.includes(existingCamera.project_id)) {
      return res.status(403).json({ message: "You don't have permission to update this camera" });
    }

    try {
      const result = insertCameraSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid camera data", 
          errors: result.error.errors 
        });
      }

      const camera = await storage.updateCamera(cameraId, result.data);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }

      res.json(camera);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update camera",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/cameras/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
    }
    
    // Get the camera to check permissions before deleting
    const camera = await storage.getCamera(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this camera belongs to
    if (!userProjectIds.includes(camera.project_id)) {
      return res.status(403).json({ message: "You don't have permission to delete this camera" });
    }

    const success = await storage.deleteCamera(cameraId);
    if (!success) {
      return res.status(404).json({ message: "Camera not found" });
    }

    res.status(204).end();
  });

  // Elevator endpoints
  app.get("/api/projects/:projectId/elevators", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.projectId);
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

    const elevators = await storage.getElevators(projectId);
    res.json(elevators);
  });

  app.get("/api/elevators/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
    }

    const elevator = await storage.getElevator(elevatorId);
    if (!elevator) {
      return res.status(404).json({ message: "Elevator not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this elevator belongs to
    if (!userProjectIds.includes(elevator.project_id)) {
      return res.status(403).json({ message: "You don't have permission to access this elevator" });
    }

    res.json(elevator);
  });

  app.post("/api/elevators", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const result = insertElevatorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid elevator data", 
          errors: result.error.errors 
        });
      }

      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to this project
      if (!userProjectIds.includes(result.data.project_id)) {
        return res.status(403).json({ message: "You don't have permission to add elevators to this project" });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const elevator = await storage.createElevator(result.data);
      res.status(201).json(elevator);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create elevator",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/elevators/:id/duplicate", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const elevatorId = parseInt(req.params.id);
      if (isNaN(elevatorId)) {
        return res.status(400).json({ message: "Invalid elevator ID" });
      }
      
      // Get the existing elevator
      const existingElevator = await storage.getElevator(elevatorId);
      if (!existingElevator) {
        return res.status(404).json({ message: "Elevator not found" });
      }
      
      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to the project this elevator belongs to
      if (!userProjectIds.includes(existingElevator.project_id)) {
        return res.status(403).json({ message: "You don't have permission to duplicate this elevator" });
      }
      
      // Create a copy with a modified location name
      const duplicateData: InsertElevator = {
        project_id: existingElevator.project_id,
        location: `${existingElevator.location} (Copy)`,
        elevator_type: existingElevator.elevator_type,
        floor_count: existingElevator.floor_count,
        notes: existingElevator.notes
      };
      
      // Create the duplicate
      const duplicatedElevator = await storage.createElevator(duplicateData);
      
      res.status(201).json(duplicatedElevator);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to duplicate elevator",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/elevators/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
    }

    // Get the existing elevator to check permissions
    const existingElevator = await storage.getElevator(elevatorId);
    if (!existingElevator) {
      return res.status(404).json({ message: "Elevator not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this elevator belongs to
    if (!userProjectIds.includes(existingElevator.project_id)) {
      return res.status(403).json({ message: "You don't have permission to update this elevator" });
    }

    try {
      const result = insertElevatorSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid elevator data", 
          errors: result.error.errors 
        });
      }

      const elevator = await storage.updateElevator(elevatorId, result.data);
      if (!elevator) {
        return res.status(404).json({ message: "Elevator not found" });
      }

      res.json(elevator);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update elevator",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/elevators/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
    }
    
    // Get the elevator to check permissions before deleting
    const elevator = await storage.getElevator(elevatorId);
    if (!elevator) {
      return res.status(404).json({ message: "Elevator not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this elevator belongs to
    if (!userProjectIds.includes(elevator.project_id)) {
      return res.status(403).json({ message: "You don't have permission to delete this elevator" });
    }

    const success = await storage.deleteElevator(elevatorId);
    if (!success) {
      return res.status(404).json({ message: "Elevator not found" });
    }

    res.status(204).end();
  });

  // Intercom endpoints
  app.get("/api/projects/:projectId/intercoms", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.projectId);
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

    const intercoms = await storage.getIntercoms(projectId);
    res.json(intercoms);
  });

  app.get("/api/intercoms/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
    }

    const intercom = await storage.getIntercom(intercomId);
    if (!intercom) {
      return res.status(404).json({ message: "Intercom not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this intercom belongs to
    if (!userProjectIds.includes(intercom.project_id)) {
      return res.status(403).json({ message: "You don't have permission to access this intercom" });
    }

    res.json(intercom);
  });

  app.post("/api/intercoms", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const result = insertIntercomSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid intercom data", 
          errors: result.error.errors 
        });
      }
      
      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to this project
      if (!userProjectIds.includes(result.data.project_id)) {
        return res.status(403).json({ message: "You don't have permission to add intercoms to this project" });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const intercom = await storage.createIntercom(result.data);
      res.status(201).json(intercom);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create intercom",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/intercoms/:id/duplicate", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const intercomId = parseInt(req.params.id);
      if (isNaN(intercomId)) {
        return res.status(400).json({ message: "Invalid intercom ID" });
      }
      
      // Get the existing intercom
      const existingIntercom = await storage.getIntercom(intercomId);
      if (!existingIntercom) {
        return res.status(404).json({ message: "Intercom not found" });
      }
      
      // Get list of projects the user has access to
      const userProjects = await storage.getProjectsForUser(req.user.id);
      const userProjectIds = userProjects.map(p => p.id);
      
      // Check if user has access to the project this intercom belongs to
      if (!userProjectIds.includes(existingIntercom.project_id)) {
        return res.status(403).json({ message: "You don't have permission to duplicate this intercom" });
      }
      
      // Create a copy with a modified location name
      const duplicateData: InsertIntercom = {
        project_id: existingIntercom.project_id,
        location: `${existingIntercom.location} (Copy)`,
        intercom_type: existingIntercom.intercom_type,
        notes: existingIntercom.notes
      };
      
      // Create the duplicate
      const duplicatedIntercom = await storage.createIntercom(duplicateData);
      
      res.status(201).json(duplicatedIntercom);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to duplicate intercom",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/intercoms/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
    }

    // Get the existing intercom to check permissions
    const existingIntercom = await storage.getIntercom(intercomId);
    if (!existingIntercom) {
      return res.status(404).json({ message: "Intercom not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this intercom belongs to
    if (!userProjectIds.includes(existingIntercom.project_id)) {
      return res.status(403).json({ message: "You don't have permission to update this intercom" });
    }

    try {
      const result = insertIntercomSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid intercom data", 
          errors: result.error.errors 
        });
      }

      const intercom = await storage.updateIntercom(intercomId, result.data);
      if (!intercom) {
        return res.status(404).json({ message: "Intercom not found" });
      }

      res.json(intercom);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update intercom",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/intercoms/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
    }
    
    // Get the intercom to check permissions before deleting
    const intercom = await storage.getIntercom(intercomId);
    if (!intercom) {
      return res.status(404).json({ message: "Intercom not found" });
    }
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to the project this intercom belongs to
    if (!userProjectIds.includes(intercom.project_id)) {
      return res.status(403).json({ message: "You don't have permission to delete this intercom" });
    }

    const success = await storage.deleteIntercom(intercomId);
    if (!success) {
      return res.status(404).json({ message: "Intercom not found" });
    }

    res.status(204).end();
  });

  // Reports
  app.get("/api/projects/:projectId/reports/door-schedule", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const accessPoints = await storage.getAccessPoints(projectId);
    
    // Transform access points into door schedule format
    const doorSchedule = accessPoints.map(ap => ({
      id: ap.id,
      location: ap.location,
      door_type: ap.lock_type,
      reader_type: ap.reader_type,
      lock_type: ap.lock_type,
      security_level: ap.monitoring_type,
      ppi: ap.lock_provider || "None",
      notes: ap.notes || ""
    }));

    res.json({
      project: project,
      doors: doorSchedule
    });
  });

  app.get("/api/projects/:projectId/reports/camera-schedule", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const cameras = await storage.getCameras(projectId);
    
    // Transform cameras into camera schedule format
    const cameraSchedule = cameras.map(camera => ({
      id: camera.id,
      location: camera.location,
      camera_type: camera.camera_type,
      mounting_type: camera.mounting_type || "N/A",
      resolution: camera.resolution || "N/A",
      field_of_view: camera.field_of_view || "N/A",
      notes: camera.notes || ""
    }));

    res.json({
      project: project,
      cameras: cameraSchedule
    });
  });

  app.get("/api/projects/:projectId/reports/project-summary", isAuthenticated, async (req: Request, res: Response) => {
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
    
    console.log(`Project ${projectId} summary - Access Points: ${accessPoints.length}, Cameras: ${cameras.length}, Elevators: ${elevators.length}, Intercoms: ${intercoms.length}`);

    // Fetch images for all equipment items
    const accessPointsWithImages = await Promise.all(
      accessPoints.map(async (ap) => {
        const images = await storage.getImages('access_point', ap.id);
        return { ...ap, images };
      })
    );

    const camerasWithImages = await Promise.all(
      cameras.map(async (cam) => {
        const images = await storage.getImages('camera', cam.id);
        return { ...cam, images };
      })
    );

    const elevatorsWithImages = await Promise.all(
      elevators.map(async (elev) => {
        const images = await storage.getImages('elevator', elev.id);
        return { ...elev, images };
      })
    );

    const intercomsWithImages = await Promise.all(
      intercoms.map(async (intercom) => {
        const images = await storage.getImages('intercom', intercom.id);
        return { ...intercom, images };
      })
    );

    // Calculate additional counts
    const interiorAccessPoints = accessPoints.filter(ap => ap.interior_perimeter === 'Interior').length;
    const perimeterAccessPoints = accessPoints.filter(ap => ap.interior_perimeter === 'Perimeter').length;
    
    const indoorCameras = cameras.filter(cam => cam.is_indoor === true).length;
    const outdoorCameras = cameras.filter(cam => cam.is_indoor === false).length;
    
    // For elevators, count groups by location prefix (a bank is typically named like "Elevator Bank A")
    const elevatorLocations = new Set();
    elevators.forEach(elev => {
      // Extract the first word of location which typically identifies the bank
      const bankIdentifier = elev.location.split(' ')[0];
      elevatorLocations.add(bankIdentifier);
    });
    const elevatorBanks = elevatorLocations.size;

    res.json({
      project: project,
      summary: {
        accessPointCount: accessPoints.length,
        interiorAccessPointCount: interiorAccessPoints,
        perimeterAccessPointCount: perimeterAccessPoints,
        cameraCount: cameras.length,
        indoorCameraCount: indoorCameras,
        outdoorCameraCount: outdoorCameras,
        elevatorCount: elevators.length,
        elevatorBankCount: elevatorBanks,
        intercomCount: intercoms.length,
        totalEquipmentCount: accessPoints.length + cameras.length + elevators.length + intercoms.length
      },
      equipment: {
        accessPoints: accessPointsWithImages,
        cameras: camerasWithImages,
        elevators: elevatorsWithImages,
        intercoms: intercomsWithImages
      }
    });
  });
  
  // AI Analysis endpoint
  // New endpoint for project questions analysis
  app.get("/api/projects/:projectId/ai-analysis/questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Use the project questions analysis module
      
      // Get all equipment for the project
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);
      
      // Generate the static analysis (no AI)
      const staticAnalysis = generateProjectAnalysis();
      
      // If the request includes a 'full' parameter, generate the AI analysis as well
      let aiAnalysis = null;
      if (req.query.full === 'true') {
        aiAnalysis = await analyzeProject(project, accessPoints, cameras, elevators, intercoms);
      }
      
      res.json({
        project,
        staticAnalysis,
        aiAnalysis
      });
    } catch (error) {
      console.error("Error in project questions analysis:", error);
      res.status(500).json({ error: "Failed to analyze project questions" });
    }
  });

  app.post("/api/projects/:projectId/ai-analysis", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get all equipment for this project
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);
      
      // Calculate additional counts
      const interiorAccessPoints = accessPoints.filter(ap => ap.interior_perimeter === 'Interior').length;
      const perimeterAccessPoints = accessPoints.filter(ap => ap.interior_perimeter === 'Perimeter').length;
      
      const indoorCameras = cameras.filter(cam => cam.is_indoor === true).length;
      const outdoorCameras = cameras.filter(cam => cam.is_indoor === false).length;
      
      // For elevators, count groups by location prefix (a bank is typically named like "Elevator Bank A")
      const elevatorLocations = new Set();
      elevators.forEach(elev => {
        // Extract the first word of location which typically identifies the bank
        const bankIdentifier = elev.location.split(' ')[0];
        elevatorLocations.add(bankIdentifier);
      });
      const elevatorBanks = elevatorLocations.size;
      
      // Get tooltips to include in the prompt
      const tooltips = {
        replace_readers: "Installation/Hardware Scope: Existing readers are being swapped out. Consider compatibility with existing wiring and backboxes.",
        install_locks: "Installation/Hardware Scope: New locks are being installed as part of the project.",
        pull_wire: "Installation/Hardware Scope: New wiring is required for some or all devices.",
        wireless_locks: "Installation/Hardware Scope: Project includes wireless locks that communicate via gateway.",
        conduit_drawings: "Installation/Hardware Scope: Project requires identification of conduit pathways.",
        need_credentials: "Access Control/Identity Management: Requires supplying access credentials for users.",
        photo_id: "Access Control/Identity Management: Credentials will include photo identification.",
        photo_badging: "Access Control/Identity Management: On-site photo badging setup needed.",
        ble: "Access Control/Identity Management: Mobile credentials will be used for access.",
        test_card: "Access Control/Identity Management: Test cards needed for system verification.",
        visitor: "Access Control/Identity Management: Visitor management features are included.",
        guard_controls: "Access Control/Identity Management: Security guard station(s) with equipment for door release.",
        floorplan: "Site Conditions/Project Planning: Electronic floorplans are available for the site.",
        reports_available: "Site Conditions/Project Planning: Previous reports or system documentation is available.",
        kastle_connect: "Site Conditions/Project Planning: Integration with Kastle services over internet connection.",
        on_site_security: "Site Conditions/Project Planning: Property has security personnel on site.",
        takeover: "Site Conditions/Project Planning: Project involves taking over an existing system.",
        rush: "Site Conditions/Project Planning: Project is on an expedited timeline.",
        ppi_quote_needed: "Site Conditions/Project Planning: Professional proposal/installation quote needed."
      };
      
      // Prepare the data for the AI analysis
      const analysisData = {
        project: project,
        summary: {
          accessPointCount: accessPoints.length,
          interiorAccessPointCount: interiorAccessPoints,
          perimeterAccessPointCount: perimeterAccessPoints,
          cameraCount: cameras.length,
          indoorCameraCount: indoorCameras,
          outdoorCameraCount: outdoorCameras,
          elevatorCount: elevators.length,
          elevatorBankCount: elevatorBanks,
          intercomCount: intercoms.length,
          totalEquipmentCount: accessPoints.length + cameras.length + elevators.length + intercoms.length
        },
        equipment: {
          accessPoints: accessPoints,
          cameras: cameras,
          elevators: elevators,
          intercoms: intercoms
        },
        tooltips: tooltips
      };
      
      // Generate AI analysis using Gemini
      console.log("Making Gemini API call for project:", projectId);
      try {
        const analysis = await generateSiteWalkAnalysis(analysisData);
        console.log("Gemini API call successful with sections:", Object.keys(analysis));
        
        res.json({
          success: true,
          analysis: analysis
        });
      } catch (aiError) {
        console.error("Gemini API detailed error:", aiError);
        throw aiError; // Will be caught by outer try/catch
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate AI analysis",
        error: (error as Error).message
      });
    }
  });
  
  // Quote Review Agenda endpoint
  app.post("/api/projects/:projectId/quote-review-agenda", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get project data
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      console.log(`Requesting Quote Review Agenda for project ${projectId}`);

      // Get all equipment for this project
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);

      // Calculate summary stats
      const interiorAccessPointCount = accessPoints.filter(ap => ap.interior_perimeter === "Interior").length;
      const perimeterAccessPointCount = accessPoints.filter(ap => ap.interior_perimeter === "Perimeter").length;
      const indoorCameraCount = cameras.filter(cam => cam.is_indoor === true).length;
      const outdoorCameraCount = cameras.filter(cam => cam.is_indoor === false).length;
      
      // Get unique elevator banks by counting distinct floor counts
      const elevatorBankCount = new Set(elevators.map(el => el.floor_count)).size;

      const summary = {
        accessPointCount: accessPoints.length,
        interiorAccessPointCount,
        perimeterAccessPointCount,
        cameraCount: cameras.length,
        indoorCameraCount,
        outdoorCameraCount,
        elevatorCount: elevators.length,
        elevatorBankCount,
        intercomCount: intercoms.length
      };

      // Get tooltip data for project configuration options
      const tooltips = lookupData.tooltips;

      // Prepare data for AI analysis
      const agendaData = {
        project,
        summary,
        equipment: {
          accessPoints,
          cameras,
          elevators,
          intercoms
        },
        tooltips
      };

      // Call AI service to generate quote review agenda
      try {
        const agenda = await generateQuoteReviewAgenda(agendaData);
        
        console.log("Quote Review Agenda generated successfully");

        res.json({
          success: true,
          agenda
        });
      } catch (aiError) {
        console.error("Error calling Gemini API for quote review agenda:", aiError);
        res.status(500).json({
          success: false,
          message: "Failed to generate quote review agenda",
          error: (aiError as Error).message
        });
      }
    } catch (error) {
      console.error("Error in quote review agenda endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate quote review agenda",
        error: (error as Error).message
      });
    }
  });
  
  // Turnover Call Agenda endpoint
  app.post("/api/projects/:projectId/turnover-call-agenda", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get project data
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      console.log(`Requesting Turnover Call Agenda for project ${projectId}`);

      // Get all equipment for this project
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);

      // Calculate summary stats
      const interiorAccessPointCount = accessPoints.filter(ap => ap.interior_perimeter === "Interior").length;
      const perimeterAccessPointCount = accessPoints.filter(ap => ap.interior_perimeter === "Perimeter").length;
      const indoorCameraCount = cameras.filter(cam => cam.is_indoor === true).length;
      const outdoorCameraCount = cameras.filter(cam => cam.is_indoor === false).length;
      
      // Get unique elevator banks by counting distinct floor counts
      const elevatorBankCount = new Set(elevators.map(el => el.floor_count)).size;

      const summary = {
        accessPointCount: accessPoints.length,
        interiorAccessPointCount,
        perimeterAccessPointCount,
        cameraCount: cameras.length,
        indoorCameraCount,
        outdoorCameraCount,
        elevatorCount: elevators.length,
        elevatorBankCount,
        intercomCount: intercoms.length
      };

      // Get tooltip data for project configuration options
      const tooltips = lookupData.tooltips;

      // Prepare data for AI analysis
      const agendaData = {
        project,
        summary,
        equipment: {
          accessPoints,
          cameras,
          elevators,
          intercoms
        },
        tooltips
      };

      // Call AI service to generate turnover call agenda
      try {
        const agenda = await generateTurnoverCallAgenda(agendaData);
        
        console.log("Turnover Call Agenda generated successfully");

        res.json({
          success: true,
          agenda
        });
      } catch (aiError) {
        console.error("Error calling Gemini API for turnover call agenda:", aiError);
        res.status(500).json({
          success: false,
          message: "Failed to generate turnover call agenda",
          error: (aiError as Error).message
        });
      }
    } catch (error) {
      console.error("Error in turnover call agenda endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate turnover call agenda",
        error: (error as Error).message
      });
    }
  });
  
  // Image endpoints
  app.get("/api/images/:equipmentType/:equipmentId", isAuthenticated, async (req: Request, res: Response) => {
    const equipmentType = req.params.equipmentType;
    const equipmentId = parseInt(req.params.equipmentId);
    
    console.log(`GET /api/images/${equipmentType}/${equipmentId} - Fetching images`);
    
    if (isNaN(equipmentId)) {
      console.log(`Invalid equipment ID: ${req.params.equipmentId}`);
      return res.status(400).json({ message: "Invalid equipment ID" });
    }
    
    // Validate equipment type
    if (!['access_point', 'camera', 'elevator', 'intercom'].includes(equipmentType)) {
      console.log(`Invalid equipment type: ${equipmentType}`);
      return res.status(400).json({ message: "Invalid equipment type" });
    }
    
    // Get all images for this equipment
    const images = await storage.getImages(equipmentType, equipmentId);
    console.log(`Found ${images.length} images for ${equipmentType} ${equipmentId}`);
    
    // If debugging, log some details about the first few images
    if (images.length > 0) {
      console.log(`First image: ID=${images[0].id}, Filename=${images[0].filename}, Has data: ${!!images[0].image_data}`);
    }
    
    res.json(images);
  });
  
  app.post("/api/images", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Received image upload request with data:", { 
        equipment_type: req.body.equipment_type,
        equipment_id: req.body.equipment_id,
        project_id: req.body.project_id,
        has_image_data: !!req.body.image_data,
        has_filename: !!req.body.filename,
        keys: Object.keys(req.body)
      });
      
      const result = insertImageSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Image validation failed:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid image data", 
          errors: result.error.errors 
        });
      }
      
      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Use the image compression utility imported at the top of the file
      
      // Compress the image to save storage space
      let compressedImageData = result.data.image_data;
      let thumbnailData = '';
      
      if (result.data.image_data && result.data.image_data.startsWith('data:image')) {
        try {
          // Compress the main image (80% quality, max 1920px wide)
          compressedImageData = await compressImage(result.data.image_data, 80, 1920);
          
          // Create a thumbnail for potential future use
          thumbnailData = await createThumbnail(result.data.image_data, 300);
          
          console.log('Image compressed successfully');
        } catch (compressionError) {
          console.error('Image compression failed, using original image:', compressionError);
          // Continue with the original image if compression fails
        }
      }
      
      // Use isAzureConfigured and uploadImageToAzure imported at the top of the file
      
      let imageData = {
        ...result.data,
        image_data: compressedImageData,
        thumbnail_data: thumbnailData || null
      };
      
      // If Azure is configured and we have image data, try to upload to Azure first
      if (isAzureConfigured && compressedImageData) {
        try {
          console.log("Attempting to upload image to Azure Blob Storage");
          const azureResult = await uploadImageToAzure(
            compressedImageData,
            result.data.equipment_type,
            result.data.equipment_id,
            result.data.project_id,
            result.data.filename || null
          );
          
          if (azureResult) {
            // Azure upload succeeded, update the image data for storage
            imageData = {
              ...imageData,
              blob_url: azureResult.url,
              blob_name: azureResult.blobName,
              storage_type: 'azure'
            };
            
            // If Azure is storing the image, we can save space in the DB by removing the base64 data
            if (process.env.AZURE_OPTIMIZE_STORAGE === 'true') {
              // Only store the thumbnail in the database
              imageData.image_data = null;
            }
            
            console.log("Successfully uploaded image to Azure Blob Storage");
          }
        } catch (azureError) {
          console.error("Failed to upload to Azure, falling back to database storage:", azureError);
          // Continue with database storage as fallback
          imageData = {
            ...imageData,
            storage_type: 'database'
          };
        }
      } else {
        // Azure not configured, use database storage
        imageData = {
          ...imageData,
          storage_type: 'database'
        };
      }
      
      // Save the image with appropriate storage information
      console.log("About to save image with imageData:", {
        equipment_type: imageData.equipment_type,
        equipment_id: imageData.equipment_id,
        project_id: imageData.project_id,
        has_image_data: !!imageData.image_data,
        has_thumbnail: !!imageData.thumbnail_data,
        filename: imageData.filename,
        storage_type: imageData.storage_type
      });
      
      const image = await storage.saveImage(imageData);
      console.log("Image saved successfully with ID:", image.id);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error saving image:", error);
      // Log stack trace for debugging
      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
      }
      
      res.status(500).json({ 
        message: "Failed to save image",
        error: (error as Error).message,
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });
  
  app.delete("/api/images/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      console.log(`Deleting image with ID: ${imageId}`);
      
      if (isNaN(imageId)) {
        console.log(`Invalid image ID: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid image ID" });
      }
      
      // First, retrieve the image to check if it exists
      const image = await storage.getImageById(imageId);
      if (!image) {
        console.log(`Image not found with ID: ${imageId}`);
        return res.status(404).json({ message: "Image not found" });
      }
      
      console.log(`Found image to delete:`, {
        id: image.id,
        equipment_type: image.equipment_type,
        equipment_id: image.equipment_id
      });
      
      // We're now only storing images in the database, so no Azure blob handling is needed
      
      // Delete from database using the storage implementation
      console.log(`Attempting to delete image from database with ID: ${imageId}`);
      
      try {
        const success = await storage.deleteImage(imageId);
        console.log(`Delete operation result: ${success}`);
        
        if (success) {
          console.log(`Successfully deleted image with ID: ${imageId}`);
          return res.status(204).end();
        } else {
          console.error(`Failed to delete image with ID: ${imageId}`);
          return res.status(500).json({ message: "Failed to delete image from database" });
        }
      } catch (dbError) {
        console.error(`Database error deleting image:`, dbError);
        return res.status(500).json({ 
          message: "Database error deleting image", 
          error: (dbError as Error).message 
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ 
        message: "Failed to delete image", 
        error: (error as Error).message 
      });
    }
  });

  // Floorplan endpoints
  app.get("/api/projects/:projectId/floorplans", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const floorplans = await storage.getFloorplans(projectId);
    res.json(floorplans);
  });
  
  // Get unassigned equipment items (not yet placed on floorplans)
  app.get("/api/projects/:projectId/unassigned-equipment", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      // Get project and verify it exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get all equipment for this project
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);
      
      // Get all markers assigned to equipment
      const markers = await storage.getFloorplanMarkersByProjectId(projectId);
      
      // Create a set of equipment IDs that already have markers
      const markerEquipmentIds = new Map<string, Set<number>>();
      markerEquipmentIds.set('access_point', new Set());
      markerEquipmentIds.set('camera', new Set());
      markerEquipmentIds.set('elevator', new Set());
      markerEquipmentIds.set('intercom', new Set());
      
      // Populate the sets with equipment IDs that already have markers
      markers.forEach(marker => {
        const typeSet = markerEquipmentIds.get(marker.marker_type);
        if (typeSet && marker.equipment_id) {
          typeSet.add(marker.equipment_id);
        }
      });
      
      // Filter out equipment that already has markers
      const unassignedAccessPoints = accessPoints.filter(ap => 
        !markerEquipmentIds.get('access_point')?.has(ap.id)
      ).map(ap => ({
        id: ap.id,
        type: 'access_point',
        label: ap.location || `Access Point ${ap.id}`
      }));
      
      const unassignedCameras = cameras.filter(cam => 
        !markerEquipmentIds.get('camera')?.has(cam.id)
      ).map(cam => ({
        id: cam.id,
        type: 'camera',
        label: cam.location || `Camera ${cam.id}`
      }));
      
      const unassignedElevators = elevators.filter(elev => 
        !markerEquipmentIds.get('elevator')?.has(elev.id)
      ).map(elev => ({
        id: elev.id,
        type: 'elevator',
        label: elev.location || `Elevator ${elev.id}`
      }));
      
      const unassignedIntercoms = intercoms.filter(intercom => 
        !markerEquipmentIds.get('intercom')?.has(intercom.id)
      ).map(intercom => ({
        id: intercom.id,
        type: 'intercom',
        label: intercom.location || `Intercom ${intercom.id}`
      }));
      
      // Combine all unassigned equipment into a single response
      const unassignedEquipment = {
        access_points: unassignedAccessPoints,
        cameras: unassignedCameras,
        elevators: unassignedElevators,
        intercoms: unassignedIntercoms
      };
      
      res.json(unassignedEquipment);
    } catch (error) {
      console.error("Error in /api/projects/:projectId/unassigned-equipment:", error);
      res.status(500).json({ error: "Failed to retrieve unassigned equipment" });
    }
  });

  app.get("/api/floorplans/:id", isAuthenticated, async (req: Request, res: Response) => {
    const floorplanId = parseInt(req.params.id);
    if (isNaN(floorplanId)) {
      return res.status(400).json({ message: "Invalid floorplan ID" });
    }

    const floorplan = await storage.getFloorplan(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: "Floorplan not found" });
    }

    res.json(floorplan);
  });

  app.delete("/api/floorplans/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const floorplanId = parseInt(req.params.id);
      if (isNaN(floorplanId)) {
        return res.status(400).json({ message: "Invalid floorplan ID" });
      }
      
      // First, get the floorplan to check if it exists
      const floorplan = await storage.getFloorplan(floorplanId);
      if (!floorplan) {
        return res.status(404).json({ message: "Floorplan not found" });
      }
      
      // Delete all markers associated with this floorplan
      const markers = await storage.getFloorplanMarkers(floorplanId);
      for (const marker of markers) {
        await storage.deleteFloorplanMarker(marker.id);
      }
      
      // Delete the floorplan
      const success = await storage.deleteFloorplan(floorplanId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete floorplan" });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete floorplan",
        error: (error as Error).message 
      });
    }
  });

  app.post("/api/floorplans", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertFloorplanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid floorplan data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const floorplan = await storage.createFloorplan(result.data);
      res.status(201).json(floorplan);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create floorplan",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/floorplans/:id", isAuthenticated, async (req: Request, res: Response) => {
    const floorplanId = parseInt(req.params.id);
    if (isNaN(floorplanId)) {
      return res.status(400).json({ message: "Invalid floorplan ID" });
    }

    try {
      const result = insertFloorplanSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid floorplan data", 
          errors: result.error.errors 
        });
      }

      const floorplan = await storage.updateFloorplan(floorplanId, result.data);
      if (!floorplan) {
        return res.status(404).json({ message: "Floorplan not found" });
      }

      res.json(floorplan);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update floorplan",
        error: (error as Error).message
      });
    }
  });



  // Floorplan Marker endpoints
  // Authentication middleware removed for debugging purposes
  app.get("/api/floorplans/:floorplanId/markers", isAuthenticated, async (req: Request, res: Response) => {
    const floorplanId = parseInt(req.params.floorplanId);
    if (isNaN(floorplanId)) {
      return res.status(400).json({ message: "Invalid floorplan ID" });
    }

    console.log(`Getting markers for floorplan ID: ${floorplanId}`);

    const floorplan = await storage.getFloorplan(floorplanId);
    if (!floorplan) {
      console.error(`Floorplan not found with ID: ${floorplanId}`);
      return res.status(404).json({ message: "Floorplan not found" });
    }

    const markers = await storage.getFloorplanMarkers(floorplanId);
    console.log(`Found ${markers.length} markers for floorplan ID: ${floorplanId}`);
    res.json(markers);
  });

  app.post("/api/floorplan-markers", isAuthenticated, async (req: Request, res: Response) => {
    console.log("Creating floorplan marker with data:", req.body);
    try {
      const result = insertFloorplanMarkerSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid marker data:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid marker data", 
          errors: result.error.errors 
        });
      }

      // Verify that equipment_id is valid
      if (!result.data.equipment_id && result.data.marker_type !== 'note') {
        console.error("Invalid equipment ID provided:", result.data.equipment_id);
        return res.status(400).json({ message: "Invalid equipment ID" });
      }

      // Verify floorplan exists
      const floorplan = await storage.getFloorplan(result.data.floorplan_id);
      if (!floorplan) {
        console.error("Floorplan not found:", result.data.floorplan_id);
        return res.status(404).json({ message: "Floorplan not found" });
      }

      // Create equipment if needed (access point or camera)
      let equipmentId = result.data.equipment_id;
      
      // If equipment_id is 0, we need to create a new equipment item
      if (equipmentId === 0) {
        // Get equipment count for auto-numbering
        let locationName: string;
        
        if (result.data.marker_type === 'access_point') {
          // Get current count of access points for sequential numbering
          const accessPoints = await storage.getAccessPointsByProject(floorplan.project_id);
          const nextNumber = accessPoints.length + 1;
          
          // Create label with sequential number
          locationName = result.data.label || `Access Point ${nextNumber}`;
          
          const newAccessPoint = await storage.createAccessPoint({
            project_id: floorplan.project_id,
            location: locationName,
            quick_config: 'Standard', // Include required field
            reader_type: 'KR-RP40',
            lock_type: 'Magnetic Lock',
            monitoring_type: 'Standard'
          });
          equipmentId = newAccessPoint.id;
        } else if (result.data.marker_type === 'camera') {
          // Get current count of cameras for sequential numbering
          const cameras = await storage.getCamerasByProject(floorplan.project_id);
          const nextNumber = cameras.length + 1;
          
          // Create label with sequential number
          locationName = result.data.label || `Camera ${nextNumber}`;
          
          const newCamera = await storage.createCamera({
            project_id: floorplan.project_id,
            location: locationName,
            camera_type: 'Fixed Indoor Dome'
          });
          equipmentId = newCamera.id;
        } else if (result.data.marker_type === 'elevator') {
          // Get current count of elevators for sequential numbering
          const elevators = await storage.getElevatorsByProject(floorplan.project_id);
          const nextNumber = elevators.length + 1;
          
          // Create label with sequential number
          locationName = result.data.label || `Elevator ${nextNumber}`;
          
          const newElevator = await storage.createElevator({
            project_id: floorplan.project_id,
            location: locationName,
            elevator_type: 'Destination Dispatch',
            floor_count: 1,
            notes: 'Added from floorplan'
          });
          equipmentId = newElevator.id;
        } else if (result.data.marker_type === 'intercom') {
          // Get current count of intercoms for sequential numbering
          const intercoms = await storage.getIntercomsByProject(floorplan.project_id);
          const nextNumber = intercoms.length + 1;
          
          // Create label with sequential number
          locationName = result.data.label || `Intercom ${nextNumber}`;
          
          const newIntercom = await storage.createIntercom({
            project_id: floorplan.project_id,
            location: locationName,
            intercom_type: 'Audio/Video',
            notes: 'Added from floorplan'
          });
          equipmentId = newIntercom.id;
        } else if (result.data.marker_type === 'note') {
          // Notes don't have associated equipment, just use -1 as a placeholder ID
          equipmentId = -1;
        }
      }

      // Create the marker with the equipment ID
      const marker = await storage.createFloorplanMarker({
        ...result.data,
        equipment_id: equipmentId
      });
      
      res.status(201).json(marker);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create marker",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/floorplan-markers/:id", isAuthenticated, async (req: Request, res: Response) => {
    console.log(`Updating marker ID ${req.params.id} with data:`, req.body);
    const markerId = parseInt(req.params.id);
    if (isNaN(markerId)) {
      return res.status(400).json({ message: "Invalid marker ID" });
    }

    try {
      const result = insertFloorplanMarkerSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid marker data", 
          errors: result.error.errors 
        });
      }

      const marker = await storage.updateFloorplanMarker(markerId, result.data);
      if (!marker) {
        return res.status(404).json({ message: "Marker not found" });
      }

      res.json(marker);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update marker",
        error: (error as Error).message
      });
    }
  });
  
  // Add PATCH endpoint for updating marker positions
  app.patch("/api/floorplan-markers/:id", isAuthenticated, async (req: Request, res: Response) => {
    console.log(`PATCH updating marker ID ${req.params.id} with position data:`, req.body);
    const markerId = parseInt(req.params.id);
    if (isNaN(markerId)) {
      return res.status(400).json({ message: "Invalid marker ID" });
    }

    try {
      // This is used primarily for position updates, which are just x/y coordinates
      const { position_x, position_y } = req.body;
      
      if (position_x === undefined && position_y === undefined) {
        return res.status(400).json({ 
          message: "Invalid marker data: At least one of position_x or position_y must be provided"
        });
      }
      
      // Create the update object with only the fields that were provided
      const updateData: Partial<InsertFloorplanMarker> = {};
      if (position_x !== undefined) updateData.position_x = position_x;
      if (position_y !== undefined) updateData.position_y = position_y;
      
      const marker = await storage.updateFloorplanMarker(markerId, updateData);
      if (!marker) {
        return res.status(404).json({ message: "Marker not found" });
      }

      res.json(marker);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update marker position",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/floorplan-markers/:id", isAuthenticated, async (req: Request, res: Response) => {
    console.log(`Deleting marker ID: ${req.params.id}`);
    const markerId = parseInt(req.params.id);
    if (isNaN(markerId)) {
      return res.status(400).json({ message: "Invalid marker ID" });
    }

    try {
      const success = await storage.deleteFloorplanMarker(markerId);
      if (!success) {
        return res.status(404).json({ message: "Marker not found" });
      }

      // Return a JSON response instead of no content for better client handling
      return res.status(200).json({ 
        success: true, 
        message: "Marker deleted successfully",
        id: markerId
      });
    } catch (error) {
      console.error("Error deleting marker:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error deleting marker", 
        error: (error as Error).message 
      });
    }
  });

  // API endpoint to check if Microsoft authentication is configured
  app.get("/api/auth/microsoft/status", (req, res) => {
    res.json({
      configured: areAzureCredentialsAvailable()
    });
  });
  
  // Gemini AI Translation endpoint
  app.post("/api/gemini-translate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required parameters. Please provide 'text' and 'targetLanguage'." 
        });
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured on the server." 
        });
      }
      
      const translatedText = await translateText(text, targetLanguage, sourceLanguage);
      
      res.json({
        success: true,
        translatedText,
        sourceLanguage,
        targetLanguage
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred during translation" 
      });
    }
  });

  // Gemini API diagnostic endpoint
  app.get("/api/diagnose/gemini", isAuthenticated, async (req: Request, res: Response) => {
    console.log("Gemini API diagnostic endpoint called");
    try {
      // First check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "Gemini API key is not configured on the server"
        });
      }
      
      // Sample data for testing
      const sampleData = {
        project: { 
          id: 1, 
          name: "Test Project",
          client: "Test Client", 
          replace_readers: true,
          install_locks: true 
        },
        summary: {
          accessPointCount: 2,
          interiorAccessPointCount: 1,
          perimeterAccessPointCount: 1,
          cameraCount: 2,
          indoorCameraCount: 1,
          outdoorCameraCount: 1,
          elevatorCount: 0,
          elevatorBankCount: 0,
          intercomCount: 0,
          totalEquipmentCount: 4
        },
        equipment: {
          accessPoints: [
            { id: 1, project_id: 1, location: "Main Door", reader_type: "KR-RP40", lock_type: "Magnetic" },
            { id: 2, project_id: 1, location: "Side Door", reader_type: "KR-RP40", lock_type: "Electric Strike" }
          ],
          cameras: [
            { id: 1, project_id: 1, location: "Entrance", camera_type: "Fixed Dome" },
            { id: 2, project_id: 1, location: "Parking", camera_type: "PTZ" }
          ],
          elevators: [],
          intercoms: []
        },
        tooltips: {
          replace_readers: "Existing readers are being swapped out",
          install_locks: "New locks are being installed"
        }
      };
      
      console.log("Making Gemini API call with sample data");
      const startTime = Date.now();
      
      // Call the Gemini API with sample data
      const analysis = await generateSiteWalkAnalysis(sampleData);
      
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      console.log(`Gemini API call completed in ${timeTaken} seconds`);
      
      // Check for default values
      const hasDefaultSummary = analysis.summary === "Executive summary not available";
      const hasDefaultAnalysis = analysis.detailedAnalysis === "Technical analysis not available";
      const hasDefaultRecs = analysis.recommendations.length === 1 && 
                            analysis.recommendations[0] === "No specific recommendations available";
      const hasDefaultRisks = analysis.risks.length === 1 && 
                             analysis.risks[0] === "No specific risks identified";
      const hasDefaultTimeline = analysis.timeline === "Timeline information not available";
      
      const usingDefaults = hasDefaultSummary || hasDefaultAnalysis || 
                           hasDefaultRecs || hasDefaultRisks || hasDefaultTimeline;
      
      res.json({
        success: true,
        diagnostics: {
          apiKeyConfigured: true,
          timeTaken: timeTaken,
          responseReceived: true,
          usingDefaultValues: usingDefaults,
          defaultFields: {
            summary: hasDefaultSummary,
            detailedAnalysis: hasDefaultAnalysis,
            recommendations: hasDefaultRecs,
            risks: hasDefaultRisks,
            timeline: hasDefaultTimeline
          },
          contentLengths: {
            summary: analysis.summary.length,
            detailedAnalysis: analysis.detailedAnalysis.length,
            recommendations: analysis.recommendations.length,
            risks: analysis.risks.length,
            timeline: analysis.timeline.length
          }
        },
        analysis: analysis
      });
    } catch (error) {
      console.error("Gemini API diagnostic error:", error);
      res.status(500).json({
        success: false,
        message: "Gemini API diagnostic failed",
        error: (error as Error).message
      });
    }
  });

  // CRM Integration endpoints
  app.get("/api/integration/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check Microsoft authentication configuration
      const missingAuthCredentials: string[] = [];
      
      if (!process.env.AZURE_CLIENT_ID) missingAuthCredentials.push("AZURE_CLIENT_ID");
      if (!process.env.AZURE_CLIENT_SECRET) missingAuthCredentials.push("AZURE_CLIENT_SECRET");
      if (!process.env.AZURE_TENANT_ID) missingAuthCredentials.push("AZURE_TENANT_ID");
      
      const isMicrosoftAuthConfigured = areAzureCredentialsAvailable();
      const isGraphConfigured = isSharePointConfigured();
      
      // Check Microsoft Graph capability
      const graphCapability = {
        configured: isGraphConfigured,
        status: isGraphConfigured ? "available" : "unavailable",
        missingCredentials: missingAuthCredentials.length > 0 ? missingAuthCredentials : undefined
      };
      
      // Check if refresh token is available for Microsoft authentication
      const hasRefreshToken = !!process.env.MS_REFRESH_TOKEN;
      
      // Get all CRM systems and check their configuration status
      const crmSystems = ["dynamics365", "dataverse"];
      const crmStatuses: Record<string, { 
        configured: boolean; 
        name: string; 
        error?: string;
        status: string;
        missingSettings?: string[];
        authIssue?: boolean;
      }> = {};
      
      for (const crmType of crmSystems) {
        try {
          const crm = getCrmSystem(crmType);
          const settings = await crm.getSettings();
          const isConfigured = await crm.isConfigured();
          
          const missingSettings: string[] = [];
          
          // Check for missing CRM-specific settings
          if (!settings) {
            missingSettings.push("CRM settings not found");
          } else {
            if (!settings.base_url) missingSettings.push("base_url");
            if (!settings.api_version) missingSettings.push("api_version");
            
            // SharePoint settings check for file storage capability
            if (crmType === "dynamics365" || crmType === "dataverse") {
              const settingsObj = settings.settings as Record<string, any>;
              if (!settingsObj.sharePointSiteId) missingSettings.push("sharePointSiteId");
              if (!settingsObj.sharePointDriveId) missingSettings.push("sharePointDriveId");
            }
          }
          
          crmStatuses[crmType] = {
            configured: isConfigured,
            name: crm.name,
            status: isConfigured ? "ready" : "not configured",
            missingSettings: missingSettings.length > 0 ? missingSettings : undefined,
            authIssue: !isMicrosoftAuthConfigured || !hasRefreshToken
          };
        } catch (e) {
          let errorMessage = "Unknown error occurred";
          if (e instanceof Error) {
            errorMessage = e.message;
          }
          
          crmStatuses[crmType] = {
            configured: false,
            name: crmType,
            error: errorMessage,
            status: "error",
            authIssue: !isMicrosoftAuthConfigured || !hasRefreshToken
          };
        }
      }
      
      // Respond with comprehensive status information
      res.json({
        microsoftAuth: {
          configured: isMicrosoftAuthConfigured,
          status: isMicrosoftAuthConfigured ? "configured" : "missing credentials",
          missingCredentials: missingAuthCredentials.length > 0 ? missingAuthCredentials : undefined,
          hasRefreshToken: hasRefreshToken
        },
        microsoftGraph: graphCapability,
        crmSystems: crmStatuses,
        requiredSecrets: missingAuthCredentials.length > 0 ? missingAuthCredentials : undefined
      });
    } catch (error) {
      console.error("Error checking integration status:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error checking integration status" 
      });
    }
  });

  // Link a project to CRM
  app.post("/api/projects/:projectId/crm-link", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const { crmType = "dynamics365" } = req.body;
      
      // Get CRM System
      const crm = getCrmSystem(crmType);
      
      // Check if configured
      if (!await crm.isConfigured()) {
        return res.status(400).json({ 
          message: `CRM system ${crmType} is not configured` 
        });
      }
      
      // Link to CRM
      await linkProjectToCrm(projectId, crmType);
      
      // Get updated project
      const project = await storage.getProject(projectId);
      
      res.json({
        success: true,
        message: "Project linked to CRM successfully",
        project
      });
    } catch (error) {
      console.error("Error linking project to CRM:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // CRM Settings endpoints
  app.get("/api/crm-settings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get all CRM settings from database
      const crmSettingsList = await storage.getCrmSettings();
      res.json(crmSettingsList);
    } catch (error) {
      console.error("Error fetching CRM settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error fetching CRM settings" 
      });
    }
  });
  
  app.post("/api/crm-settings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const insertCrmSettingsSchema = z.object({
        crm_type: z.string(),
        base_url: z.string().url(),
        api_version: z.string().optional(),
        auth_type: z.string(),
        settings: z.record(z.unknown())
      });
      
      const result = insertCrmSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid CRM settings", 
          errors: result.error.errors 
        });
      }
      
      // Create CRM settings
      const crmSettings = await storage.createCrmSettings(result.data);
      
      res.status(201).json(crmSettings);
    } catch (error) {
      console.error("Error creating CRM settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error creating CRM settings" 
      });
    }
  });
  
  app.put("/api/crm-settings/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settingsId = parseInt(req.params.id);
      if (isNaN(settingsId)) {
        return res.status(400).json({ message: "Invalid settings ID" });
      }
      
      // Validate the request body
      const updateCrmSettingsSchema = z.object({
        crm_type: z.string().optional(),
        base_url: z.string().url().optional(),
        api_version: z.string().optional(),
        auth_type: z.string().optional(),
        settings: z.record(z.unknown()).optional()
      });
      
      const result = updateCrmSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid CRM settings", 
          errors: result.error.errors 
        });
      }
      
      // Update CRM settings
      const crmSettings = await storage.updateCrmSettings(settingsId, result.data);
      
      if (!crmSettings) {
        return res.status(404).json({ message: "CRM settings not found" });
      }
      
      res.json(crmSettings);
    } catch (error) {
      console.error("Error updating CRM settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error updating CRM settings" 
      });
    }
  });
  
  app.delete("/api/crm-settings/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const settingsId = parseInt(req.params.id);
      if (isNaN(settingsId)) {
        return res.status(400).json({ message: "Invalid settings ID" });
      }
      
      const success = await storage.deleteCrmSettings(settingsId);
      
      if (!success) {
        return res.status(404).json({ message: "CRM settings not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting CRM settings:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error deleting CRM settings" 
      });
    }
  });

  // Kastle Video Guarding Form Data endpoints
  app.get("/api/projects/:projectId/kvg-form-data", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log("Attempting to fetch KVG form data for project", projectId);
    const formData = await storage.getKvgFormData(projectId);
    console.log("KVG Form Data query executed");
    
    if (!formData) {
      console.log("No KVG Form Data found for project", projectId);
      // Return a skeleton response that will pass the validation checks
      return res.json({
        id: null, // Using null instead of 0 so client knows it needs to be created
        project_id: projectId,
        form_type: 'kvg',
        form_data: {},
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    console.log("Found KVG form data with ID:", formData.id);
    res.json(formData);
  });

  app.post("/api/kvg-form-data", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("Received KVG form data:", JSON.stringify(req.body, null, 2));
      const result = insertKvgFormDataSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation errors:", JSON.stringify(result.error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid KVG form data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if form data already exists for this project
      const existingFormData = await storage.getKvgFormData(result.data.project_id);
      if (existingFormData) {
        // Update instead of creating a new one
        const updatedFormData = await storage.updateKvgFormData(existingFormData.id, result.data);
        return res.json(updatedFormData);
      }

      const formData = await storage.createKvgFormData(result.data);
      res.status(201).json(formData);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create KVG form data",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/kvg-form-data/:id", isAuthenticated, async (req: Request, res: Response) => {
    const formDataId = parseInt(req.params.id);
    if (isNaN(formDataId)) {
      return res.status(400).json({ message: "Invalid form data ID" });
    }

    try {
      console.log("Received PUT KVG form data:", JSON.stringify(req.body, null, 2));
      const result = insertKvgFormDataSchema.partial().safeParse(req.body);
      if (!result.success) {
        console.log("PUT Validation errors:", JSON.stringify(result.error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid KVG form data", 
          errors: result.error.errors 
        });
      }

      const formData = await storage.updateKvgFormData(formDataId, result.data);
      if (!formData) {
        return res.status(404).json({ message: "KVG form data not found" });
      }

      res.json(formData);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update KVG form data",
        error: (error as Error).message
      });
    }
  });

  // KVG Streams endpoints
  app.get("/api/projects/:projectId/kvg-streams", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const streams = await storage.getKvgStreams(projectId);
    res.json(streams);
  });

  app.get("/api/kvg-streams/:id", isAuthenticated, async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.id);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: "Invalid stream ID" });
    }

    const stream = await storage.getKvgStream(streamId);
    if (!stream) {
      return res.status(404).json({ message: "KVG stream not found" });
    }

    res.json(stream);
  });

  app.post("/api/kvg-streams", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Use a more flexible schema to handle additional fields
      const { flexibleKvgStreamSchema } = require('./custom-schemas');
      const result = flexibleKvgStreamSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid KVG stream data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists if project_id is provided
      if (result.data.project_id) {
        const project = await storage.getProject(result.data.project_id);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
      }

      const stream = await storage.createKvgStream(result.data);
      res.status(201).json(stream);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create KVG stream",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/kvg-streams/:id", isAuthenticated, async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.id);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: "Invalid stream ID" });
    }

    try {
      // Use a more flexible schema to handle additional fields
      const { flexibleKvgStreamSchema } = require('./custom-schemas');
      const result = flexibleKvgStreamSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid KVG stream data", 
          errors: result.error.errors 
        });
      }

      const stream = await storage.updateKvgStream(streamId, result.data);
      if (!stream) {
        return res.status(404).json({ message: "KVG stream not found" });
      }

      res.json(stream);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update KVG stream",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/kvg-streams/:id", isAuthenticated, async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.id);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: "Invalid stream ID" });
    }

    const success = await storage.deleteKvgStream(streamId);
    if (!success) {
      return res.status(404).json({ message: "KVG stream not found" });
    }

    res.status(204).end();
  });

  // Stream Images endpoints
  app.get("/api/kvg-streams/:streamId/images", isAuthenticated, async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.streamId);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: "Invalid stream ID" });
    }

    const stream = await storage.getKvgStream(streamId);
    if (!stream) {
      return res.status(404).json({ message: "KVG stream not found" });
    }

    const images = await storage.getStreamImages(streamId);
    res.json(images);
  });

  app.post("/api/stream-images", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertStreamImageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid stream image data", 
          errors: result.error.errors 
        });
      }

      // Verify stream exists
      const stream = await storage.getKvgStream(result.data.stream_id);
      if (!stream) {
        return res.status(404).json({ message: "KVG stream not found" });
      }

      const image = await storage.createStreamImage(result.data);
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create stream image",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/stream-images/:id", isAuthenticated, async (req: Request, res: Response) => {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    const success = await storage.deleteStreamImage(imageId);
    if (!success) {
      return res.status(404).json({ message: "Stream image not found" });
    }

    res.status(204).end();
  });

  // Feedback (Bug Report & Feature Request) endpoints
  app.get("/api/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const feedbackItems = await storage.getFeedback();
      res.json(feedbackItems);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve feedback items",
        error: (error as Error).message
      });
    }
  });

  app.post("/api/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertFeedbackSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid feedback data", 
          errors: result.error.errors 
        });
      }

      const feedback = await storage.createFeedback(result.data);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create feedback",
        error: (error as Error).message
      });
    }
  });

  app.get("/api/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
    const feedbackId = parseInt(req.params.id);
    if (isNaN(feedbackId)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const feedback = await storage.getFeedbackById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  });

  app.put("/api/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
    const feedbackId = parseInt(req.params.id);
    if (isNaN(feedbackId)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    try {
      const result = insertFeedbackSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid feedback data", 
          errors: result.error.errors 
        });
      }

      const feedback = await storage.updateFeedback(feedbackId, result.data);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      res.json(feedback);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update feedback",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
    const feedbackId = parseInt(req.params.id);
    if (isNaN(feedbackId)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const success = await storage.deleteFeedback(feedbackId);
    if (!success) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(204).end();
  });

  // Project Collaborators endpoints
  app.get("/api/projects/:projectId/collaborators", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if the user has permission to view this project's collaborators
      const permission = await storage.getUserProjectPermission(req.user.id, projectId);
      if (!permission && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to view this project's collaborators" });
      }

      const collaborators = await storage.getProjectCollaborators(projectId);
      
      // Fetch user information for each collaborator
      const collaboratorsWithUserInfo = await Promise.all(
        collaborators.map(async (collaborator) => {
          const user = await storage.getUser(collaborator.user_id);
          return {
            ...collaborator,
            user: user ? {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName
            } : null
          };
        })
      );
      
      res.json(collaboratorsWithUserInfo);
    } catch (error) {
      console.error("Error getting project collaborators:", error);
      res.status(500).json({ 
        message: "Failed to get project collaborators",
        error: (error as Error).message
      });
    }
  });

  app.post("/api/projects/:projectId/collaborators", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if the user has admin permission on this project
      const permission = await storage.getUserProjectPermission(req.user.id, projectId);
      if (permission !== PERMISSION.ADMIN && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to add collaborators to this project" });
      }

      // Check if email is provided instead of user_id
      if (req.body.email && !req.body.user_id) {
        console.log("Looking up user by email:", req.body.email);
        // Look up the user by email
        const user = await storage.getUserByEmail(req.body.email);
        if (!user) {
          return res.status(404).json({ message: "User with this email not found" });
        }
        
        // Set the user_id in the request body
        req.body.user_id = user.id;
        console.log("Found user by email, ID:", user.id);
      }

      // Validate the request body
      const result = insertProjectCollaboratorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid collaborator data", 
          errors: result.error.errors 
        });
      }

      // Check if the user exists
      const user = await storage.getUser(result.data.user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the collaborator already exists
      const existingCollaborators = await storage.getProjectCollaborators(projectId);
      const existingCollaborator = existingCollaborators.find(
        c => c.user_id === result.data.user_id && c.project_id === projectId
      );

      if (existingCollaborator) {
        return res.status(409).json({ message: "User is already a collaborator on this project" });
      }

      // Add the collaborator
      const collaborator = await storage.addProjectCollaborator({
        ...result.data,
        project_id: projectId
      });
      
      // Return collaborator with user info for improved UX
      res.status(201).json({
        ...collaborator,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error("Error adding project collaborator:", error);
      res.status(500).json({ 
        message: "Failed to add project collaborator",
        error: (error as Error).message
      });
    }
  });

  app.put("/api/projects/collaborators/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ message: "Invalid collaborator ID" });
      }

      // Check if the collaborator exists
      const collaborator = await storage.getProjectCollaborator(collaboratorId);
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      // Check if the user has admin permission on this project
      const permission = await storage.getUserProjectPermission(req.user.id, collaborator.project_id);
      if (permission !== PERMISSION.ADMIN && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to modify collaborators on this project" });
      }

      // Validate the request body
      const result = insertProjectCollaboratorSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid collaborator data", 
          errors: result.error.errors 
        });
      }

      // Update the collaborator
      const updatedCollaborator = await storage.updateProjectCollaborator(collaboratorId, result.data);
      if (!updatedCollaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      res.json(updatedCollaborator);
    } catch (error) {
      console.error("Error updating project collaborator:", error);
      res.status(500).json({ 
        message: "Failed to update project collaborator",
        error: (error as Error).message
      });
    }
  });

  app.delete("/api/projects/collaborators/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ message: "Invalid collaborator ID" });
      }

      // Check if the collaborator exists
      const collaborator = await storage.getProjectCollaborator(collaboratorId);
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      // Check if the user has admin permission on this project
      const permission = await storage.getUserProjectPermission(req.user.id, collaborator.project_id);
      if (permission !== PERMISSION.ADMIN && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to remove collaborators from this project" });
      }

      // Remove the collaborator
      const success = await storage.removeProjectCollaborator(collaboratorId);
      if (!success) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error removing project collaborator:", error);
      res.status(500).json({ 
        message: "Failed to remove project collaborator",
        error: (error as Error).message
      });
    }
  });

  // Add API route to get user's projects
  app.get("/api/user/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjectsForUser(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error("Error getting user's projects:", error);
      res.status(500).json({ 
        message: "Failed to get user's projects",
        error: (error as Error).message
      });
    }
  });

  // Add API route to check user's permission for a project
  app.get("/api/projects/:projectId/permission", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get the user's permission for this project
      let permission = await storage.getUserProjectPermission(req.user.id, projectId);
      
      // If the user is an admin, they always have admin permission
      if (req.user.role === 'admin') {
        permission = PERMISSION.ADMIN;
      }

      res.json({ permission });
    } catch (error) {
      console.error("Error checking project permission:", error);
      res.status(500).json({ 
        message: "Failed to check project permission",
        error: (error as Error).message
      });
    }
  });

  // Route to look up users by email
  app.get("/api/lookup/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email query parameter is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the user without exposing sensitive information
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

  // Gemini AI API Proxy
  // Test endpoint for Gemini API
  // Keep Gemini endpoint for backward compatibility
  app.post("/api/gemini/test", isAuthenticated, proxyTestGemini);
  
  // Add Azure OpenAI endpoint
  app.post("/api/azure/test", isAuthenticated, proxyTestAzureOpenAI);

  // Public test endpoint for debugging (no authentication required)
  app.post("/api/test/azure", (req: Request, res: Response) => {
    console.log("Public Azure OpenAI test endpoint called");
    proxyTestAzureOpenAI(req, res);
  });
  
  // AI Analysis endpoints using smart AI service
  app.post("/api/ai/analysis/site-walk", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        projectName, 
        projectDescription, 
        buildingCount,
        accessPointCount,
        cameraCount,
        clientRequirements,
        specialConsiderations,
        provider // Optional parameter to force a specific provider
      } = req.body;

      // Validate required fields
      if (!projectName || !projectDescription) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const analysis = await generateSiteWalkAnalysis(
        projectName,
        projectDescription,
        buildingCount || 1,
        accessPointCount || 0,
        cameraCount || 0,
        clientRequirements || "",
        specialConsiderations || ""
      );

      res.json({
        ...analysis,
        secureAI: true,
        aiProvider: "Azure OpenAI in Kastle's secure environment"
      });
    } catch (error) {
      console.error("Error generating site walk analysis:", error);
      res.status(500).json({ 
        error: "Failed to generate site walk analysis",
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.post("/api/ai/analysis/quote-review", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        projectName, 
        projectDescription, 
        quoteDetails,
        clientBackground,
        provider // Optional parameter to force a specific provider
      } = req.body;

      // Validate required fields
      if (!projectName || !projectDescription) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const agenda = await generateQuoteReviewAgenda(
        projectName,
        projectDescription,
        quoteDetails || "",
        clientBackground || "",
        provider as 'azure' | 'gemini' | undefined
      );

      res.json(agenda);
    } catch (error) {
      console.error("Error generating quote review agenda:", error);
      res.status(500).json({ 
        error: "Failed to generate quote review agenda",
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.post("/api/ai/analysis/turnover-call", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { 
        projectName, 
        projectDescription, 
        installationDetails,
        clientNeeds,
        provider // Optional parameter to force a specific provider
      } = req.body;

      // Validate required fields
      if (!projectName || !projectDescription) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const agenda = await generateTurnoverCallAgenda(
        projectName,
        projectDescription,
        installationDetails || "",
        clientNeeds || "",
        provider as 'azure' | 'gemini' | undefined
      );

      res.json(agenda);
    } catch (error) {
      console.error("Error generating turnover call agenda:", error);
      res.status(500).json({ 
        error: "Failed to generate turnover call agenda",
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Check Gemini API configuration
  // Removed Gemini status endpoint - all AI functionality now uses Azure OpenAI
  
  // Check Azure OpenAI API configuration (authenticated)
  app.get("/api/azure/status", isAuthenticated, (req: Request, res: Response) => {
    const isConfigured = !!process.env.AZURE_OPENAI_API_KEY;
    res.json({ 
      configured: isConfigured,
      model: isConfigured ? "gpt-4" : null,
      deployment: isConfigured ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME : null,
      endpoint: isConfigured ? "https://azuresearchservice2.openai.azure.com/" : null 
    });
  });

  // Location-based endpoints
  app.get("/api/geocode", isAuthenticated, async (req: Request, res: Response) => {
    const address = req.query.address as string;
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    try {
      // First try the Google Maps Geocoding API
      const result = await geocodeAddress(address);
      
      if (result) {
        return res.json(result);
      }
      
      // If geocoding fails, try our fallback method
      console.log("Geocoding API failed, using fallback coordinate parser");
      const fallbackCoords = parseCoordinatesFromAddress(address);
      
      if (fallbackCoords) {
        return res.json({
          lat: fallbackCoords.lat,
          lng: fallbackCoords.lng,
          formattedAddress: address
        });
      }
      
      return res.status(404).json({ message: "Unable to geocode address" });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to geocode address",
        error: (error as Error).message
      });
    }
  });

  app.get("/api/weather", isAuthenticated, async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng coordinates are required" });
    }

    try {
      const weatherData = await getWeatherData(lat, lng);
      if (!weatherData) {
        return res.status(404).json({ message: "Unable to fetch weather data" });
      }
      res.json(weatherData);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch weather data",
        error: (error as Error).message
      });
    }
  });
  
  app.get("/api/places/autocomplete", isAuthenticated, async (req: Request, res: Response) => {
    const input = req.query.input as string;
    
    if (!input || input.length < 3) {
      return res.json({ predictions: [] });
    }

    try {
      const suggestions = await getPlaceAutocomplete(input);
      res.json(suggestions);
    } catch (error) {
      console.error("Error with place autocomplete:", error);
      // Even in case of error, return a valid response with fallback suggestions
      res.json({ 
        status: 'FALLBACK_ERROR', 
        predictions: [] 
      });
    }
  });

  app.get("/api/map-url", isAuthenticated, (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const zoom = parseInt(req.query.zoom as string) || 18;
    const width = parseInt(req.query.width as string) || 600;
    const height = parseInt(req.query.height as string) || 400;
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng coordinates are required" });
    }

    try {
      const mapUrl = getStaticMapUrl(lat, lng, zoom, width, height);
      res.json({ url: mapUrl });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate map URL",
        error: (error as Error).message
      });
    }
  });
  
  // Get satellite image thumbnail for a project
  app.get("/api/projects/:projectId/satellite-image", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }
    
    try {
      // Get project details
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If project doesn't have an address, return a 404
      if (!project.site_address) {
        return res.status(404).json({ message: "Project doesn't have an address" });
      }
      
      // Geocode the address to get coordinates
      const geocoded = await geocodeAddress(project.site_address);
      
      if (!geocoded) {
        return res.status(404).json({ message: "Couldn't geocode project address" });
      }
      
      // Generate a satellite image URL (smaller size for thumbnails)
      const mapUrl = getStaticMapUrl(geocoded.lat, geocoded.lng, 18, 300, 200);
      
      // Return the URL
      res.json({ url: mapUrl });
    } catch (error) {
      console.error("Error getting satellite image for project", error);
      res.status(500).json({ 
        message: "Failed to generate satellite image URL",
        error: (error as Error).message
      });
    }
  });

  app.get("/api/map-embed-url", isAuthenticated, (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng coordinates are required" });
    }

    try {
      const embedUrl = getMapEmbedUrl(lat, lng);
      res.json({ url: embedUrl });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate map embed URL",
        error: (error as Error).message
      });
    }
  });

  // Register enhanced Bluebeam-like PDF annotation routes
  registerEnhancedFloorplanRoutes(app, isAuthenticated);
  registerEnhancedMarkerAPI(app, isAuthenticated);
  
  // Speech API endpoints
  app.post("/api/speech/recognize", isAuthenticated, (req: Request, res: Response) => {
    recognizeSpeech(req, res);
  });

  app.post("/api/speech/synthesize", isAuthenticated, (req: Request, res: Response) => {
    textToSpeech(req, res);
  });
  
  // Chatbot API endpoints
  app.post("/api/gemini/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          success: false,
          message: "Messages are required and must be an array"
        });
      }
      
      const result = await chatbotGeminiService.processMessage(messages, context || {});
      res.json(result);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/gemini/chat/recommendations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          success: false,
          message: "Messages are required and must be an array"
        });
      }
      
      const response = await chatbotGeminiService.processMessage(messages, context || {});
      const recommendations = await chatbotGeminiService.extractEquipmentRecommendations(response);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating equipment recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate equipment recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Register CRM and Dataverse integration routes
  app.use(crmRoutes);
  
  // Set up AI routes
  setupAIRoutes(app);
  
  // Set up equipment creation and configuration routes for chatbot integration
  setupEquipmentCreationRoutes(app);
  setupEquipmentConfigurationRoutes(app);
  
  // Initialize Dataverse integration
  dataverseIntegration.loadConfiguration().catch(err => {
    console.error("Failed to load Dataverse configuration:", err);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
