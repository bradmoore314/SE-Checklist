// Script to execute the enhanced PDF markers migration
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Read the migration SQL file
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '..', 'migrations', '20250502_enhanced_floorplan_markers.sql'),
    'utf8'
  );

  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting PDF coordinate system migration...');
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Execute the migration SQL
      console.log('Creating new schema tables...');
      await client.query(migrationSQL);
      
      // Check if we should migrate existing data
      const shouldMigrateData = process.argv.includes('--migrate-data');
      
      if (shouldMigrateData) {
        console.log('Migrating existing markers to enhanced schema...');
        await client.query('SELECT migrate_markers_to_enhanced()');
        console.log('Data migration completed successfully!');
      }
      
      await client.query('COMMIT');
      console.log('Migration transaction committed successfully!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Migration failed, transaction rolled back:', err);
      throw err;
    } finally {
      client.release();
    }
    
    console.log('PDF coordinate system migration completed successfully!');
    
    // Provide guidance on next steps
    if (!shouldMigrateData) {
      console.log('\nData migration was not performed. To migrate existing data, run:');
      console.log('  node scripts/run_pdf_migration.js --migrate-data');
      console.log('\nNote: Test the migration in a development environment first.');
    }
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);