-- Purchase Management System Migration

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    
    -- Supplier details
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    
    -- Business details
    business_type VARCHAR(100), -- 'wholesaler', 'distributor', 'farmer', 'manufacturer'
    tax_number VARCHAR(50),
    payment_terms VARCHAR(100), -- 'cash', 'credit_30', 'credit_60', etc.
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0, -- 0-5 rating
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Order details
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Financial details
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    
    -- Additional info
    notes TEXT,
    terms_conditions TEXT,
    
    -- User tracking
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    
    -- Item details
    item_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_ordered DECIMAL(10,3) NOT NULL,
    quantity_received DECIMAL(10,3) DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Quality check
    quality_status VARCHAR(20) DEFAULT 'pending' CHECK (quality_status IN ('pending', 'approved', 'rejected')),
    quality_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase receipts/invoices table
CREATE TABLE IF NOT EXISTS purchase_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Receipt details
    receipt_number VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100),
    receipt_date DATE NOT NULL,
    
    -- Financial details
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'verified', 'disputed')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supplier materials (what each supplier can provide)
CREATE TABLE IF NOT EXISTS supplier_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    
    -- Pricing and availability
    unit_price DECIMAL(10,2) NOT NULL,
    minimum_order_quantity DECIMAL(10,3) DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(supplier_id, raw_material_id)
);

-- Cost tracking table
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    
    -- Cost details
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    average_cost DECIMAL(10,2) NOT NULL,
    last_purchase_cost DECIMAL(10,2),
    market_price DECIMAL(10,2),
    
    -- Variance analysis
    cost_variance DECIMAL(10,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_id, raw_material_id, tracking_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_restaurant_id ON suppliers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_restaurant_id ON purchase_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po_id ON purchase_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_materials_supplier_id ON supplier_materials(supplier_id);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_restaurant_id ON cost_tracking(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON cost_tracking(tracking_date);

-- Insert sample suppliers
INSERT INTO suppliers (restaurant_id, name, contact_person, phone, email, business_type, payment_terms) 
SELECT 
    r.id,
    supplier.name,
    supplier.contact_person,
    supplier.phone,
    supplier.email,
    supplier.business_type,
    supplier.payment_terms
FROM restaurants r
CROSS JOIN (
    VALUES 
    ('Fresh Dairy Co.', 'Ram Sharma', '9841234567', 'ram@freshdairy.com', 'distributor', 'credit_30'),
    ('Mountain Coffee Suppliers', 'Sita Gurung', '9851234567', 'sita@mountaincoffee.com', 'wholesaler', 'cash'),
    ('Valley Vegetables', 'Hari Thapa', '9861234567', 'hari@valleyveggies.com', 'farmer', 'cash'),
    ('Kathmandu Meat House', 'Gopal Rai', '9871234567', 'gopal@meathouse.com', 'wholesaler', 'credit_15'),
    ('Himalayan Spices Ltd.', 'Maya Tamang', '9881234567', 'maya@himalayanspices.com', 'manufacturer', 'credit_45')
) AS supplier(name, contact_person, phone, email, business_type, payment_terms)
ON CONFLICT DO NOTHING;