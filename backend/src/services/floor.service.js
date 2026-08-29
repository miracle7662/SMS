import floorRepository from '../repositories/floor.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const defaultFloorName = (number) => number === 0 ? 'Ground Floor' : number < 0 ? `Basement ${Math.abs(number)}` : `Floor ${number}`;

class FloorService {
  list(societyId) { return floorRepository.list(societyId); }

  async generate(societyId, payload, userId, requestMeta) {
    const wing = await floorRepository.getWing(societyId, payload.building_id, payload.wing_id);
    if (!wing) throw new ApiError(404, 'Selected building and wing were not found in this society');
    const floors = Array.from({ length: payload.number_of_floors }, (_, index) => {
      const floorNumber = payload.start_floor + index;
      return { floor_number: floorNumber, floor_name: defaultFloorName(floorNumber) };
    });
    await floorRepository.generate(societyId, payload.building_id, payload.wing_id, floors, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'floors', action: 'generate', recordId: payload.wing_id,
      newData: { building_id: payload.building_id, wing_id: payload.wing_id, floors },
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return { generated_count: floors.length, floors: await floorRepository.list(societyId) };
  }

  async update(societyId, floorId, payload, userId, requestMeta) {
    const current = await floorRepository.getById(societyId, floorId);
    if (!current) throw new ApiError(404, 'Floor not found in the selected society');
    if (await floorRepository.findByNumber(societyId, current.wing_id, payload.floor_number, floorId)) {
      throw new ApiError(409, 'Floor number already exists in this wing');
    }
    const updated = await floorRepository.update(societyId, floorId, payload.floor_number, payload.floor_name.trim(), userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'floors', action: 'update', recordId: floorId,
      oldData: current, newData: updated, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return updated;
  }

  async remove(societyId, floorId, userId, requestMeta) {
    const current = await floorRepository.getById(societyId, floorId);
    if (!current) throw new ApiError(404, 'Floor not found in the selected society');
    await floorRepository.softDelete(societyId, floorId, userId);
    await auditRepository.log({
      societyId, userId, moduleName: 'floors', action: 'delete', recordId: floorId,
      oldData: current, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
  }
}

export default new FloorService();
