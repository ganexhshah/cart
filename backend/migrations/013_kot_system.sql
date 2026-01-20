-- KOT (Kitchen Order Ticket) System Migration

-- KOT Categories table
CREATE TABLE IF NOT EXISTS kot_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOT Items table (kitchen preparation items)
CREATE TABLE IF NOT EXISTS kot_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES kot_categories(id) ON DELETE SET NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    preparation_time INTEGER DEFAULT 15, -- in minutes
    difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    special_instructions TEXT,
    ingredients JSONB,
    allergens TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KOT Orders table
CREATE TABLE IF NOT EXISTS kot_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    kot_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    total_items INTEGER DEFAULT 0,
    estimated_time INTEGER, -- in minutes
    actual_time INTEGER, -- in minutes
    notes TEXT,
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id), -- chef/kitchen staff
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- KOT Order Items table
CREATE TABLE IF NOT EXISTS kot_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kot_order_id UUID NOT NULL REFERENCES kot_orders(id) ON DELETE CASCADE,
    kot_item_id UUID NOT NULL REFERENCES kot_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
    special_requests TEXT,
    preparation_notes TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kot_categories_restaurant ON kot_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kot_items_restaurant ON kot_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kot_items_category ON kot_items(category_id);
CREATE INDEX IF NOT EXISTS idx_kot_orders_restaurant ON kot_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kot_orders_status ON kot_orders(status);
CREATE INDEX IF NOT EXISTS idx_kot_orders_created_at ON kot_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_kot_order_items_kot_order ON kot_order_items(kot_order_id);

-- Create unique constraint for KOT number per restaurant
CREATE UNIQUE INDEX IF NOT EXISTS idx_kot_orders_number_restaurant ON kot_orders(restaurant_id, kot_number);