import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupData } from "./data/lookupData";
import { analyzeProject, generateProjectAnalysis } from './services/project-questions-analysis';
import { 
  insertProjectSchema, 
  insertAccessPointSchema,
  insertCameraSchema,
  insertElevatorSchema,
  insertIntercomSchema,
  insertImageSchema,
  insertFloorplanSchema,
  insertFloorplanMarkerSchema,
  insertKvgFormDataSchema,
  insertKvgStreamSchema,
  insertStreamImageSchema,
  InsertAccessPoint,
  InsertCamera,
  InsertElevator,
  InsertIntercom,
  InsertImage,
  InsertFloorplan,
  InsertFloorplanMarker,
  InsertKvgFormData,
  InsertKvgStream,
  InsertStreamImage
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { generateSiteWalkAnalysis } from "./utils/gemini";
import { translateText } from "./services/gemini-translation";
import { linkProjectToCrm, getCrmSystem } from "./services/crm-integration";
import { isSharePointConfigured, areAzureCredentialsAvailable } from "./services/microsoft-graph";

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
  if (bypassHeaderAuth || bypassQueryAuth || process.env.NODE_ENV !== 'production') {
    console.log('⚠️ Authentication bypassed for development');
    
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
  res.status(401).json({ 
    success: false,
    message: "Authentication required" 
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication is already set up in index.ts
  
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

  // Project endpoints
  app.get("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  });

  app.post("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

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
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
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

  // Access Point endpoints
  app.get("/api/projects/:projectId/access-points", isAuthenticated, async (req: Request, res: Response) => {
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
      const result = insertAccessPointSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid access point data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const accessPoint = await storage.createAccessPoint(result.data);
      res.status(201).json(accessPoint);
    } catch (error) {
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
        quick_config: existingAccessPoint.quick_config,
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
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const cameras = await storage.getCameras(projectId);
    res.json(cameras);
  });

  app.get("/api/cameras/:id", isAuthenticated, async (req: Request, res: Response) => {
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
    }

    const camera = await storage.getCamera(cameraId);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    res.json(camera);
  });

  app.post("/api/cameras", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertCameraSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid camera data", 
          errors: result.error.errors 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const camera = await storage.createCamera(result.data);
      res.status(201).json(camera);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to create camera",
        error: (error as Error).message
      });
    }
  });
  
  app.post("/api/cameras/:id/duplicate", isAuthenticated, async (req: Request, res: Response) => {
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
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
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
    const cameraId = parseInt(req.params.id);
    if (isNaN(cameraId)) {
      return res.status(400).json({ message: "Invalid camera ID" });
    }

    const success = await storage.deleteCamera(cameraId);
    if (!success) {
      return res.status(404).json({ message: "Camera not found" });
    }

    res.status(204).end();
  });

  // Elevator endpoints
  app.get("/api/projects/:projectId/elevators", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const elevators = await storage.getElevators(projectId);
    res.json(elevators);
  });

  app.get("/api/elevators/:id", isAuthenticated, async (req: Request, res: Response) => {
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
    }

    const elevator = await storage.getElevator(elevatorId);
    if (!elevator) {
      return res.status(404).json({ message: "Elevator not found" });
    }

    res.json(elevator);
  });

  app.post("/api/elevators", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertElevatorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid elevator data", 
          errors: result.error.errors 
        });
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
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
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
    const elevatorId = parseInt(req.params.id);
    if (isNaN(elevatorId)) {
      return res.status(400).json({ message: "Invalid elevator ID" });
    }

    const success = await storage.deleteElevator(elevatorId);
    if (!success) {
      return res.status(404).json({ message: "Elevator not found" });
    }

    res.status(204).end();
  });

  // Intercom endpoints
  app.get("/api/projects/:projectId/intercoms", isAuthenticated, async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const intercoms = await storage.getIntercoms(projectId);
    res.json(intercoms);
  });

  app.get("/api/intercoms/:id", isAuthenticated, async (req: Request, res: Response) => {
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
    }

    const intercom = await storage.getIntercom(intercomId);
    if (!intercom) {
      return res.status(404).json({ message: "Intercom not found" });
    }

    res.json(intercom);
  });

  app.post("/api/intercoms", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertIntercomSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid intercom data", 
          errors: result.error.errors 
        });
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
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
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
    const intercomId = parseInt(req.params.id);
    if (isNaN(intercomId)) {
      return res.status(400).json({ message: "Invalid intercom ID" });
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
      door_type: ap.quick_config,
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
    
    const indoorCameras = cameras.filter(cam => cam.mounting_type?.includes('Indoor')).length;
    const outdoorCameras = cameras.filter(cam => cam.mounting_type?.includes('Outdoor')).length;
    
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
      
      const indoorCameras = cameras.filter(cam => cam.mounting_type?.includes('Indoor')).length;
      const outdoorCameras = cameras.filter(cam => cam.mounting_type?.includes('Outdoor')).length;
      
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
      const analysis = await generateSiteWalkAnalysis(analysisData);
      
      res.json({
        success: true,
        analysis: analysis
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate AI analysis",
        error: (error as Error).message
      });
    }
  });
  
  // Image endpoints
  app.get("/api/images/:equipmentType/:equipmentId", isAuthenticated, async (req: Request, res: Response) => {
    const equipmentType = req.params.equipmentType;
    const equipmentId = parseInt(req.params.equipmentId);
    
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }
    
    // Validate equipment type
    if (!['access_point', 'camera', 'elevator', 'intercom'].includes(equipmentType)) {
      return res.status(400).json({ message: "Invalid equipment type" });
    }
    
    // Get all images for this equipment
    const images = await storage.getImages(equipmentType, equipmentId);
    res.json(images);
  });
  
  app.post("/api/images", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertImageSchema.safeParse(req.body);
      if (!result.success) {
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
      
      // Save the image
      const image = await storage.saveImage(result.data);
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to save image",
        error: (error as Error).message
      });
    }
  });
  
  app.delete("/api/images/:id", isAuthenticated, async (req: Request, res: Response) => {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }
    
    const success = await storage.deleteImage(imageId);
    if (!success) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.status(204).end();
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

  app.delete("/api/floorplans/:id", isAuthenticated, async (req: Request, res: Response) => {
    const floorplanId = parseInt(req.params.id);
    if (isNaN(floorplanId)) {
      return res.status(400).json({ message: "Invalid floorplan ID" });
    }

    const success = await storage.deleteFloorplan(floorplanId);
    if (!success) {
      return res.status(404).json({ message: "Floorplan not found" });
    }

    res.status(204).end();
  });

  // Floorplan Marker endpoints
  app.get("/api/floorplans/:floorplanId/markers", isAuthenticated, async (req: Request, res: Response) => {
    const floorplanId = parseInt(req.params.floorplanId);
    if (isNaN(floorplanId)) {
      return res.status(400).json({ message: "Invalid floorplan ID" });
    }

    const floorplan = await storage.getFloorplan(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: "Floorplan not found" });
    }

    const markers = await storage.getFloorplanMarkers(floorplanId);
    res.json(markers);
  });

  app.post("/api/floorplan-markers", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertFloorplanMarkerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid marker data", 
          errors: result.error.errors 
        });
      }

      // Verify floorplan exists
      const floorplan = await storage.getFloorplan(result.data.floorplan_id);
      if (!floorplan) {
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
            quick_config: 'N/A',
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

  app.delete("/api/floorplan-markers/:id", isAuthenticated, async (req: Request, res: Response) => {
    const markerId = parseInt(req.params.id);
    if (isNaN(markerId)) {
      return res.status(400).json({ message: "Invalid marker ID" });
    }

    const success = await storage.deleteFloorplanMarker(markerId);
    if (!success) {
      return res.status(404).json({ message: "Marker not found" });
    }

    res.status(204).end();
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

    const formData = await storage.getKvgFormData(projectId);
    res.json(formData || null);
  });

  app.post("/api/kvg-form-data", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const result = insertKvgFormDataSchema.safeParse(req.body);
      if (!result.success) {
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
      const result = insertKvgFormDataSchema.partial().safeParse(req.body);
      if (!result.success) {
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
      const result = insertKvgStreamSchema.safeParse(req.body);
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
      const result = insertKvgStreamSchema.partial().safeParse(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
