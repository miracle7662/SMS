import flatRepository from '../repositories/flat.repository.js';
import memberRepository from '../repositories/member.repository.js';
import chargeTypeRepository from '../repositories/charge-type.repository.js';
import chargeRuleRepository from '../repositories/charge-rule.repository.js';
import societySettingService from './society-setting.service.js';

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const selectRule = (rules, chargeTypeId, flat, date) => rules
  .filter((rule) => Number(rule.charge_type_id) === Number(chargeTypeId)
    && rule.status === 'ACTIVE' && String(rule.effective_from).slice(0, 10) <= date
    && (!rule.effective_to || String(rule.effective_to).slice(0, 10) >= date)
    && (rule.applicability_scope === 'ALL_FLATS'
      || (rule.applicability_scope === 'FLAT_TYPE' && rule.flat_type === flat.flat_type)
      || (rule.applicability_scope === 'OCCUPANCY_STATUS' && rule.occupancy_status === flat.occupancy_status)
      || (rule.applicability_scope === 'SPECIFIC_FLAT' && Number(rule.flat_id) === Number(flat.id))))
  .sort((a, b) => Number(b.priority) - Number(a.priority))[0] || null;

const clamp = (amount, minimum, maximum) => {
  let value = amount;
  if (minimum !== null && minimum !== undefined) value = Math.max(value, Number(minimum));
  if (maximum !== null && maximum !== undefined) value = Math.min(value, Number(maximum));
  return value;
};
const applyRounding = (value, mode) => mode === 'NEAREST_RUPEE' ? Math.round(value) : mode === 'UP_TO_RUPEE' ? Math.ceil(value) : round2(value);
const frequencyDue = (type, settings, billingDate, rule) => {
  const frequency = type.billing_frequency === 'INHERIT' ? settings.billing_frequency : type.billing_frequency;
  if (frequency === 'MONTHLY') return true;
  if (frequency === 'ONE_TIME') return Boolean(rule && String(rule.effective_from).slice(0, 10) === billingDate);
  const month = Number(billingDate.slice(5, 7));
  const offset = (month - Number(settings.financial_year_start_month) + 12) % 12;
  return frequency === 'QUARTERLY' ? offset % 3 === 0 : frequency === 'HALF_YEARLY' ? offset % 6 === 0 : offset === 0;
};

