-- Migration script for enhancing floorplan markers with Bluebeam-like features
-- Date: 2025-05-02

-- Create tables for new PDF-coordinate-based schema

-- 1. Create the floorplan_layers table
CREATE TABLE IF NOT EXISTS "floorplan_layers" (
  "id" SERIAL PRIMARY KEY,
  "floorplan_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 2. Create the floorplan_calibrations table
CREATE TABLE IF NOT EXISTS "floorplan_calibrations" (
  "id" SERIAL PRIMARY KEY,
  "floorplan_id" INTEGER NOT NULL,
  "page" INTEGER NOT NULL,
  "real_world_distance" REAL NOT NULL,
  "pdf_distance" REAL NOT NULL,
  "unit" TEXT NOT NULL,
  "start_x" REAL NOT NULL,
  "start_y" REAL NOT NULL,
  "end_x" REAL NOT NULL,
  "end_y" REAL NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 3. Create new floorplan_markers_enhanced table (to avoid breaking existing functionality)
CREATE TABLE IF NOT EXISTS "floorplan_markers_enhanced" (
  "id" SERIAL PRIMARY KEY,
  "unique_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "floorplan_id" INTEGER NOT NULL,
  "page" INTEGER NOT NULL,
  "marker_type" TEXT NOT NULL,
  "equipment_id" INTEGER,
  "layer_id" INTEGER,
  "position_x" REAL NOT NULL,
  "position_y" REAL NOT NULL,
  "end_x" REAL,
  "end_y" REAL,
  "width" REAL,
  "height" REAL,
  "rotation" REAL DEFAULT 0,
  "color" TEXT,
  "fill_color" TEXT,
  "opacity" REAL DEFAULT 1,
  "line_width" REAL DEFAULT 1,
  "label" TEXT,
  "text_content" TEXT,
  "font_size" REAL,
  "font_family" TEXT,
  "points" JSONB,
  "author_id" INTEGER,
  "author_name" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "parent_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 4. Create marker_comments table
CREATE TABLE IF NOT EXISTS "marker_comments" (
  "id" SERIAL PRIMARY KEY,
  "marker_id" INTEGER NOT NULL,
  "author_id" INTEGER,
  "author_name" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE "floorplan_layers" ADD CONSTRAINT fk_floorplan_layers_floorplan
  FOREIGN KEY ("floorplan_id") REFERENCES "floorplans"("id") ON DELETE CASCADE;

ALTER TABLE "floorplan_calibrations" ADD CONSTRAINT fk_floorplan_calibrations_floorplan
  FOREIGN KEY ("floorplan_id") REFERENCES "floorplans"("id") ON DELETE CASCADE;

ALTER TABLE "floorplan_markers_enhanced" ADD CONSTRAINT fk_floorplan_markers_enhanced_floorplan
  FOREIGN KEY ("floorplan_id") REFERENCES "floorplans"("id") ON DELETE CASCADE;

ALTER TABLE "floorplan_markers_enhanced" ADD CONSTRAINT fk_floorplan_markers_enhanced_layer
  FOREIGN KEY ("layer_id") REFERENCES "floorplan_layers"("id") ON DELETE SET NULL;

ALTER TABLE "floorplan_markers_enhanced" ADD CONSTRAINT fk_floorplan_markers_enhanced_parent
  FOREIGN KEY ("parent_id") REFERENCES "floorplan_markers_enhanced"("id") ON DELETE SET NULL;

ALTER TABLE "marker_comments" ADD CONSTRAINT fk_marker_comments_marker
  FOREIGN KEY ("marker_id") REFERENCES "floorplan_markers_enhanced"("id") ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_floorplan_markers_enhanced_floorplan_id ON "floorplan_markers_enhanced"("floorplan_id");
CREATE INDEX idx_floorplan_markers_enhanced_page ON "floorplan_markers_enhanced"("page");
CREATE INDEX idx_floorplan_markers_enhanced_marker_type ON "floorplan_markers_enhanced"("marker_type");
CREATE INDEX idx_floorplan_layers_floorplan_id ON "floorplan_layers"("floorplan_id");
CREATE INDEX idx_floorplan_calibrations_floorplan_id ON "floorplan_calibrations"("floorplan_id");
CREATE INDEX idx_marker_comments_marker_id ON "marker_comments"("marker_id");

-- Create default layers for each existing floorplan
INSERT INTO "floorplan_layers" ("floorplan_id", "name", "color", "visible", "order")
SELECT 
  id, 
  'Security Equipment', 
  '#3b82f6', 
  true, 
  1
FROM "floorplans";

INSERT INTO "floorplan_layers" ("floorplan_id", "name", "color", "visible", "order")
SELECT 
  id, 
  'Building Infrastructure', 
  '#10b981', 
  true, 
  2
FROM "floorplans";

INSERT INTO "floorplan_layers" ("floorplan_id", "name", "color", "visible", "order")
SELECT 
  id, 
  'Notes & Comments', 
  '#f59e0b', 
  true, 
  3
FROM "floorplans";

INSERT INTO "floorplan_layers" ("floorplan_id", "name", "color", "visible", "order")
SELECT 
  id, 
  'Measurements', 
  '#ef4444', 
  true, 
  4
FROM "floorplans";

-- Migration function to convert existing markers to enhanced markers
-- This function will be called manually after testing to preserve existing data
CREATE OR REPLACE FUNCTION migrate_markers_to_enhanced()
RETURNS void AS $$
DECLARE
  layer_security_id INTEGER;
  layer_infra_id INTEGER;
  layer_notes_id INTEGER;
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT floorplan_id FROM floorplan_markers LOOP
    -- Get layer IDs for this floorplan
    SELECT id INTO layer_security_id FROM floorplan_layers 
      WHERE floorplan_id = r.floorplan_id AND name = 'Security Equipment' LIMIT 1;
    
    SELECT id INTO layer_infra_id FROM floorplan_layers 
      WHERE floorplan_id = r.floorplan_id AND name = 'Building Infrastructure' LIMIT 1;
    
    SELECT id INTO layer_notes_id FROM floorplan_layers 
      WHERE floorplan_id = r.floorplan_id AND name = 'Notes & Comments' LIMIT 1;
    
    -- Insert existing markers into enhanced table
    INSERT INTO floorplan_markers_enhanced (
      floorplan_id, page, marker_type, equipment_id, 
      position_x, position_y, label, layer_id
    )
    SELECT 
      floorplan_id, 
      page, 
      marker_type, 
      equipment_id, 
      position_x::real, -- Convert from integer to real
      position_y::real, -- Convert from integer to real
      label,
      CASE
        WHEN marker_type IN ('access_point', 'camera', 'intercom') THEN layer_security_id
        WHEN marker_type = 'elevator' THEN layer_infra_id
        WHEN marker_type = 'note' THEN layer_notes_id
        ELSE NULL
      END as layer_id
    FROM floorplan_markers
    WHERE floorplan_id = r.floorplan_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;