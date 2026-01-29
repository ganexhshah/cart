-- Create waiter calls table
CREATE TABLE IF NOT EXISTS waiter_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    call_type VARCHAR(50) DEFAULT 'assistance' CHECK (call_type IN ('assistance', 'order_ready', 'bill', 'complaint', 'other')),
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled')),
    assigned_waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waiter_calls_restaurant_id ON waiter_calls(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table_id ON waiter_calls(table_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_created_at ON waiter_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_assigned_waiter ON waiter_calls(assigned_waiter_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waiter_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waiter_calls_updated_at
    BEFORE UPDATE ON waiter_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_waiter_calls_updated_at();