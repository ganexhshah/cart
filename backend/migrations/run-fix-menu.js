const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Running menu categories UUID fix migration...');
    
    const migrationPath = path.join(__dirname, '015_fix_menu_categories_uuid.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✓ Menu categories UUID fix migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();