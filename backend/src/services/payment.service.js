import repository from '../repositories/payment.repository.js';
import societySettingService from './society-setting.service.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const financialYear = (date, startMonth) => { const year = Number(date.slice(0, 4)); const month = Number(date.slice(5, 7)); const start = month >= Number(startMonth) ? year : year - 1; return `${start}-${String((start + 1) % 100).padStart(2, '0')}`; };
const money = (value) => Number(Number(value).toFixed(2));
const safePayment = (row) => ({ ...row, total_amount: Number(row.total_amount) });

class PaymentService {
  async outstanding(societyId) {
    return (await repository.outstandingBills(societyId)).map((row) => ({ ...row, total_amount: Number(row.total_amount), paid_amount: Number(row.paid_amount), balance_amount: Number(row.balance_amount) }));
  }
  async collect(societyId, payload, userId, meta) {
    const ids = payload.allocations.map((item) => Number(item.bill_id));
    if (new Set(ids).size !== ids.length) throw new ApiError(400, 'The same bill cannot be allocated more than once');
    const allocatedTotal = money(payload.allocations.reduce((sum, item) => sum + Number(item.amount), 0));
    if (allocatedTotal !== money(payload.total_amount)) throw new ApiError(400, 'Allocation total must match payment total');
    if (payload.payment_mode !== 'CASH' && !payload.reference_number?.trim()) throw new ApiError(400, 'Reference number is required for non-cash payments');
    if (payload.payment_mode === 'CHEQUE' && (!payload.bank_name?.trim() || !payload.cheque_date)) throw new ApiError(400, 'Bank name and cheque date are required for cheque payments');
    const settings = await societySettingService.get(societyId);
    const clean = { ...payload, total_amount: money(payload.total_amount), reference_number: payload.reference_number?.trim() || null, bank_name: payload.bank_name?.trim() || null, cheque_date: payload.cheque_date || null, payer_name: payload.payer_name?.trim() || null, payer_mobile: payload.payer_mobile?.trim() || null, payer_email: payload.payer_email?.trim().toLowerCase() || null, notes: payload.notes?.trim() || null, allocations: payload.allocations.map((item) => ({ bill_id: Number(item.bill_id), amount: money(item.amount) })) };
    let result;
    try { result = await repository.collect(societyId, clean, { financial_year: financialYear(clean.payment_date, settings.financial_year_start_month), prefix: settings.receipt_prefix }, userId); }
    catch (error) {
      if (['INVALID_BILLS', 'MULTIPLE_FLATS', 'SETTLED_BILL', 'OVERPAYMENT'].includes(error.code)) throw new ApiError(409, error.message);
      if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'This payment or receipt conflicts with an existing record');
      throw error;
    }
    await auditRepository.log({ societyId, userId, moduleName: 'maintenance_payments', action: 'collect', recordId: result.paymentId, newData: { ...result, total_amount: clean.total_amount, payment_mode: clean.payment_mode, bill_ids: ids }, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { payment_id: result.paymentId, receipt_id: result.receiptId, receipt_number: result.receiptNumber, total_amount: clean.total_amount };
  }
  async list(societyId) { return (await repository.list(societyId)).map(safePayment); }
  async receipt(societyId, id) {
    const row = await repository.getReceipt(societyId, id); if (!row) throw new ApiError(404, 'Receipt not found in the selected society');
    return { ...safePayment(row), amount: Number(row.amount), allocations: row.allocations.map((item) => ({ ...item, allocated_amount: Number(item.allocated_amount), total_amount: Number(item.total_amount), balance_amount: Number(item.balance_amount) })) };
  }
  async reverse(societyId, id, reason, userId, meta) {
    let result; try { result = await repository.reverse(societyId, id, reason.trim(), userId); }
    catch (error) {
      if (error.code === 'PAYMENT_NOT_FOUND') throw new ApiError(404, error.message);
      if (['PAYMENT_NOT_REVERSIBLE','INVALID_PAYMENT'].includes(error.code)) throw new ApiError(409, error.message);
      throw error;
    }
    await auditRepository.log({ societyId, userId, moduleName: 'maintenance_payments', action: 'reverse', recordId: id, newData: { reason: reason.trim(), affected_bill_ids: result.affectedBillIds }, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { payment_id: id, status: 'REVERSED', receipt_status: 'CANCELLED' };
  }
  async reconciliation(societyId, fromDate, toDate) {
    const rows = (await repository.reconciliation(societyId, fromDate, toDate)).map(safePayment);
    const successful = rows.filter((row) => row.status === 'SUCCESS');
    return { summary: { system_total: money(successful.reduce((sum, row) => sum + row.total_amount, 0)), matched_total: money(successful.filter((row) => row.reconciliation_status === 'MATCHED').reduce((sum, row) => sum + row.total_amount, 0)), unmatched_total: money(successful.filter((row) => row.reconciliation_status === 'UNMATCHED').reduce((sum, row) => sum + row.total_amount, 0)), matched_count: successful.filter((row) => row.reconciliation_status === 'MATCHED').length, total_count: successful.length }, transactions: rows };
  }
  async reconcile(societyId, id, payload, userId, meta) {
    const updated = await repository.reconcile(societyId, id, { status: payload.status, reference: payload.reference?.trim() || null, note: payload.note?.trim() || null }, userId);
    if (!updated) throw new ApiError(404, 'Successful payment not found in the selected society');
    await auditRepository.log({ societyId, userId, moduleName: 'payment_reconciliation', action: payload.status === 'MATCHED' ? 'match' : 'unmatch', recordId: id, newData: payload, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    return { payment_id: id, reconciliation_status: payload.status };
  }
}
export default new PaymentService();
