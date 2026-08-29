CREATE TABLE IF NOT EXISTS society_settings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  financial_year_start_month TINYINT UNSIGNED NOT NULL DEFAULT 4,
  billing_frequency ENUM('MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY') NOT NULL DEFAULT 'MONTHLY',
  bill_generation_day TINYINT UNSIGNED NOT NULL DEFAULT 1,
  payment_due_days TINYINT UNSIGNED NOT NULL DEFAULT 10,
  grace_period_days TINYINT UNSIGNED NOT NULL DEFAULT 0,
  late_fee_type ENUM('NONE','FIXED','PERCENTAGE') NOT NULL DEFAULT 'PERCENTAGE',
  late_fee_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  interest_rate_per_annum DECIMAL(6,3) NOT NULL DEFAULT 0,
  rounding_mode ENUM('NONE','NEAREST_RUPEE','UP_TO_RUPEE') NOT NULL DEFAULT 'NEAREST_RUPEE',
  bill_prefix VARCHAR(50) NOT NULL DEFAULT 'BILL/',
  receipt_prefix VARCHAR(50) NOT NULL DEFAULT 'RCT/',
  tenant_bill_to ENUM('OWNER','TENANT') NOT NULL DEFAULT 'OWNER',
  non_occupancy_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  non_occupancy_percentage DECIMAL(6,3) NOT NULL DEFAULT 0,
  require_tenant_police_noc BOOLEAN NOT NULL DEFAULT TRUE,
  gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
  gstin VARCHAR(20) NULL,
  bank_name VARCHAR(150) NULL,
  bank_account_name VARCHAR(150) NULL,
  bank_account_number VARCHAR(50) NULL,
  bank_ifsc VARCHAR(20) NULL,
  bank_branch VARCHAR(150) NULL,
  upi_id VARCHAR(150) NULL,
  online_payment_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  date_format ENUM('DD/MM/YYYY','DD-MMM-YYYY','YYYY-MM-DD') NOT NULL DEFAULT 'DD/MM/YYYY',
  committee_contact_name VARCHAR(150) NULL,
  committee_contact_mobile VARCHAR(20) NULL,
  committee_contact_email VARCHAR(150) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_society_settings_society (society_id),
  CONSTRAINT fk_society_settings_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Society Settings', 'society.settings.view', 'society', 'View society billing and payment settings', 'ACTIVE'),
  ('Update Society Settings', 'society.settings.update', 'society', 'Update society billing and payment settings', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY')
  AND p.permission_code IN ('society.settings.view','society.settings.update')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('TREASURER','ACCOUNTANT') AND p.permission_code = 'society.settings.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
