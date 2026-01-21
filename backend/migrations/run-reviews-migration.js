const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function runReviewsMigration() {
  try {
    console.log('Running reviews system migration...');
    
    const migrationPath = path.join(__dirname, '017_reviews_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Reviews system migration completed successfully!');
    
    // Insert some sample data for testing
    console.log('Inserting sample review data...');
    
    const sampleDataSQL = `
      -- Insert sample reviews (assuming we have some users and restaurants)
      INSERT INTO reviews (customer_id, restaurant_id, rating, title, content, status, order_value) 
      SELECT 
        u.id as customer_id,
        r.id as restaurant_id,
        (RANDOM() * 4 + 1)::INTEGER as rating,
        CASE 
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 4 THEN 'Great experience!'
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 3 THEN 'Good food and service'
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 2 THEN 'Average experience'
          ELSE 'Could be better'
        END as title,
        CASE 
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 4 THEN 'Amazing food and excellent service. Will definitely come back!'
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 3 THEN 'The food was good and the staff was friendly. Enjoyed our meal.'
          WHEN (RANDOM() * 4 + 1)::INTEGER >= 2 THEN 'Food was okay, nothing special. Service could be improved.'
          ELSE 'Disappointed with the quality. Expected better for the price.'
        END as content,
        CASE 
          WHEN RANDOM() > 0.8 THEN 'pending'
          ELSE 'published'
        END as status,
        (RANDOM() * 100 + 20)::DECIMAL(10,2) as order_value
      FROM users u
      CROSS JOIN restaurants r
      WHERE u.role = 'customer' 
        AND r.is_active = true
      LIMIT 20
      ON CONFLICT DO NOTHING;
      
      -- Insert some sample responses
      INSERT INTO review_responses (review_id, restaurant_id, user_id, content)
      SELECT 
        r.id as review_id,
        r.restaurant_id,
        u.id as user_id,
        'Thank you for your feedback! We appreciate your business and will continue to improve our service.' as content
      FROM reviews r
      JOIN restaurants rest ON r.restaurant_id = rest.id
      JOIN users u ON u.id = rest.owner_id
      WHERE r.status = 'published' 
        AND RANDOM() > 0.5
      LIMIT 10
      ON CONFLICT DO NOTHING;
    `;
    
    await pool.query(sampleDataSQL);
    console.log('✅ Sample review data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error running reviews migration:', error);
    throw error;
  }
}

// Run the migration
runReviewsMigration()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });