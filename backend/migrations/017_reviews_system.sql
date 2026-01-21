-- Reviews System Migration
-- Create tables for customer reviews and restaurant responses

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
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
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Staff member who responded
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

-- Review tags/categories table
CREATE TABLE IF NOT EXISTS review_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for review tags
CREATE TABLE IF NOT EXISTS review_tag_assignments (
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES review_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_restaurant_id ON review_responses(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);

-- Insert some default review tags
INSERT INTO review_tags (name, color) VALUES 
    ('Food Quality', '#10B981'),
    ('Service', '#3B82F6'),
    ('Delivery', '#F59E0B'),
    ('Value for Money', '#8B5CF6'),
    ('Ambiance', '#EF4444'),
    ('Cleanliness', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON review_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();