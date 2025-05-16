import { Router } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { customLabor, customParts } from "../../shared/schema";

const router = Router();

// Custom Labor Routes
router.get("/projects/:projectId/custom-labor", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const laborItems = await db.select().from(customLabor).where(eq(customLabor.project_id, projectId));
    res.json(laborItems);
  } catch (error) {
    console.error("Error fetching custom labor:", error);
    res.status(500).json({ error: "Failed to fetch custom labor items" });
  }
});

router.post("/projects/:projectId/custom-labor", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { description, hours, rate, notes } = req.body;
    
    const newItem = await db.insert(customLabor).values({
      project_id: projectId,
      description,
      hours,
      rate,
      notes
    }).returning();
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error("Error creating custom labor:", error);
    res.status(500).json({ error: "Failed to create custom labor item" });
  }
});

router.put("/projects/:projectId/custom-labor/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { description, hours, rate, notes } = req.body;
    
    const updatedItem = await db.update(customLabor)
      .set({ description, hours, rate, notes })
      .where(eq(customLabor.id, itemId))
      .returning();
    
    if (!updatedItem.length) {
      return res.status(404).json({ error: "Custom labor item not found" });
    }
    
    res.json(updatedItem[0]);
  } catch (error) {
    console.error("Error updating custom labor:", error);
    res.status(500).json({ error: "Failed to update custom labor item" });
  }
});

router.delete("/projects/:projectId/custom-labor/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    
    await db.delete(customLabor).where(eq(customLabor.id, itemId));
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting custom labor:", error);
    res.status(500).json({ error: "Failed to delete custom labor item" });
  }
});

// Custom Parts Routes
router.get("/projects/:projectId/custom-parts", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const partItems = await db.select().from(customParts).where(eq(customParts.project_id, projectId));
    res.json(partItems);
  } catch (error) {
    console.error("Error fetching custom parts:", error);
    res.status(500).json({ error: "Failed to fetch custom parts" });
  }
});

router.post("/projects/:projectId/custom-parts", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { part_number, description, quantity, price, notes } = req.body;
    
    const newItem = await db.insert(customParts).values({
      project_id: projectId,
      part_number,
      description,
      quantity,
      price,
      notes
    }).returning();
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error("Error creating custom part:", error);
    res.status(500).json({ error: "Failed to create custom part" });
  }
});

router.put("/projects/:projectId/custom-parts/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { part_number, description, quantity, price, notes } = req.body;
    
    const updatedItem = await db.update(customParts)
      .set({ part_number, description, quantity, price, notes })
      .where(eq(customParts.id, itemId))
      .returning();
    
    if (!updatedItem.length) {
      return res.status(404).json({ error: "Custom part not found" });
    }
    
    res.json(updatedItem[0]);
  } catch (error) {
    console.error("Error updating custom part:", error);
    res.status(500).json({ error: "Failed to update custom part" });
  }
});

router.delete("/projects/:projectId/custom-parts/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    
    await db.delete(customParts).where(eq(customParts.id, itemId));
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting custom part:", error);
    res.status(500).json({ error: "Failed to delete custom part" });
  }
});

export default router;