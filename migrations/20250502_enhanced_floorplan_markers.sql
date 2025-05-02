-- Enhanced Floorplan PDF Annotation System
-- This migration creates the necessary tables for professional PDF annotation capabilities
-- Similar to Bluebeam functionality with accurate coordinate systems

-- Create floorplan_layers table for organizing markers
CREATE TABLE IF NOT EXISTS floorplan_layers (
  id SERIAL PRIMARY KEY,
  floorplan_id INTEGER NOT NULL REFERENCES floorplans(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(255) NOT NULL DEFAULT '#3b82f6',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on floorplan_id for better performance
CREATE INDEX IF NOT EXISTS floorplan_layers_floorplan_id_idx ON floorplan_layers(floorplan_id);

-- Create floorplan_markers table for all marker types
CREATE TABLE IF NOT EXISTS floorplan_markers (
  id SERIAL PRIMARY KEY,
  floorplan_id INTEGER NOT NULL REFERENCES floorplans(id) ON DELETE CASCADE,
  unique_id VARCHAR(255) NOT NULL,
  page INTEGER NOT NULL DEFAULT 1,
  marker_type VARCHAR(255) NOT NULL,
  equipment_id INTEGER,
  layer_id INTEGER REFERENCES floorplan_layers(id) ON DELETE SET NULL,
  
  -- Position and size
  position_x DECIMAL(10, 2) NOT NULL,
  position_y DECIMAL(10, 2) NOT NULL,
  end_x DECIMAL(10, 2),
  end_y DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  rotation DECIMAL(10, 2),
  
  -- Style
  color VARCHAR(255),
  fill_color VARCHAR(255),
  opacity DECIMAL(5, 2),
  line_width DECIMAL(5, 2),
  
  -- Text content
  label VARCHAR(255),
  text_content TEXT,
  font_size INTEGER,
  font_family VARCHAR(255),
  
  -- For polygon shapes
  points JSONB,
  
  -- Version control
  author_id INTEGER,
  author_name VARCHAR(255),
  version INTEGER NOT NULL DEFAULT 1,
  parent_id INTEGER REFERENCES floorplan_markers(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS floorplan_markers_floorplan_id_idx ON floorplan_markers(floorplan_id);
CREATE INDEX IF NOT EXISTS floorplan_markers_page_idx ON floorplan_markers(floorplan_id, page);
CREATE INDEX IF NOT EXISTS floorplan_markers_layer_id_idx ON floorplan_markers(layer_id);
CREATE INDEX IF NOT EXISTS floorplan_markers_marker_type_idx ON floorplan_markers(marker_type);
CREATE INDEX IF NOT EXISTS floorplan_markers_equipment_id_idx ON floorplan_markers(equipment_id);

-- Create floorplan_calibrations table for real-world scaling
CREATE TABLE IF NOT EXISTS floorplan_calibrations (
  id SERIAL PRIMARY KEY,
  floorplan_id INTEGER NOT NULL REFERENCES floorplans(id) ON DELETE CASCADE,
  page INTEGER NOT NULL DEFAULT 1,
  real_world_distance DECIMAL(10, 2) NOT NULL,
  pdf_distance DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(255) NOT NULL DEFAULT 'ft',
  start_x DECIMAL(10, 2) NOT NULL,
  start_y DECIMAL(10, 2) NOT NULL,
  end_x DECIMAL(10, 2) NOT NULL,
  end_y DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(floorplan_id, page)
);

-- Create indices for calibration lookups
CREATE INDEX IF NOT EXISTS floorplan_calibrations_floorplan_id_idx ON floorplan_calibrations(floorplan_id);
CREATE INDEX IF NOT EXISTS floorplan_calibrations_page_idx ON floorplan_calibrations(floorplan_id, page);

-- Create marker_comments table for collaborative markup
CREATE TABLE IF NOT EXISTS marker_comments (
  id SERIAL PRIMARY KEY,
  marker_id INTEGER NOT NULL REFERENCES floorplan_markers(id) ON DELETE CASCADE,
  user_id INTEGER,
  user_name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for comment lookups
CREATE INDEX IF NOT EXISTS marker_comments_marker_id_idx ON marker_comments(marker_id);

-- Add default layers for each existing floorplan
INSERT INTO floorplan_layers (floorplan_id, name, color, visible, order_num)
SELECT id, 'Default', '#3b82f6', TRUE, 0 FROM floorplans
WHERE NOT EXISTS (
  SELECT 1 FROM floorplan_layers WHERE floorplan_layers.floorplan_id = floorplans.id
);

INSERT INTO floorplan_layers (floorplan_id, name, color, visible, order_num)
SELECT id, 'Measurements', '#ef4444', TRUE, 1 FROM floorplans
WHERE NOT EXISTS (
  SELECT 1 FROM floorplan_layers 
  WHERE floorplan_layers.floorplan_id = floorplans.id 
  AND floorplan_layers.name = 'Measurements'
);

INSERT INTO floorplan_layers (floorplan_id, name, color, visible, order_num)
SELECT id, 'Notes', '#f59e0b', TRUE, 2 FROM floorplans
WHERE NOT EXISTS (
  SELECT 1 FROM floorplan_layers 
  WHERE floorplan_layers.floorplan_id = floorplans.id 
  AND floorplan_layers.name = 'Notes'
);

INSERT INTO floorplan_layers (floorplan_id, name, color, visible, order_num)
SELECT id, 'Equipment', '#10b981', TRUE, 3 FROM floorplans
WHERE NOT EXISTS (
  SELECT 1 FROM floorplan_layers 
  WHERE floorplan_layers.floorplan_id = floorplans.id 
  AND floorplan_layers.name = 'Equipment'
);

-- Migrate existing floorplan markers (if any) to the new system
INSERT INTO floorplan_markers (
  floorplan_id,
  unique_id,
  page,
  marker_type,
  equipment_id,
  layer_id,
  position_x,
  position_y,
  color,
  label
)
SELECT 
  m.floorplan_id,
  'migrated_' || m.id,
  1,
  m.marker_type,
  m.equipment_id,
  l.id as layer_id,
  m.x_position,
  m.y_position,
  CASE m.marker_type
    WHEN 'access_point' THEN '#3b82f6'
    WHEN 'camera' THEN '#10b981'
    WHEN 'elevator' THEN '#f59e0b'
    WHEN 'intercom' THEN '#ef4444'
    ELSE '#3b82f6'
  END as color,
  m.label
FROM
  floorplan_markers m
JOIN
  floorplan_layers l ON l.floorplan_id = m.floorplan_id AND l.name = 'Equipment'
WHERE
  NOT EXISTS (
    SELECT 1 FROM floorplan_markers new_m
    WHERE new_m.unique_id = 'migrated_' || m.id
  );