import { getPool } from '../config/database.js';

export class AuditRepository {
  async log(auditData) {
    const pool = getPool();
    const query = `
      INSERT INTO audit_logs 
        (society_id, user_id, module_name, action, record_id, old_data, new_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      await pool.query(query, [
        auditData.societyId || null,
        auditData.userId || null,
        auditData.moduleName,
        auditData.action,
        auditData.recordId || null,
        auditData.oldData ? JSON.stringify(auditData.oldData) : null,
        auditData.newData ? JSON.stringify(auditData.newData) : null,
        auditData.ipAddress || null,
        auditData.userAgent || null,
      ]);
    } catch (error) {
      // Audit logging failure should not crash the main operation
      console.error('Audit log failed:', error.message);
    }
  }

  async getAuditLog(filters = {}, limit = 100, offset = 0) {
    const pool = getPool();
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.societyId) {
      query += ' AND society_id = ?';
      params.push(filters.societyId);
    }

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.moduleName) {
      query += ' AND module_name = ?';
      params.push(filters.moduleName);
    }

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

export default new AuditRepository();
