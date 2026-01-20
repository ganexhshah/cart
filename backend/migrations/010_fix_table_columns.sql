-- Fix table column naming issues definitively
-- This migration ensures the restaurant_tables table has the correct column names

-- Create a function to safely rename columns
DO $$
DECLARE
    has_table_name BOOLEAN;
    has_name BOOLEAN;
    has_type BOOLEAN;
    has_table_type BOOLEAN;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables' AND column_name = 'table_name'
    ) INTO has_table_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables' AND column_name = 'name'
    ) INTO has_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables' AND column_name = 'type'
    ) INTO has_type;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables' AND column_name = 'table_type'
    ) INTO has_table_type;
    
    -- Handle table_name -> name
    IF has_table_name AND NOT has_name THEN
        -- Rename table_name to name
        ALTER TABLE restaurant_tables RENAME COLUMN table_name TO name;
        RAISE NOTICE 'Renamed table_name to name';
    ELSIF has_table_name AND has_name THEN
        -- Both exist, drop the old one after copying data
        UPDATE restaurant_tables SET name = COALESCE(name, table_name);
        ALTER TABLE restaurant_tables DROP COLUMN table_name;
        RAISE NOTICE 'Merged table_name into name and dropped table_name';
    ELSIF NOT has_table_name AND NOT has_name THEN
        -- Neither exists, add name column
        ALTER TABLE restaurant_tables ADD COLUMN name VARCHAR(100);
        RAISE NOTICE 'Added name column';
    END IF;
    
    -- Handle type -> table_type
    IF has_type AND NOT has_table_type THEN
        -- Rename type to table_type
        ALTER TABLE restaurant_tables RENAME COLUMN type TO table_type;
        RAISE NOTICE 'Renamed type to table_type';
    ELSIF has_type AND has_table_type THEN
        -- Both exist, drop the old one after copying data
        UPDATE restaurant_tables SET table_type = COALESCE(table_type, type);
        ALTER TABLE restaurant_tables DROP COLUMN type;
        RAISE NOTICE 'Merged type into table_type and dropped type';
    ELSIF NOT has_type AND NOT has_table_type THEN
        -- Neither exists, add table_type column
        ALTER TABLE restaurant_tables ADD COLUMN table_type VARCHAR(20) DEFAULT 'indoor';
        RAISE NOTICE 'Added table_type column';
    END IF;
END $$;

-- Ensure all required columns exist with proper defaults
ALTER TABLE restaurant_tables 
ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set proper defaults and constraints
ALTER TABLE restaurant_tables 
ALTER COLUMN table_type SET DEFAULT 'indoor',
ALTER COLUMN status SET DEFAULT 'available',
ALTER COLUMN position_x SET DEFAULT 0,
ALTER COLUMN position_y SET DEFAULT 0,
ALTER COLUMN is_active SET DEFAULT true;

-- Update any NULL values
UPDATE restaurant_tables 
SET 
    table_type = COALESCE(table_type, 'indoor'),
    status = COALESCE(status, 'available'),
    position_x = COALESCE(position_x, 0),
    position_y = COALESCE(position_y, 0),
    is_active = COALESCE(is_active, true),
    name = COALESCE(name, 'Table ' || table_number)
WHERE table_type IS NULL OR status IS NULL OR position_x IS NULL OR position_y IS NULL OR is_active IS NULL OR name IS NULL;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add check constraint for table_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'restaurant_tables_table_type_check'
    ) THEN
        ALTER TABLE restaurant_tables 
        ADD CONSTRAINT restaurant_tables_table_type_check 
        CHECK (table_type IN ('indoor', 'outdoor', 'private'));
    END IF;
    
    -- Add check constraint for status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'restaurant_tables_status_check'
    ) THEN
        ALTER TABLE restaurant_tables 
        ADD CONSTRAINT restaurant_tables_status_check 
        CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraints already exist, ignore
        NULL;
END $$;