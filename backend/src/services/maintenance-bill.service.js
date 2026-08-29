import repository from '../repositories/maintenance-bill.repository.js';
import previewService from './maintenance-preview.service.js';
import societySettingService from './society-setting.service.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const addDays = (date, days) => { const value = new Date(`${date}T00:00:00.000Z`); value.setUTCDate(value.getUTCDate() + Number(days)); return value.toISOString().slice(0, 10); };
const financialYear = (date, startMonth) => { const year = Number(date.slice(0, 4)); const month = Number(date.slice(5, 7)); const start = month >= Number(startMonth) ? year : year - 1; return `${start}-${String((start + 1) % 100).padStart(2, '0')}`; };
const safeBill = (bill) => ({ ...bill, subtotal: Number(bill.subtotal), gst_total: Number(bill.gst_total), rounding_adjustment: Number(bill.rounding_adjustment), total_amount: Number(bill.total_amount), paid_amount: Number(bill.paid_amount), balance_amount: Number(bill.balance_amount) });

class MaintenanceBillService {
  async generate(societyId, payload, userId, meta) {
    if (payload.period_end < payload.period_start) throw new ApiError(400, 'Period End must be on or after Period Start');
    const [settings, preview] = await Promise.all([societySettingService.get(societyId), previewService.preview(societyId, payload.billing_date)]);
    const requestedIds = payload.flat_ids?.length ? new Set(payload.flat_ids.map(Number)) : null;
    const selected = preview.flats.filter((flat) => !requestedIds || requestedIds.has(Number(flat.flat_id)));
    if (requestedIds && selected.length !== requestedIds.size) throw new ApiError(400, 'One or more selected flats do not belong to this society');
    if (!selected.length) throw new ApiError(400, 'Select at least one active flat');
    const missingRecipients = selected.filter((flat) => !flat.billing_recipient).map((flat) => `${flat.wing_name}-${flat.flat_no}`);
    if (missingRecipients.length) throw new ApiError(409, `Assign an owner or tenant before billing these flats: ${missingRecipients.join(', ')}`);
    const withoutCharges = selected.filter((flat) => !flat.charges.length || flat.total <= 0).map((flat) => `${flat.wing_name}-${flat.flat_no}`);
    if (withoutCharges.length) throw new ApiError(409, `No payable charges were calculated for: ${withoutCharges.join(', ')}`);
    const duplicates = await repository.findDuplicates(societyId, selected.map((flat) => flat.flat_id), payload.period_start, payload.period_end);
    if (duplicates.length) throw new ApiError(409, `Bills already exist for this period: ${duplicates.map((bill) => `${bill.flat_no} (${bill.bill_number})`).join(', ')}`);
    const run = {
      billing_date: payload.billing_date, period_start: payload.period_start, period_end: payload.period_end,
      due_date: addDays(payload.billing_date, settings.payment_due_days),
      financial_year: financialYear(payload.billing_date, settings.financial_year_start_month),
      total_amount: selected.reduce((sum, flat) => sum + flat.total, 0),
    };
    let generated;
    try { generated = await repository.generate(societyId, run, selected, settings, userId); }
    catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'A bill was generated for the same flat and period by another request');
      throw error;
    }
    await auditRepository.log({ societyId, userId, moduleName: 'maintenance_bills', action: 'generate', recordId: generated.runId, newData: { ...run, flat_count: selected.length, bill_ids: generated.billIds }, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { billing_run_id: generated.runId, financial_year: run.financial_year, billing_date: run.billing_date, due_date: run.due_date, period_start: run.period_start, period_end: run.period_end, bill_count: generated.billIds.length, total_amount: run.total_amount, bill_ids: generated.billIds };
  }
  async list(societyId) { return (await repository.list(societyId)).map(safeBill); }
  async get(societyId, id) {
    const bill = await repository.get(societyId, id); if (!bill) throw new ApiError(404, 'Maintenance bill not found in the selected society');
    return { ...safeBill(bill), items: bill.items.map((item) => ({ ...item, applied_rate: Number(item.applied_rate), base_amount: Number(item.base_amount), gst_rate: Number(item.gst_rate), gst_amount: Number(item.gst_amount), line_total: Number(item.line_total) })) };
  }
}
export default new MaintenanceBillService();
