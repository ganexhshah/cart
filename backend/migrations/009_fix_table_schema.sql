-- Fix table schema mismatch
-- This migration updates the existing restaurant_tables table to match the expected schema

-- First, check if we need to rename columns
DO $$
BEGIN
    -- Rename table_name to name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'restaurant_tables' AND column_name = 'table_name') THEN
        ALTER TABLE restaurant_tables RENAME COLUMN table_name TO name;
    END IF;
    
    -- Rename type to table_type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'restaurant_tables' AND column_name = 'type') THEN
        ALTER TABLE restaurant_tables RENAME COLUMN type TO table_type;
    END IF;
END $$;

-- Add missing columns if they don't exist
ALTER TABLE restaurant_tables 
ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records to set is_active = true if NULL
UPDATE restaurant_tables SET is_active = true WHERE is_active IS NULL;

-- Ensure proper constraints and defaults
ALTER TABLE restaurant_tables 
ALTER COLUMN table_type SET DEFAULT 'indoor',
ALTER COLUMN status SET DEFAULT 'available',
ALTER COLUMN position_x SET DEFAULT 0,
ALTER COLUMN position_y SET DEFAULT 0,
ALTER COLUMN is_active SET DEFAULT true;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS table_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    status VARCHAR(20) DEFAULT 'confirmed',
    special_requests TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    order_id UUID,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    party_size INTEGER,
    waiter_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);