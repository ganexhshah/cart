const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function runSeeds() {
  try {
    console.log('Running database seeds...');
    
    const seedFile = path.join(__dirname, 'sample_data.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = seedSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }
    
    console.log('Seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();