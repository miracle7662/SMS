import flatRepository from '../repositories/flat.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const cleanFlatNo = (value) => value.trim().toUpperCase().replace(/\s+/g, '');

class FlatService {
  list(societyId) { return flatRepository.list(societyId); }

  async get(societyId, flatId) {
    const flat = await flatRepository.getById(societyId, flatId);
    if (!flat) throw new ApiError(404, 'Flat not found in the selected society');
    return flat;
  }

  async generate(societyId, payload, userId, requestMeta) {
    const floor = await flatRepository.getFloor(societyId, payload.building_id, payload.wing_id, payload.floor_id);
    if (!floor) throw new ApiError(404, 'Selected building, wing and floor combination was not found');
    const prefix = cleanFlatNo(payload.flat_prefix || '');
    const flats = Array.from({ length: payload.number_of_flats }, (_, index) => ({
      flat_no: `${prefix}${String(payload.start_number + index).padStart(payload.pad_length, '0')}`,
      flat_type: payload.flat_type.trim(),
      carpet_area_sqft: payload.carpet_area_sqft || null,
      builtup_area_sqft: payload.builtup_area_sqft || null,
    }));
    const conflicts = await flatRepository.findNumbers(societyId, flats.map((flat) => flat.flat_no));
    if (conflicts.length) throw new ApiError(409, `Flat number already exists: ${conflicts.map((flat) => flat.flat_no).join(', ')}`);

    await flatRepository.generate(societyId, payload, flats, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'flats', action: 'generate', recordId: payload.floor_id,
      newData: { structure: payload, flat_numbers: flats.map((flat) => flat.flat_no) },
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return { generated_count: flats.length, flats: await flatRepository.list(societyId) };
  }

  async update(societyId, flatId, payload, userId, requestMeta) {
    const current = await this.get(societyId, flatId);
    const flatNo = cleanFlatNo(payload.flat_no);
    if ((await flatRepository.findNumbers(societyId, [flatNo], flatId)).length) {
      throw new ApiError(409, 'Flat number already exists in this society');
    }
    const updated = await flatRepository.update(societyId, flatId, {
      ...payload, flat_no: flatNo, flat_type: payload.flat_type.trim(),
      carpet_area_sqft: payload.carpet_area_sqft || null,
      builtup_area_sqft: payload.builtup_area_sqft || null,
    }, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'flats', action: 'update', recordId: flatId,
      oldData: current, newData: updated, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return updated;
  }

  async remove(societyId, flatId, userId, requestMeta) {
    const current = await this.get(societyId, flatId);
    await flatRepository.softDelete(societyId, flatId, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'flats', action: 'delete', recordId: flatId,
      oldData: current, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
  }
}

export default new FlatService();
