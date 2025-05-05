-- Add missing columns to kvg_form_data table
ALTER TABLE kvg_form_data ADD COLUMN IF NOT EXISTS num_sites INTEGER;
ALTER TABLE kvg_form_data ADD COLUMN IF NOT EXISTS maintenance TEXT;