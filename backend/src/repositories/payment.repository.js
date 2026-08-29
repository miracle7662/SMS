import { getPool } from '../config/database.js';

class PaymentRepository {
  async outstandingBills(societyId) {
    const [rows] = await getPool().execute(
      `SELECT mb.id, mb.bill_number, mb.flat_id, fl.flat_no, b.building_name, w.wing_name,
              mb.recipient_member_id, mb.recipient_name, mb.recipient_mobile, mb.recipient_email,
              mb.due_date, mb.total_amount, mb.paid_amount, mb.balance_amount,
              CASE WHEN mb.due_date < CURRENT_DATE THEN 'OVERDUE' ELSE mb.status END AS status
       FROM maintenance_bills mb INNER JOIN flats fl ON fl.id = mb.flat_id AND fl.society_id = mb.society_id
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = mb.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE mb.society_id = ? AND mb.balance_amount > 0 AND mb.status NOT IN ('PAID','CANCELLED')
       ORDER BY mb.due_date, mb.id`, [societyId]
    ); return rows;
  }

  async collect(societyId, payload, receipt, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const billIds = payload.allocations.map((item) => item.bill_id);
      const placeholders = billIds.map(() => '?').join(',');
      const [bills] = await connection.execute(
        `SELECT id, flat_id, recipient_member_id, recipient_name, recipient_mobile, recipient_email,
                balance_amount, status FROM maintenance_bills
         WHERE society_id = ? AND id IN (${placeholders}) FOR UPDATE`, [societyId, ...billIds]
      );
      if (bills.length !== billIds.length) throw Object.assign(new Error('One or more bills were not found in the selected society'), { code: 'INVALID_BILLS' });
      if (new Set(bills.map((bill) => Number(bill.flat_id))).size !== 1) throw Object.assign(new Error('All allocated bills must belong to the same flat'), { code: 'MULTIPLE_FLATS' });
      for (const allocation of payload.allocations) {
        const bill = bills.find((item) => Number(item.id) === Number(allocation.bill_id));
        if (bill.status === 'CANCELLED' || Number(bill.balance_amount) <= 0) throw Object.assign(new Error('A selected bill is already settled or cancelled'), { code: 'SETTLED_BILL' });
        if (Number(allocation.amount) > Number(bill.balance_amount)) throw Object.assign(new Error(`Payment exceeds balance for bill ID ${bill.id}`), { code: 'OVERPAYMENT' });
      }
      const firstBill = bills[0];
      const [paymentResult] = await connection.execute(
        `INSERT INTO maintenance_payments
         (society_id, flat_id, payer_member_id, payment_date, payment_mode, reference_number,
          bank_name, cheque_date, total_amount, notes, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?)`,
        [societyId, firstBill.flat_id, payload.payer_member_id || firstBill.recipient_member_id,
          payload.payment_date, payload.payment_mode, payload.reference_number, payload.bank_name,
          payload.cheque_date, payload.total_amount, payload.notes, userId]
      );
      for (const allocation of payload.allocations) {
        const bill = bills.find((item) => Number(item.id) === Number(allocation.bill_id));
        const paid = Number(bill.balance_amount) - Number(allocation.amount);
        await connection.execute(
          `INSERT INTO maintenance_payment_allocations (society_id, payment_id, bill_id, allocated_amount)
           VALUES (?, ?, ?, ?)`, [societyId, paymentResult.insertId, bill.id, allocation.amount]
        );
        await connection.execute(
          `UPDATE maintenance_bills SET paid_amount = paid_amount + ?, balance_amount = ?,
             status = CASE WHEN ? <= 0 THEN 'PAID' ELSE 'PARTIALLY_PAID' END
           WHERE id = ? AND society_id = ?`, [allocation.amount, paid, paid, bill.id, societyId]
        );
      }
      await connection.execute(
        `INSERT INTO society_document_sequences (society_id, document_type, financial_year, next_number)
         VALUES (?, 'RECEIPT', ?, 1) ON DUPLICATE KEY UPDATE next_number = next_number`,
        [societyId, receipt.financial_year]
      );
      const [sequences] = await connection.execute(
        `SELECT id, next_number FROM society_document_sequences
         WHERE society_id = ? AND document_type = 'RECEIPT' AND financial_year = ? FOR UPDATE`,
        [societyId, receipt.financial_year]
      );
      const separator = receipt.prefix.endsWith('/') ? '' : '/';
      const receiptNumber = `${receipt.prefix}${separator}${receipt.financial_year}/${String(sequences[0].next_number).padStart(6, '0')}`;
      const [receiptResult] = await connection.execute(
        `INSERT INTO maintenance_receipts
         (society_id, payment_id, receipt_number, financial_year, receipt_date, payer_name,
          payer_mobile, payer_email, payment_mode, reference_number, amount, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?)`,
        [societyId, paymentResult.insertId, receiptNumber, receipt.financial_year, payload.payment_date,
          payload.payer_name || firstBill.recipient_name || 'Member', payload.payer_mobile || firstBill.recipient_mobile,
          payload.payer_email || firstBill.recipient_email, payload.payment_mode, payload.reference_number,
          payload.total_amount, userId]
      );
      await connection.execute(`UPDATE society_document_sequences SET next_number = next_number + 1 WHERE id = ?`, [sequences[0].id]);
      await connection.commit();
      return { paymentId: paymentResult.insertId, receiptId: receiptResult.insertId, receiptNumber };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async list(societyId) {
    const [rows] = await getPool().execute(
      `SELECT p.id, p.payment_date, p.payment_mode, p.reference_number, p.bank_name, p.total_amount,
              p.status, p.reversal_reason, p.reconciliation_status, p.created_at,
              r.id AS receipt_id, r.receipt_number, r.payer_name, r.status AS receipt_status,
              fl.flat_no, b.building_name, w.wing_name
       FROM maintenance_payments p INNER JOIN maintenance_receipts r ON r.payment_id = p.id AND r.society_id = p.society_id
       INNER JOIN flats fl ON fl.id = p.flat_id AND fl.society_id = p.society_id
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = p.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE p.society_id = ? ORDER BY p.payment_date DESC, p.id DESC`, [societyId]
    ); return rows;
  }

  async reverse(societyId, paymentId, reason, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [payments] = await connection.execute(
        `SELECT id, status FROM maintenance_payments WHERE id = ? AND society_id = ? FOR UPDATE`,
        [paymentId, societyId]
      );
      if (!payments[0]) throw Object.assign(new Error('Payment not found in the selected society'), { code: 'PAYMENT_NOT_FOUND' });
      if (payments[0].status !== 'SUCCESS') throw Object.assign(new Error('Only a successful payment can be reversed'), { code: 'PAYMENT_NOT_REVERSIBLE' });
      const [allocations] = await connection.execute(
        `SELECT a.bill_id, a.allocated_amount, mb.paid_amount, mb.balance_amount, mb.due_date, mb.status
         FROM maintenance_payment_allocations a
         INNER JOIN maintenance_bills mb ON mb.id = a.bill_id AND mb.society_id = a.society_id
         WHERE a.payment_id = ? AND a.society_id = ? FOR UPDATE`, [paymentId, societyId]
      );
      if (!allocations.length) throw Object.assign(new Error('Payment allocations were not found'), { code: 'INVALID_PAYMENT' });
      for (const allocation of allocations) {
        const newPaid = Number(allocation.paid_amount) - Number(allocation.allocated_amount);
        if (newPaid < -0.001) throw Object.assign(new Error('Bill payment history is inconsistent; reversal was stopped'), { code: 'INVALID_PAYMENT' });
        const newBalance = Number(allocation.balance_amount) + Number(allocation.allocated_amount);
        await connection.execute(
          `UPDATE maintenance_bills SET paid_amount = ?, balance_amount = ?,
             status = CASE WHEN ? > 0 THEN 'PARTIALLY_PAID' WHEN due_date < CURRENT_DATE THEN 'OVERDUE' ELSE 'UNPAID' END
           WHERE id = ? AND society_id = ?`, [Math.max(0, newPaid), newBalance, newPaid, allocation.bill_id, societyId]
        );
      }
      await connection.execute(
        `UPDATE maintenance_payments SET status = 'REVERSED', reversal_reason = ?, reversed_at = UTC_TIMESTAMP(),
           reversed_by = ?, reconciliation_status = 'EXCLUDED' WHERE id = ? AND society_id = ?`,
        [reason, userId, paymentId, societyId]
      );
      await connection.execute(
        `UPDATE maintenance_receipts SET status = 'CANCELLED', cancellation_reason = ?, cancelled_at = UTC_TIMESTAMP(), cancelled_by = ?
         WHERE payment_id = ? AND society_id = ?`, [reason, userId, paymentId, societyId]
      );
      await connection.commit(); return { paymentId, affectedBillIds: allocations.map((row) => Number(row.bill_id)) };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async reconciliation(societyId, fromDate, toDate) {
    const [rows] = await getPool().execute(
      `SELECT p.id, p.payment_date, p.payment_mode, p.reference_number, p.total_amount, p.status,
              p.reconciliation_status, p.reconciliation_reference, p.reconciliation_note, p.reconciled_at,
              r.receipt_number, r.payer_name, fl.flat_no, w.wing_name
       FROM maintenance_payments p
       INNER JOIN maintenance_receipts r ON r.payment_id = p.id AND r.society_id = p.society_id
       INNER JOIN flats fl ON fl.id = p.flat_id AND fl.society_id = p.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE p.society_id = ? AND p.payment_date BETWEEN ? AND ?
       ORDER BY p.payment_date DESC, p.id DESC`, [societyId, fromDate, toDate]
    ); return rows;
  }

  async reconcile(societyId, paymentId, payload, userId) {
    const [result] = await getPool().execute(
      `UPDATE maintenance_payments SET reconciliation_status = ?, reconciliation_reference = ?,
         reconciliation_note = ?, reconciled_at = CASE WHEN ? = 'MATCHED' THEN UTC_TIMESTAMP() ELSE NULL END,
         reconciled_by = CASE WHEN ? = 'MATCHED' THEN ? ELSE NULL END
       WHERE id = ? AND society_id = ? AND status = 'SUCCESS'`,
      [payload.status, payload.reference, payload.note, payload.status, payload.status, userId, paymentId, societyId]
    ); return result.affectedRows;
  }

  async getReceipt(societyId, receiptId) {
    const [rows] = await getPool().execute(
      `SELECT r.*, p.status AS status, p.reversal_reason, p.flat_id, p.bank_name, p.cheque_date, p.notes,
              fl.flat_no, b.building_name, w.wing_name
       FROM maintenance_receipts r INNER JOIN maintenance_payments p ON p.id = r.payment_id AND p.society_id = r.society_id
       INNER JOIN flats fl ON fl.id = p.flat_id AND fl.society_id = p.society_id
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = p.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE r.id = ? AND r.society_id = ? LIMIT 1`, [receiptId, societyId]
    );
    if (!rows[0]) return null;
    const [allocations] = await getPool().execute(
      `SELECT a.bill_id, mb.bill_number, a.allocated_amount, mb.total_amount, mb.balance_amount
       FROM maintenance_payment_allocations a INNER JOIN maintenance_bills mb ON mb.id = a.bill_id AND mb.society_id = a.society_id
       WHERE a.payment_id = ? AND a.society_id = ? ORDER BY mb.id`, [rows[0].payment_id, societyId]
    ); return { ...rows[0], allocations };
  }
}
export default new PaymentRepository();
