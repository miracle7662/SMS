import { getPool } from '../config/database.js';

class BuildingRepository {
  async list(societyId) {
    const pool = getPool();
    const [buildings] = await pool.execute(
      `SELECT id, society_id, building_code, building_name, floors_per_wing,
              flats_per_floor, status, created_at, updated_at
       FROM buildings
       WHERE society_id = ? AND deleted_at IS NULL
       ORDER BY building_name ASC`,
      [societyId]
    );
    if (!buildings.length) return [];

    const [wings] = await pool.execute(
      `SELECT id, building_id, wing_code, wing_name, status
       FROM building_wings
       WHERE society_id = ? AND deleted_at IS NULL
       ORDER BY building_id, wing_name`,
      [societyId]
    );
    return buildings.map((building) => this.withComputedValues(
      building,
      wings.filter((wing) => Number(wing.building_id) === Number(building.id))
    ));
  }

  async getById(societyId, buildingId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, society_id, building_code, building_name, floors_per_wing,
              flats_per_floor, status, created_at, updated_at
       FROM buildings
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL LIMIT 1`,
      [buildingId, societyId]
    );
    if (!rows[0]) return null;
    const [wings] = await pool.execute(
      `SELECT id, building_id, wing_code, wing_name, status
       FROM building_wings
       WHERE building_id = ? AND society_id = ? AND deleted_at IS NULL
       ORDER BY wing_name`,
      [buildingId, societyId]
    );
    return this.withComputedValues(rows[0], wings);
  }

  async findByCode(societyId, code, excludeId = null) {
    const pool = getPool();
    let query = `SELECT id FROM buildings WHERE society_id = ? AND building_code = ?`;
    const params = [societyId, code];
    if (excludeId) { query += ' AND id <> ?'; params.push(excludeId); }
    query += ' LIMIT 1';
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  }

  async count(societyId) {
    const [rows] = await getPool().execute(
      `SELECT COUNT(*) AS total FROM buildings WHERE society_id = ? AND deleted_at IS NULL AND status = 'ACTIVE'`,
      [societyId]
    );
    return Number(rows[0]?.total ?? 0);
  }

  async create(societyId, building, wings, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO buildings
          (society_id, building_code, building_name, floors_per_wing, flats_per_floor, status, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [societyId, building.building_code, building.building_name, building.floors_per_wing, building.flats_per_floor, userId, userId]
      );
      for (const wing of wings) {
        await connection.execute(
          `INSERT INTO building_wings
            (society_id, building_id, wing_code, wing_name, status, created_by, updated_by)
           VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)`,
          [societyId, result.insertId, wing.wing_code, wing.wing_name, userId, userId]
        );
      }
      await connection.commit();
      return this.getById(societyId, result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(societyId, buildingId, building, wings, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE buildings
         SET building_code = ?, building_name = ?, floors_per_wing = ?, flats_per_floor = ?, updated_by = ?
         WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
        [building.building_code, building.building_name, building.floors_per_wing, building.flats_per_floor, userId, buildingId, societyId]
      );
      await connection.execute(
        `UPDATE building_wings SET deleted_at = CURRENT_TIMESTAMP, status = 'INACTIVE', updated_by = ?
         WHERE building_id = ? AND society_id = ? AND deleted_at IS NULL`,
        [userId, buildingId, societyId]
      );
      for (const wing of wings) {
        await connection.execute(
          `INSERT INTO building_wings
            (society_id, building_id, wing_code, wing_name, status, created_by, updated_by, deleted_at)
           VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, NULL)
           ON DUPLICATE KEY UPDATE wing_name = VALUES(wing_name), status = 'ACTIVE', updated_by = VALUES(updated_by), deleted_at = NULL`,
          [societyId, buildingId, wing.wing_code, wing.wing_name, userId, userId]
        );
      }
      await connection.commit();
      return this.getById(societyId, buildingId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async softDelete(societyId, buildingId, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `UPDATE buildings SET status = 'INACTIVE', deleted_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
        [userId, buildingId, societyId]
      );
      await connection.execute(
        `UPDATE building_wings SET status = 'INACTIVE', deleted_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE building_id = ? AND society_id = ? AND deleted_at IS NULL`,
        [userId, buildingId, societyId]
      );
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  withComputedValues(building, wings) {
    const activeWings = wings.filter((wing) => wing.status === 'ACTIVE');
    return {
      ...building,
      wings: activeWings,
      total_floors: activeWings.length * Number(building.floors_per_wing),
      total_flats: activeWings.length * Number(building.floors_per_wing) * Number(building.flats_per_floor),
    };
  }
}

export default new BuildingRepository();
