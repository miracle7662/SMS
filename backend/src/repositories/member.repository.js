import { getPool } from '../config/database.js';

const SELECT_MEMBERS = `
  SELECT fm.id, m.id AS member_id, m.member_code, m.name, m.mobile, m.email,
         fm.flat_id, fl.flat_no, b.building_name, w.wing_name,
         fm.member_type, fm.ownership_percentage, fm.occupancy_start, fm.occupancy_end,
         fm.agreement_status, fm.police_noc_status, fm.is_primary, fm.status
  FROM flat_members fm
  INNER JOIN members m ON m.id = fm.member_id AND m.society_id = fm.society_id AND m.deleted_at IS NULL
  INNER JOIN flats fl ON fl.id = fm.flat_id AND fl.society_id = fm.society_id AND fl.deleted_at IS NULL
  INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = fm.society_id AND b.deleted_at IS NULL
  INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id AND w.deleted_at IS NULL`;

class MemberRepository {
  async list(societyId, memberType = null) {
    const params = [societyId];
    let filter = '';
    if (memberType) { filter = ' AND fm.member_type = ?'; params.push(memberType); }
    const [rows] = await getPool().execute(
      `${SELECT_MEMBERS} WHERE fm.society_id = ?${filter}
       ORDER BY fm.status = 'ACTIVE' DESC, b.building_name, w.wing_name, fl.flat_no, m.name`, params
    );
    return rows;
  }

  async getById(societyId, assignmentId) {
    const [rows] = await getPool().execute(
      `${SELECT_MEMBERS} WHERE fm.society_id = ? AND fm.id = ? LIMIT 1`, [societyId, assignmentId]
    );
    return rows[0] || null;
  }

  async getActiveFlat(societyId, flatId) {
    const [rows] = await getPool().execute(
      `SELECT id FROM flats WHERE id = ? AND society_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
      [flatId, societyId]
    );
    return rows[0] || null;
  }

  async findMemberByMobile(societyId, mobile) {
    const [rows] = await getPool().execute(
      `SELECT id, name, mobile, email, status, deleted_at FROM members WHERE society_id = ? AND mobile = ? LIMIT 1`,
      [societyId, mobile]
    );
    return rows[0] || null;
  }

  async createAssignment(societyId, payload, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      let [members] = await connection.execute(
        `SELECT id FROM members WHERE society_id = ? AND mobile = ? FOR UPDATE`, [societyId, payload.mobile]
      );
      let memberId = members[0]?.id;
      if (!memberId) {
        const [result] = await connection.execute(
          `INSERT INTO members (society_id, member_code, name, mobile, email, status, created_by, updated_by)
           VALUES (?, CONCAT('MEM', UUID_SHORT()), ?, ?, ?, 'ACTIVE', ?, ?)`,
          [societyId, payload.name, payload.mobile, payload.email, userId, userId]
        );
        memberId = result.insertId;
      }
      const [existing] = await connection.execute(
        `SELECT id FROM flat_members WHERE society_id = ? AND flat_id = ? AND member_id = ? AND member_type = ? LIMIT 1`,
        [societyId, payload.flat_id, memberId, payload.member_type]
      );
      if (existing[0]) throw Object.assign(new Error('Member is already assigned to this flat with the selected type'), { code: 'DUPLICATE_ASSIGNMENT' });
      const [result] = await connection.execute(
        `INSERT INTO flat_members
          (society_id, flat_id, member_id, member_type, ownership_percentage, occupancy_start, occupancy_end,
           agreement_status, police_noc_status, is_primary, status, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [societyId, payload.flat_id, memberId, payload.member_type, payload.ownership_percentage,
          payload.occupancy_start, payload.occupancy_end, payload.agreement_status, payload.police_noc_status,
          payload.is_primary, userId, userId]
      );
      const occupancy = payload.member_type === 'TENANT' ? 'RENTED' : 'OWNER_OCCUPIED';
      await connection.execute(
        `UPDATE flats SET occupancy_status = ?, updated_by = ? WHERE id = ? AND society_id = ?`,
        [occupancy, userId, payload.flat_id, societyId]
      );
      await connection.execute(
        `UPDATE societies SET total_members = (
           SELECT COUNT(DISTINCT fm.member_id) FROM flat_members fm WHERE fm.society_id = ? AND fm.status = 'ACTIVE'
         ) WHERE id = ?`, [societyId, societyId]
      );
      await connection.commit();
      return result.insertId;
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async deactivate(societyId, assignmentId, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [currentRows] = await connection.execute(
        `SELECT flat_id FROM flat_members WHERE id = ? AND society_id = ? AND status = 'ACTIVE' FOR UPDATE`,
        [assignmentId, societyId]
      );
      if (!currentRows[0]) { await connection.rollback(); return false; }
      const flatId = currentRows[0].flat_id;
      await connection.execute(
        `UPDATE flat_members SET status = 'INACTIVE', ended_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ? AND society_id = ?`,
        [userId, assignmentId, societyId]
      );
      const [types] = await connection.execute(
        `SELECT member_type FROM flat_members WHERE society_id = ? AND flat_id = ? AND status = 'ACTIVE'`,
        [societyId, flatId]
      );
      const occupancy = types.some((row) => row.member_type === 'TENANT') ? 'RENTED'
        : types.some((row) => row.member_type === 'OWNER' || row.member_type === 'CO_OWNER') ? 'OWNER_OCCUPIED' : 'VACANT';
      await connection.execute(`UPDATE flats SET occupancy_status = ?, updated_by = ? WHERE id = ? AND society_id = ?`, [occupancy, userId, flatId, societyId]);
      await connection.execute(
        `UPDATE societies SET total_members = (SELECT COUNT(DISTINCT member_id) FROM flat_members WHERE society_id = ? AND status = 'ACTIVE') WHERE id = ?`,
        [societyId, societyId]
      );
      await connection.commit(); return true;
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
}

export default new MemberRepository();