class MaintenancePreviewService {
  async preview(societyId, billingDate) {
    const [settings, flats, members, chargeTypes, rules] = await Promise.all([
      societySettingService.get(societyId), flatRepository.list(societyId), memberRepository.list(societyId),
      chargeTypeRepository.list(societyId), chargeRuleRepository.list(societyId),
    ]);
    const activeFlats = flats.filter((flat) => flat.status === 'ACTIVE');
    const activeTypes = chargeTypes.filter((type) => type.status === 'ACTIVE');
    const warnings = [];
    if (!activeTypes.length) warnings.push('No active charge types are configured.');
    if (settings.non_occupancy_enabled && !activeTypes.some((type) => type.charge_code === 'NON_OCCUPANCY')) {
      warnings.push('Non-occupancy is enabled, but an active NON_OCCUPANCY charge type has not been created.');
    }

    const previewFlats = activeFlats.map((flat) => {
      const flatMembers = members.filter((member) => Number(member.flat_id) === Number(flat.id) && member.status === 'ACTIVE');
      const owner = flatMembers.find((member) => member.member_type === 'OWNER') || flatMembers.find((member) => member.member_type === 'CO_OWNER');
      const tenant = flatMembers.find((member) => member.member_type === 'TENANT');
      const recipient = settings.tenant_bill_to === 'TENANT' && tenant ? tenant : owner || tenant || null;
      const selected = activeTypes.map((type) => {
        if (type.charge_code === 'NON_OCCUPANCY' && (!settings.non_occupancy_enabled || flat.occupancy_status !== 'RENTED')) return null;
        const rule = selectRule(rules, type.id, flat, billingDate);
        if (!frequencyDue(type, settings, billingDate, rule)) return null;
        let rate = rule ? Number(rule.rate) : type.default_rate === null ? null : Number(type.default_rate);
        if (type.charge_code === 'NON_OCCUPANCY' && !rule && settings.non_occupancy_percentage > 0) rate = Number(settings.non_occupancy_percentage);
        if (rate === null) return null;
        return { type, rule, rate };
      }).filter(Boolean);

      const lines = []; const calculationWarnings = [];
      for (const item of selected.filter((item) => item.type.calculation_basis !== 'PERCENTAGE_OF_MAINTENANCE')) {
        let amount = item.rate;
        if (item.type.calculation_basis === 'PER_CARPET_SQFT') {
          if (!Number(flat.carpet_area_sqft)) calculationWarnings.push(`${item.type.charge_name}: carpet area is missing`);
          amount = item.rate * Number(flat.carpet_area_sqft || 0);
        }
        if (item.type.calculation_basis === 'PER_BUILTUP_SQFT') {
          if (!Number(flat.builtup_area_sqft)) calculationWarnings.push(`${item.type.charge_name}: built-up area is missing`);
          amount = item.rate * Number(flat.builtup_area_sqft || 0);
        }
        amount = round2(clamp(amount, item.rule?.minimum_amount, item.rule?.maximum_amount));
        lines.push(this.line(item, amount));
      }
      const maintenanceBase = round2(lines.filter((line) => line.category === 'MAINTENANCE').reduce((sum, line) => sum + line.amount, 0));
      for (const item of selected.filter((item) => item.type.calculation_basis === 'PERCENTAGE_OF_MAINTENANCE')) {
        if (!maintenanceBase) calculationWarnings.push(`${item.type.charge_name}: maintenance base is zero`);
        const amount = round2(clamp(maintenanceBase * item.rate / 100, item.rule?.minimum_amount, item.rule?.maximum_amount));
        lines.push(this.line(item, amount));
      }
      const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
      const gstTotal = round2(lines.reduce((sum, line) => sum + line.gst_amount, 0));
      const unroundedTotal = round2(subtotal + gstTotal); const total = applyRounding(unroundedTotal, settings.rounding_mode);
      return {
        flat_id: flat.id, flat_no: flat.flat_no, flat_type: flat.flat_type, building_name: flat.building_name,
        wing_name: flat.wing_name, occupancy_status: flat.occupancy_status,
        billing_recipient_member_id: recipient?.member_id || null, billing_recipient: recipient?.name || null,
        billing_recipient_mobile: recipient?.mobile || null, billing_recipient_email: recipient?.email || null,
        maintenance_base: maintenanceBase, subtotal, gst_total: gstTotal, rounding_adjustment: round2(total - unroundedTotal), total,
        non_occupancy_amount: round2(lines.filter((line) => line.charge_code === 'NON_OCCUPANCY').reduce((sum, line) => sum + line.amount, 0)),
        calculation_warnings: calculationWarnings, charges: lines,
      };
    });
    return {
      billing_date: billingDate, settings: { rounding_mode: settings.rounding_mode, tenant_bill_to: settings.tenant_bill_to, non_occupancy_enabled: settings.non_occupancy_enabled, non_occupancy_percentage: settings.non_occupancy_percentage },
      summary: { flat_count: previewFlats.length, rented_flat_count: previewFlats.filter((flat) => flat.occupancy_status === 'RENTED').length, charge_line_count: previewFlats.reduce((sum, flat) => sum + flat.charges.length, 0), total_amount: round2(previewFlats.reduce((sum, flat) => sum + flat.total, 0)), non_occupancy_total: round2(previewFlats.reduce((sum, flat) => sum + flat.non_occupancy_amount, 0)) },
      warnings, flats: previewFlats,
    };
  }

  line(item, amount) {
    const gstRate = item.type.is_taxable ? Number(item.type.gst_rate) : 0;
    return { charge_type_id: item.type.id, charge_code: item.type.charge_code, charge_name: item.type.charge_name,
      category: item.type.category, calculation_basis: item.type.calculation_basis, rule_id: item.rule?.id || null,
      rule_name: item.rule?.rule_name || 'Default Rate', rate: item.rate, amount, gst_rate: gstRate,
      gst_amount: round2(amount * gstRate / 100), total: round2(amount + amount * gstRate / 100) };
  }
}
export default new MaintenancePreviewService();
