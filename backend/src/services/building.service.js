import buildingRepository from '../repositories/building.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const normalizeCode = (value) => value.trim().toUpperCase().replace(/\s+/g, '-');
const normalizeWings = (wings) => wings.map((wing) => ({
  wing_code: normalizeCode(wing.wing_code),
  wing_name: wing.wing_name.trim(),
}));

class BuildingService {
  list(societyId) { return buildingRepository.list(societyId); }

  async create(societyId, payload, userId, requestMeta) {
    const buildingCode = normalizeCode(payload.building_code);
    if (await buildingRepository.findByCode(societyId, buildingCode)) {
      throw new ApiError(409, 'Building code already exists in this society');
    }
    const wings = normalizeWings(payload.wings);
    if (new Set(wings.map((wing) => wing.wing_code)).size !== wings.length) {
      throw new ApiError(400, 'Wing codes must be unique within a building');
    }
    const created = await buildingRepository.create(societyId, {
      ...payload,
      building_code: buildingCode,
      building_name: payload.building_name.trim(),
    }, wings, userId);
    await this.audit('create', societyId, userId, created, null, requestMeta);
    return created;
  }

  async update(societyId, buildingId, payload, userId, requestMeta) {
    const current = await buildingRepository.getById(societyId, buildingId);
    if (!current) throw new ApiError(404, 'Building not found in the selected society');
    const buildingCode = normalizeCode(payload.building_code);
    if (await buildingRepository.findByCode(societyId, buildingCode, buildingId)) {
      throw new ApiError(409, 'Building code already exists in this society');
    }
    const wings = normalizeWings(payload.wings);
    if (new Set(wings.map((wing) => wing.wing_code)).size !== wings.length) {
      throw new ApiError(400, 'Wing codes must be unique within a building');
    }
    const updated = await buildingRepository.update(societyId, buildingId, {
      ...payload,
      building_code: buildingCode,
      building_name: payload.building_name.trim(),
    }, wings, userId);
    await this.audit('update', societyId, userId, updated, current, requestMeta);
    return updated;
  }

  async remove(societyId, buildingId, userId, requestMeta) {
    const current = await buildingRepository.getById(societyId, buildingId);
    if (!current) throw new ApiError(404, 'Building not found in the selected society');
    await buildingRepository.softDelete(societyId, buildingId, userId);
    await this.audit('delete', societyId, userId, null, current, requestMeta);
  }

  async audit(action, societyId, userId, newData, oldData, requestMeta) {
    await auditRepository.log({
      societyId, userId, moduleName: 'buildings', action,
      recordId: newData?.id ?? oldData?.id, oldData, newData,
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
  }
}

export default new BuildingService();
