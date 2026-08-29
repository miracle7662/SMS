import { config } from './config/env.js';
import { createPool, getPool, testDatabaseConnection } from './config/database.js';
import { hashPassword } from './utils/password-utils.js';
import { normalizeMobile, normalizeEmail } from './utils/normalize.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedRolesAndPermissions() {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Read seed SQL
    const seedPath = path.join(__dirname, '../database/seeds/001_roles_permissions.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    // Execute seed statements
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.commit();
    console.log('✓ Roles and permissions seeded');
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('✗ Failed to seed roles and permissions:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function seedSuperAdmin() {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    // Validate Super Admin environment variables
    if (!config.superAdmin.name || !config.superAdmin.mobile || !config.superAdmin.password) {
      throw new Error('SUPER_ADMIN_NAME, SUPER_ADMIN_MOBILE, and SUPER_ADMIN_PASSWORD must be set');
    }

    const normalizedMobile = normalizeMobile(config.superAdmin.mobile);
    const normalizedEmail = config.superAdmin.email ? normalizeEmail(config.superAdmin.email) : null;

    await connection.beginTransaction();

    // Check if Super Admin already exists
    let [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE mobile = ?',
      [normalizedMobile]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`✓ Super Admin user exists (ID: ${userId})`);
    } else {
      // Create Super Admin user
      const passwordHash = await hashPassword(config.superAdmin.password);

      const [result] = await connection.query(
        `INSERT INTO users (name, mobile, email, password_hash, status)
         VALUES (?, ?, ?, ?, 'ACTIVE')`,
        [config.superAdmin.name, normalizedMobile, normalizedEmail, passwordHash]
      );

      userId = result.insertId;
      console.log(`✓ Super Admin user created (ID: ${userId})`);
    }

    // Get SUPER_ADMIN role
    let [roles] = await connection.query(
      'SELECT id FROM roles WHERE role_code = ?',
      ['SUPER_ADMIN']
    );

    if (!roles.length) {
      throw new Error('SUPER_ADMIN role not found. Run migrations first.');
    }

    const roleId = roles[0].id;

    // Assign SUPER_ADMIN role
    await connection.query(
      `INSERT INTO user_roles (user_id, role_id, society_id)
       VALUES (?, ?, NULL)
       ON DUPLICATE KEY UPDATE id=id`,
      [userId, roleId]
    );

    console.log(`✓ SUPER_ADMIN role assigned to user (ID: ${userId})`);

    await connection.commit();
    console.log('✓ Super Admin seeded successfully');
    return userId;
  } catch (error) {
    await connection.rollback();
    console.error('✗ Failed to seed Super Admin:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function main() {
  try {
    console.log('Starting authentication seed...\n');

    // Initialize pool
    createPool();
    console.log('✓ Database pool created');

    // Test connection
    await testDatabaseConnection();
    console.log('✓ Database connection verified\n');

    // Run seeds
    await seedRolesAndPermissions();
    await seedSuperAdmin();

    console.log('\n✓ Authentication seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seed failed:', error.message);
    process.exit(1);
  }
}

main();
