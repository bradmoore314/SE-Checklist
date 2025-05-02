const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Script to run the PDF annotation system database migrations
 * This sets up all the necessary tables and indices for Bluebeam-like functionality
 */
async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/20250502_enhanced_floorplan_markers.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Starting enhanced floorplan markers migration...');
    
    // Connect to the database
    const client = await pool.connect();
    try {
      // Execute the migration in a transaction
      await client.query('BEGIN');
      
      // Split the SQL by semicolons and execute each statement
      const statements = migrationSql
        .split(';')
        .filter(stmt => stmt.trim() !== '')
        .map(stmt => stmt.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Executing statement ${i + 1} of ${statements.length}...`);
        try {
          await client.query(statement);
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
          console.error('Statement:', statement);
          throw err;
        }
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Migration completed successfully!');
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Migration failed, rolled back changes:', error);
      process.exit(1);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration script error:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});