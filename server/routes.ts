import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupData } from "./data/lookupData";
import { 
  insertProjectSchema, 
  insertAccessPointSchema,
  insertCameraSchema,
  insertElevatorSchema,
  insertIntercomSchema,
  insertImageSchema,
  InsertAccessPoint,
  InsertCamera,
  InsertElevator,
  InsertIntercom,
  InsertImage
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    success: false,
    message: "Authentication required" 
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication is already set up in index.ts

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
      door_type: ap.door_type,
      reader_type: ap.reader_type,
      lock_type: ap.lock_type,
      security_level: ap.security_level,
      ppi: ap.ppi || "None",
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

    res.json({
      project: project,
      summary: {
        accessPointCount: accessPoints.length,
        cameraCount: cameras.length,
        elevatorCount: elevators.length,
        intercomCount: intercoms.length,
        totalEquipmentCount: accessPoints.length + cameras.length + elevators.length + intercoms.length
      }
    });
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

  const httpServer = createServer(app);
  return httpServer;
}
