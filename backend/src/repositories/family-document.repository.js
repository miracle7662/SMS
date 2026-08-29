import { getPool } from '../config/database.js';

class FamilyDocumentRepository {
  async listPrimaryMembers(societyId) {
    const [rows] = await getPool().execute(
      `SELECT DISTINCT m.id AS member_id, m.name, fm.flat_id, fl.flat_no, b.building_name, w.wing_name
       FROM flat_members fm
       INNER JOIN members m ON m.id = fm.member_id AND m.society_id = fm.society_id AND m.deleted_at IS NULL
       INNER JOIN flats fl ON fl.id = fm.flat_id AND fl.society_id = fm.society_id AND fl.deleted_at IS NULL
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = fm.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id AND w.deleted_at IS NULL
       WHERE fm.society_id = ? AND fm.status = 'ACTIVE' AND fm.member_type IN ('OWNER','CO_OWNER','TENANT')
       ORDER BY b.building_name, w.wing_name, fl.flat_no, m.name`, [societyId]
    );
    return rows;
  }

  async getPrimaryMember(societyId, memberId, flatId) {
    const [rows] = await getPool().execute(
      `SELECT m.id, m.name FROM members m INNER JOIN flat_members fm ON fm.member_id = m.id AND fm.society_id = m.society_id
       WHERE m.id = ? AND fm.flat_id = ? AND m.society_id = ? AND m.deleted_at IS NULL AND m.status = 'ACTIVE' AND fm.status = 'ACTIVE' LIMIT 1`,
      [memberId, flatId, societyId]
    ); return rows[0] || null;
  }

  async listFamily(societyId) {
    const [rows] = await getPool().execute(
      `SELECT f.id, f.name, f.relation_type, f.mobile, f.email, f.date_of_birth, f.status,
              f.flat_id, fl.flat_no, b.building_name, w.wing_name, m.id AS primary_member_id, m.name AS primary_member_name
       FROM family_members f
       INNER JOIN members m ON m.id = f.primary_member_id AND m.society_id = f.society_id AND m.deleted_at IS NULL
       INNER JOIN flats fl ON fl.id = f.flat_id AND fl.society_id = f.society_id AND fl.deleted_at IS NULL
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = f.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id AND w.deleted_at IS NULL
       WHERE f.society_id = ? AND f.deleted_at IS NULL ORDER BY f.status = 'ACTIVE' DESC, b.building_name, w.wing_name, fl.flat_no, f.name`, [societyId]
    ); return rows;
  }

  async createFamily(societyId, payload, userId) {
    const [result] = await getPool().execute(
      `INSERT INTO family_members (society_id, flat_id, primary_member_id, name, relation_type, mobile, email, date_of_birth, status, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
      [societyId, payload.flat_id, payload.primary_member_id, payload.name, payload.relation_type, payload.mobile, payload.email, payload.date_of_birth, userId, userId]
    ); return result.insertId;
  }

  async deleteFamily(societyId, id, userId) {
    const [result] = await getPool().execute(
      `UPDATE family_members SET status = 'INACTIVE', deleted_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ? AND society_id = ? AND deleted_at IS NULL`,
      [userId, id, societyId]
    ); return result.affectedRows > 0;
  }

  async listDocuments(societyId) {
    const [rows] = await getPool().execute(
      `SELECT d.id, d.member_id, m.name AS member_name, d.flat_id, fl.flat_no, b.building_name, w.wing_name,
              d.document_type, d.document_number, d.original_file_name, d.mime_type, d.file_size,
              d.status, d.expiry_date, d.verified_at, d.rejection_reason, d.created_at
       FROM member_documents d
       INNER JOIN members m ON m.id = d.member_id AND m.society_id = d.society_id AND m.deleted_at IS NULL
       INNER JOIN flats fl ON fl.id = d.flat_id AND fl.society_id = d.society_id AND fl.deleted_at IS NULL
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = d.society_id AND b.deleted_at IS NULL
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id AND w.deleted_at IS NULL
       WHERE d.society_id = ? AND d.deleted_at IS NULL ORDER BY d.created_at DESC`, [societyId]
    ); return rows;
  }

  async createDocument(societyId, payload, file, userId) {
    const [result] = await getPool().execute(
      `INSERT INTO member_documents (society_id, member_id, flat_id, document_type, document_number, original_file_name, stored_file_name, mime_type, file_size, status, expiry_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [societyId, payload.member_id, payload.flat_id, payload.document_type, payload.document_number,
        file.originalName, file.storedName, file.mimeType, file.size, payload.expiry_date, userId]
    ); return result.insertId;
  }

  async getDocument(societyId, id) {
    const [rows] = await getPool().execute(
      `SELECT id, society_id, member_id, flat_id, original_file_name, stored_file_name, mime_type, file_size, status
       FROM member_documents WHERE id = ? AND society_id = ? AND deleted_at IS NULL LIMIT 1`, [id, societyId]
    ); return rows[0] || null;
  }

  async verifyDocument(societyId, id, status, reason, userId) {
    const [result] = await getPool().execute(
      `UPDATE member_documents SET status = ?, rejection_reason = ?, verified_by = ?, verified_at = UTC_TIMESTAMP()
       WHERE id = ? AND society_id = ? AND deleted_at IS NULL`, [status, reason, userId, id, societyId]
    ); return result.affectedRows > 0;
  }

  async deleteDocument(societyId, id) {
    const [result] = await getPool().execute(
      `UPDATE member_documents SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND society_id = ? AND deleted_at IS NULL`, [id, societyId]
    ); return result.affectedRows > 0;
  }
}

export default new FamilyDocumentRepository();
