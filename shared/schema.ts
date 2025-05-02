import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, boolean, json, real, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role"), // admin, user, guest
  microsoftId: text("microsoft_id"),
  refreshToken: text("refresh_token"),
  lastLogin: timestamp("last_login"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// User roles and permissions
export const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
} as const;

export type Role = typeof ROLE[keyof typeof ROLE];

export const PERMISSION = {
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin'
} as const;

export type Permission = typeof PERMISSION[keyof typeof PERMISSION];

// Project Collaborators - tracks who has access to which projects and their permission level
export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  user_id: integer("user_id").notNull(),
  permission: text("permission").notNull(), // 'view', 'edit', 'admin'
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});
export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;

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

// Define marker types enum for better type safety
export const MARKER_TYPE = {
  ACCESS_POINT: 'access_point',
  CAMERA: 'camera',
  ELEVATOR: 'elevator',
  INTERCOM: 'intercom',
  NOTE: 'note',
  MEASUREMENT: 'measurement',
  AREA: 'area',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  TEXT: 'text',
  CALLOUT: 'callout',
  ARROW: 'arrow',
  CLOUD: 'cloud',
  POLYGON: 'polygon',
  STAMP: 'stamp',
} as const;

export type MarkerType = typeof MARKER_TYPE[keyof typeof MARKER_TYPE];

// Layers for organizing annotations
export const floorplanLayers = pgTable("floorplan_layers", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  visible: boolean("visible").notNull().default(true),
  order: integer("order").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type FloorplanLayer = typeof floorplanLayers.$inferSelect;
export const insertFloorplanLayerSchema = createInsertSchema(floorplanLayers).omit({ id: true, created_at: true, updated_at: true });
export type InsertFloorplanLayer = z.infer<typeof insertFloorplanLayerSchema>;

// Calibration data for scale management
export const floorplanCalibrations = pgTable("floorplan_calibrations", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").notNull(),
  real_world_distance: real("real_world_distance").notNull(),
  pdf_distance: real("pdf_distance").notNull(),
  unit: text("unit").notNull(), // feet, meters, inches
  start_x: real("start_x").notNull(),
  start_y: real("start_y").notNull(),
  end_x: real("end_x").notNull(),
  end_y: real("end_y").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type FloorplanCalibration = typeof floorplanCalibrations.$inferSelect;
export const insertFloorplanCalibrationSchema = createInsertSchema(floorplanCalibrations).omit({ id: true, created_at: true, updated_at: true });
export type InsertFloorplanCalibration = z.infer<typeof insertFloorplanCalibrationSchema>;

// Enhanced Floorplan Markers with PDF coordinate system
export const floorplanMarkers = pgTable("floorplan_markers", {
  id: serial("id").primaryKey(),
  unique_id: uuid("unique_id").notNull().defaultRandom(), // Unique ID for version tracking
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").notNull(),
  marker_type: text("marker_type").notNull(), // Using MarkerType
  equipment_id: integer("equipment_id"), // Now optional - not all markers are equipment
  layer_id: integer("layer_id"), // Reference to the layer
  
  // PDF coordinate system (in PDF points, 1/72 inch)
  position_x: real("position_x").notNull(),
  position_y: real("position_y").notNull(),
  
  // For measurements, shapes, etc.
  end_x: real("end_x"),
  end_y: real("end_y"),
  width: real("width"),
  height: real("height"),
  rotation: real("rotation").default(0),
  
  // Styling properties
  color: text("color"),
  fill_color: text("fill_color"),
  opacity: real("opacity").default(1),
  line_width: real("line_width").default(1),
  
  // Content-related fields
  label: text("label"),
  text_content: text("text_content"),
  font_size: real("font_size"),
  font_family: text("font_family"),
  
  // For complex shapes - store as JSON array of points
  points: jsonb("points"),
  
  // Authoring and collaboration information
  author_id: integer("author_id"),
  author_name: text("author_name"),
  
  // Version control
  version: integer("version").notNull().default(1),
  parent_id: integer("parent_id"), // For tracking changes - references previous version
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type FloorplanMarker = typeof floorplanMarkers.$inferSelect;
export const insertFloorplanMarkerSchema = createInsertSchema(floorplanMarkers)
  .omit({ 
    id: true, 
    unique_id: true, 
    version: true, 
    created_at: true, 
    updated_at: true
  });
export type InsertFloorplanMarker = z.infer<typeof insertFloorplanMarkerSchema>;

// Comment system for markers - enables collaboration
export const markerComments = pgTable("marker_comments", {
  id: serial("id").primaryKey(),
  marker_id: integer("marker_id").notNull(),
  author_id: integer("author_id"),
  author_name: text("author_name").notNull(),
  text: text("text").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type MarkerComment = typeof markerComments.$inferSelect;
export const insertMarkerCommentSchema = createInsertSchema(markerComments).omit({ id: true, created_at: true, updated_at: true });
export type InsertMarkerComment = z.infer<typeof insertMarkerCommentSchema>;

// Access Points
export const accessPoints = pgTable("access_points", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  location: text("location").notNull(),
  quick_config: text("quick_config").notNull(), // NOTE: Legacy field - needed for database compatibility
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
  is_indoor: boolean("is_indoor").default(true), // true for indoor, false for outdoor
  import_to_gateway: boolean("import_to_gateway").default(true),
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

// Camera Stream Gateway types
export type GatewayType = '8ch' | '16ch';

export interface GatewayConfiguration {
  type: GatewayType;
  count: number;
}

export interface Calculations {
  totalStreams: number;
  totalThroughput: number;
  totalStorage: number;
}

export interface StreamCamera {
  name: string;
  lensCount: number;
  streamingResolution: number;
  frameRate: number;
  storageDays: number;
  recordingResolution: number;
  
  // Additional fields from the main app
  camera_type?: string;
  mounting_type?: string;
  resolution?: string;
  field_of_view?: string;
  notes?: string;
}

export interface Stream {
  id: string;
  name: string;
  lensType: string;
  resolution: string;
  frameRate: string;
  throughput: number;
  storage: number;
  cameraId: string;
}

// BitRate table as a constant object
export const BITRATE_TABLE = {
  1: 1.5,
  2: 2.0,
  4: 2.5,
  5: 2.8,
  6: 3.0,
  8: 3.5,
  12: 4.0
};