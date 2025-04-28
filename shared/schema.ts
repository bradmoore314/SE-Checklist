import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role"),
  microsoftId: text("microsoft_id"),
  refreshToken: text("refresh_token"),
  lastLogin: timestamp("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  site_address: text("site_address"),
  se_name: text("se_name"),
  bdm_name: text("bdm_name"),
  building_count: integer("building_count"),
  progress_percentage: integer("progress_percentage"),
  progress_notes: text("progress_notes"),
  equipment_notes: text("equipment_notes"),
  scope_notes: text("scope_notes"),
  
  // CRM integration fields
  crm_opportunity_id: text("crm_opportunity_id"),
  crm_opportunity_name: text("crm_opportunity_name"),
  crm_account_id: text("crm_account_id"),
  crm_account_name: text("crm_account_name"),
  crm_last_synced: timestamp("crm_last_synced"),
  
  // SharePoint integration fields
  sharepoint_folder_url: text("sharepoint_folder_url"),
  sharepoint_site_id: text("sharepoint_site_id"),
  sharepoint_drive_id: text("sharepoint_drive_id"),
  sharepoint_folder_id: text("sharepoint_folder_id"),
  
  // Project configuration flags
  replace_readers: boolean("replace_readers"),
  need_credentials: boolean("need_credentials"),
  takeover: boolean("takeover"),
  pull_wire: boolean("pull_wire"),
  visitor: boolean("visitor"),
  install_locks: boolean("install_locks"),
  ble: boolean("ble"),
  ppi_quote_needed: boolean("ppi_quote_needed"),
  guard_controls: boolean("guard_controls"),
  floorplan: boolean("floorplan"),
  test_card: boolean("test_card"),
  conduit_drawings: boolean("conduit_drawings"),
  reports_available: boolean("reports_available"),
  photo_id: boolean("photo_id"),
  on_site_security: boolean("on_site_security"),
  photo_badging: boolean("photo_badging"),
  kastle_connect: boolean("kastle_connect"),
  wireless_locks: boolean("wireless_locks"),
  rush: boolean("rush"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, created_at: true, updated_at: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Floorplans
export const floorplans = pgTable("floorplans", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  pdf_data: text("pdf_data").notNull(),  // Base64 encoded PDF
  page_count: integer("page_count").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Floorplan = typeof floorplans.$inferSelect;
export const insertFloorplanSchema = createInsertSchema(floorplans).omit({ id: true, created_at: true, updated_at: true });
export type InsertFloorplan = z.infer<typeof insertFloorplanSchema>;

// Floorplan Markers
export const floorplanMarkers = pgTable("floorplan_markers", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").notNull(),
  marker_type: text("marker_type").notNull(), // 'access_point', 'camera', etc.
  equipment_id: integer("equipment_id").notNull(),
  position_x: integer("position_x").notNull(),
  position_y: integer("position_y").notNull(),
  label: text("label"),
  created_at: timestamp("created_at").defaultNow(),
});

export type FloorplanMarker = typeof floorplanMarkers.$inferSelect;
export const insertFloorplanMarkerSchema = createInsertSchema(floorplanMarkers).omit({ id: true, created_at: true });
export type InsertFloorplanMarker = z.infer<typeof insertFloorplanMarkerSchema>;

// Access Points
export const accessPoints = pgTable("access_points", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  reader_type: text("reader_type").notNull(),
  lock_type: text("lock_type").notNull(),
  monitoring_type: text("monitoring_type").notNull(),
  lock_provider: text("lock_provider"),
  takeover: text("takeover"),
  interior_perimeter: text("interior_perimeter"),
  exst_panel_location: text("exst_panel_location"),
  exst_panel_type: text("exst_panel_type"),
  exst_reader_type: text("exst_reader_type"),
  new_panel_location: text("new_panel_location"),
  new_panel_type: text("new_panel_type"),
  new_reader_type: text("new_reader_type"),
  noisy_prop: text("noisy_prop"),
  crashbars: text("crashbars"),
  real_lock_type: text("real_lock_type"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type AccessPoint = typeof accessPoints.$inferSelect;
export const insertAccessPointSchema = createInsertSchema(accessPoints).omit({ id: true, created_at: true, updated_at: true });
export type InsertAccessPoint = z.infer<typeof insertAccessPointSchema>;

// Cameras
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

export type Camera = typeof cameras.$inferSelect;
export const insertCameraSchema = createInsertSchema(cameras).omit({ id: true, created_at: true, updated_at: true });
export type InsertCamera = z.infer<typeof insertCameraSchema>;

// Elevators
export const elevators = pgTable("elevators", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location"),
  elevator_type: text("elevator_type"),
  floor_count: integer("floor_count"),
  notes: text("notes"),
  title: text("title"),
  bank_name: text("bank_name"),
  building_number: text("building_number"),
  address: text("address"),
  city: text("city"),
  management_company: text("management_company"),
  management_contact_person: text("management_contact_person"),
  management_phone_number: text("management_phone_number"),
  elevator_company: text("elevator_company"),
  elevator_contact_person: text("elevator_contact_person"),
  elevator_phone_number: text("elevator_phone_number"),
  elevator_system_type: text("elevator_system_type"),
  secured_floors: text("secured_floors"),
  freight_car_home_floor: text("freight_car_home_floor"),
  elevator_phone_type: text("elevator_phone_type"),
  reader_type: text("reader_type"),
  freight_secure_type: text("freight_secure_type"),
  freight_car_numbers: text("freight_car_numbers"),
  visitor_processing: text("visitor_processing"),
  
  // Boolean flags
  rear_hall_calls: boolean("rear_hall_calls"),
  rear_hall_control: boolean("rear_hall_control"),
  reader_mounting_surface_ferrous: boolean("reader_mounting_surface_ferrous"),
  flush_mount_required: boolean("flush_mount_required"),
  elevator_phones_for_visitors: boolean("elevator_phones_for_visitors"),
  engineer_override_key_switch: boolean("engineer_override_key_switch"),
  freight_car_in_group: boolean("freight_car_in_group"),
  shutdown_freight_car: boolean("shutdown_freight_car"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Elevator = typeof elevators.$inferSelect;
export const insertElevatorSchema = createInsertSchema(elevators).omit({ id: true, created_at: true, updated_at: true });
export type InsertElevator = z.infer<typeof insertElevatorSchema>;

// Intercoms
export const intercoms = pgTable("intercoms", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  intercom_type: text("intercom_type").notNull(),
  mounting_style: text("mounting_style"),
  connected_door: text("connected_door"),
  network_connection: text("network_connection"),
  power_source: text("power_source"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Intercom = typeof intercoms.$inferSelect;
export const insertIntercomSchema = createInsertSchema(intercoms).omit({ id: true, created_at: true, updated_at: true });
export type InsertIntercom = z.infer<typeof insertIntercomSchema>;

// Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  report_type: text("report_type").notNull(), // 'summary', 'technical', etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  format: text("format").notNull(), // 'pdf', 'excel', etc.
  created_at: timestamp("created_at").defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, created_at: true });
export type InsertReport = z.infer<typeof insertReportSchema>;

// Feedback / Bug Reports / Feature Requests
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'bug' or 'feature'
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high'
  submitter_name: text("submitter_name").notNull(),
  submitter_email: text("submitter_email"),
  status: text("status").notNull().default("open"), // 'open', 'in-progress', 'resolved', 'wont-fix'
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Feedback = typeof feedback.$inferSelect;
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, status: true, created_at: true, updated_at: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;