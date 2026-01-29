const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure proper order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      
      const migrationPath = path.join(__dirname, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await db.query(statement);
        }
      }
      
      console.log(`✓ Completed migration: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();