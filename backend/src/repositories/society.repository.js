import { getPool } from '../config/database.js';  // ✅ हे बरोबर आहे का?

class SocietyRepository {
  static async getAllActive() {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        id,
        society_code,
        society_name,
        city,
        state,
        status
      FROM societies 
      WHERE deleted_at IS NULL 
        AND status = 'ACTIVE'
      ORDER BY society_name ASC
    `);
    return rows;
  }

  static async getById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM societies WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  static async getMemberCount(societyId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM user_societies 
       WHERE society_id = ? AND status = 'ACTIVE'`,
      [societyId]
    );
    return rows[0]?.count || 0;
  }

  static async getAllForSuperAdmin() {
    const societies = await this.getAllActive();
    
    const societiesWithCount = await Promise.all(
      societies.map(async (society) => {
        const count = await this.getMemberCount(society.id);
        return {
          ...society,
          memberCount: count
        };
      })
    );
    
    return societiesWithCount;
  }
}

export default SocietyRepository;