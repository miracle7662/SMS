import repository from '../repositories/society-setting.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import SocietyRepository from '../repositories/society.repository.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';

const defaults = {
  financial_year_start_month: 4, billing_frequency: 'MONTHLY', bill_generation_day: 1,
  payment_due_days: 10, grace_period_days: 0, late_fee_type: 'PERCENTAGE', late_fee_value: 0,
  interest_rate_per_annum: 0, rounding_mode: 'NEAREST_RUPEE', bill_prefix: 'BILL/', receipt_prefix: 'RCT/',
  tenant_bill_to: 'OWNER', non_occupancy_enabled: false, non_occupancy_percentage: 0,
  require_tenant_police_noc: true, gst_registered: false, gstin: null, bank_name: null,
  bank_account_name: null, bank_account_number: null, bank_ifsc: null, bank_branch: null, upi_id: null,
  online_payment_enabled: false, currency_code: 'INR', timezone: 'Asia/Kolkata', date_format: 'DD/MM/YYYY',
  committee_contact_name: null, committee_contact_mobile: null, committee_contact_email: null,
};
const safe = (row) => {
  const source = { ...defaults, ...(row || {}) };
  const result = Object.fromEntries(Object.keys(defaults).map((key) => [key, source[key]]));
  return {
    ...result,
    late_fee_value: Number(source.late_fee_value), interest_rate_per_annum: Number(source.interest_rate_per_annum),
    non_occupancy_percentage: Number(source.non_occupancy_percentage),
    non_occupancy_enabled: Boolean(source.non_occupancy_enabled), require_tenant_police_noc: Boolean(source.require_tenant_police_noc),
    gst_registered: Boolean(source.gst_registered), online_payment_enabled: Boolean(source.online_payment_enabled),
  };
};

class SocietySettingService {
  async ensureSociety(societyId) {
    const society = await SocietyRepository.getById(societyId);
    if (!society || society.status !== 'ACTIVE') throw new ApiError(404, 'Active society not found');
  }
  async get(societyId) { await this.ensureSociety(societyId); return safe(await repository.get(societyId)); }
  async update(societyId, payload, userId, requestMeta) {
    await this.ensureSociety(societyId); const current = await this.get(societyId);
    const settings = {
      ...payload, bill_prefix: payload.bill_prefix.trim().toUpperCase(), receipt_prefix: payload.receipt_prefix.trim().toUpperCase(),
      gstin: payload.gst_registered && payload.gstin ? payload.gstin.trim().toUpperCase() : null,
      bank_name: payload.bank_name?.trim() || null, bank_account_name: payload.bank_account_name?.trim() || null,
      bank_account_number: payload.bank_account_number?.trim() || null, bank_ifsc: payload.bank_ifsc?.trim().toUpperCase() || null,
      bank_branch: payload.bank_branch?.trim() || null, upi_id: payload.upi_id?.trim().toLowerCase() || null,
      committee_contact_name: payload.committee_contact_name?.trim() || null,
      committee_contact_mobile: payload.committee_contact_mobile ? normalizeMobile(payload.committee_contact_mobile) : null,
      committee_contact_email: payload.committee_contact_email ? normalizeEmail(payload.committee_contact_email) : null,
    };
    if (settings.late_fee_type === 'NONE') settings.late_fee_value = 0;
    if (!settings.non_occupancy_enabled) settings.non_occupancy_percentage = 0;
    const updated = safe(await repository.upsert(societyId, settings, userId));
    await auditRepository.log({ societyId, userId, moduleName: 'society_settings', action: 'update', recordId: societyId, oldData: current, newData: updated, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
    return updated;
  }
}

export default new SocietySettingService();
