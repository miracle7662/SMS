import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationRunner {
  async runMigrations() {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Create migrations tracking table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Get all migration files
      const migrationsDir = path.join(__dirname, '../../database/migrations');
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

      console.log(`Found ${migrationFiles.length} migration(s)`);

      for (const file of migrationFiles) {
        // Check if migration already ran
        const [rows] = await connection.query(
          'SELECT id FROM schema_migrations WHERE migration_name = ?',
          [file]
        );

        if (rows.length > 0) {
          console.log(`✓ ${file} (already executed)`);
          continue;
        }

        // Read and execute migration
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        try {
          // Split SQL by statement and execute each
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

          for (const statement of statements) {
            await connection.query(statement);
          }

          // Record migration
          await connection.query(
            'INSERT INTO schema_migrations (migration_name) VALUES (?)',
            [file]
          );

          console.log(`✓ ${file}`);
        } catch (error) {
          console.error(`✗ ${file} - Error: ${error.message}`);
          throw error;
        }
      }

      console.log('\n✓ All migrations completed successfully');
      return true;
    } catch (error) {
      console.error('\n✗ Migration failed:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new MigrationRunner();
