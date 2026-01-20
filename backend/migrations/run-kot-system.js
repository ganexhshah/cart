const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runKOTMigration() {
  const client = await pool.connect();
  try {
    console.log('🍳 Running KOT System Migration...\n');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '013_kot_system.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ KOT System tables created successfully!');
    console.log('   - kot_categories');
    console.log('   - kot_items');
    console.log('   - kot_orders');
    console.log('   - kot_order_items');
    console.log('   - Indexes and constraints added\n');
    
  } catch (error) {
    console.error('❌ KOT Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runKOTMigration()
  .then(() => {
    console.log('🎉 KOT System migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  });