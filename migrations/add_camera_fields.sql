-- Add is_indoor column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cameras'
        AND column_name = 'is_indoor'
    ) THEN
        ALTER TABLE cameras ADD COLUMN is_indoor BOOLEAN DEFAULT TRUE;
    END IF;
END
$$;

-- Add import_to_gateway column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cameras'
        AND column_name = 'import_to_gateway'
    ) THEN
        ALTER TABLE cameras ADD COLUMN import_to_gateway BOOLEAN DEFAULT TRUE;
    END IF;
END
$$;

-- Update existing camera records:
-- Set is_indoor based on camera_type value
UPDATE cameras
SET is_indoor = (
    CASE 
        WHEN camera_type LIKE '%Indoor%' THEN TRUE
        WHEN camera_type LIKE '%Outdoor%' THEN FALSE
        ELSE TRUE  -- Default to indoor if unsure
    END
)
WHERE is_indoor IS NULL;