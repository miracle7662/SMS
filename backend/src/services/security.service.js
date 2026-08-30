import securityRepository from '../repositories/security.repository.js';
import auditRepository from '../repositories/audit.repository.js';

class SecurityService {
  dashboard(query) { return securityRepository.dashboard({ days: query.days, limit: query.limit, societyId: query.society_id, moduleName: query.module_name, severity: query.severity }); }
  async resolve(eventId, body, actor, meta) {
    await securityRepository.resolveEvent(eventId, body.status, body.resolution_note, actor);
    await auditRepository.log({ userId: actor, moduleName: 'platform_security', action: 'resolve_event', recordId: eventId, newData: body, ipAddress: meta.ip, userAgent: meta.userAgent });
    return this.dashboard({});
  }
  async unlock(userId, actor, meta) {
    await securityRepository.unlockUser(userId);
    await auditRepository.log({ userId: actor, moduleName: 'platform_security', action: 'unlock_user', recordId: userId, ipAddress: meta.ip, userAgent: meta.userAgent });
    return this.dashboard({});
  }
  async revoke(userId, actor, meta) {
    const count = await securityRepository.revokeSessions(userId);
    await auditRepository.log({ userId: actor, moduleName: 'platform_security', action: 'revoke_sessions', recordId: userId, newData: { revoked_sessions: count }, ipAddress: meta.ip, userAgent: meta.userAgent });
    return { revokedSessions: count };
  }
}
export default new SecurityService();
