import { pgTable, text, serial, integer, boolean, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").default("user"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client"),
  site_address: text("site_address"),
  se_name: text("se_name"),
  bdm_name: text("bdm_name"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  // Configuration options
  replace_readers: boolean("replace_readers").default(false),
  need_credentials: boolean("need_credentials").default(false),
  takeover: boolean("takeover").default(false),
  pull_wire: boolean("pull_wire").default(false),
  visitor: boolean("visitor").default(false),
  install_locks: boolean("install_locks").default(false),
  ble: boolean("ble").default(false),
  ppi_quote_needed: boolean("ppi_quote_needed").default(false),
  guard_controls: boolean("guard_controls").default(false),
  floorplan: boolean("floorplan").default(false),
  test_card: boolean("test_card").default(false),
  conduit_drawings: boolean("conduit_drawings").default(false),
  reports_available: boolean("reports_available").default(false),
  photo_id: boolean("photo_id").default(false),
  on_site_security: boolean("on_site_security").default(false),
  photo_badging: boolean("photo_badging").default(false),
  kastle_connect: boolean("kastle_connect").default(false),
  wireless_locks: boolean("wireless_locks").default(false),
  rush: boolean("rush").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Card Access Points model
export const accessPoints = pgTable("access_points", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  quick_config: text("quick_config").notNull(), // Changed from door_type
  reader_type: text("reader_type").notNull(),
  lock_type: text("lock_type").notNull(),
  monitoring_type: text("monitoring_type").notNull(), // Changed from security_level
  lock_provider: text("lock_provider"), // Changed from ppi
  takeover: text("takeover"), // New field for takeover (yes/no)
  interior_perimeter: text("interior_perimeter"), // New field for Interior/Perimeter
  // Hidden fields
  exst_panel_location: text("exst_panel_location"),
  exst_panel_type: text("exst_panel_type"),
  exst_reader_type: text("exst_reader_type"),
  new_panel_location: text("new_panel_location"),
  new_panel_type: text("new_panel_type"),
  new_reader_type: text("new_reader_type"),
  noisy_prop: text("noisy_prop"), // New hidden field for Noisy Prop (yes/no)
  crashbars: text("crashbars"), // New hidden field for Crashbars (yes/no)
  real_lock_type: text("real_lock_type"), // New hidden field for Real Lock Type (mortise/single strike)
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertAccessPointSchema = createInsertSchema(accessPoints).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Cameras model
export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  camera_type: text("camera_type").notNull(),
  mounting_type: text("mounting_type"),
  resolution: text("resolution"),
  field_of_view: text("field_of_view"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Elevators model
export const elevators = pgTable("elevators", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  elevator_type: text("elevator_type").notNull(),
  floor_count: integer("floor_count"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertElevatorSchema = createInsertSchema(elevators).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Intercoms model
export const intercoms = pgTable("intercoms", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  intercom_type: text("intercom_type").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertIntercomSchema = createInsertSchema(intercoms).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Equipment Types for Images
export const equipmentTypeEnum = pgEnum('equipment_type', [
  'access_point',
  'camera',
  'elevator',
  'intercom'
]);

// Images table for all equipment types
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  equipment_type: equipmentTypeEnum("equipment_type").notNull(),
  equipment_id: integer("equipment_id").notNull(),
  project_id: integer("project_id").notNull(),
  image_data: text("image_data").notNull(), // base64 encoded image data
  filename: text("filename"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  created_at: true,
});

// Add image field to access points
export const accessPointImages = pgTable("access_point_images", {
  id: serial("id").primaryKey(),
  access_point_id: integer("access_point_id").notNull(),
  image_id: integer("image_id").notNull(),
});

// Add image field to cameras
export const cameraImages = pgTable("camera_images", {
  id: serial("id").primaryKey(),
  camera_id: integer("camera_id").notNull(),
  image_id: integer("image_id").notNull(),
});

// Add image field to elevators
export const elevatorImages = pgTable("elevator_images", {
  id: serial("id").primaryKey(),
  elevator_id: integer("elevator_id").notNull(),
  image_id: integer("image_id").notNull(),
});

// Add image field to intercoms
export const intercomImages = pgTable("intercom_images", {
  id: serial("id").primaryKey(),
  intercom_id: integer("intercom_id").notNull(),
  image_id: integer("image_id").notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type AccessPoint = typeof accessPoints.$inferSelect;
export type InsertAccessPoint = z.infer<typeof insertAccessPointSchema>;

export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = z.infer<typeof insertCameraSchema>;

export type Elevator = typeof elevators.$inferSelect;
export type InsertElevator = z.infer<typeof insertElevatorSchema>;

export type Intercom = typeof intercoms.$inferSelect;
export type InsertIntercom = z.infer<typeof insertIntercomSchema>;

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
