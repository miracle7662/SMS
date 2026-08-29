import { getPool } from '../config/database.js';

const SELECT = `SELECT cr.id, cr.charge_type_id, ct.charge_code, ct.charge_name, ct.category,
  ct.calculation_basis, cr.rule_name, cr.applicability_scope, cr.flat_type, cr.occupancy_status,
  cr.flat_id, fl.flat_no, b.building_name, w.wing_name, cr.rate, cr.minimum_amount,
  cr.maximum_amount, cr.effective_from, cr.effective_to, cr.priority, cr.proration_enabled,
  cr.description, cr.status, cr.created_at, cr.updated_at
  FROM maintenance_charge_rules cr
  INNER JOIN maintenance_charge_types ct ON ct.id = cr.charge_type_id AND ct.society_id = cr.society_id
  LEFT JOIN flats fl ON fl.id = cr.flat_id AND fl.society_id = cr.society_id
  LEFT JOIN buildings b ON b.id = fl.building_id AND b.society_id = cr.society_id
  LEFT JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id`;

class ChargeRuleRepository {
  async list(societyId) {
    const [rows] = await getPool().execute(
      `${SELECT} WHERE cr.society_id = ? AND cr.deleted_at IS NULL
       ORDER BY cr.status = 'ACTIVE' DESC, ct.charge_name, cr.effective_from DESC, cr.priority DESC`, [societyId]
    ); return rows;
  }
  async get(societyId, id) {
    const [rows] = await getPool().execute(
      `${SELECT} WHERE cr.id = ? AND cr.society_id = ? AND cr.deleted_at IS NULL LIMIT 1`, [id, societyId]
    ); return rows[0] || null;
  }
  async findOverlap(societyId, value, excludeId = null) {
    const params = [societyId, value.charge_type_id, value.applicability_scope, value.flat_type,
      value.occupancy_status, value.flat_id, value.effective_to, value.effective_from];
    let exclude = '';
    if (excludeId) { exclude = ' AND id <> ?'; params.push(excludeId); }
    const [rows] = await getPool().execute(
      `SELECT id, rule_name, effective_from, effective_to FROM maintenance_charge_rules
       WHERE society_id = ? AND charge_type_id = ? AND applicability_scope = ?
         AND flat_type <=> ? AND occupancy_status <=> ? AND flat_id <=> ?
         AND status = 'ACTIVE' AND deleted_at IS NULL
         AND effective_from <= COALESCE(?, '9999-12-31')
         AND COALESCE(effective_to, '9999-12-31') >= ?${exclude} LIMIT 1`, params
    ); return rows[0] || null;
  }
  async create(societyId, value, userId) {
    const [result] = await getPool().execute(
      `INSERT INTO maintenance_charge_rules
       (society_id, charge_type_id, rule_name, applicability_scope, flat_type, occupancy_status,
        flat_id, rate, minimum_amount, maximum_amount, effective_from, effective_to, priority,
        proration_enabled, description, status, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [societyId, value.charge_type_id, value.rule_name, value.applicability_scope, value.flat_type,
        value.occupancy_status, value.flat_id, value.rate, value.minimum_amount, value.maximum_amount,
        value.effective_from, value.effective_to, value.priority, value.proration_enabled,
        value.description, value.status, userId, userId]
    ); return this.get(societyId, result.insertId);
  }
  async update(societyId, id, value, userId) {
    const [result] = await getPool().execute(
      `UPDATE maintenance_charge_rules SET charge_type_id = ?, rule_name = ?, applicability_scope = ?,
       flat_type = ?, occupancy_status = ?, flat_id = ?, rate = ?, minimum_amount = ?, maximum_amount = ?,
       effective_from = ?, effective_to = ?, priority = ?, proration_enabled = ?, description = ?,
       status = ?, updated_by = ? WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [value.charge_type_id, value.rule_name, value.applicability_scope, value.flat_type,
        value.occupancy_status, value.flat_id, value.rate, value.minimum_amount, value.maximum_amount,
        value.effective_from, value.effective_to, value.priority, value.proration_enabled,
        value.description, value.status, userId, id, societyId]
    ); return result.affectedRows ? this.get(societyId, id) : null;
  }
  async remove(societyId, id, userId) {
    const [result] = await getPool().execute(
      `UPDATE maintenance_charge_rules SET status = 'INACTIVE', deleted_at = UTC_TIMESTAMP(), updated_by = ?
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`, [userId, id, societyId]
    ); return result.affectedRows > 0;
  }
}
export default new ChargeRuleRepository();
