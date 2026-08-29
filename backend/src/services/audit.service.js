import auditRepository from '../repositories/audit.repository.js';

export class AuditService {
  async logAuthAction(userId, action, societyId = null, ipAddress = null, userAgent = null) {
    await auditRepository.log({
      userId,
      societyId,
      moduleName: 'authentication',
      action,
      ipAddress,
      userAgent,
    });
  }

  async logAction(userId, moduleName, action, recordId = null, oldData = null, newData = null, societyId = null) {
    await auditRepository.log({
      userId,
      societyId,
      moduleName,
      action,
      recordId,
      oldData,
      newData,
    });
  }
}

export default new AuditService();
