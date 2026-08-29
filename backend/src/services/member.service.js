import memberRepository from '../repositories/member.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';

const allowedTypes = ['OWNER', 'CO_OWNER', 'TENANT'];

class MemberService {
  list(societyId, memberType) {
    const normalizedType = memberType ? String(memberType).toUpperCase() : null;
    if (normalizedType && !allowedTypes.includes(normalizedType)) throw new ApiError(400, 'Invalid member type');
    return memberRepository.list(societyId, normalizedType);
  }

  async create(societyId, payload, userId, requestMeta) {
    if (!await memberRepository.getActiveFlat(societyId, payload.flat_id)) {
      throw new ApiError(404, 'Selected flat was not found in the selected society');
    }
    const mobile = normalizeMobile(payload.mobile);
    const existing = await memberRepository.findMemberByMobile(societyId, mobile);
    if (existing?.deleted_at || (existing && existing.status !== 'ACTIVE')) {
      throw new ApiError(409, 'This mobile belongs to an inactive member record');
    }
    const memberType = payload.member_type.toUpperCase();
    if (memberType === 'TENANT' && payload.occupancy_start && payload.occupancy_end
      && new Date(payload.occupancy_end) < new Date(payload.occupancy_start)) {
      throw new ApiError(400, 'Tenant end date must be after the start date');
    }
    const normalized = {
      name: payload.name.trim(), mobile, email: payload.email ? normalizeEmail(payload.email) : null,
      flat_id: payload.flat_id, member_type: memberType,
      ownership_percentage: memberType === 'TENANT' ? null : (payload.ownership_percentage || null),
      occupancy_start: payload.occupancy_start || null, occupancy_end: payload.occupancy_end || null,
      agreement_status: memberType === 'TENANT' ? payload.agreement_status : 'NOT_REQUIRED',
      police_noc_status: memberType === 'TENANT' ? payload.police_noc_status : 'NOT_REQUIRED',
      is_primary: Boolean(payload.is_primary),
    };
    let assignmentId;
    try { assignmentId = await memberRepository.createAssignment(societyId, normalized, userId); }
    catch (error) {
      if (error.code === 'DUPLICATE_ASSIGNMENT') throw new ApiError(409, error.message);
      throw error;
    }
    const member = await memberRepository.getById(societyId, assignmentId);
    await auditRepository.log({
      societyId, userId, moduleName: 'members', action: 'create_assignment', recordId: assignmentId,
      newData: member, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return member;
  }

  async remove(societyId, assignmentId, userId, requestMeta) {
    const current = await memberRepository.getById(societyId, assignmentId);
    if (!current) throw new ApiError(404, 'Member assignment not found in the selected society');
    if (current.status !== 'ACTIVE') throw new ApiError(409, 'Member assignment is already inactive');
    await memberRepository.deactivate(societyId, assignmentId, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'members', action: 'remove_assignment', recordId: assignmentId,
      oldData: current, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
  }
}

export default new MemberService();
