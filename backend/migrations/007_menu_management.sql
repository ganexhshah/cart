-- Menu Categories Table (Updated to match initial schema)
DROP TABLE IF EXISTS menu_categories CASCADE;
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

-- Menu Items Table (Updated to use UUID for category_id)
DROP TABLE IF EXISTS menu_items CASCADE;
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

-- Menu Item Stats Table
DROP TABLE IF EXISTS menu_item_stats CASCADE;
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

-- Insert default categories with restaurant_id (you'll need to update this with actual restaurant IDs)
-- Note: This will need to be updated with actual restaurant IDs from your database
-- INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
-- SELECT r.id, 'Pizza', 'Traditional and specialty pizzas', 1 FROM restaurants r LIMIT 1;
-- (Add similar inserts for other categories)