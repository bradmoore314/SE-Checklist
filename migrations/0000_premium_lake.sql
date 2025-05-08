CREATE TABLE "access_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"location" text NOT NULL,
	"quick_config" text NOT NULL,
	"reader_type" text NOT NULL,
	"lock_type" text NOT NULL,
	"monitoring_type" text NOT NULL,
	"lock_provider" text,
	"takeover" text,
	"interior_perimeter" text,
	"exst_panel_location" text,
	"exst_panel_type" text,
	"exst_reader_type" text,
	"new_panel_location" text,
	"new_panel_type" text,
	"new_reader_type" text,
	"noisy_prop" text,
	"crashbars" text,
	"real_lock_type" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cameras" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"location" text NOT NULL,
	"camera_type" text NOT NULL,
	"mounting_type" text,
	"resolution" text,
	"field_of_view" text,
	"notes" text,
	"is_indoor" boolean DEFAULT true,
	"import_to_gateway" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"crm_type" text NOT NULL,
	"base_url" text NOT NULL,
	"api_version" text,
	"auth_type" text DEFAULT 'oauth2' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "elevators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"location" text,
	"elevator_type" text,
	"floor_count" integer,
	"notes" text,
	"title" text,
	"bank_name" text,
	"building_number" text,
	"address" text,
	"city" text,
	"management_company" text,
	"management_contact_person" text,
	"management_phone_number" text,
	"elevator_company" text,
	"elevator_contact_person" text,
	"elevator_phone_number" text,
	"elevator_system_type" text,
	"secured_floors" text,
	"freight_car_home_floor" text,
	"elevator_phone_type" text,
	"reader_type" text,
	"freight_secure_type" text,
	"freight_car_numbers" text,
	"visitor_processing" text,
	"rear_hall_calls" boolean,
	"rear_hall_control" boolean,
	"reader_mounting_surface_ferrous" boolean,
	"flush_mount_required" boolean,
	"elevator_phones_for_visitors" boolean,
	"engineer_override_key_switch" boolean,
	"freight_car_in_group" boolean,
	"shutdown_freight_car" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_email" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floorplan_calibrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"floorplan_id" integer NOT NULL,
	"page" integer NOT NULL,
	"real_world_distance" real NOT NULL,
	"pdf_distance" real NOT NULL,
	"unit" text NOT NULL,
	"start_x" real NOT NULL,
	"start_y" real NOT NULL,
	"end_x" real NOT NULL,
	"end_y" real NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floorplan_layers" (
	"id" serial PRIMARY KEY NOT NULL,
	"floorplan_id" integer NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floorplan_markers" (
	"id" serial PRIMARY KEY NOT NULL,
	"unique_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"floorplan_id" integer NOT NULL,
	"page" integer NOT NULL,
	"marker_type" text NOT NULL,
	"equipment_id" integer,
	"layer_id" integer,
	"position_x" real NOT NULL,
	"position_y" real NOT NULL,
	"end_x" real,
	"end_y" real,
	"width" real,
	"height" real,
	"rotation" real DEFAULT 0,
	"fov" real DEFAULT 90,
	"range" real DEFAULT 60,
	"color" text,
	"fill_color" text,
	"opacity" real DEFAULT 1,
	"line_width" real DEFAULT 1,
	"label" text,
	"text_content" text,
	"font_size" real,
	"font_family" text,
	"points" jsonb,
	"author_id" integer,
	"author_name" text,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "floorplans" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"pdf_data" text NOT NULL,
	"page_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gateways" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"ip_address" text NOT NULL,
	"port" integer DEFAULT 80 NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"status" text DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_type" text NOT NULL,
	"equipment_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"image_data" text,
	"filename" text,
	"created_at" timestamp DEFAULT now(),
	"blob_url" text,
	"blob_name" text,
	"storage_type" text DEFAULT 'database' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intercoms" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"location" text NOT NULL,
	"intercom_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kvg_form_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" text,
	"form_type" text DEFAULT 'kvg',
	"form_data" json DEFAULT '{}'::json,
	"bdm_owner" text,
	"sales_engineer" text,
	"kvg_sme" text,
	"customer_name" text,
	"site_address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"crm_opportunity" text,
	"quote_date" text,
	"num_sites" integer,
	"technology" text,
	"install_type" text,
	"time_zone" text,
	"opportunity_stage" text,
	"opportunity_type" text,
	"site_environment" text,
	"region" text,
	"customer_vertical" text,
	"property_category" text,
	"maintenance" text,
	"services_recommended" text,
	"incident_types" json,
	"am_name" text,
	"escalation_process1" text,
	"escalation_process2" text,
	"escalation_process3" text,
	"pm_name" text,
	"voc_escalations" integer,
	"dispatch_responses" integer,
	"gdods_patrols" integer,
	"sgpp_patrols" integer,
	"forensic_investigations" integer,
	"app_users" integer,
	"audio_devices" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kvg_stream_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"stream_id" integer NOT NULL,
	"image_data" text NOT NULL,
	"filename" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kvg_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"location" text,
	"fov_accessibility" text,
	"camera_accessibility" text,
	"camera_type" text,
	"environment" text,
	"use_case_problem" text,
	"speaker_association" text,
	"audio_talk_down" text,
	"event_monitoring" text,
	"monitoring_start_time" text,
	"monitoring_end_time" text,
	"patrol_groups" text,
	"patrol_start_time" text,
	"patrol_end_time" text,
	"schedule_type" text,
	"monitoring_days_of_week" text,
	"monitoring_hours" text,
	"use_main_schedule" boolean DEFAULT false,
	"quantity" integer DEFAULT 1,
	"description" text,
	"monitored_area" text,
	"accessibility" text,
	"use_case" text,
	"analytic_rule1" text,
	"dwell_time1" integer,
	"analytic_rule2" text,
	"dwell_time2" integer,
	"days_of_week" text,
	"schedule" text,
	"event_volume" integer,
	"patrol_type" text,
	"patrols_per_week" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marker_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"marker_id" integer NOT NULL,
	"author_id" integer,
	"author_name" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client" text NOT NULL,
	"site_address" text,
	"se_name" text,
	"bdm_name" text,
	"building_count" integer,
	"progress_percentage" integer,
	"progress_notes" text,
	"equipment_notes" text,
	"scope_notes" text,
	"created_by" integer,
	"crm_opportunity_id" text,
	"crm_opportunity_name" text,
	"crm_account_id" text,
	"crm_account_name" text,
	"crm_last_synced" timestamp,
	"sharepoint_folder_url" text,
	"sharepoint_site_id" text,
	"sharepoint_drive_id" text,
	"sharepoint_folder_id" text,
	"replace_readers" boolean,
	"need_credentials" boolean,
	"takeover" boolean,
	"pull_wire" boolean,
	"visitor" boolean,
	"install_locks" boolean,
	"ble" boolean,
	"ppi_quote_needed" boolean,
	"guard_controls" boolean,
	"floorplan" boolean,
	"test_card" boolean,
	"conduit_drawings" boolean,
	"reports_available" boolean,
	"photo_id" boolean,
	"on_site_security" boolean,
	"photo_badging" boolean,
	"kastle_connect" boolean,
	"wireless_locks" boolean,
	"rush" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"report_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"format" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stream_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"stream_id" integer NOT NULL,
	"image_data" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"gateway_id" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"audio_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text,
	"role" text,
	"microsoft_id" text,
	"refresh_token" text,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "equipment_creation_sessions" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"equipment_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"current_step" text NOT NULL,
	"responses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "kvg_form_data" ADD CONSTRAINT "kvg_form_data_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kvg_stream_images" ADD CONSTRAINT "kvg_stream_images_stream_id_kvg_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."kvg_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kvg_streams" ADD CONSTRAINT "kvg_streams_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;