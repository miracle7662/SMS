import { createPool, testDatabaseConnection, closePool } from './src/config/database.js';
import migrationRunner from './src/database/migration-runner.js';

async function main() {
  try {
    console.log('Starting database migration...\n');

    // Initialize pool
    createPool();
    console.log('✓ Database pool created');

    // Test connection
    await testDatabaseConnection();
    console.log('✓ Database connection verified\n');

    // Run migrations
    await migrationRunner.runMigrations();

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
