-- Add patrol_groups column to kvg_streams table
ALTER TABLE kvg_streams ADD COLUMN IF NOT EXISTS patrol_groups TEXT;