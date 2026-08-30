import { getPool } from '../config/database.js';

class UserRepository {
  
  // ✅ ADD THIS FUNCTION - Find user by mobile or email
  static async findByMobileOrEmail(login) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, name, mobile, email, password_hash, profile_image, status,
              failed_login_attempts, locked_until, password_changed_at, last_login, must_change_password, invitation_status
       FROM users 
       WHERE (mobile = ? OR email = ?) 
         AND deleted_at IS NULL 
         AND status = 'ACTIVE'`,
      [login, login]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, name, mobile, email, profile_image, status,
              failed_login_attempts, locked_until, password_changed_at, last_login, must_change_password, invitation_status
       FROM users
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async incrementFailedLoginAttempts(id) {
    const pool = getPool();
    await pool.execute(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  static async updateFailedLoginAttemptsAndLock(id, lockedUntil) {
    const pool = getPool();
    await pool.execute(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1, locked_until = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [lockedUntil, id]
    );
  }

  static async resetFailedLoginAttempts(id) {
    const pool = getPool();
    await pool.execute(
      `UPDATE users
       SET failed_login_attempts = 0, locked_until = NULL, last_login = UTC_TIMESTAMP()
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  static async findWithPassword(id) {
    const [rows] = await getPool().execute(`SELECT id,password_hash,must_change_password FROM users WHERE id=? AND status='ACTIVE' AND deleted_at IS NULL LIMIT 1`,[id]);
    return rows[0] || null;
  }

  static async changePassword(id,passwordHash) {
    const connection=await getPool().getConnection();
    try {await connection.beginTransaction();await connection.execute(`UPDATE users SET password_hash=?,must_change_password=0,password_changed_at=UTC_TIMESTAMP(),invitation_status=CASE WHEN invitation_status IN('PENDING','SENT') THEN 'ACCEPTED' ELSE invitation_status END WHERE id=?`,[passwordHash,id]);await connection.execute(`UPDATE society_onboarding_invitations SET status='ACCEPTED',accepted_at=UTC_TIMESTAMP() WHERE user_id=? AND status IN('PENDING','SENT')`,[id]);await connection.commit();}catch(error){await connection.rollback();throw error;}finally{connection.release();}
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
