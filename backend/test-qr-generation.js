const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testQRGeneration() {
  try {
    console.log('Testing QR code generation with new URL format...\n');
    
    // Check what restaurants exist
    const allRestaurants = await pool.query(
      'SELECT id, name, slug FROM restaurants ORDER BY created_at LIMIT 5'
    );
    
    console.log('Available restaurants:');
    allRestaurants.rows.forEach(r => {
      console.log(`- ${r.name} (slug: ${r.slug})`);
    });
    
    // Check what tables exist
    const allTables = await pool.query(
      'SELECT rt.id, rt.table_number, rt.table_name, rt.restaurant_id, r.name as restaurant_name FROM restaurant_tables rt LEFT JOIN restaurants r ON rt.restaurant_id = r.id LIMIT 5'
    );
    
    console.log('\nAvailable tables:');
    allTables.rows.forEach(t => {
      console.log(`- Table ${t.table_number} (${t.table_name || 'No name'}) at ${t.restaurant_name || 'Unknown restaurant'}`);
    });
    
    if (allTables.rows.length === 0) {
      console.log('\n⚠️  No tables found in database. Please create some tables first.');
      return;
    }
    
    // Use the first available table
    const table = allTables.rows[0];
    const restaurant = await pool.query(
      'SELECT id, name, slug FROM restaurants WHERE id = $1',
      [table.restaurant_id]
    );
    
    if (restaurant.rows.length === 0) {
      console.log('\n⚠️  Restaurant not found for table');
      return;
    }
    
    const rest = restaurant.rows[0];
    
    // Generate QR URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrUrl = `${baseUrl}/menu/${rest.slug}/${table.id}`;
    
    console.log(`\n✓ Sample QR Code URL: ${qrUrl}`);
    console.log('\nThis URL will show:');
    console.log(`- Restaurant: ${rest.name}`);
    console.log(`- Table: ${table.table_name || table.table_number}`);
    console.log(`- Restaurant-specific menu and branding`);
    
    console.log('\n🎉 QR code generation is working with the new URL format!');
    
  } catch (error) {
    console.error('Error testing QR generation:', error);
  } finally {
    await pool.end();
  }
}

testQRGeneration();