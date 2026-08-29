import { getPool } from '../config/database.js';

class SocietyUserRepository {
  async list(societyId) {
    const [rows] = await getPool().execute(
      `SELECT u.id, u.name, u.mobile, u.email, u.profile_image, u.last_login,
              us.status AS access_status, us.is_default, us.joined_at,
              GROUP_CONCAT(DISTINCT r.role_code ORDER BY r.role_code SEPARATOR ',') AS role_codes
       FROM user_societies us
       INNER JOIN users u ON u.id = us.user_id AND u.deleted_at IS NULL
       LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.society_id = us.society_id
       LEFT JOIN roles r ON r.id = ur.role_id AND r.status = 'ACTIVE'
       WHERE us.society_id = ?
       GROUP BY u.id, u.name, u.mobile, u.email, u.profile_image, u.last_login,
                us.status, us.is_default, us.joined_at
       ORDER BY us.status = 'ACTIVE' DESC, u.name ASC`,
      [societyId]
    );
    return rows.map((row) => ({ ...row, roles: row.role_codes ? row.role_codes.split(',') : [] }));
  }

  async getById(societyId, userId) {
    const users = await this.list(societyId);
    return users.find((user) => Number(user.id) === Number(userId)) || null;
  }

  async findUserByMobile(mobile) {
    const [rows] = await getPool().execute(
      `SELECT id, name, mobile, email, status, deleted_at FROM users WHERE mobile = ? LIMIT 1`,
      [mobile]
    );
    return rows[0] || null;
  }

  async findUserByEmail(email) {
    if (!email) return null;
    const [rows] = await getPool().execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`, [email]
    );
    return rows[0] || null;
  }

  async assignSocietyAdmin(societyId, identity, passwordHash, createdBy) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      let [users] = await connection.execute(
        `SELECT id, name, mobile, email, status, deleted_at FROM users WHERE mobile = ? FOR UPDATE`,
        [identity.mobile]
      );
      let user = users[0];
      let created = false;
      if (!user) {
        const [result] = await connection.execute(
          `INSERT INTO users (name, mobile, email, password_hash, status, created_by, updated_by, password_changed_at)
           VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, UTC_TIMESTAMP())`,
          [identity.name, identity.mobile, identity.email, passwordHash, createdBy, createdBy]
        );
        user = { id: result.insertId, name: identity.name, mobile: identity.mobile, email: identity.email, status: 'ACTIVE' };
        created = true;
      }

      const [assignmentCount] = await connection.execute(
        `SELECT COUNT(*) AS total FROM user_societies WHERE user_id = ? AND status = 'ACTIVE'`, [user.id]
      );
      const isDefault = Number(assignmentCount[0].total) === 0;
      await connection.execute(
        `INSERT INTO user_societies (user_id, society_id, is_default, status, joined_at, created_by)
         VALUES (?, ?, ?, 'ACTIVE', UTC_TIMESTAMP(), ?)
         ON DUPLICATE KEY UPDATE status = 'ACTIVE', joined_at = COALESCE(joined_at, UTC_TIMESTAMP())`,
        [user.id, societyId, isDefault, createdBy]
      );
      const [roles] = await connection.execute(
        `SELECT id FROM roles WHERE role_code = 'SOCIETY_ADMIN' AND scope = 'SOCIETY' AND status = 'ACTIVE' LIMIT 1`
      );
      if (!roles[0]) throw new Error('SOCIETY_ADMIN role is not configured');
      await connection.execute(
        `INSERT INTO user_roles (user_id, role_id, society_id, created_by)
         VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE created_by = created_by`,
        [user.id, roles[0].id, societyId, createdBy]
      );
      await connection.commit();
      return { userId: user.id, created };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  }

  async setAccessStatus(societyId, userId, status) {
    const [result] = await getPool().execute(
      `UPDATE user_societies SET status = ? WHERE society_id = ? AND user_id = ?`,
      [status, societyId, userId]
    );
    return result.affectedRows > 0;
  }

  async countActiveSocietyAdmins(societyId) {
    const [rows] = await getPool().execute(
      `SELECT COUNT(DISTINCT us.user_id) AS total
       FROM user_societies us
       INNER JOIN user_roles ur ON ur.user_id = us.user_id AND ur.society_id = us.society_id
       INNER JOIN roles r ON r.id = ur.role_id AND r.role_code = 'SOCIETY_ADMIN'
       WHERE us.society_id = ? AND us.status = 'ACTIVE'`,
      [societyId]
    );
    return Number(rows[0]?.total ?? 0);
  }
}

export default new SocietyUserRepository();
