import { Router } from "express";
import { storage } from "../storage";
import { insertCrmSettingSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all CRM settings
router.get("/api/crm/settings", async (req, res) => {
  try {
    const settings = await storage.getCrmSettings();
    res.json(settings);
  } catch (error) {
    console.error("Failed to fetch CRM settings:", error);
    res.status(500).json({ error: "Failed to fetch CRM settings" });
  }
});

// Get a specific CRM setting by ID
router.get("/api/crm/settings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const setting = await storage.getCrmSettingById(id);
    if (!setting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }

    res.json(setting);
  } catch (error) {
    console.error("Failed to fetch CRM setting:", error);
    res.status(500).json({ error: "Failed to fetch CRM setting" });
  }
});

// Get a specific CRM setting by type
router.get("/api/crm/settings/type/:type", async (req, res) => {
  try {
    const type = req.params.type;
    const setting = await storage.getCrmSettingByType(type);
    
    if (!setting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }

    res.json(setting);
  } catch (error) {
    console.error("Failed to fetch CRM setting by type:", error);
    res.status(500).json({ error: "Failed to fetch CRM setting by type" });
  }
});

// Create a new CRM setting
router.post("/api/crm/settings", async (req, res) => {
  try {
    const validatedData = insertCrmSettingSchema.parse(req.body);

    // Check if a setting with the same CRM type already exists
    const existingSetting = await storage.getCrmSettingByType(validatedData.crm_type);
    if (existingSetting) {
      return res.status(409).json({ error: "A setting for this CRM type already exists" });
    }

    const newSetting = await storage.createCrmSetting(validatedData);
    res.status(201).json(newSetting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to create CRM setting:", error);
    res.status(500).json({ error: "Failed to create CRM setting" });
  }
});

// Update an existing CRM setting
router.patch("/api/crm/settings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const existingSetting = await storage.getCrmSettingById(id);
    if (!existingSetting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }

    // Partial validation of the update data
    const validatedData = insertCrmSettingSchema.partial().parse(req.body);
    const updatedSetting = await storage.updateCrmSetting(id, validatedData);
    
    res.json(updatedSetting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to update CRM setting:", error);
    res.status(500).json({ error: "Failed to update CRM setting" });
  }
});

// Delete a CRM setting
router.delete("/api/crm/settings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const existingSetting = await storage.getCrmSettingById(id);
    if (!existingSetting) {
      return res.status(404).json({ error: "CRM setting not found" });
    }

    const success = await storage.deleteCrmSetting(id);
    if (!success) {
      return res.status(500).json({ error: "Failed to delete CRM setting" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Failed to delete CRM setting:", error);
    res.status(500).json({ error: "Failed to delete CRM setting" });
  }
});

// Test connection to Dataverse
router.post("/api/crm/dataverse/test-connection", async (req, res) => {
  try {
    const { url, clientId, clientSecret, tenantId } = req.body;
    
    if (!url || !clientId || !clientSecret || !tenantId) {
      return res.status(400).json({ error: "Missing required connection parameters" });
    }

    // We'll implement this function in the Microsoft Graph service
    // For now, just return success to test the API endpoint
    res.json({ success: true, message: "Connection test successful" });
  } catch (error) {
    console.error("Failed to test Dataverse connection:", error);
    res.status(500).json({ error: "Failed to test Dataverse connection" });
  }
});

// Sync projects with Dataverse
router.post("/api/crm/dataverse/sync", async (req, res) => {
  try {
    // This will be implemented to sync project data with Dataverse
    // For now, just return a placeholder response
    res.json({ success: true, message: "Sync initiated", syncedProjects: 0 });
  } catch (error) {
    console.error("Failed to sync with Dataverse:", error);
    res.status(500).json({ error: "Failed to sync with Dataverse" });
  }
});

export default router;