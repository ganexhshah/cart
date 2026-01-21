const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/restaurant_db',
  ssl: false
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check if reviews table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reviews', 'review_responses')
    `);
    
    console.log('📋 Existing tables:', tableCheck.rows.map(r => r.table_name));
    
    // If reviews table exists, check its structure
    if (tableCheck.rows.some(r => r.table_name === 'reviews')) {
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews'
      `);
      console.log('📊 Reviews table columns:', columns.rows);
    }
    
    // Check if we have any users and restaurants for sample data
    const userCheck = await pool.query('SELECT COUNT(*) as count FROM users LIMIT 1');
    const restaurantCheck = await pool.query('SELECT COUNT(*) as count FROM restaurants LIMIT 1');
    
    console.log(`👥 Users in database: ${userCheck.rows[0].count}`);
    console.log(`🏪 Restaurants in database: ${restaurantCheck.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();