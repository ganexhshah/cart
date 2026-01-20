-- POS (Point of Sale) System Migration

-- POS Terminals table
CREATE TABLE IF NOT EXISTS pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    terminal_name VARCHAR(100) NOT NULL,
    terminal_code VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Sessions table (shift management)
CREATE TABLE IF NOT EXISTS pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    opening_cash DECIMAL(10,2) DEFAULT 0.00,
    closing_cash DECIMAL(10,2),
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, closed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES pos_sessions(id),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    transaction_number VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'sale', -- sale, refund, void
    payment_method VARCHAR(30) NOT NULL, -- cash, card, upi, wallet
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tip_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, cancelled
    payment_reference VARCHAR(100),
    notes TEXT,
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Payment Methods table
CREATE TABLE IF NOT EXISTS pos_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    method_name VARCHAR(50) NOT NULL,
    method_type VARCHAR(20) NOT NULL, -- cash, card, digital
    is_active BOOLEAN DEFAULT true,
    processing_fee DECIMAL(5,4) DEFAULT 0.0000, -- percentage
    min_amount DECIMAL(10,2) DEFAULT 0.00,
    max_amount DECIMAL(10,2),
    configuration JSONB, -- store API keys, merchant IDs, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Discounts table
CREATE TABLE IF NOT EXISTS pos_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    discount_name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed, buy_x_get_y
    discount_value DECIMAL(10,4) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2),
    applicable_items JSONB, -- specific menu items or categories
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Reports table (for caching daily/monthly reports)
CREATE TABLE IF NOT EXISTS pos_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    report_type VARCHAR(30) NOT NULL, -- daily, weekly, monthly, custom
    report_date DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    payment_methods JSONB, -- breakdown by payment method
    top_items JSONB, -- best selling items
    hourly_sales JSONB, -- sales by hour
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pos_terminals_restaurant ON pos_terminals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_terminal ON pos_sessions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_user ON pos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_restaurant ON pos_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_session ON pos_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_payment_methods_restaurant ON pos_payment_methods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pos_discounts_restaurant ON pos_discounts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pos_reports_restaurant_date ON pos_reports(restaurant_id, report_date);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_terminals_code_restaurant ON pos_terminals(restaurant_id, terminal_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_transactions_number_restaurant ON pos_transactions(restaurant_id, transaction_number);