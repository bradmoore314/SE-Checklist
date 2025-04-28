// Simple script to run database migration
import { execSync } from 'child_process';

try {
  console.log('Running database migration...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
}