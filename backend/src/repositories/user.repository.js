import { getPool } from '../config/database.js';

class UserRepository {
  
  // ✅ ADD THIS FUNCTION - Find user by mobile or email
  static async findByMobileOrEmail(login) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, name, mobile, email, password_hash, profile_image, status 
       FROM users 
       WHERE (mobile = ? OR email = ?) 
         AND deleted_at IS NULL 
         AND status = 'ACTIVE'`,
      [login, login]
    );
    return rows[0] || null;
  }

  // User by ID
  static async getById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, name, mobile, email, profile_image, status 
       FROM users 
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  // User च्या roles मिळवा
  static async getUserRoles(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        ur.id,
        ur.role_id,
        ur.society_id,
        r.role_code,
        r.role_name,
        r.scope
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND r.status = 'ACTIVE'
    `, [userId]);
    return rows;
  }

  // User Super Admin आहे का check
  static async isSuperAdmin(userId) {
    const roles = await this.getUserRoles(userId);
    return roles.some(r => r.role_code === 'SUPER_ADMIN');
  }

  // User ची default society मिळवा
  static async getDefaultSociety(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        us.society_id,
        s.society_name,
        s.society_code
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ? 
        AND us.is_default = TRUE
        AND us.status = 'ACTIVE'
        AND s.deleted_at IS NULL
        AND s.status = 'ACTIVE'
    `, [userId]);
    return rows[0] || null;
  }

  // ✅ ADD THIS - Get user societies
  static async getUserSocieties(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        us.society_id as id,
        s.society_name as name,
        s.society_code as code,
        us.is_default
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ? 
        AND us.status = 'ACTIVE'
        AND s.deleted_at IS NULL
        AND s.status = 'ACTIVE'
    `, [userId]);
    return rows;
  }
}

export default UserRepository;