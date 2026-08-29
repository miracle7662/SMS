import SocietyRepository from '../repositories/society.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import buildingRepository from '../repositories/building.repository.js';

const toSafeProfile = (society, buildingCount = society.buildings ?? 0) => ({
  id: society.id,
  society_code: society.society_code,
  society_name: society.society_name,
  registration_no: society.registration_no,
  registration_type: society.registration_type,
  address: society.address,
  city: society.city,
  state: society.state,
  pincode: society.pincode,
  pan_number: society.pan_number,
  email: society.email,
  mobile: society.mobile,
  logo: society.logo,
  established_date: society.established_date,
  buildings: buildingCount,
  flats: society.flats ?? 0,
  total_members: society.total_members ?? 0,
  status: society.status,
});

class SocietyProfileService {
  async get(societyId) {
    const society = await SocietyRepository.getById(societyId);
    if (!society || society.status !== 'ACTIVE') throw new ApiError(404, 'Active society not found');
    return toSafeProfile(society, await buildingRepository.count(societyId));
  }

  async update(societyId, payload, userId, ipAddress, userAgent) {
    const current = await SocietyRepository.getById(societyId);
    if (!current || current.status !== 'ACTIVE') throw new ApiError(404, 'Active society not found');

    const updated = await SocietyRepository.updateProfile(societyId, {
      ...payload,
      society_name: payload.society_name.trim(),
      email: payload.email ? normalizeEmail(payload.email) : null,
      mobile: payload.mobile ? normalizeMobile(payload.mobile) : null,
    }, userId);

    const buildingCount = await buildingRepository.count(societyId);
    const safeUpdated = toSafeProfile(updated, buildingCount);
    await auditRepository.log({
      societyId,
      userId,
      moduleName: 'society_profile',
      action: 'update',
      recordId: societyId,
      oldData: toSafeProfile(current, buildingCount),
      newData: safeUpdated,
      ipAddress,
      userAgent,
    });
    return safeUpdated;
  }
}

export default new SocietyProfileService();
