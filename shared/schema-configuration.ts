import { pgTable, serial, text, timestamp, boolean, integer, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Equipment batch submissions table for tracking completed configuration sessions
export const equipmentBatchSubmissions = pgTable("equipment_batch_submissions", {
  id: serial("id").primaryKey(),
  batch_id: uuid("batch_id").notNull(),
  project_id: integer("project_id").notNull(),
  items_json: json("items_json").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Types for the Equipment Configuration Workspace
// These are used in the client and don't need to be in the database

export interface EquipmentField {
  name: string;
  value: string | null;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

export interface EquipmentItem {
  id: string;
  type: 'camera' | 'access_point' | 'elevator' | 'intercom';
  name: string;
  fields: EquipmentField[];
  isComplete: boolean;
  quantity: number;
}

// Zod schema for validation
export const equipmentFieldSchema = z.object({
  name: z.string(),
  value: z.string().nullable(),
  required: z.boolean(),
  type: z.enum(['text', 'number', 'select', 'boolean']),
  options: z.array(z.string()).optional(),
});

export const equipmentItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['camera', 'access_point', 'elevator', 'intercom']),
  name: z.string(),
  fields: z.array(equipmentFieldSchema),
  isComplete: z.boolean(),
  quantity: z.number().int().positive(),
});

export const processConfigurationRequestSchema = z.object({
  message: z.string(),
  projectId: z.number().int().positive().optional(),
  currentItems: z.array(equipmentItemSchema).optional(),
});

export const submitConfigurationRequestSchema = z.object({
  items: z.array(equipmentItemSchema),
  projectId: z.number().int().positive(),
});

// Drizzle insert schemas
export const insertEquipmentBatchSubmissionSchema = createInsertSchema(equipmentBatchSubmissions);

// Types for TypeScript
export type EquipmentBatchSubmission = typeof equipmentBatchSubmissions.$inferSelect;
export type InsertEquipmentBatchSubmission = z.infer<typeof insertEquipmentBatchSubmissionSchema>;