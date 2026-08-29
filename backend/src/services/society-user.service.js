import societyUserRepository from '../repositories/society-user.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { hashPassword } from '../utils/password-utils.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';

class SocietyUserService {
  list(societyId) { return societyUserRepository.list(societyId); }

  async createSocietyAdmin(societyId, payload, createdBy, requestMeta) {
    const mobile = normalizeMobile(payload.mobile);
    const email = payload.email ? normalizeEmail(payload.email) : null;
    const existing = await societyUserRepository.findUserByMobile(mobile);
    if (existing?.deleted_at) throw new ApiError(409, 'This mobile belongs to a deleted user account');
    if (existing && existing.status !== 'ACTIVE') throw new ApiError(409, 'This mobile belongs to an inactive or blocked user account');
    if (!existing && email && await societyUserRepository.findUserByEmail(email)) {
      throw new ApiError(409, 'Email address is already used by another user');
    }

    const passwordHash = existing ? null : await hashPassword(payload.password);
    const assignment = await societyUserRepository.assignSocietyAdmin(societyId, {
      name: payload.name.trim(), mobile, email,
    }, passwordHash, createdBy);
    const user = await societyUserRepository.getById(societyId, assignment.userId);
    await auditRepository.log({
      societyId, userId: createdBy, moduleName: 'society_users', action: 'assign_society_admin',
      recordId: assignment.userId, newData: { assigned_user_id: assignment.userId, account_created: assignment.created },
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return { user, account_created: assignment.created, existing_account_assigned: !assignment.created };
  }

  async setAccessStatus(societyId, targetUserId, status, actingUserId, requestMeta) {
    const current = await societyUserRepository.getById(societyId, targetUserId);
    if (!current) throw new ApiError(404, 'User does not belong to the selected society');
    if (Number(targetUserId) === Number(actingUserId) && status === 'INACTIVE') {
      throw new ApiError(400, 'You cannot deactivate your own society access');
    }
    if (status === 'INACTIVE' && current.roles.includes('SOCIETY_ADMIN') && await societyUserRepository.countActiveSocietyAdmins(societyId) <= 1) {
      throw new ApiError(409, 'Assign another Society Admin before deactivating the last active admin');
    }
    await societyUserRepository.setAccessStatus(societyId, targetUserId, status);
    await auditRepository.log({
      societyId, userId: actingUserId, moduleName: 'society_users', action: status === 'ACTIVE' ? 'activate_access' : 'deactivate_access',
      recordId: targetUserId, oldData: { access_status: current.access_status }, newData: { access_status: status },
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return societyUserRepository.getById(societyId, targetUserId);
  }
}

export default new SocietyUserService();
