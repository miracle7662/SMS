import { getPool } from '../config/database.js';  // ✅ हे बरोबर आहे का?

class UserSocietyRepository {
  static async getUserSocieties(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        us.id,
        us.society_id,
        us.is_default,
        us.status,
        s.society_name,
        s.society_code,
        s.city
      FROM user_societies us
      INNER JOIN societies s ON us.society_id = s.id
      WHERE us.user_id = ? 
        AND us.status = 'ACTIVE'
        AND s.deleted_at IS NULL
        AND s.status = 'ACTIVE'
    `, [userId]);
    return rows;
  }

  static async hasAccess(userId, societyId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id FROM user_societies 
       WHERE user_id = ? AND society_id = ? AND status = 'ACTIVE'`,
      [userId, societyId]
    );
    return rows.length > 0;
  }
}

export default UserSocietyRepository;