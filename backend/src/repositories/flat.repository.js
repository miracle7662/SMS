import { getPool } from '../config/database.js';

const SELECT_FLAT = `
  SELECT fl.id, fl.building_id, fl.wing_id, fl.floor_id, fl.flat_no, fl.flat_type,
         fl.carpet_area_sqft, fl.builtup_area_sqft, fl.occupancy_status, fl.status,
         b.building_code, b.building_name, w.wing_code, w.wing_name,
         f.floor_number, f.floor_name
  FROM flats fl
  INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = fl.society_id AND b.deleted_at IS NULL
  INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id AND w.deleted_at IS NULL
  INNER JOIN floors f ON f.id = fl.floor_id AND f.wing_id = fl.wing_id AND f.deleted_at IS NULL`;

class FlatRepository {
  async list(societyId) {
    const [rows] = await getPool().execute(
      `${SELECT_FLAT} WHERE fl.society_id = ? AND fl.deleted_at IS NULL
       ORDER BY b.building_name, w.wing_name, f.floor_number, fl.flat_no`,
      [societyId]
    );
    return rows;
  }

  async getById(societyId, flatId) {
    const [rows] = await getPool().execute(
      `${SELECT_FLAT} WHERE fl.id = ? AND fl.society_id = ? AND fl.deleted_at IS NULL LIMIT 1`,
      [flatId, societyId]
    );
    return rows[0] || null;
  }

  async getFloor(societyId, buildingId, wingId, floorId) {
    const [rows] = await getPool().execute(
      `SELECT f.id, f.floor_number, f.floor_name, b.flats_per_floor
       FROM floors f
       INNER JOIN buildings b ON b.id = f.building_id AND b.society_id = f.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = f.wing_id AND w.building_id = f.building_id AND w.deleted_at IS NULL
       WHERE f.id = ? AND f.building_id = ? AND f.wing_id = ? AND f.society_id = ?
         AND f.status = 'ACTIVE' AND f.deleted_at IS NULL LIMIT 1`,
      [floorId, buildingId, wingId, societyId]
    );
    return rows[0] || null;
  }

  async findNumbers(societyId, flatNumbers, excludeId = null) {
    if (!flatNumbers.length) return [];
    const placeholders = flatNumbers.map(() => '?').join(',');
    let query = `SELECT id, flat_no FROM flats WHERE society_id = ? AND flat_no IN (${placeholders})`;
    const params = [societyId, ...flatNumbers];
    if (excludeId) { query += ' AND id <> ?'; params.push(excludeId); }
    const [rows] = await getPool().execute(query, params);
    return rows;
  }

  async generate(societyId, structure, flats, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      for (const flat of flats) {
        await connection.execute(
          `INSERT INTO flats
            (society_id, building_id, wing_id, floor_id, flat_no, flat_type,
             carpet_area_sqft, builtup_area_sqft, occupancy_status, status, created_by, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'VACANT', 'ACTIVE', ?, ?)`,
          [societyId, structure.building_id, structure.wing_id, structure.floor_id,
            flat.flat_no, flat.flat_type, flat.carpet_area_sqft, flat.builtup_area_sqft, userId, userId]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  }

  async update(societyId, flatId, flat, userId) {
    const [result] = await getPool().execute(
      `UPDATE flats SET flat_no = ?, flat_type = ?, carpet_area_sqft = ?, builtup_area_sqft = ?,
                        occupancy_status = ?, updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [flat.flat_no, flat.flat_type, flat.carpet_area_sqft, flat.builtup_area_sqft,
        flat.occupancy_status, userId, flatId, societyId]
    );
    return result.affectedRows > 0 ? this.getById(societyId, flatId) : null;
  }

  async softDelete(societyId, flatId, userId) {
    const [result] = await getPool().execute(
      `UPDATE flats SET status = 'INACTIVE', deleted_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [userId, flatId, societyId]
    );
    return result.affectedRows > 0;
  }

  async countByFloor(societyId, floorId) {
    const [rows] = await getPool().execute(
      `SELECT COUNT(*) AS total FROM flats WHERE society_id = ? AND floor_id = ? AND deleted_at IS NULL`,
      [societyId, floorId]
    );
    return Number(rows[0]?.total ?? 0);
  }

  async countByBuilding(societyId, buildingId) {
    const [rows] = await getPool().execute(
      `SELECT COUNT(*) AS total FROM flats WHERE society_id = ? AND building_id = ? AND deleted_at IS NULL`,
      [societyId, buildingId]
    );
    return Number(rows[0]?.total ?? 0);
  }

  async count(societyId) {
    const [rows] = await getPool().execute(
      `SELECT COUNT(*) AS total FROM flats WHERE society_id = ? AND deleted_at IS NULL AND status = 'ACTIVE'`,
      [societyId]
    );
    return Number(rows[0]?.total ?? 0);
  }
}

export default new FlatRepository();
