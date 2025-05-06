/**
 * Script to run the project ownership migration
 */
import { execSync } from 'child_process';

console.log('Starting project ownership migration...');

try {
  // Run the migration script
  execSync('node scripts/migrate_project_owners.js', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}