import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupData } from "./data/lookupData";
import { analyzeProject, generateProjectAnalysis } from './services/project-questions-analysis';
// Using Azure OpenAI for all AI functionality in Kastle's secure environment
// All AI processing occurs within Azure's secure cloud, ensuring data privacy compliance

// Azure OpenAI proxy removed during cleanup

// Import Azure OpenAI secure generation functions
import { 
  generateQuoteReviewAgenda as generateAzureQuoteReviewAgenda, 
  generateTurnoverCallAgenda as generateAzureTurnoverCallAgenda,
  testAzureOpenAI 
} from './utils/azure-openai';

// Import the Azure OpenAI-based quote review agenda service
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
import { registerEnhancedFloorplanRoutes } from './enhanced-floorplan-routes';
import { registerEnhancedMarkerAPI } from './enhanced-markers-api';
import { recognizeSpeech, textToSpeech } from './speech-api';
// Using Azure OpenAI for AI services
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
// Using Azure OpenAI for translation
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

  // Authenticated Azure OpenAI test endpoint
  app.post("/api/azure/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Missing required prompt parameter" });
      }
      
      console.log("Testing Azure OpenAI with prompt:", prompt);
      
      // Send the prompt to Azure OpenAI API
      const response = await testAzureOpenAI(prompt);
      
      console.log("Azure OpenAI response:", response);
      
      // Return the response to the client in the format the client expects
      res.json({ content: response });
    } catch (error) {
      console.error("Error calling Azure OpenAI API:", error);
      
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });
  
  app.post("/api/public/azure/test", (req: Request, res: Response) => {
    console.log("Public Azure OpenAI test endpoint called");
    testAzureOpenAI(req, res);
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
      
      const result = await generateAzureSiteWalkAnalysis(
        projectName,
        projectDescription,
        buildingCount,
        accessPointCount,
        cameraCount,
        clientRequirements,
        specialConsiderations
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

  // Access Point endpoints - now public
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
  
  // Get a specific access point within a project
  app.get("/api/projects/:projectId/access-points/:id", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const projectId = parseInt(req.params.projectId);
    const accessPointId = parseInt(req.params.id);
    
    if (isNaN(projectId) || isNaN(accessPointId)) {
      return res.status(400).json({ message: "Invalid ID parameters" });
    }

    console.log(`Fetching access point ${accessPointId} for project ${projectId}`);
    
    // Get list of projects the user has access to
    const userProjects = await storage.getProjectsForUser(req.user.id);
    const userProjectIds = userProjects.map(p => p.id);
    
    // Check if user has access to this project
    if (!userProjectIds.includes(projectId)) {
      return res.status(403).json({ message: "You don't have permission to access this project" });
    }

    const accessPoint = await storage.getAccessPoint(accessPointId);
    
    if (!accessPoint) {
      console.log(`Access point ${accessPointId} not found`);
      return res.status(404).json({ message: "Access point not found" });
    }
    
    // Verify this access point belongs to the requested project
    if (accessPoint.project_id !== projectId) {
      console.log(`Access point ${accessPointId} does not belong to project ${projectId}, actual project: ${accessPoint.project_id}`);
      return res.status(404).json({ message: "Access point not found in this project" });
    }

    console.log(`Successfully found access point: ${JSON.stringify(accessPoint)}`);
    res.json(accessPoint);
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
        quick_config: existingAccessPoint.quick_config || 'Standard',
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
    try {
      const accessPointId = parseInt(req.params.id);
      if (isNaN(accessPointId)) {
        return res.status(400).json({ message: "Invalid access point ID" });
      }

      // Get the access point to check its project ID
      const accessPoint = await storage.getAccessPoint(accessPointId);
      if (!accessPoint) {
        return res.status(404).json({ message: "Access point not found" });
      }

      // Find all floorplan markers of this access point across all floorplans
      // First get floorplans for this project
      const floorplans = await storage.getFloorplans(accessPoint.project_id);
      if (floorplans.length > 0) {
        for (const floorplan of floorplans) {
          // Get markers for each floorplan
          const markers = await storage.getFloorplanMarkers(floorplan.id);
          // Find and delete markers that reference this access point
          for (const marker of markers) {
            if (marker.marker_type === 'access_point' && marker.equipment_id === accessPointId) {
              await storage.deleteFloorplanMarker(marker.id);
              console.log(`Deleted marker ${marker.id} referencing access point ${accessPointId}`);
            }
          }
        }
      }

      // Now delete the access point itself
      const success = await storage.deleteAccessPoint(accessPointId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete access point" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting access point:", error);
      res.status(500).json({ 
        message: "Failed to delete access point and associated markers",
        error: (error as Error).message
      });
    }
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

    try {
      // Find all floorplan markers of this camera across all floorplans
      // First get floorplans for this project
      const floorplans = await storage.getFloorplans(camera.project_id);
      if (floorplans.length > 0) {
        for (const floorplan of floorplans) {
          // Get markers for each floorplan
          const markers = await storage.getFloorplanMarkers(floorplan.id);
          // Find and delete markers that reference this camera
          for (const marker of markers) {
            if (marker.marker_type === 'camera' && marker.equipment_id === cameraId) {
              await storage.deleteFloorplanMarker(marker.id);
              console.log(`Deleted marker ${marker.id} referencing camera ${cameraId}`);
            }
          }
        }
      }

      // Now delete the camera itself
      const success = await storage.deleteCamera(cameraId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete camera" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting camera:", error);
      res.status(500).json({
        message: "Failed to delete camera and associated markers",
        error: (error as Error).message
      });
    }
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
      
      // Generate AI analysis using Azure OpenAI
      console.log("Making Azure OpenAI API call for project:", projectId);
      try {
        // Using Azure's secure environment for enhanced protection of sensitive data
        const analysis = await generateAzureSiteWalkAnalysis(analysisData);
        console.log("Azure OpenAI API call successful with sections:", Object.keys(analysis));
        
        res.json({
          success: true,
          analysis: analysis,
          secureAI: true,
          aiProvider: "Azure OpenAI in Kastle's secure environment"
        });
      } catch (aiError) {
        console.error("Azure OpenAI API detailed error:", aiError);
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

      // Call Azure OpenAI service to generate quote review agenda
      try {
        // Using our new Azure OpenAI implementation for quote review agenda
        const agenda = await generateQuoteReviewAgenda(agendaData);
        
        console.log("Quote Review Agenda generated successfully using Azure OpenAI");

        res.json({
          success: true,
          agenda,
          secureAI: true,
          aiProvider: "Azure OpenAI in Kastle's secure environment"
        });
      } catch (aiError) {
        console.error("Error calling Azure OpenAI for quote review agenda:", aiError);
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
  
  // Interactive Quote Review endpoints
  app.get("/api/projects/:projectId/interactive-questions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Get project data for context
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get questions that need user input from the service
      const { generateQuoteReviewQuestions } = require('./services/interactive-quote-review');
      const questions = generateQuoteReviewQuestions();
      
      // Return the questions
      res.json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          client: project.client
        },
        questions
      });
    } catch (error) {
      console.error("Error fetching questions for interactive review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch questions for interactive review",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/projects/:projectId/interactive-quote-review", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Get user-answered questions from request body
      const { userAnsweredQuestions } = req.body;
      if (!userAnsweredQuestions) {
        return res.status(400).json({ message: "Missing user answered questions" });
      }

      // Get project data
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get equipment data
      const accessPoints = await storage.getAccessPoints(projectId);
      const cameras = await storage.getCameras(projectId);
      const elevators = await storage.getElevators(projectId);
      const intercoms = await storage.getIntercoms(projectId);

      // Prepare data for AI analysis
      const projectData = {
        project,
        equipment: {
          accessPoints,
          cameras,
          elevators,
          intercoms
        }
      };

      // Import and call the interactive quote review service
      const { generateInteractiveQuoteReview } = require('./services/interactive-quote-review');
      
      try {
        const analysis = await generateInteractiveQuoteReview(projectData, userAnsweredQuestions);
        
        console.log("Interactive Quote Review Analysis generated successfully");

        res.json({
          success: true,
          analysis,
          secureAI: true,
          aiProvider: "Azure OpenAI in Kastle's secure environment"
        });
      } catch (aiError) {
        console.error("Error calling AI for interactive quote review:", aiError);
        res.status(500).json({
          success: false,
          message: "Failed to generate interactive quote review analysis",
          error: (aiError as Error).message
        });
      }
    } catch (error) {
      console.error("Error in interactive quote review endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate interactive quote review analysis",
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
        console.error("Error calling Azure OpenAI API for turnover call agenda:", aiError);
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
    
    // Validate equipment type (allow both singular and plural forms)
    const validTypes = ['access_point', 'access-points', 'camera', 'cameras', 'elevator', 'elevators', 'intercom', 'intercoms'];
    if (!validTypes.includes(equipmentType)) {
      console.log(`Invalid equipment type: ${equipmentType}`);
      return res.status(400).json({ message: "Invalid equipment type" });
    }
    
    // Normalize to singular form for database lookup
    const normalizedType = equipmentType.replace('-points', '_point').replace('s$', '').replace('-', '_');
    
    // Get all images for this equipment using normalized type
    const images = await storage.getImages(normalizedType, equipmentId);
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
      // Create sequential equipment numbering based on type
      const accessPointsWithMarkers = accessPoints.filter(ap => 
        markerEquipmentIds.get('access_point')?.has(ap.id)
      );
      const camerasWithMarkers = cameras.filter(cam => 
        markerEquipmentIds.get('camera')?.has(cam.id)
      );
      const elevatorsWithMarkers = elevators.filter(elev => 
        markerEquipmentIds.get('elevator')?.has(elev.id)
      );
      const intercomsWithMarkers = intercoms.filter(intercom => 
        markerEquipmentIds.get('intercom')?.has(intercom.id)
      );
      
      // Map unassigned equipment with sequential numbers
      const unassignedAccessPoints = accessPoints.filter(ap => 
        !markerEquipmentIds.get('access_point')?.has(ap.id)
      ).map((ap, index) => ({
        id: ap.id,
        type: 'access_point',
        label: ap.location && !ap.location.startsWith('Floor ') 
          ? ap.location 
          : `Access Point ${accessPointsWithMarkers.length + index + 1}`
      }));
      
      const unassignedCameras = cameras.filter(cam => 
        !markerEquipmentIds.get('camera')?.has(cam.id)
      ).map((cam, index) => ({
        id: cam.id,
        type: 'camera',
        label: cam.location && !cam.location.startsWith('Floor ') 
          ? cam.location 
          : `Camera ${camerasWithMarkers.length + index + 1}`
      }));
      
      const unassignedElevators = elevators.filter(elev => 
        !markerEquipmentIds.get('elevator')?.has(elev.id)
      ).map((elev, index) => ({
        id: elev.id,
        type: 'elevator',
        label: elev.location && !elev.location.startsWith('Floor ') 
          ? elev.location 
          : `Elevator ${elevatorsWithMarkers.length + index + 1}`
      }));
      
      const unassignedIntercoms = intercoms.filter(intercom => 
        !markerEquipmentIds.get('intercom')?.has(intercom.id)
      ).map((intercom, index) => ({
        id: intercom.id,
        type: 'intercom',
        label: intercom.location && !intercom.location.startsWith('Floor ') 
          ? intercom.location 
          : `Intercom ${intercomsWithMarkers.length + index + 1}`
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
          // Get access points to determine next number
          const accessPoints = await storage.getAccessPointsByProject(floorplan.project_id);
          
          // Default to 1 if no access points exist yet
          let nextNumber = 1;
          
          // Otherwise find the highest number and add 1
          if (accessPoints.length > 0) {
            const numberedAccessPoints = accessPoints
              .filter(ap => ap.location && ap.location.startsWith('Access Point '))
              .map(ap => {
                const match = ap.location.match(/Access Point (\d+)/);
                return match ? parseInt(match[1], 10) : 0;
              });
              
            if (numberedAccessPoints.length > 0) {
              nextNumber = Math.max(...numberedAccessPoints) + 1;
            }
          }
          
          // Create label with sequential number - don't use coordinates in name
          locationName = `Access Point ${nextNumber}`;
          
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
          // Get cameras to determine next number
          const cameras = await storage.getCamerasByProject(floorplan.project_id);
          
          // Default to 1 if no cameras exist yet
          let nextNumber = 1;
          
          // Otherwise find the highest number and add 1
          if (cameras.length > 0) {
            const numberedCameras = cameras
              .filter(cam => cam.location && cam.location.startsWith('Camera '))
              .map(cam => {
                const match = cam.location.match(/Camera (\d+)/);
                return match ? parseInt(match[1], 10) : 0;
              });
              
            if (numberedCameras.length > 0) {
              nextNumber = Math.max(...numberedCameras) + 1;
            }
          }
          
          // Create label with sequential number - don't use coordinates in name
          locationName = `Camera ${nextNumber}`;
          
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
          
          // Create label with sequential number - don't use coordinates in name
          locationName = `Elevator ${nextNumber}`;
          
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
          
          // Create label with sequential number - don't use coordinates in name
          locationName = `Intercom ${nextNumber}`;
          
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

      // For existing equipment, use its name/location for the marker label
      if (equipmentId !== 0 && equipmentId !== -1 && result.data.marker_type !== 'note') {
        // Get the equipment item to use its actual name
        let equipmentName = '';
        
        if (result.data.marker_type === 'access_point') {
          const ap = await storage.getAccessPoint(equipmentId);
          if (ap && ap.location) {
            equipmentName = ap.location;
          } else {
            // Default sequential naming if location is not available
            const accessPoints = await storage.getAccessPointsByProject(floorplan.project_id);
            const index = accessPoints.findIndex(item => item.id === equipmentId);
            equipmentName = `Access Point ${index !== -1 ? index + 1 : accessPoints.length}`;
          }
        } else if (result.data.marker_type === 'camera') {
          const camera = await storage.getCamera(equipmentId);
          if (camera && camera.location) {
            equipmentName = camera.location;
          } else {
            // Default sequential naming
            const cameras = await storage.getCamerasByProject(floorplan.project_id);
            const index = cameras.findIndex(item => item.id === equipmentId);
            equipmentName = `Camera ${index !== -1 ? index + 1 : cameras.length}`;
          }
        } else if (result.data.marker_type === 'elevator') {
          const elevator = await storage.getElevator(equipmentId);
          if (elevator && elevator.location) {
            equipmentName = elevator.location;
          } else {
            // Default sequential naming
            const elevators = await storage.getElevatorsByProject(floorplan.project_id);
            const index = elevators.findIndex(item => item.id === equipmentId);
            equipmentName = `Elevator ${index !== -1 ? index + 1 : elevators.length}`;
          }
        } else if (result.data.marker_type === 'intercom') {
          const intercom = await storage.getIntercom(equipmentId);
          if (intercom && intercom.location) {
            equipmentName = intercom.location;
          } else {
            // Default sequential naming
            const intercoms = await storage.getIntercomsByProject(floorplan.project_id);
            const index = intercoms.findIndex(item => item.id === equipmentId);
            equipmentName = `Intercom ${index !== -1 ? index + 1 : intercoms.length}`;
          }
        }
        
        // Create marker with the equipment's proper name
        const marker = await storage.createFloorplanMarker({
          ...result.data,
          equipment_id: equipmentId,
          label: equipmentName
        });
        return res.status(201).json(marker);
      }
      
      // Create the marker with the equipment ID (for newly created equipment)
      // Always use proper sequential naming for equipment markers
      if (result.data.marker_type === 'access_point') {
        // Get current access points to determine next number
        const accessPoints = await storage.getAccessPointsByProject(floorplan.project_id);
        
        // Default to 1 if no markers exist yet
        let nextNumber = 1;
        
        // Otherwise find the highest number and add 1
        if (accessPoints.length > 0) {
          const numberedAccessPoints = accessPoints
            .filter(ap => ap.location && ap.location.startsWith('Access Point '))
            .map(ap => {
              const match = ap.location.match(/Access Point (\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            });
            
          if (numberedAccessPoints.length > 0) {
            nextNumber = Math.max(...numberedAccessPoints) + 1;
          }
        }
        
        // Create appropriate sequential name
        const properName = `Access Point ${nextNumber}`;
        
        // Update the equipment's location to this new name too
        if (equipmentId !== 0 && equipmentId !== -1) {
          await storage.updateAccessPoint(equipmentId, { location: properName });
        }
        
        // Create marker with proper name
        const marker = await storage.createFloorplanMarker({
          ...result.data,
          label: properName, // Use proper name instead of "Floor X, Y"
          equipment_id: equipmentId
        });
        
        return res.status(201).json(marker);
      }
      
      // For other marker types or non-Floor labels, proceed normally
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
  
  // Azure OpenAI Translation endpoint
  app.post("/api/azure-translate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required parameters. Please provide 'text' and 'targetLanguage'." 
        });
      }
      
      if (!process.env.AZURE_OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "Azure OpenAI API key is not configured on the server." 
        });
      }
      
      // Import the Azure OpenAI test function which we'll use for translation
      const { testAzureOpenAI } = await import("./utils/azure-openai");
      
      // Use Azure OpenAI to translate the text through Kastle's secure environment
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translated text without explanations or quotation marks:\n\n${text}`;
      const translatedText = await testAzureOpenAI(prompt);
      
      res.json({
        success: true,
        translatedText,
        sourceLanguage,
        targetLanguage,
        provider: "azure",
        secureEnvironment: "Kastle Azure OpenAI"
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred during translation" 
      });
    }
  });

  // Azure OpenAI diagnostic endpoint
  app.get("/api/diagnose/azure", isAuthenticated, async (req: Request, res: Response) => {
    console.log("Azure OpenAI diagnostic endpoint called");
    try {
      // First check if API key is configured
      if (!process.env.AZURE_OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "Azure OpenAI API key is not configured on the server"
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
      
      console.log("Making Azure OpenAI API call with sample data from Kastle's secure environment");
      const startTime = Date.now();
      
      // Call the Azure OpenAI API with sample data through Kastle's secure environment
      const { generateSiteWalkAnalysis } = await import("./services/ai-service");
      const analysis = await generateSiteWalkAnalysis(
        sampleData.project.name,
        "Sample project for diagnostic testing",
        2,
        sampleData.summary.accessPointCount,
        sampleData.summary.cameraCount,
        "Standard security requirements",
        "None"
      );
      
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      console.log(`Azure OpenAI API call completed in ${timeTaken} seconds`);
      
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
        provider: "azure",
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        endpoint: "https://azuresearchservice2.openai.azure.com/",
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
      console.error("Azure OpenAI API diagnostic error:", error);
      res.status(500).json({
        success: false,
        message: "Azure OpenAI API diagnostic failed",
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
      console.log("Creating KVG stream with data:", JSON.stringify(req.body));
      
      // Accept all fields from frontend
      const streamData = req.body;
      
      if (!streamData.project_id) {
        console.error("Missing project_id in KVG stream data");
        return res.status(400).json({ message: "project_id is required" });
      }

      // Verify project exists
      const project = await storage.getProject(streamData.project_id);
      if (!project) {
        console.error(`Project not found: ${streamData.project_id}`);
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Pass the data directly to the storage method, which now handles camelCase to snake_case conversion
      try {
        const stream = await storage.createKvgStream(streamData);
        res.status(201).json(stream);
      } catch (dbError) {
        console.error("Database error creating KVG stream:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Error creating KVG stream:", error);
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
      console.log("Updating KVG stream with ID:", streamId, "Data:", JSON.stringify(req.body));
      // Pass the data directly to the storage method, which now handles camelCase to snake_case conversion
      const stream = await storage.updateKvgStream(streamId, req.body);
      
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

  // Azure OpenAI API Proxy
  // All AI functionality migrated to Azure OpenAI for enhanced security
  app.post("/api/azure/test", isAuthenticated, testAzureOpenAI);
  
  // Keep routing for any existing implementations, but redirect to Azure OpenAI
  app.post("/api/gemini/test", isAuthenticated, (req, res) => {
    console.log("Warning: Legacy AI endpoint accessed, redirecting to Azure OpenAI");
    return testAzureOpenAI(req, res);
  });

  // Public test endpoint for debugging (no authentication required)
  app.post("/api/test/azure", (req: Request, res: Response) => {
    console.log("Public Azure OpenAI test endpoint called");
    testAzureOpenAI(req, res);
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

      // Create analysis data in the expected format for Azure OpenAI
      const analysisData = {
        projectName,
        projectDescription,
        buildingCount: buildingCount || 1,
        accessPointCount: accessPointCount || 0,
        cameraCount: cameraCount || 0,
        clientRequirements: clientRequirements || "",
        specialConsiderations: specialConsiderations || ""
      };
      
      // Use Azure OpenAI for secure, enterprise-grade site walk analysis
      const analysis = await generateAzureSiteWalkAnalysis(analysisData);

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

      // Create agenda data in the format expected by Azure OpenAI
      const agendaData = {
        projectName,
        projectDescription,
        quoteDetails: quoteDetails || "",
        clientBackground: clientBackground || ""
      };
      
      // Use Azure OpenAI for secure, enterprise-grade quote review agenda
      const agenda = await generateAzureQuoteReviewAgenda(agendaData);

      res.json({
        ...agenda,
        secureAI: true,
        aiProvider: "Azure OpenAI in Kastle's secure environment"
      });
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

      // Create turnover call data in the format expected by Azure OpenAI
      const turnoverData = {
        projectName,
        projectDescription,
        installationDetails: installationDetails || "",
        clientNeeds: clientNeeds || ""
      };
      
      // Use Azure OpenAI for secure, enterprise-grade turnover call agenda
      const agenda = await generateAzureTurnoverCallAgenda(turnoverData);

      res.json({
        ...agenda,
        secureAI: true,
        aiProvider: "Azure OpenAI in Kastle's secure environment"
      });
    } catch (error) {
      console.error("Error generating turnover call agenda:", error);
      res.status(500).json({ 
        error: "Failed to generate turnover call agenda",
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // All AI functionality now uses Azure OpenAI exclusively in Kastle's secure environment
  // All AI processing is now done exclusively through Microsoft's secure Azure OpenAI service
  
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
    // New parameter for 3D tiles, defaults to true
    const use3DTiles = req.query.use3DTiles !== 'false'; // Default to true unless explicitly set to 'false'
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng coordinates are required" });
    }

    try {
      // Pass the use3DTiles parameter to get high-quality imagery when true
      const mapUrl = getStaticMapUrl(lat, lng, zoom, width, height, use3DTiles);
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
      
      // Generate a satellite image URL with photorealistic 3D Tiles (higher resolution for saving as floorplan)
      const mapUrl = getStaticMapUrl(geocoded.lat, geocoded.lng, 18, 800, 600, true);
      
      // For now, just hardcode a sample base64 image
      // This is a small transparent image that will allow the client-side code to continue working
      // but will need a real implementation for production
      const placeholderBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V7q34QAAAABJRU5ErkJggg==";
      
      // Return both the URL and a placeholder base64 data
      res.json({ 
        url: mapUrl,
        base64: placeholderBase64,
        // Include a message to indicate this is a workaround
        message: "Preview only - save to floorplan to see full image"
      });
    } catch (error) {
      console.error("Error getting satellite image for project", error);
      res.status(500).json({ 
        message: "Failed to generate satellite image",
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
  
  // Google Maps API key endpoint for client-side interactive maps
  app.get("/api/map-api-key", isAuthenticated, (req: Request, res: Response) => {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(404).json({ error: 'Google Maps API key not configured' });
      }
      
      // Return the API key for use with Google Maps JavaScript API
      return res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
    } catch (error) {
      console.error('Error providing Maps API key:', error);
      return res.status(500).json({ error: 'Server error' });
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
  app.post("/api/azure/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          success: false,
          message: "Messages are required and must be an array"
        });
      }
      
      // Import the Azure OpenAI client 
      const { getAzureOpenAIClient } = await import("./utils/azure-openai");
      const openai = getAzureOpenAIClient();
      
      // Format messages for Azure OpenAI with proper typing
      const formattedMessages: {role: 'user' | 'assistant' | 'system', content: string}[] = [];
      
      // Add a system message for context
      formattedMessages.push({
        role: 'system',
        content: 'You are a helpful security systems expert from Kastle Systems. Provide accurate, professional responses about security systems, access control, and cameras.'
      });
      
      // Add user messages with proper typing
      messages.forEach(msg => {
        // Convert the role to a type that OpenAI accepts
        const role = msg.role === 'user' ? 'user' : 
                     msg.role === 'assistant' ? 'assistant' : 'system';
                     
        formattedMessages.push({
          role: role as 'user' | 'assistant' | 'system',
          content: msg.content.toString()
        });
      });
      
      // Process the message through Azure OpenAI in Kastle's secure environment
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: formattedMessages as any, // Type casting to avoid TypeScript errors
        temperature: 0.7,
        max_tokens: 800
      });
      
      // Get the response content
      const result = {
        success: true,
        response: response.choices[0].message.content,
        provider: "azure",
        secureEnvironment: "Kastle Azure OpenAI",
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini"
      };
      
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
  
  app.post("/api/azure/chat/recommendations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          success: false,
          message: "Messages are required and must be an array"
        });
      }
      
      // Import the Azure OpenAI client 
      const { getAzureOpenAIClient } = await import("./utils/azure-openai");
      const openai = getAzureOpenAIClient();
      
      // Format messages for Azure OpenAI with proper typing
      const formattedMessages: {role: 'user' | 'assistant' | 'system', content: string}[] = [];
      
      // Add a system message for context
      formattedMessages.push({
        role: 'system',
        content: 'You are a helpful security systems expert from Kastle Systems. Provide accurate, professional responses about security systems, access control, and cameras.'
      });
      
      // Add user messages with proper typing
      messages.forEach(msg => {
        // Convert the role to a type that OpenAI accepts
        const role = msg.role === 'user' ? 'user' : 
                     msg.role === 'assistant' ? 'assistant' : 'system';
                     
        formattedMessages.push({
          role: role as 'user' | 'assistant' | 'system',
          content: msg.content.toString()
        });
      });
      
      // Get initial response through Azure OpenAI in Kastle's secure environment
      const chatResponse = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800
      });
      
      const responseText = chatResponse.choices[0].message.content || '';
      
      // Now extract equipment recommendations from the response
      const extractPrompt: {role: 'user' | 'assistant' | 'system', content: string}[] = [
        { 
          role: "system", 
          content: "You are a security system expert. Extract specific equipment recommendations from the following text. Format as a JSON array of strings. Only include actual equipment items like 'KR-RP40 readers', 'magnetic locks', etc. Don't include general concepts or advice."
        },
        {
          role: "user",
          content: responseText
        }
      ];
      
      // Extract recommendations - need to use a proper cast for OpenAI API compatibility
      const extractResponse = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
        messages: extractPrompt as any, // Type casting to avoid TypeScript errors
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      let recommendations = [];
      
      try {
        // Parse the JSON response
        const extractedText = extractResponse.choices[0].message.content || '{"recommendations":[]}';
        const parsed = JSON.parse(extractedText);
        recommendations = parsed.recommendations || [];
      } catch (err) {
        console.error("Error parsing recommendations:", err);
        recommendations = [];
      }
      
      res.json({ 
        recommendations,
        provider: "azure",
        secureEnvironment: "Kastle Azure OpenAI",
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini"
      });
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
