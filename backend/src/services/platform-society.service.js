import SocietyRepository from '../repositories/society.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';

class PlatformSocietyService {
  async list() {
    return SocietyRepository.getAllForSuperAdmin();
  }

  async create(payload, userId, ipAddress, userAgent) {
    const societyCode = payload.society_code.trim().toUpperCase();
    if (await SocietyRepository.findByCode(societyCode)) {
      throw new ApiError(409, 'Society code already exists');
    }

    const society = await SocietyRepository.create({
      ...payload,
      society_code: societyCode,
      society_name: payload.society_name.trim(),
      email: payload.email ? normalizeEmail(payload.email) : null,
      mobile: payload.mobile ? normalizeMobile(payload.mobile) : null,
    }, userId);

    await auditRepository.log({
      userId,
      societyId: society.id,
      moduleName: 'platform_societies',
      action: 'create',
      recordId: society.id,
      newData: society,
      ipAddress,
      userAgent,
    });

    return society;
  }
}

export default new PlatformSocietyService();
