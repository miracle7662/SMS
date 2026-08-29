import { getPool } from '../config/database.js';

class FloorRepository {
  async list(societyId) {
    const [rows] = await getPool().execute(
      `SELECT f.id, f.building_id, f.wing_id, f.floor_number, f.floor_name, f.status,
              b.building_code, b.building_name, w.wing_code, w.wing_name,
              b.flats_per_floor
       FROM floors f
       INNER JOIN buildings b ON b.id = f.building_id AND b.society_id = f.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = f.wing_id AND w.building_id = f.building_id AND w.deleted_at IS NULL
       WHERE f.society_id = ? AND f.deleted_at IS NULL
       ORDER BY b.building_name, w.wing_name, f.floor_number`,
      [societyId]
    );
    return rows;
  }

  async getById(societyId, floorId) {
    const [rows] = await getPool().execute(
      `SELECT f.id, f.building_id, f.wing_id, f.floor_number, f.floor_name, f.status,
              b.building_code, b.building_name, w.wing_code, w.wing_name,
              b.flats_per_floor
       FROM floors f
       INNER JOIN buildings b ON b.id = f.building_id AND b.society_id = f.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = f.wing_id AND w.building_id = f.building_id AND w.deleted_at IS NULL
       WHERE f.id = ? AND f.society_id = ? AND f.deleted_at IS NULL LIMIT 1`,
      [floorId, societyId]
    );
    return rows[0] || null;
  }

  async getWing(societyId, buildingId, wingId) {
    const [rows] = await getPool().execute(
      `SELECT w.id, w.wing_code, w.wing_name, b.id AS building_id, b.building_name, b.floors_per_wing
       FROM building_wings w
       INNER JOIN buildings b ON b.id = w.building_id AND b.society_id = w.society_id
       WHERE w.id = ? AND w.building_id = ? AND w.society_id = ?
         AND w.status = 'ACTIVE' AND w.deleted_at IS NULL
         AND b.status = 'ACTIVE' AND b.deleted_at IS NULL LIMIT 1`,
      [wingId, buildingId, societyId]
    );
    return rows[0] || null;
  }

  async findByNumber(societyId, wingId, floorNumber, excludeId = null) {
    let query = `SELECT id FROM floors WHERE society_id = ? AND wing_id = ? AND floor_number = ?`;
    const params = [societyId, wingId, floorNumber];
    if (excludeId) { query += ' AND id <> ?'; params.push(excludeId); }
    query += ' LIMIT 1';
    const [rows] = await getPool().execute(query, params);
    return rows[0] || null;
  }

  async generate(societyId, buildingId, wingId, floors, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      for (const floor of floors) {
        await connection.execute(
          `INSERT INTO floors
            (society_id, building_id, wing_id, floor_number, floor_name, status, created_by, updated_by, deleted_at)
           VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, NULL)
           ON DUPLICATE KEY UPDATE floor_name = VALUES(floor_name), status = 'ACTIVE', updated_by = VALUES(updated_by), deleted_at = NULL`,
          [societyId, buildingId, wingId, floor.floor_number, floor.floor_name, userId, userId]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(societyId, floorId, floorNumber, floorName, userId) {
    const [result] = await getPool().execute(
      `UPDATE floors SET floor_number = ?, floor_name = ?, updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [floorNumber, floorName, userId, floorId, societyId]
    );
    return result.affectedRows > 0 ? this.getById(societyId, floorId) : null;
  }

  async softDelete(societyId, floorId, userId) {
    const [result] = await getPool().execute(
      `UPDATE floors SET status = 'INACTIVE', deleted_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [userId, floorId, societyId]
    );
    return result.affectedRows > 0;
  }
}

export default new FloorRepository();
