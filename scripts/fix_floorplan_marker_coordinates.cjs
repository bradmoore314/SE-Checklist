/**
 * Migration script to fix floorplan_markers table coordinate columns
 * 
 * This script updates the position_x and position_y columns to be REAL/FLOAT
 * type instead of INTEGER to properly support precise PDF coordinates
 */

const { Pool } = require('pg');

// Setup connection pool
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable not set');
}

const pool = new Pool({
  connectionString: DATABASE_URL
});

async function runMigration() {
  console.log('Starting coordinate type migration...');
  
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Check column types
    const checkColumnTypeResult = await pool.query(`
      SELECT data_type
      FROM information_schema.columns 
      WHERE table_name = 'floorplan_markers' AND column_name = 'position_x';
    `);
    
    if (checkColumnTypeResult.rows.length > 0) {
      const currentType = checkColumnTypeResult.rows[0].data_type;
      console.log(`Current position_x data type: ${currentType}`);
      
      // If the type is integer, modify to real
      if (currentType === 'integer') {
        console.log('Updating position_x and position_y to REAL type...');
        
        // Alter table to change column types
        await pool.query(`ALTER TABLE floorplan_markers ALTER COLUMN position_x TYPE REAL USING position_x::REAL;`);
        console.log('Updated position_x to REAL type');
        
        await pool.query(`ALTER TABLE floorplan_markers ALTER COLUMN position_y TYPE REAL USING position_y::REAL;`);
        console.log('Updated position_y to REAL type');
      } else {
        console.log('Position columns already have the correct type, no changes needed');
      }
    } else {
      console.error('Could not find position_x column in floorplan_markers table');
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    console.log('Migration completed successfully');
    
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Coordinate column types fixed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });