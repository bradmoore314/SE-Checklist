-- Add patrol_start_time and patrol_end_time columns to the kvg_streams table
ALTER TABLE kvg_streams ADD COLUMN IF NOT EXISTS patrol_start_time TEXT;
ALTER TABLE kvg_streams ADD COLUMN IF NOT EXISTS patrol_end_time TEXT;