-- Sample Users
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@restaurant.com', '$2b$10$YourHashedPasswordHere', 'Admin User', '+1234567890', 'admin'),
('owner@restaurant.com', '$2b$10$YourHashedPasswordHere', 'Restaurant Owner', '+1234567891', 'owner'),
('waiter@restaurant.com', '$2b$10$YourHashedPasswordHere', 'John Waiter', '+1234567892', 'waiter'),
('customer@restaurant.com', '$2b$10$YourHashedPasswordHere', 'Jane Customer', '+1234567893', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Sample Restaurant
INSERT INTO restaurants (owner_id, name, description, address, city, state, country, phone, email, opening_time, closing_time) 
SELECT 
  id,
  'The Gourmet Kitchen',
  'Fine dining experience with authentic cuisine',
  '123 Main Street',
  'New York',
  'NY',
  'USA',
  '+1234567890',
  'info@gourmetkitchen.com',
  '10:00:00',
  '22:00:00'
FROM users WHERE email = 'owner@restaurant.com'
ON CONFLICT DO NOTHING;

-- Sample Tables
INSERT INTO restaurant_tables (restaurant_id, table_number, table_name, capacity, location, type, status)
SELECT 
  id,
  'T1',
  'Table 1',
  4,
  'Main Hall',
  'indoor',
  'available'
FROM restaurants WHERE name = 'The Gourmet Kitchen'
UNION ALL
SELECT 
  id,
  'T2',
  'Table 2',
  2,
  'Main Hall',
  'indoor',
  'available'
FROM restaurants WHERE name = 'The Gourmet Kitchen'
ON CONFLICT DO NOTHING;

-- Sample Menu Categories
INSERT INTO menu_categories (restaurant_id, name, description, display_order)
SELECT 
  id,
  'Appetizers',
  'Start your meal with our delicious appetizers',
  1
FROM restaurants WHERE name = 'The Gourmet Kitchen'
UNION ALL
SELECT 
  id,
  'Main Course',
  'Our signature main dishes',
  2
FROM restaurants WHERE name = 'The Gourmet Kitchen'
UNION ALL
SELECT 
  id,
  'Desserts',
  'Sweet endings to your meal',
  3
FROM restaurants WHERE name = 'The Gourmet Kitchen'
ON CONFLICT DO NOTHING;

-- Sample Menu Items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_vegetarian, is_available, is_popular)
SELECT 
  r.id,
  c.id,
  'Caesar Salad',
  'Fresh romaine lettuce with caesar dressing',
  8.99,
  true,
  true,
  true
FROM restaurants r
JOIN menu_categories c ON r.id = c.restaurant_id
WHERE r.name = 'The Gourmet Kitchen' AND c.name = 'Appetizers'
ON CONFLICT DO NOTHING;

COMMIT;
