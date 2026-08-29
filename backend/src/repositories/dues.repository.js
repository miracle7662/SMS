import { getPool } from '../config/database.js';
class DuesRepository {
  async overdue(societyId, asOfDate, graceDays) {
    const [rows] = await getPool().execute(
      `SELECT mb.id, mb.bill_number, mb.flat_id, mb.recipient_name, mb.due_date, mb.total_amount,
              mb.paid_amount, mb.balance_amount, fl.flat_no, b.building_name, w.wing_name,
              DATE_ADD(mb.due_date, INTERVAL ? DAY) AS grace_end_date,
              MAX(CASE WHEN a.adjustment_type='INTEREST' AND a.status='APPLIED' THEN a.calculation_to END) AS interest_applied_through,
              MAX(CASE WHEN a.adjustment_type='LATE_FEE' AND a.status='APPLIED' THEN 1 ELSE 0 END) AS late_fee_applied
       FROM maintenance_bills mb
       INNER JOIN flats fl ON fl.id=mb.flat_id AND fl.society_id=mb.society_id
       INNER JOIN buildings b ON b.id=fl.building_id AND b.society_id=mb.society_id
       INNER JOIN building_wings w ON w.id=fl.wing_id AND w.building_id=fl.building_id
       LEFT JOIN maintenance_bill_adjustments a ON a.bill_id=mb.id AND a.society_id=mb.society_id
       WHERE mb.society_id=? AND mb.balance_amount>0 AND mb.status NOT IN ('PAID','CANCELLED')
         AND DATE_ADD(mb.due_date, INTERVAL ? DAY) < ?
       GROUP BY mb.id,mb.bill_number,mb.flat_id,mb.recipient_name,mb.due_date,mb.total_amount,mb.paid_amount,mb.balance_amount,fl.flat_no,b.building_name,w.wing_name
       ORDER BY mb.due_date,mb.id`, [graceDays,societyId,graceDays,asOfDate]
    ); return rows;
  }
  async apply(societyId, asOfDate, entries, userId) {
    const connection=await getPool().getConnection();try{await connection.beginTransaction();let total=0;const ids=[];
      for(const entry of entries){const [bills]=await connection.execute(`SELECT id,balance_amount,status FROM maintenance_bills WHERE id=? AND society_id=? FOR UPDATE`,[entry.bill_id,societyId]);const bill=bills[0];if(!bill||['PAID','CANCELLED'].includes(bill.status)||Math.abs(Number(bill.balance_amount)-entry.expected_balance)>0.009)throw Object.assign(new Error('Outstanding balance changed. Refresh the preview and try again.'),{code:'STALE_DUES'});
        for(const charge of entry.charges){await connection.execute(`INSERT INTO maintenance_bill_adjustments (society_id,bill_id,adjustment_type,calculation_from,calculation_to,base_amount,rate,days_count,amount,settings_snapshot,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,'APPLIED',?)`,[societyId,entry.bill_id,charge.type,charge.from,charge.to,entry.expected_balance,charge.rate,charge.days,charge.amount,JSON.stringify(charge.settings),userId]);total+=charge.amount;}
        if(entry.total_charge>0){await connection.execute(`UPDATE maintenance_bills SET total_amount=total_amount+?,balance_amount=balance_amount+?,status='OVERDUE' WHERE id=? AND society_id=?`,[entry.total_charge,entry.total_charge,entry.bill_id,societyId]);ids.push(entry.bill_id);}
      }await connection.commit();return{billIds:ids,totalAmount:Number(total.toFixed(2)),asOfDate};
    }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  }
}
export default new DuesRepository();
