-- Add the thumbnail_data column to the images table if it doesn't exist
ALTER TABLE images ADD COLUMN IF NOT EXISTS thumbnail_data TEXT;