import { getPool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

const maskIdentifier = (value = '') => {
  const text = String(value).trim();
  if (text.includes('@')) {
    const [name, domain] = text.split('@');
    return `${name.slice(0, 2)}***@${domain || '***'}`;
  }
  return text.length > 4 ? `${'*'.repeat(Math.min(6, text.length - 4))}${text.slice(-4)}` : '****';
};

class SecurityRepository {
  async log({ userId = null, societyId = null, eventType, severity = 'LOW', identifier, ipAddress, userAgent, details }) {
    try {
      await getPool().execute(`INSERT INTO security_events
        (user_id,society_id,event_type,severity,identifier_masked,ip_address,user_agent,details)
        VALUES (?,?,?,?,?,?,?,?)`, [userId, societyId, eventType, severity, identifier ? maskIdentifier(identifier) : null,
        ipAddress || null, userAgent || null, details ? JSON.stringify(details) : null]);
    } catch (error) { console.error('Security event logging failed:', error.message); }
  }

  async dashboard(filters) {
    const pool = getPool();
    const days = Number(filters.days || 7);
    const limit = Number(filters.limit || 100);
    const params = [days];
    let auditWhere = `WHERE al.created_at >= UTC_TIMESTAMP() - INTERVAL ? DAY`;
    let eventWhere = `WHERE se.created_at >= UTC_TIMESTAMP() - INTERVAL ? DAY`;
    const eventParams = [days];
    if (filters.societyId) { auditWhere += ' AND al.society_id=?'; eventWhere += ' AND se.society_id=?'; params.push(filters.societyId); eventParams.push(filters.societyId); }
    if (filters.moduleName) { auditWhere += ' AND al.module_name=?'; params.push(filters.moduleName); }
    if (filters.severity) { eventWhere += ' AND se.severity=?'; eventParams.push(filters.severity); }

    const [auditLogs] = await pool.query(`SELECT al.id,al.module_name,al.action,al.record_id,al.ip_address,al.created_at,
      u.name user_name,s.society_name FROM audit_logs al LEFT JOIN users u ON u.id=al.user_id LEFT JOIN societies s ON s.id=al.society_id
      ${auditWhere} ORDER BY al.created_at DESC LIMIT ?`, [...params, limit]);
    const [events] = await pool.query(`SELECT se.*,u.name user_name,s.society_name,ru.name resolved_by_name FROM security_events se
      LEFT JOIN users u ON u.id=se.user_id LEFT JOIN societies s ON s.id=se.society_id LEFT JOIN users ru ON ru.id=se.resolved_by
      ${eventWhere} ORDER BY FIELD(se.status,'OPEN','IGNORED','RESOLVED'),FIELD(se.severity,'CRITICAL','HIGH','MEDIUM','LOW'),se.created_at DESC LIMIT ?`, [...eventParams, limit]);
    const [[summary]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM audit_logs WHERE created_at>=UTC_TIMESTAMP()-INTERVAL ? DAY) audit_count,
      (SELECT COUNT(*) FROM security_events WHERE created_at>=UTC_TIMESTAMP()-INTERVAL ? DAY) security_event_count,
      (SELECT COUNT(*) FROM security_events WHERE status='OPEN') open_events,
      (SELECT COUNT(*) FROM security_events WHERE status='OPEN' AND severity IN ('HIGH','CRITICAL')) high_risk_events,
      (SELECT COUNT(*) FROM users WHERE locked_until>UTC_TIMESTAMP() AND deleted_at IS NULL) locked_users,
      (SELECT COUNT(*) FROM refresh_tokens WHERE revoked_at IS NULL AND expires_at>UTC_TIMESTAMP()) active_sessions`, [days, days]);
    const [lockedUsers] = await pool.execute(`SELECT id,name,mobile,email,failed_login_attempts,locked_until,last_login FROM users
      WHERE locked_until>UTC_TIMESTAMP() AND deleted_at IS NULL ORDER BY locked_until DESC`);
    const [modules] = await pool.execute(`SELECT DISTINCT module_name FROM audit_logs ORDER BY module_name`);
    return { summary, auditLogs, events, lockedUsers, modules: modules.map(row => row.module_name) };
  }

  async resolveEvent(eventId, status, note, userId) {
    const [result] = await getPool().execute(`UPDATE security_events SET status=?,resolution_note=?,resolved_by=?,resolved_at=UTC_TIMESTAMP()
      WHERE id=? AND status='OPEN'`, [status, note || null, userId, eventId]);
    if (!result.affectedRows) throw new ApiError(404, 'Open security event not found');
  }

  async unlockUser(userId) {
    const [result] = await getPool().execute(`UPDATE users SET failed_login_attempts=0,locked_until=NULL WHERE id=? AND deleted_at IS NULL`, [userId]);
    if (!result.affectedRows) throw new ApiError(404, 'User not found');
  }

  async revokeSessions(userId) {
    const [result] = await getPool().execute(`UPDATE refresh_tokens SET revoked_at=COALESCE(revoked_at,UTC_TIMESTAMP()) WHERE user_id=? AND revoked_at IS NULL`, [userId]);
    return result.affectedRows;
  }
}

export default new SecurityRepository();
