import { pgTable, text, serial, integer, boolean, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Password can be null for Microsoft logins
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").default("user"),
  // Microsoft Entra ID fields
  microsoftId: text("microsoft_id").unique(), // Microsoft OID
  refreshToken: text("refresh_token"), // Token for Microsoft Graph API
  lastLogin: timestamp("last_login"),
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
  building_count: integer("building_count"),
  progress_percentage: integer("progress_percentage").default(0),
  progress_notes: text("progress_notes"),
  equipment_notes: text("equipment_notes"), // New field for equipment notes
  scope_notes: text("scope_notes"), // New field for scope notes
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  // CRM Integration Fields
  crm_opportunity_id: text("crm_opportunity_id"),
  crm_opportunity_name: text("crm_opportunity_name"),
  crm_account_id: text("crm_account_id"),
  crm_account_name: text("crm_account_name"),
  crm_last_synced: timestamp("crm_last_synced"),
  // SharePoint Integration Fields
  sharepoint_folder_url: text("sharepoint_folder_url"),
  sharepoint_site_id: text("sharepoint_site_id"),
  sharepoint_drive_id: text("sharepoint_drive_id"),
  sharepoint_folder_id: text("sharepoint_folder_id"),
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
  bank_name: text("bank_name"),
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
  'intercom',
  'floorplan'
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

// Floorplans model
export const floorplans = pgTable("floorplans", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  name: text("name").notNull(),
  pdf_data: text("pdf_data").notNull(), // base64 encoded PDF
  page_count: integer("page_count").default(1),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertFloorplanSchema = createInsertSchema(floorplans).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Marker types
export const markerTypeEnum = pgEnum('marker_type', [
  'access_point',
  'camera'
]);

// Floorplan markers for mapping equipment to positions on the PDF
export const floorplanMarkers = pgTable("floorplan_markers", {
  id: serial("id").primaryKey(),
  floorplan_id: integer("floorplan_id").notNull(),
  page: integer("page").default(1),
  marker_type: markerTypeEnum("marker_type").notNull(),
  equipment_id: integer("equipment_id").notNull(),
  position_x: integer("position_x").notNull(), // X position as percentage 
  position_y: integer("position_y").notNull(), // Y position as percentage
  label: text("label"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertFloorplanMarkerSchema = createInsertSchema(floorplanMarkers).omit({
  id: true,
  created_at: true,
});

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;

export type Floorplan = typeof floorplans.$inferSelect;
export type InsertFloorplan = z.infer<typeof insertFloorplanSchema>;

export type FloorplanMarker = typeof floorplanMarkers.$inferSelect;
export type InsertFloorplanMarker = z.infer<typeof insertFloorplanMarkerSchema>;

// CRM Settings table
export const crmSettings = pgTable("crm_settings", {
  id: serial("id").primaryKey(),
  crm_type: text("crm_type").notNull(), // e.g., "salesforce", "dynamics", "hubspot"
  base_url: text("base_url").notNull(),
  api_version: text("api_version"),
  auth_type: text("auth_type").notNull(), // "oauth2", "api_key", etc.
  settings: jsonb("settings").notNull(), // Store additional settings as JSON
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertCrmSettingsSchema = createInsertSchema(crmSettings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CrmSettings = typeof crmSettings.$inferSelect;
export type InsertCrmSettings = z.infer<typeof insertCrmSettingsSchema>;

// Equipment Images table (photos of equipment for site walks)
export const equipmentImages = pgTable("equipment_images", {
  id: serial("id").primaryKey(),
  equipment_type: equipmentTypeEnum("equipment_type").notNull(),
  equipment_id: integer("equipment_id").notNull(),
  project_id: integer("project_id").notNull(),
  image_data: text("image_data").notNull(), // base64 encoded image
  thumbnail_data: text("thumbnail_data"), // base64 encoded thumbnail
  filename: text("filename"),
  sharepoint_file_id: text("sharepoint_file_id"), // ID of file in SharePoint if synced
  sharepoint_url: text("sharepoint_url"), // Direct URL to file in SharePoint
  created_at: timestamp("created_at").defaultNow(),
});

export const insertEquipmentImageSchema = createInsertSchema(equipmentImages).omit({
  id: true,
  created_at: true,
});

export type EquipmentImage = typeof equipmentImages.$inferSelect;
export type InsertEquipmentImage = z.infer<typeof insertEquipmentImageSchema>;

// Kastle Video Guarding Stream Images model
export const streamImages = pgTable("stream_images", {
  id: serial("id").primaryKey(),
  stream_id: integer("stream_id").notNull(),
  project_id: integer("project_id"),
  image_data: text("image_data").notNull(), // base64 encoded image
  thumbnail_data: text("thumbnail_data"), // base64 encoded thumbnail
  filename: text("filename"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertStreamImageSchema = createInsertSchema(streamImages).omit({
  id: true,
  created_at: true,
});

// Kastle Video Guarding Streams model
export const kvgStreams = pgTable("kvg_streams", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id"),
  location: text("location"),
  fov_accessibility: text("fov_accessibility"),
  camera_accessibility: text("camera_accessibility"),
  camera_type: text("camera_type"),
  environment: text("environment"),
  use_case_problem: text("use_case_problem"),
  speaker_association: text("speaker_association"),
  audio_talk_down: text("audio_talk_down"),
  event_monitoring: text("event_monitoring"),
  monitoring_start_time: text("monitoring_start_time"),
  monitoring_end_time: text("monitoring_end_time"),
  monitoring_days: text("monitoring_days"), // Stored as comma-separated days
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertKvgStreamSchema = createInsertSchema(kvgStreams).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Kastle Video Guarding Form Data model
export const kvgFormData = pgTable("kvg_form_data", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  
  // Pricing tab fields
  customer_type: text("customer_type"),
  voc_escalations: integer("voc_escalations").default(0),
  dispatch_responses: integer("dispatch_responses").default(0),
  gdods_patrols: integer("gdods_patrols").default(0),
  sgpp_patrols: integer("sgpp_patrols").default(0),
  forensic_investigations: integer("forensic_investigations").default(0),
  app_users: integer("app_users").default(0),
  audio_devices: integer("audio_devices").default(0),
  
  // Discovery tab fields
  bdm_owner: text("bdm_owner"),
  sales_engineer: text("sales_engineer"),
  kvg_sme: text("kvg_sme"),
  customer_name: text("customer_name"),
  site_address: text("site_address"),
  city: text("city"),
  state: text("state"),
  zip_code: text("zip_code"),
  crm_opportunity: text("crm_opportunity"),
  quote_date: text("quote_date"),
  time_zone: text("time_zone"),
  opportunity_stage: text("opportunity_stage"),
  opportunity_type: text("opportunity_type"),
  site_environment: text("site_environment"),
  region: text("region"),
  customer_vertical: text("customer_vertical"),
  property_category: text("property_category"),
  
  // Project Deployment - PM tab fields
  pm_name: text("pm_name"),
  deployment_date: text("deployment_date"),
  opportunity_number: text("opportunity_number"),
  project_manager: text("project_manager"),
  site_supervisor: text("site_supervisor"),
  technician: text("technician"),
  project_scope_description: text("project_scope_description"),
  deployment_requirements: text("deployment_requirements"),
  installation_requirements: text("installation_requirements"),
  parts_list_credentials: text("parts_list_credentials"),
  gateway_ip_address: text("gateway_ip_address"),
  gateway_port: text("gateway_port"),
  gateway_username: text("gateway_username"),
  gateway_password: text("gateway_password"),
  stream_names_ids: text("stream_names_ids"),
  stream_health_verification: text("stream_health_verification"),
  speaker_verification: text("speaker_verification"),
  
  // Technology fields
  technology: text("technology"),
  technology_deployed: text("technology_deployed"),
  camera_type: text("camera_type"),
  rspndr_gdods: text("rspndr_gdods"),
  rspndr_subscriptions: text("rspndr_subscriptions"),
  install_type: text("install_type"),
  
  // Stream counts
  event_video_trigger_streams: integer("event_video_trigger_streams").default(0),
  virtual_patrol_streams: integer("virtual_patrol_streams").default(0),
  event_action_clip_streams: integer("event_action_clip_streams").default(0),
  event_action_multi_view_streams: integer("event_action_multi_view_streams").default(0),
  health_streams: integer("health_streams").default(0),
  audio_talk_down_speakers: integer("audio_talk_down_speakers").default(0),
  
  // Monitoring details
  total_events_per_month: integer("total_events_per_month").default(0),
  total_virtual_patrols_per_month: integer("total_virtual_patrols_per_month").default(0),
  patrol_frequency: text("patrol_frequency"),
  total_health_patrols_per_month: integer("total_health_patrols_per_month").default(30),
  
  // Site Assessment fields
  lighting_requirements: text("lighting_requirements"),
  lighting_notes: text("lighting_notes"),
  camera_field_of_view: text("camera_field_of_view"),
  fov_notes: text("fov_notes"),
  network_connectivity: text("network_connectivity"),
  network_notes: text("network_notes"),
  site_assessment_notes: text("site_assessment_notes"),
  total_event_action_multi_views_per_month: integer("total_event_action_multi_views_per_month").default(0),
  total_escalations_maximum: integer("total_escalations_maximum").default(0),
  gdods_dispatches_per_month: integer("gdods_dispatches_per_month").default(0),
  sgpp_scheduled_patrols_per_month: integer("sgpp_scheduled_patrols_per_month").default(0),
  
  // Patrol details
  on_demand_guard_dispatch_detail: text("on_demand_guard_dispatch_detail"),
  sgpp_scheduled_guard_patrol_detail: text("sgpp_scheduled_guard_patrol_detail"),
  sgpp_scheduled_guard_patrols_schedule_detail: text("sgpp_scheduled_guard_patrols_schedule_detail"),
  
  // Use Case tab fields
  use_case_commitment: text("use_case_commitment"),
  use_case_response: text("use_case_response"),
  sow_detailed_outline: text("sow_detailed_outline"),
  schedule_details: text("schedule_details"),
  quote_with_sow_attached: text("quote_with_sow_attached"),
  quote_design_attached: text("quote_design_attached"),
  
  // VOC Protocol tab fields
  am_name: text("am_name"),
  project_id_value: text("project_id_value"),
  voc_script: text("voc_script"),
  voc_contact_name: text("voc_contact_name"),
  type_of_install_account: text("type_of_install_account"),
  
  // Escalation Process 1 fields
  escalation_process1: text("escalation_process1"),
  escalation_process1_events: text("escalation_process1_events"),
  escalation_process1_days_of_week: text("escalation_process1_days_of_week"),
  escalation_process1_start_time: text("escalation_process1_start_time"),
  escalation_process1_end_time: text("escalation_process1_end_time"),
  escalation_process1_cameras: text("escalation_process1_cameras"),
  escalation_process1_scene_observation: text("escalation_process1_scene_observation"),
  escalation_process1_process: text("escalation_process1_process"),
  escalation_process1_use_talk_down: text("escalation_process1_use_talk_down"),
  escalation_process1_contact_site_personnel: text("escalation_process1_contact_site_personnel"),
  escalation_process1_contact_police: text("escalation_process1_contact_police"),
  escalation_process1_escalate_to_branch: text("escalation_process1_escalate_to_branch"),
  escalation_process1_create_security_report: text("escalation_process1_create_security_report"),
  escalation_process1_rspndr_dispatch: text("escalation_process1_rspndr_dispatch"),
  escalation_process1_audio_response: text("escalation_process1_audio_response"),
  escalation_process1_audio_message: text("escalation_process1_audio_message"),
  
  // Escalation Process 2 fields
  escalation_process2: text("escalation_process2"),
  escalation_process2_events: text("escalation_process2_events"),
  escalation_process2_days_of_week: text("escalation_process2_days_of_week"),
  escalation_process2_start_time: text("escalation_process2_start_time"),
  escalation_process2_end_time: text("escalation_process2_end_time"),
  escalation_process2_scene_observation: text("escalation_process2_scene_observation"),
  escalation_process2_process: text("escalation_process2_process"),
  escalation_process2_audio_response: text("escalation_process2_audio_response"),
  escalation_process2_audio_message: text("escalation_process2_audio_message"),
  
  // Escalation Process 3 fields
  escalation_process3: text("escalation_process3"),
  escalation_process3_events: text("escalation_process3_events"),
  escalation_process3_days_of_week: text("escalation_process3_days_of_week"),
  escalation_process3_start_time: text("escalation_process3_start_time"),
  escalation_process3_end_time: text("escalation_process3_end_time"),
  escalation_process3_scene_observation: text("escalation_process3_scene_observation"),
  escalation_process3_process: text("escalation_process3_process"),
  escalation_process3_audio_response: text("escalation_process3_audio_response"),
  escalation_process3_audio_message: text("escalation_process3_audio_message"),
  
  // Incident Types - stored as JSON to allow for flexible structure
  incident_types: jsonb("incident_types"),
  
  // Price Streams data - stored as JSON array
  price_streams: jsonb("price_streams"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertKvgFormDataSchema = createInsertSchema(kvgFormData).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type StreamImage = typeof streamImages.$inferSelect;
export type InsertStreamImage = z.infer<typeof insertStreamImageSchema>;

export type KvgStream = typeof kvgStreams.$inferSelect;
export type InsertKvgStream = z.infer<typeof insertKvgStreamSchema>;

export type KvgFormData = typeof kvgFormData.$inferSelect;
export type InsertKvgFormData = z.infer<typeof insertKvgFormDataSchema>;
