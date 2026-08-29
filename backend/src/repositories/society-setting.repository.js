import { getPool } from '../config/database.js';

class SocietySettingRepository {
  async get(societyId) {
    const [rows] = await getPool().execute(
      `SELECT * FROM society_settings WHERE society_id = ? LIMIT 1`, [societyId]
    );
    return rows[0] || null;
  }

  async upsert(societyId, settings, userId) {
    await getPool().execute(
      `INSERT INTO society_settings (
         society_id, financial_year_start_month, billing_frequency, bill_generation_day,
         payment_due_days, grace_period_days, late_fee_type, late_fee_value,
         interest_rate_per_annum, rounding_mode, bill_prefix, receipt_prefix, tenant_bill_to,
         non_occupancy_enabled, non_occupancy_percentage, require_tenant_police_noc,
         gst_registered, gstin, bank_name, bank_account_name, bank_account_number,
         bank_ifsc, bank_branch, upi_id, online_payment_enabled, currency_code, timezone,
         date_format, committee_contact_name, committee_contact_mobile, committee_contact_email,
         created_by, updated_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         financial_year_start_month = VALUES(financial_year_start_month), billing_frequency = VALUES(billing_frequency),
         bill_generation_day = VALUES(bill_generation_day), payment_due_days = VALUES(payment_due_days),
         grace_period_days = VALUES(grace_period_days), late_fee_type = VALUES(late_fee_type),
         late_fee_value = VALUES(late_fee_value), interest_rate_per_annum = VALUES(interest_rate_per_annum),
         rounding_mode = VALUES(rounding_mode), bill_prefix = VALUES(bill_prefix), receipt_prefix = VALUES(receipt_prefix),
         tenant_bill_to = VALUES(tenant_bill_to), non_occupancy_enabled = VALUES(non_occupancy_enabled),
         non_occupancy_percentage = VALUES(non_occupancy_percentage), require_tenant_police_noc = VALUES(require_tenant_police_noc),
         gst_registered = VALUES(gst_registered), gstin = VALUES(gstin), bank_name = VALUES(bank_name),
         bank_account_name = VALUES(bank_account_name), bank_account_number = VALUES(bank_account_number),
         bank_ifsc = VALUES(bank_ifsc), bank_branch = VALUES(bank_branch), upi_id = VALUES(upi_id),
         online_payment_enabled = VALUES(online_payment_enabled), currency_code = VALUES(currency_code),
         timezone = VALUES(timezone), date_format = VALUES(date_format), committee_contact_name = VALUES(committee_contact_name),
         committee_contact_mobile = VALUES(committee_contact_mobile), committee_contact_email = VALUES(committee_contact_email),
         updated_by = VALUES(updated_by)`,
      [societyId, settings.financial_year_start_month, settings.billing_frequency, settings.bill_generation_day,
        settings.payment_due_days, settings.grace_period_days, settings.late_fee_type, settings.late_fee_value,
        settings.interest_rate_per_annum, settings.rounding_mode, settings.bill_prefix, settings.receipt_prefix,
        settings.tenant_bill_to, settings.non_occupancy_enabled, settings.non_occupancy_percentage,
        settings.require_tenant_police_noc, settings.gst_registered, settings.gstin, settings.bank_name,
        settings.bank_account_name, settings.bank_account_number, settings.bank_ifsc, settings.bank_branch,
        settings.upi_id, settings.online_payment_enabled, settings.currency_code, settings.timezone,
        settings.date_format, settings.committee_contact_name, settings.committee_contact_mobile,
        settings.committee_contact_email, userId, userId]
    );
    return this.get(societyId);
  }
}

export default new SocietySettingRepository();
