-- Fix menu categories to use UUID consistently
-- This migration fixes the inconsistency between initial schema (UUID) and menu management migration (SERIAL)

-- First, drop existing tables if they exist (this will recreate them with correct structure)
DROP TABLE IF EXISTS menu_item_stats CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;

-- Recreate menu_categories with UUID (consistent with initial schema)
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate menu_items with UUID category_id
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'available',
    preparation_time INTEGER DEFAULT 15,
    calories INTEGER,
    ingredients JSONB DEFAULT '[]'::jsonb,
    allergens JSONB DEFAULT '[]'::jsonb,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate menu_item_stats with UUID
CREATE TABLE menu_item_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_ordered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_item_id)
);

-- Insert default categories for each restaurant
-- This will create categories for all existing restaurants
INSERT INTO menu_categories (restaurant_id, name, description, display_order)
SELECT 
    r.id,
    category_data.name,
    category_data.description,
    category_data.display_order
FROM restaurants r
CROSS JOIN (
    VALUES 
        ('Pizza', 'Traditional and specialty pizzas', 1),
        ('Burgers', 'Beef, chicken, and veggie burgers', 2),
        ('Sushi', 'Fresh sushi rolls and sashimi', 3),
        ('Salads', 'Fresh and healthy salad options', 4),
        ('Appetizers', 'Starters and small plates', 5),
        ('Desserts', 'Sweet treats and desserts', 6),
        ('Beverages', 'Drinks and refreshments', 7)
) AS category_data(name, description, display_order)
WHERE r.is_active = true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_active ON menu_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_item_stats_item ON menu_item_stats(menu_item_id);