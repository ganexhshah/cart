-- Add status column to menu_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'status'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN status VARCHAR(20) DEFAULT 'available';
        
        -- Update existing rows to set status based on is_available
        UPDATE menu_items SET status = CASE 
            WHEN is_available = true THEN 'available'
            ELSE 'unavailable'
        END;
    END IF;
END $$;

-- Add other missing columns from menu management migration
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'ingredients'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN ingredients JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'allergens'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;
