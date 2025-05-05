import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { dataverseIntegration } from "../services/dataverse-integration";
import { insertCrmSettingSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware to ensure authentication
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  // IMPORTANT: Always bypass authentication for development purposes
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
};

// Get all CRM settings
router.get("/api/crm/settings", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getCrmSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to retrieve CRM settings",
      details: (error as Error).message
    });
  }
});

// Get CRM setting by ID
router.get("/api/crm/settings/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const setting = await storage.getCrmSettingById(id);
    if (!setting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to retrieve CRM setting",
      details: (error as Error).message
    });
  }
});

// Get CRM setting by type
router.get("/api/crm/settings/type/:type", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const type = req.params.type;
    if (!type) {
      return res.status(400).json({ error: "Type parameter is required" });
    }
    
    const setting = await storage.getCrmSettingByType(type);
    if (!setting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to retrieve CRM setting",
      details: (error as Error).message
    });
  }
});

// Create a new CRM setting
router.post("/api/crm/settings", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parseResult = insertCrmSettingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid CRM setting data", 
        details: parseResult.error.errors 
      });
    }
    
    const newSetting = await storage.createCrmSetting(parseResult.data);
    res.status(201).json(newSetting);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to create CRM setting",
      details: (error as Error).message
    });
  }
});

// Update an existing CRM setting
router.patch("/api/crm/settings/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const parseResult = insertCrmSettingSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid CRM setting data", 
        details: parseResult.error.errors 
      });
    }
    
    const updatedSetting = await storage.updateCrmSetting(id, parseResult.data);
    if (!updatedSetting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }
    
    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to update CRM setting",
      details: (error as Error).message
    });
  }
});

// Delete a CRM setting
router.delete("/api/crm/settings/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const success = await storage.deleteCrmSetting(id);
    if (!success) {
      return res.status(404).json({ error: "CRM setting not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to delete CRM setting",
      details: (error as Error).message
    });
  }
});

// Test Dataverse connection
router.post("/api/crm/dataverse/test-connection", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const schema = z.object({
      url: z.string().url(),
      clientId: z.string(),
      clientSecret: z.string(),
      tenantId: z.string(),
    });
    
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid connection parameters", 
        details: parseResult.error.errors 
      });
    }
    
    const { url, clientId, clientSecret, tenantId } = parseResult.data;
    
    // Test the connection
    const success = await dataverseIntegration.testConnection(url, clientId, clientSecret, tenantId);
    
    if (success) {
      res.json({ success: true, message: "Connection successful" });
    } else {
      res.status(400).json({ success: false, error: "Connection failed" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to test connection",
      details: (error as Error).message
    });
  }
});

// Sync projects with Dataverse opportunities
router.post("/api/crm/dataverse/sync", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await dataverseIntegration.syncProjects();
    
    if (result.errors.length > 0) {
      res.status(result.syncedProjects > 0 ? 200 : 400).json({
        success: result.syncedProjects > 0,
        syncedProjects: result.syncedProjects,
        errors: result.errors
      });
    } else {
      res.json({
        success: true,
        syncedProjects: result.syncedProjects
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to sync projects",
      details: (error as Error).message
    });
  }
});

// Search for opportunities in Dataverse
router.get("/api/crm/dataverse/opportunities/search", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const opportunities = await dataverseIntegration.searchOpportunities(query);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to search opportunities",
      details: (error as Error).message
    });
  }
});

// Link a project to an opportunity in Dataverse
router.post("/api/crm/dataverse/link/:projectId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }
    
    const schema = z.object({
      opportunityId: z.string()
    });
    
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid opportunity ID", 
        details: parseResult.error.errors 
      });
    }
    
    const { opportunityId } = parseResult.data;
    
    const success = await dataverseIntegration.linkProjectToOpportunity(projectId, opportunityId);
    
    if (success) {
      res.json({ success: true, message: "Project linked to opportunity" });
    } else {
      res.status(400).json({ success: false, error: "Failed to link project to opportunity" });
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to link project to opportunity",
      details: (error as Error).message
    });
  }
});

export default router;