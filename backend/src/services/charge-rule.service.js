import repository from '../repositories/charge-rule.repository.js';
import chargeTypeRepository from '../repositories/charge-type.repository.js';
import flatRepository from '../repositories/flat.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const priorities = { ALL_FLATS: 100, OCCUPANCY_STATUS: 200, FLAT_TYPE: 300, SPECIFIC_FLAT: 400 };
const safe = (row) => row && ({ ...row, rate: Number(row.rate), minimum_amount: row.minimum_amount === null ? null : Number(row.minimum_amount), maximum_amount: row.maximum_amount === null ? null : Number(row.maximum_amount), proration_enabled: Boolean(row.proration_enabled) });
const normalize = (payload) => {
  const scope = payload.applicability_scope;
  return {
    charge_type_id: Number(payload.charge_type_id), rule_name: payload.rule_name.trim(), applicability_scope: scope,
    flat_type: scope === 'FLAT_TYPE' ? (payload.flat_type || '').trim() : null,
    occupancy_status: scope === 'OCCUPANCY_STATUS' ? payload.occupancy_status : null,
    flat_id: scope === 'SPECIFIC_FLAT' ? Number(payload.flat_id) : null,
    rate: Number(payload.rate), minimum_amount: payload.minimum_amount === null || payload.minimum_amount === '' ? null : Number(payload.minimum_amount),
    maximum_amount: payload.maximum_amount === null || payload.maximum_amount === '' ? null : Number(payload.maximum_amount),
    effective_from: payload.effective_from, effective_to: payload.effective_to || null,
    priority: priorities[scope], proration_enabled: Boolean(payload.proration_enabled),
    description: payload.description?.trim() || null, status: payload.status,
  };
};

class ChargeRuleService {
  async list(societyId) { return (await repository.list(societyId)).map(safe); }
  async get(societyId, id) { const row = await repository.get(societyId, id); if (!row) throw new ApiError(404, 'Charge rule not found in the selected society'); return safe(row); }
  async validate(societyId, value, excludeId = null) {
    const chargeType = await chargeTypeRepository.get(societyId, value.charge_type_id);
    if (!chargeType || chargeType.status !== 'ACTIVE') throw new ApiError(404, 'Active charge type not found in the selected society');
    if (chargeType.calculation_basis === 'PERCENTAGE_OF_MAINTENANCE' && value.rate > 100) throw new ApiError(400, 'Percentage rate cannot exceed 100');
    if (value.effective_to && value.effective_to < value.effective_from) throw new ApiError(400, 'Effective To date must be on or after Effective From date');
    if (value.minimum_amount !== null && value.maximum_amount !== null && value.maximum_amount < value.minimum_amount) throw new ApiError(400, 'Maximum amount cannot be less than minimum amount');
    if (value.applicability_scope === 'FLAT_TYPE') {
      if (!value.flat_type) throw new ApiError(400, 'Flat type is required for this rule');
      const flats = await flatRepository.list(societyId);
      if (!flats.some((flat) => flat.flat_type === value.flat_type)) throw new ApiError(400, 'Selected flat type does not exist in this society');
    }
    if (value.applicability_scope === 'OCCUPANCY_STATUS' && !value.occupancy_status) throw new ApiError(400, 'Occupancy status is required for this rule');
    if (value.applicability_scope === 'SPECIFIC_FLAT' && !Number.isInteger(value.flat_id)) throw new ApiError(400, 'Flat is required for this rule');
    if (value.applicability_scope === 'SPECIFIC_FLAT' && !await flatRepository.getById(societyId, value.flat_id)) throw new ApiError(404, 'Selected flat was not found in this society');
    if (value.status === 'ACTIVE') {
      const overlap = await repository.findOverlap(societyId, value, excludeId);
      if (overlap) throw new ApiError(409, `Rule overlaps with "${overlap.rule_name}" for the same target and date range`);
    }
  }
  async create(societyId, payload, userId, meta) {
    const value = normalize(payload); await this.validate(societyId, value);
    const created = safe(await repository.create(societyId, value, userId));
    await auditRepository.log({ societyId, userId, moduleName: 'charge_rules', action: 'create', recordId: created.id, newData: created, ipAddress: meta.ipAddress, userAgent: meta.userAgent }); return created;
  }
  async update(societyId, id, payload, userId, meta) {
    const current = await this.get(societyId, id); const value = normalize(payload); await this.validate(societyId, value, id);
    const updated = safe(await repository.update(societyId, id, value, userId));
    await auditRepository.log({ societyId, userId, moduleName: 'charge_rules', action: 'update', recordId: id, oldData: current, newData: updated, ipAddress: meta.ipAddress, userAgent: meta.userAgent }); return updated;
  }
  async remove(societyId, id, userId, meta) {
    const current = await this.get(societyId, id); await repository.remove(societyId, id, userId);
    await auditRepository.log({ societyId, userId, moduleName: 'charge_rules', action: 'delete', recordId: id, oldData: current, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
  }
}
export default new ChargeRuleService();
