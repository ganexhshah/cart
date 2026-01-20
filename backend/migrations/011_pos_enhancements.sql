-- Add POS-specific columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS received_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS change_amount DECIMAL(10,2) DEFAULT 0.00;

-- Add POS-specific columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_staff ON orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- Update customers table to include name and phone directly (for quick POS access)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Create index for customer phone lookup
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_restaurant_phone ON customers(restaurant_id, phone);