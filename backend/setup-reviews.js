const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/restaurant_db',
  ssl: false
});

async function setupReviews() {
  try {
    console.log('🔄 Setting up reviews system...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'migrations', 'simple-reviews-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Reviews system setup completed successfully!');
    console.log('📊 Sample data has been inserted');
    
    // Test the setup by querying reviews
    const result = await pool.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`📝 Total reviews in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error setting up reviews system:', error.message);
    
    // If tables already exist, that's okay
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, checking data...');
      try {
        const result = await pool.query('SELECT COUNT(*) as count FROM reviews');
        console.log(`📝 Total reviews in database: ${result.rows[0].count}`);
      } catch (e) {
        console.error('Error checking existing data:', e.message);
      }
    }
  } finally {
    await pool.end();
  }
}

// Run the setup
setupReviews();