/**
 * Migration script to set up Enhanced Floorplan functionality tables
 * 
 * This script creates the necessary tables and columns for the
 * Bluebeam-like PDF annotation functionality:
 * 
 * 1. floorplan_markers - Add unique_id column if it doesn't exist
 * 2. floorplan_calibrations - Create this table for precise measurements
 * 3. floorplan_layers - Create this table for organizing annotations
 */

const { pool } = require('../server/db');

async function runMigration() {
  console.log('Starting Enhanced Floorplan migration...');
  
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Check if floorplan_markers table exists
    const checkTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'floorplan_markers'
      );
    `);
    
    const floorplanMarkersExists = checkTableResult.rows[0].exists;
    
    // Create floorplan_markers table if it doesn't exist
    if (!floorplanMarkersExists) {
      console.log('Creating floorplan_markers table...');
      await pool.query(`
        CREATE TABLE floorplan_markers (
          id SERIAL PRIMARY KEY,
          floorplan_id INTEGER NOT NULL,
          unique_id TEXT NOT NULL,
          page INTEGER NOT NULL,
          marker_type TEXT NOT NULL,
          equipment_id INTEGER,
          layer_id INTEGER,
          position_x FLOAT NOT NULL,
          position_y FLOAT NOT NULL,
          end_x FLOAT,
          end_y FLOAT,
          width FLOAT,
          height FLOAT,
          rotation FLOAT,
          color TEXT,
          fill_color TEXT,
          opacity FLOAT,
          line_width FLOAT,
          label TEXT,
          text_content TEXT,
          font_size FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Created floorplan_markers table');
    } else {
      // Check if unique_id column exists in floorplan_markers
      const checkColumnResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'floorplan_markers' AND column_name = 'unique_id'
        );
      `);
      
      const uniqueIdExists = checkColumnResult.rows[0].exists;
      
      // Add unique_id column if it doesn't exist
      if (!uniqueIdExists) {
        console.log('Adding unique_id column to floorplan_markers table...');
        await pool.query(`
          ALTER TABLE floorplan_markers 
          ADD COLUMN unique_id TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT;
        `);
        console.log('Added unique_id column to floorplan_markers table');
      }
    }
    
    // Check if floorplan_calibrations table exists
    const checkCalibrationTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'floorplan_calibrations'
      );
    `);
    
    const floorplanCalibrationsExists = checkCalibrationTableResult.rows[0].exists;
    
    // Create floorplan_calibrations table if it doesn't exist
    if (!floorplanCalibrationsExists) {
      console.log('Creating floorplan_calibrations table...');
      await pool.query(`
        CREATE TABLE floorplan_calibrations (
          id SERIAL PRIMARY KEY,
          floorplan_id INTEGER NOT NULL,
          page INTEGER NOT NULL,
          start_x FLOAT NOT NULL,
          start_y FLOAT NOT NULL,
          end_x FLOAT NOT NULL,
          end_y FLOAT NOT NULL,
          real_distance FLOAT NOT NULL,
          unit TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(floorplan_id, page)
        );
      `);
      console.log('Created floorplan_calibrations table');
    }
    
    // Check if floorplan_layers table exists
    const checkLayersTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'floorplan_layers'
      );
    `);
    
    const floorplanLayersExists = checkLayersTableResult.rows[0].exists;
    
    // Create floorplan_layers table if it doesn't exist
    if (!floorplanLayersExists) {
      console.log('Creating floorplan_layers table...');
      await pool.query(`
        CREATE TABLE floorplan_layers (
          id SERIAL PRIMARY KEY,
          floorplan_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          visible BOOLEAN NOT NULL DEFAULT true,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Created floorplan_layers table');
      
      // Create default layer for each floorplan
      await pool.query(`
        INSERT INTO floorplan_layers (floorplan_id, name, color, visible, order_index)
        SELECT id, 'Default', '#3B82F6', true, 0
        FROM floorplans;
      `);
      console.log('Created default layers for existing floorplans');
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    console.log('Enhanced Floorplan migration completed successfully');
    
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
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });