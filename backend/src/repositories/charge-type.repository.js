import { getPool } from '../config/database.js';

const SELECT = `SELECT id, charge_code, charge_name, category, calculation_basis, default_rate,
  billing_frequency, is_taxable, gst_rate, description, display_order, status, created_at, updated_at
  FROM maintenance_charge_types`;

class ChargeTypeRepository {
  async list(societyId) {
    const [rows] = await getPool().execute(
      `${SELECT} WHERE society_id = ? AND deleted_at IS NULL ORDER BY display_order, charge_name`, [societyId]
    ); return rows;
  }
  async get(societyId, id) {
    const [rows] = await getPool().execute(
      `${SELECT} WHERE id = ? AND society_id = ? AND deleted_at IS NULL LIMIT 1`, [id, societyId]
    ); return rows[0] || null;
  }
  async findByCode(societyId, code, excludeId = null) {
    const params = [societyId, code]; let extra = '';
    if (excludeId) { extra = ' AND id <> ?'; params.push(excludeId); }
    const [rows] = await getPool().execute(
      `SELECT id FROM maintenance_charge_types WHERE society_id = ? AND charge_code = ?${extra} LIMIT 1`, params
    ); return rows[0] || null;
  }
  async create(societyId, value, userId) {
    const [result] = await getPool().execute(
      `INSERT INTO maintenance_charge_types
       (society_id, charge_code, charge_name, category, calculation_basis, default_rate,
        billing_frequency, is_taxable, gst_rate, description, display_order, status, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [societyId, value.charge_code, value.charge_name, value.category, value.calculation_basis,
        value.default_rate, value.billing_frequency, value.is_taxable, value.gst_rate,
        value.description, value.display_order, value.status, userId, userId]
    ); return this.get(societyId, result.insertId);
  }
  async update(societyId, id, value, userId) {
    const [result] = await getPool().execute(
      `UPDATE maintenance_charge_types SET charge_code = ?, charge_name = ?, category = ?,
       calculation_basis = ?, default_rate = ?, billing_frequency = ?, is_taxable = ?, gst_rate = ?,
       description = ?, display_order = ?, status = ?, updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [value.charge_code, value.charge_name, value.category, value.calculation_basis, value.default_rate,
        value.billing_frequency, value.is_taxable, value.gst_rate, value.description,
        value.display_order, value.status, userId, id, societyId]
    ); return result.affectedRows ? this.get(societyId, id) : null;
  }
  async remove(societyId, id, userId) {
    const [result] = await getPool().execute(
      `UPDATE maintenance_charge_types SET status = 'INACTIVE', deleted_at = UTC_TIMESTAMP(), updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`, [userId, id, societyId]
    ); return result.affectedRows > 0;
  }
}
export default new ChargeTypeRepository();
