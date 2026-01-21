-- Billing & Payments System Migration

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES users(id),
    table_id UUID REFERENCES restaurant_tables(id),
    
    -- Bill details
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_type VARCHAR(20) CHECK (discount_type IN ('flat', 'percentage')),
    discount_value DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment details
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    payment_method VARCHAR(50),
    
    -- Split bill support
    is_split_bill BOOLEAN DEFAULT FALSE,
    parent_bill_id UUID REFERENCES bills(id),
    split_count INTEGER DEFAULT 1,
    
    -- Bill generation
    is_printed BOOLEAN DEFAULT FALSE,
    is_sent_whatsapp BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Bill items table
CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    item_name VARCHAR(255) NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id),
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Payment gateway details
    gateway_name VARCHAR(50), -- 'esewa', 'khalti', 'cash', 'card'
    gateway_transaction_id VARCHAR(100),
    gateway_response TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax settings table
CREATE TABLE IF NOT EXISTS tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bills_restaurant_id ON bills(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_bills_order_id ON bills(order_id);
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_bill_id ON payment_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_tax_settings_restaurant_id ON tax_settings(restaurant_id);

-- Insert default tax settings
INSERT INTO tax_settings (restaurant_id, tax_name, tax_rate) 
SELECT id, 'VAT', 13.00 FROM restaurants 
ON CONFLICT DO NOTHING;