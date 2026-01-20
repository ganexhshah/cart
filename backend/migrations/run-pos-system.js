const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runPOSMigration() {
  const client = await pool.connect();
  try {
    console.log('💳 Running POS System Migration...\n');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '014_pos_system.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ POS System tables created successfully!');
    console.log('   - pos_terminals');
    console.log('   - pos_sessions');
    console.log('   - pos_transactions');
    console.log('   - pos_payment_methods');
    console.log('   - pos_discounts');
    console.log('   - pos_reports');
    console.log('   - Indexes and constraints added\n');
    
  } catch (error) {
    console.error('❌ POS Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runPOSMigration()
  .then(() => {
    console.log('🎉 POS System migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  });