-- Add services_recommended column to kvg_form_data table
ALTER TABLE kvg_form_data ADD COLUMN IF NOT EXISTS services_recommended TEXT;