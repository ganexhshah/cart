-- Inventory & Stock Management System Migration

-- Raw materials/ingredients table
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'dairy', 'beverages', 'spices', 'vegetables', etc.
    unit VARCHAR(50) NOT NULL, -- 'kg', 'liter', 'pieces', 'grams', etc.
    
    -- Stock levels
    current_stock DECIMAL(10,3) DEFAULT 0,
    minimum_stock DECIMAL(10,3) DEFAULT 0,
    maximum_stock DECIMAL(10,3) DEFAULT 0,
    reorder_level DECIMAL(10,3) DEFAULT 0,
    
    -- Pricing
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock transactions table (for stock in/out tracking)
CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'waste')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Stock levels after transaction
    stock_before DECIMAL(10,3),
    stock_after DECIMAL(10,3),
    
    -- Reference information
    reference_type VARCHAR(50), -- 'purchase', 'production', 'waste', 'adjustment'
    reference_id UUID, -- ID of purchase, production order, etc.
    notes TEXT,
    
    -- User tracking
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily usage tracking table
CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    usage_date DATE NOT NULL,
    
    -- Usage details
    opening_stock DECIMAL(10,3) DEFAULT 0,
    stock_in DECIMAL(10,3) DEFAULT 0,
    stock_out DECIMAL(10,3) DEFAULT 0,
    closing_stock DECIMAL(10,3) DEFAULT 0,
    
    -- Calculated usage
    total_usage DECIMAL(10,3) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_id, raw_material_id, usage_date)
);

-- Low stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'expiry'
    current_stock DECIMAL(10,3),
    minimum_stock DECIMAL(10,3),
    message TEXT,
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients table (for production cost calculation)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    quantity_required DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_raw_materials_restaurant_id ON raw_materials(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_raw_materials_category ON raw_materials(category);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_restaurant_id ON stock_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_raw_material_id ON stock_transactions(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_usage_restaurant_id ON daily_usage(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_restaurant_id ON stock_alerts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved ON stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_menu_item_id ON recipe_ingredients(menu_item_id);

-- Insert sample raw materials
INSERT INTO raw_materials (restaurant_id, name, category, unit, minimum_stock, maximum_stock, reorder_level, cost_per_unit) 
SELECT 
    r.id,
    material.name,
    material.category,
    material.unit,
    material.min_stock,
    material.max_stock,
    material.reorder_level,
    material.cost
FROM restaurants r
CROSS JOIN (
    VALUES 
    ('Milk', 'dairy', 'liter', 10, 100, 20, 50.00),
    ('Coffee Beans', 'beverages', 'kg', 2, 20, 5, 800.00),
    ('Sugar', 'sweeteners', 'kg', 5, 50, 10, 80.00),
    ('Rice', 'grains', 'kg', 10, 100, 20, 120.00),
    ('Chicken', 'meat', 'kg', 5, 50, 10, 350.00),
    ('Onions', 'vegetables', 'kg', 5, 30, 10, 60.00),
    ('Tomatoes', 'vegetables', 'kg', 3, 25, 8, 80.00),
    ('Cooking Oil', 'oils', 'liter', 2, 20, 5, 180.00)
) AS material(name, category, unit, min_stock, max_stock, reorder_level, cost)
ON CONFLICT DO NOTHING;