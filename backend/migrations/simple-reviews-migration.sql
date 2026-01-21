-- Simple Reviews System Migration
-- Run this directly in your PostgreSQL database

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    restaurant_id UUID,
    order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'flagged', 'hidden')),
    helpful_count INTEGER DEFAULT 0,
    order_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review responses table (for restaurant replies)
CREATE TABLE IF NOT EXISTS review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID,
    restaurant_id UUID,
    user_id UUID,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);

-- Insert some sample data
INSERT INTO reviews (customer_id, restaurant_id, rating, title, content, status, order_value) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 5, 'Amazing food!', 'The food was absolutely delicious and the service was excellent. Will definitely come back!', 'published', 45.99),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 4, 'Good experience', 'Food was good, service could be improved but overall a nice experience.', 'published', 32.50),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 2, 'Disappointing', 'Expected better quality for the price. Food was cold when it arrived.', 'pending', 28.75)
ON CONFLICT DO NOTHING;