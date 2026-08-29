import repository from '../repositories/charge-type.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const safe = (row) => row && ({ ...row, default_rate: row.default_rate === null ? null : Number(row.default_rate), gst_rate: Number(row.gst_rate), is_taxable: Boolean(row.is_taxable) });
const normalize = (payload) => ({
  charge_code: payload.charge_code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, ''),
  charge_name: payload.charge_name.trim(), category: payload.category, calculation_basis: payload.calculation_basis,
  default_rate: payload.default_rate === null || payload.default_rate === '' ? null : Number(payload.default_rate),
  billing_frequency: payload.billing_frequency, is_taxable: Boolean(payload.is_taxable),
  gst_rate: payload.is_taxable ? Number(payload.gst_rate) : 0, description: payload.description?.trim() || null,
  display_order: Number(payload.display_order), status: payload.status,
});

class ChargeTypeService {
  async list(societyId) { return (await repository.list(societyId)).map(safe); }
  async get(societyId, id) { const row = await repository.get(societyId, id); if (!row) throw new ApiError(404, 'Charge type not found in the selected society'); return safe(row); }
  async create(societyId, payload, userId, meta) {
    const value = normalize(payload); if (!value.charge_code) throw new ApiError(400, 'Charge code must contain letters or numbers');
    if (await repository.findByCode(societyId, value.charge_code)) throw new ApiError(409, 'Charge code already exists in this society');
    const created = safe(await repository.create(societyId, value, userId));
    await auditRepository.log({ societyId, userId, moduleName: 'charge_types', action: 'create', recordId: created.id, newData: created, ipAddress: meta.ipAddress, userAgent: meta.userAgent }); return created;
  }
  async update(societyId, id, payload, userId, meta) {
    const current = await this.get(societyId, id); const value = normalize(payload);
    if (!value.charge_code) throw new ApiError(400, 'Charge code must contain letters or numbers');
    if (await repository.findByCode(societyId, value.charge_code, id)) throw new ApiError(409, 'Charge code already exists in this society');
    const updated = safe(await repository.update(societyId, id, value, userId));
    await auditRepository.log({ societyId, userId, moduleName: 'charge_types', action: 'update', recordId: id, oldData: current, newData: updated, ipAddress: meta.ipAddress, userAgent: meta.userAgent }); return updated;
  }
  async remove(societyId, id, userId, meta) {
    const current = await this.get(societyId, id); await repository.remove(societyId, id, userId);
    await auditRepository.log({ societyId, userId, moduleName: 'charge_types', action: 'delete', recordId: id, oldData: current, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
  }
}
export default new ChargeTypeService();
