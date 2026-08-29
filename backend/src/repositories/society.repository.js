import { getPool } from '../config/database.js';  // ✅ हे बरोबर आहे का?

class SocietyRepository {
  static async create(society, createdBy) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO societies (
        society_code, society_name, registration_no, registration_type,
        address, city, state, pincode, pan_number, email, mobile,
        established_date, status, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
      [
        society.society_code,
        society.society_name,
        society.registration_no || null,
        society.registration_type || 'Co-operative Housing Society',
        society.address || null,
        society.city || null,
        society.state || null,
        society.pincode || null,
        society.pan_number || null,
        society.email || null,
        society.mobile || null,
        society.established_date || null,
        createdBy,
        createdBy,
      ]
    );

    return this.getById(result.insertId);
  }

  static async findByCode(code) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id FROM societies WHERE society_code = ? LIMIT 1`,
      [code]
    );
    return rows[0] || null;
  }

  static async getAllActive() {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        id,
        society_code,
        society_name,
        city,
        state,
        email,
        mobile,
        created_at,
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
