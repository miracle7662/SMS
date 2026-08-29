import { getPool } from '../config/database.js';

class MaintenanceBillRepository {
  async findDuplicates(societyId, flatIds, periodStart, periodEnd) {
    if (!flatIds.length) return [];
    const placeholders = flatIds.map(() => '?').join(',');
    const [rows] = await getPool().execute(
      `SELECT mb.id, mb.bill_number, mb.flat_id, fl.flat_no
       FROM maintenance_bills mb INNER JOIN flats fl ON fl.id = mb.flat_id AND fl.society_id = mb.society_id
       WHERE mb.society_id = ? AND mb.flat_id IN (${placeholders}) AND mb.period_start = ? AND mb.period_end = ?
         AND mb.status <> 'CANCELLED'`, [societyId, ...flatIds, periodStart, periodEnd]
    ); return rows;
  }

  async generate(societyId, run, previewFlats, settings, userId) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [runResult] = await connection.execute(
        `INSERT INTO maintenance_billing_runs
         (society_id, billing_date, period_start, period_end, due_date, financial_year,
          flat_count, total_amount, settings_snapshot, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROCESSING', ?)`,
        [societyId, run.billing_date, run.period_start, run.period_end, run.due_date, run.financial_year,
          previewFlats.length, run.total_amount, JSON.stringify(settings), userId]
      );
      await connection.execute(
        `INSERT INTO society_document_sequences (society_id, document_type, financial_year, next_number)
         VALUES (?, 'MAINTENANCE_BILL', ?, 1)
         ON DUPLICATE KEY UPDATE next_number = next_number`, [societyId, run.financial_year]
      );
      const [sequences] = await connection.execute(
        `SELECT id, next_number FROM society_document_sequences
         WHERE society_id = ? AND document_type = 'MAINTENANCE_BILL' AND financial_year = ? FOR UPDATE`,
        [societyId, run.financial_year]
      );
      let sequence = Number(sequences[0].next_number); const billIds = [];
      const separator = settings.bill_prefix.endsWith('/') ? '' : '/';
      for (const flat of previewFlats) {
        const billNumber = `${settings.bill_prefix}${separator}${run.financial_year}/${String(sequence).padStart(6, '0')}`;
        const [billResult] = await connection.execute(
          `INSERT INTO maintenance_bills
           (society_id, billing_run_id, flat_id, recipient_member_id, bill_number, financial_year,
            billing_date, period_start, period_end, due_date, recipient_name, recipient_mobile,
            recipient_email, subtotal, gst_total, rounding_adjustment, total_amount, paid_amount,
            balance_amount, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'UNPAID', ?)`,
          [societyId, runResult.insertId, flat.flat_id, flat.billing_recipient_member_id, billNumber,
            run.financial_year, run.billing_date, run.period_start, run.period_end, run.due_date,
            flat.billing_recipient, flat.billing_recipient_mobile, flat.billing_recipient_email,
            flat.subtotal, flat.gst_total, flat.rounding_adjustment, flat.total, flat.total, userId]
        );
        billIds.push(billResult.insertId);
        for (const item of flat.charges) {
          await connection.execute(
            `INSERT INTO maintenance_bill_items
             (society_id, bill_id, charge_type_id, charge_rule_id, charge_code, charge_name,
              calculation_basis, applied_rate, base_amount, gst_rate, gst_amount, line_total, rule_snapshot)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [societyId, billResult.insertId, item.charge_type_id, item.rule_id, item.charge_code,
              item.charge_name, item.calculation_basis, item.rate, item.amount, item.gst_rate,
              item.gst_amount, item.total, JSON.stringify({ rule_id: item.rule_id, rule_name: item.rule_name })]
          );
        }
        sequence += 1;
      }
      await connection.execute(`UPDATE society_document_sequences SET next_number = ? WHERE id = ?`, [sequence, sequences[0].id]);
      await connection.execute(
        `UPDATE maintenance_billing_runs SET status = 'GENERATED', completed_at = UTC_TIMESTAMP() WHERE id = ?`, [runResult.insertId]
      );
      await connection.commit();
      return { runId: runResult.insertId, billIds };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }

  async list(societyId) {
    const [rows] = await getPool().execute(
      `SELECT mb.id, mb.bill_number, mb.financial_year, mb.billing_date, mb.period_start, mb.period_end,
              mb.due_date, mb.recipient_name, mb.subtotal, mb.gst_total, mb.total_amount,
              mb.paid_amount, mb.balance_amount,
              CASE WHEN mb.status IN ('UNPAID','PARTIALLY_PAID') AND mb.due_date < CURRENT_DATE THEN 'OVERDUE' ELSE mb.status END AS status,
              fl.flat_no, fl.flat_type, b.building_name, w.wing_name, mb.created_at
       FROM maintenance_bills mb
       INNER JOIN flats fl ON fl.id = mb.flat_id AND fl.society_id = mb.society_id
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = mb.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE mb.society_id = ? ORDER BY mb.billing_date DESC, mb.id DESC`, [societyId]
    ); return rows;
  }

  async get(societyId, id) {
    const [bills] = await getPool().execute(
      `SELECT mb.*, fl.flat_no, fl.flat_type, b.building_name, w.wing_name
       FROM maintenance_bills mb INNER JOIN flats fl ON fl.id = mb.flat_id AND fl.society_id = mb.society_id
       INNER JOIN buildings b ON b.id = fl.building_id AND b.society_id = mb.society_id
       INNER JOIN building_wings w ON w.id = fl.wing_id AND w.building_id = fl.building_id
       WHERE mb.id = ? AND mb.society_id = ? LIMIT 1`, [id, societyId]
    );
    if (!bills[0]) return null;
    const [items] = await getPool().execute(
      `SELECT id, charge_code, charge_name, calculation_basis, applied_rate, base_amount,
              gst_rate, gst_amount, line_total, rule_snapshot FROM maintenance_bill_items
       WHERE bill_id = ? AND society_id = ? ORDER BY id`, [id, societyId]
    ); return { ...bills[0], items };
  }
}
export default new MaintenanceBillRepository();
