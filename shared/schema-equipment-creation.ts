import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

// Equipment Creation Sessions
export const equipmentCreationSessions = pgTable("equipment_creation_sessions", {
  session_id: uuid("session_id").primaryKey(),
  project_id: integer("project_id").notNull(),
  equipment_type: text("equipment_type").notNull(),
  quantity: integer("quantity").notNull(),
  current_step: text("current_step").notNull(),
  responses: jsonb("responses").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  completed: boolean("completed").default(false),
});

export type EquipmentCreationSession = typeof equipmentCreationSessions.$inferSelect;
export const insertEquipmentCreationSessionSchema = createInsertSchema(equipmentCreationSessions).omit({ 
  created_at: true, 
  updated_at: true 
});
export type InsertEquipmentCreationSession = z.infer<typeof insertEquipmentCreationSessionSchema>;