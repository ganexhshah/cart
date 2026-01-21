const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Running restaurant slug migration...');
    
    const migrationPath = path.join(__dirname, '016_add_restaurant_slug.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✓ Restaurant slug migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();