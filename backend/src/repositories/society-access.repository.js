import { getPool } from '../config/database.js';

export class SocietyAccessRepository {
  async getUserSocieties(userId) {
    const pool = getPool();
    const query = `
      SELECT 
        us.id, s.id as society_id, s.society_code, s.society_name, 
        s.logo, s.status, us.is_default, us.joined_at
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ?
      AND us.status = 'ACTIVE'
      AND s.status = 'ACTIVE'
      AND s.deleted_at IS NULL
      ORDER BY us.is_default DESC, us.created_at ASC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  async getUserDefaultSociety(userId) {
    const pool = getPool();
    const query = `
      SELECT 
        us.id, s.id as society_id, s.society_code, s.society_name, 
        s.logo, s.status
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ?
      AND us.is_default = TRUE
      AND us.status = 'ACTIVE'
      AND s.status = 'ACTIVE'
      AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows[0] || null;
  }

  async hasAccessToSociety(userId, societyId) {
    const pool = getPool();
    const query = `
      SELECT 1
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ?
      AND us.society_id = ?
      AND us.status = 'ACTIVE'
      AND s.status = 'ACTIVE'
      AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [userId, societyId]);
    return rows.length > 0;
  }

  async getUserRoles(userId, societyId = null) {
    const pool = getPool();
    let query = `
      SELECT r.id, r.role_name, r.role_code, r.scope
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `;
    const params = [userId];

    if (societyId) {
      query += ' AND ur.society_id = ?';
      params.push(societyId);
    } else {
      query += ' AND ur.society_id IS NULL';
    }

    query += ' ORDER BY r.role_code';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async assignRoleToUser(userId, roleId, societyId = null) {
    const pool = getPool();
    const query = `
      INSERT INTO user_roles (user_id, role_id, society_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id
    `;
    await pool.query(query, [userId, roleId, societyId]);
  }

  async createUserSocietyAccess(userId, societyId, isDefault = false) {
    const pool = getPool();
    const query = `
      INSERT INTO user_societies (user_id, society_id, is_default, joined_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status='ACTIVE'
    `;
    await pool.query(query, [userId, societyId, isDefault]);
  }

  async getAllActiveSocieties() {
    const pool = getPool();
    const query = `
      SELECT id, society_code, society_name, logo, status
      FROM societies
      WHERE status = 'ACTIVE'
      AND deleted_at IS NULL
      ORDER BY society_name ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  async getSocietyById(societyId) {
    const pool = getPool();
    const query = `
      SELECT 
        id, society_code, society_name, logo, email, mobile, status
      FROM societies
      WHERE id = ?
      AND status = 'ACTIVE'
      AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [societyId]);
    return rows[0] || null;
  }
}

export default new SocietyAccessRepository();
