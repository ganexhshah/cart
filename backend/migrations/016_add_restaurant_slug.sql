-- Add slug field to restaurants table for SEO-friendly URLs

-- Add slug column if it doesn't exist
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Drop the unique constraint temporarily if it exists
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_slug_key;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_restaurants_slug;

-- Generate unique slugs for existing restaurants
DO $$
DECLARE
    r RECORD;
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER;
BEGIN
    FOR r IN SELECT id, name FROM restaurants WHERE slug IS NULL OR slug = '' ORDER BY created_at LOOP
        -- Generate base slug from restaurant name
        base_slug := LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(r.name, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special characters
                    '\s+', '-', 'g'  -- Replace spaces with hyphens
                ),
                '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
            )
        );
        
        -- Remove leading/trailing hyphens
        base_slug := TRIM(BOTH '-' FROM base_slug);
        
        -- Ensure slug is not empty
        IF base_slug = '' OR base_slug IS NULL THEN
            base_slug := 'restaurant';
        END IF;
        
        -- Check if base slug is unique
        new_slug := base_slug;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = new_slug AND id != r.id) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        -- Update the restaurant with the unique slug
        UPDATE restaurants SET slug = new_slug WHERE id = r.id;
        
        RAISE NOTICE 'Updated restaurant "%" with slug "%"', r.name, new_slug;
    END LOOP;
END $$;

-- Now add the unique constraint and index
ALTER TABLE restaurants ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- Make slug NOT NULL after generating values
UPDATE restaurants SET slug = 'restaurant-' || id WHERE slug IS NULL OR slug = '';
ALTER TABLE restaurants ALTER COLUMN slug SET NOT NULL;