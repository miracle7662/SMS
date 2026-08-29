CREATE TABLE IF NOT EXISTS society_document_sequences (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('MAINTENANCE_BILL','RECEIPT') NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  next_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_document_sequence (society_id, document_type, financial_year),
  CONSTRAINT fk_document_sequence_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_billing_runs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  billing_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  flat_count INT UNSIGNED NOT NULL DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  settings_snapshot JSON NOT NULL,
  status ENUM('PROCESSING','GENERATED','FAILED','CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  KEY idx_billing_runs_society_date (society_id, billing_date, status),
  CONSTRAINT fk_billing_runs_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_bills (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  billing_run_id BIGINT UNSIGNED NOT NULL,
  flat_id BIGINT UNSIGNED NOT NULL,
  recipient_member_id BIGINT UNSIGNED NULL,
  bill_number VARCHAR(100) NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  billing_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  recipient_name VARCHAR(150) NULL,
  recipient_mobile VARCHAR(20) NULL,
  recipient_email VARCHAR(150) NULL,
  subtotal DECIMAL(14,2) NOT NULL,
  gst_total DECIMAL(14,2) NOT NULL DEFAULT 0,
  rounding_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  balance_amount DECIMAL(14,2) NOT NULL,
  status ENUM('UNPAID','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'UNPAID',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_bill_society_number (society_id, bill_number),
  UNIQUE KEY uk_bill_flat_period (society_id, flat_id, period_start, period_end),
  KEY idx_bills_society_status_due (society_id, status, due_date),
  KEY idx_bills_run (billing_run_id),
  CONSTRAINT fk_bills_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bills_run FOREIGN KEY (billing_run_id) REFERENCES maintenance_billing_runs(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bills_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bills_recipient FOREIGN KEY (recipient_member_id) REFERENCES members(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_bill_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  bill_id BIGINT UNSIGNED NOT NULL,
  charge_type_id BIGINT UNSIGNED NOT NULL,
  charge_rule_id BIGINT UNSIGNED NULL,
  charge_code VARCHAR(50) NOT NULL,
  charge_name VARCHAR(150) NOT NULL,
  calculation_basis VARCHAR(50) NOT NULL,
  applied_rate DECIMAL(12,4) NOT NULL,
  base_amount DECIMAL(14,2) NOT NULL,
  gst_rate DECIMAL(6,3) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(14,2) NOT NULL,
  rule_snapshot JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bill_items_bill (society_id, bill_id),
  CONSTRAINT fk_bill_items_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES maintenance_bills(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bill_items_charge_type FOREIGN KEY (charge_type_id) REFERENCES maintenance_charge_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bill_items_charge_rule FOREIGN KEY (charge_rule_id) REFERENCES maintenance_charge_rules(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Maintenance Bills', 'society.bills.view', 'maintenance', 'View generated maintenance bills', 'ACTIVE'),
  ('Generate Maintenance Bills', 'society.bills.generate', 'maintenance', 'Generate maintenance bills from active rules', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','SECRETARY','TREASURER','ACCOUNTANT')
  AND p.permission_code IN ('society.bills.view','society.bills.generate')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code = 'CHAIRMAN' AND p.permission_code = 'society.bills.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
