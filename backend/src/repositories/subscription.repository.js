import { getPool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

class SubscriptionRepository {
  async dashboard() {
    const pool = getPool();
    const [[plans], [subscriptions], [invoices], [payments]] = await Promise.all([
      pool.execute(`SELECT * FROM subscription_plans ORDER BY price, plan_name`),
      pool.execute(`SELECT ss.*, s.society_code, s.society_name, p.plan_code, p.plan_name
        FROM society_subscriptions ss JOIN societies s ON s.id=ss.society_id JOIN subscription_plans p ON p.id=ss.plan_id
        ORDER BY ss.created_at DESC`),
      pool.execute(`SELECT i.*, s.society_name, ss.subscription_number FROM platform_invoices i
        JOIN societies s ON s.id=i.society_id JOIN society_subscriptions ss ON ss.id=i.subscription_id ORDER BY i.created_at DESC`),
      pool.execute(`SELECT py.*, s.society_name, i.invoice_number FROM platform_payments py
        JOIN societies s ON s.id=py.society_id JOIN platform_invoices i ON i.id=py.invoice_id ORDER BY py.created_at DESC LIMIT 100`),
    ]);
    return { plans, subscriptions, invoices, payments };
  }

  async createPlan(data, userId) {
    const [result] = await getPool().execute(`INSERT INTO subscription_plans
      (plan_code,plan_name,description,billing_cycle,price,trial_days,max_buildings,max_flats,max_users,features,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [data.plan_code, data.plan_name, data.description || null, data.billing_cycle,
      data.price, data.trial_days || 0, data.max_buildings || null, data.max_flats || null, data.max_users || null,
      JSON.stringify(data.features || {}), userId]);
    return result.insertId;
  }

  async assign(data, userId) {
    const pool = getPool(); const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [[society]] = await connection.execute(`SELECT id FROM societies WHERE id=? AND deleted_at IS NULL AND status='ACTIVE' FOR UPDATE`, [data.society_id]);
      const [[plan]] = await connection.execute(`SELECT id,trial_days FROM subscription_plans WHERE id=? AND status='ACTIVE'`, [data.plan_id]);
      if (!society || !plan) throw new ApiError(404, 'Active society or plan not found');
      const [[existing]] = await connection.execute(`SELECT id FROM society_subscriptions WHERE society_id=? AND status IN ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED') LIMIT 1 FOR UPDATE`, [data.society_id]);
      if (existing && !data.replace_existing) throw new ApiError(409, 'Society already has a current subscription');
      if (existing) await connection.execute(`UPDATE society_subscriptions SET status='CANCELLED',updated_by=? WHERE id=?`, [userId, existing.id]);
      const number = `SUB-${Date.now()}-${data.society_id}`;
      const status = Number(plan.trial_days) > 0 && data.use_trial ? 'TRIAL' : 'ACTIVE';
      const trialEnd = status === 'TRIAL' ? new Date(Date.now() + Number(plan.trial_days) * 86400000).toISOString().slice(0,10) : null;
      const [result] = await connection.execute(`INSERT INTO society_subscriptions
        (society_id,plan_id,subscription_number,start_date,end_date,trial_end_date,status,auto_renew,notes,created_by,updated_by)
        VALUES (?,?,?,COALESCE(?,CURRENT_DATE),?,?,?,?,?,?,?)`, [data.society_id,data.plan_id,number,data.start_date||null,
        data.end_date||null,trialEnd,status,data.auto_renew?1:0,data.notes||null,userId,userId]);
      await connection.commit(); return result.insertId;
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
  }

  async updateStatus(id, status, userId) {
    const [result] = await getPool().execute(`UPDATE society_subscriptions SET status=?,updated_by=? WHERE id=?`, [status,userId,id]);
    if (!result.affectedRows) throw new ApiError(404, 'Subscription not found');
  }

  async createInvoice(data, userId) {
    const pool=getPool(); const connection=await pool.getConnection();
    try { await connection.beginTransaction();
      const [[subscription]]=await connection.execute(`SELECT id,society_id FROM society_subscriptions WHERE id=? FOR UPDATE`,[data.subscription_id]);
      if(!subscription) throw new ApiError(404,'Subscription not found');
      const subtotal=Number(data.subtotal), tax=Number(data.tax_amount||0), total=subtotal+tax;
      const number=`INV-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Date.now().toString().slice(-6)}`;
      const [result]=await connection.execute(`INSERT INTO platform_invoices
        (society_id,subscription_id,invoice_number,invoice_date,due_date,subtotal,tax_amount,total_amount,balance_amount,notes,created_by)
        VALUES (?,?,?,COALESCE(?,CURRENT_DATE),?,?,?,?,?,?,?)`,[subscription.society_id,data.subscription_id,number,data.invoice_date||null,data.due_date,subtotal,tax,total,total,data.notes||null,userId]);
      await connection.commit(); return result.insertId;
    } catch(error){await connection.rollback();throw error;} finally{connection.release();}
  }

  async recordPayment(invoiceId, data, userId) {
    const pool=getPool(); const connection=await pool.getConnection();
    try { await connection.beginTransaction();
      const [[invoice]]=await connection.execute(`SELECT * FROM platform_invoices WHERE id=? FOR UPDATE`,[invoiceId]);
      if(!invoice) throw new ApiError(404,'Invoice not found');
      if(['PAID','CANCELLED'].includes(invoice.status)) throw new ApiError(409,'Invoice cannot accept a payment');
      const amount=Number(data.amount); if(amount<=0 || amount>Number(invoice.balance_amount)) throw new ApiError(422,'Payment must be greater than zero and not exceed the balance');
      await connection.execute(`INSERT INTO platform_payments (invoice_id,society_id,payment_date,amount,payment_mode,reference_number,notes,created_by)
        VALUES (?,?,COALESCE(?,CURRENT_DATE),?,?,?,?,?)`,[invoiceId,invoice.society_id,data.payment_date||null,amount,data.payment_mode,data.reference_number||null,data.notes||null,userId]);
      const paid=Number(invoice.paid_amount)+amount, balance=Number(invoice.total_amount)-paid;
      await connection.execute(`UPDATE platform_invoices SET paid_amount=?,balance_amount=?,status=? WHERE id=?`,[paid,balance,balance===0?'PAID':'PARTIALLY_PAID',invoiceId]);
      await connection.commit();
    } catch(error){await connection.rollback();throw error;} finally{connection.release();}
  }

  async entitlement(societyId) {
    const [rows]=await getPool().execute(`SELECT ss.id,ss.status,ss.start_date,ss.end_date,ss.trial_end_date,p.plan_code,p.plan_name,
      p.max_buildings,p.max_flats,p.max_users,p.features FROM society_subscriptions ss JOIN subscription_plans p ON p.id=ss.plan_id
      WHERE ss.society_id=? AND ss.status IN ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED') ORDER BY ss.created_at DESC LIMIT 1`,[societyId]);
    return rows[0]||null;
  }
}
export default new SubscriptionRepository();
