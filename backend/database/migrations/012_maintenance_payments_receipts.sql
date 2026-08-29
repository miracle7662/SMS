CREATE TABLE IF NOT EXISTS maintenance_payments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  flat_id BIGINT UNSIGNED NOT NULL,
  payer_member_id BIGINT UNSIGNED NULL,
  payment_date DATE NOT NULL,
  payment_mode ENUM('CASH','CHEQUE','NEFT','RTGS','UPI','CARD','ONLINE') NOT NULL,
  reference_number VARCHAR(100) NULL,
  bank_name VARCHAR(150) NULL,
  cheque_date DATE NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  notes VARCHAR(500) NULL,
  status ENUM('SUCCESS','PENDING','FAILED','REVERSED') NOT NULL DEFAULT 'SUCCESS',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_society_date (society_id, payment_date, status),
  KEY idx_payments_flat (society_id, flat_id),
  KEY idx_payments_reference (society_id, reference_number),
  CONSTRAINT fk_payments_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payments_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payments_payer FOREIGN KEY (payer_member_id) REFERENCES members(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_payment_allocations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  payment_id BIGINT UNSIGNED NOT NULL,
  bill_id BIGINT UNSIGNED NOT NULL,
  allocated_amount DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_payment_bill_allocation (payment_id, bill_id),
  KEY idx_allocations_bill (society_id, bill_id),
  CONSTRAINT fk_allocations_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_allocations_payment FOREIGN KEY (payment_id) REFERENCES maintenance_payments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_allocations_bill FOREIGN KEY (bill_id) REFERENCES maintenance_bills(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_receipts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  payment_id BIGINT UNSIGNED NOT NULL,
  receipt_number VARCHAR(100) NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  receipt_date DATE NOT NULL,
  payer_name VARCHAR(150) NOT NULL,
  payer_mobile VARCHAR(20) NULL,
  payer_email VARCHAR(150) NULL,
  payment_mode VARCHAR(30) NOT NULL,
  reference_number VARCHAR(100) NULL,
  amount DECIMAL(14,2) NOT NULL,
  status ENUM('ISSUED','CANCELLED') NOT NULL DEFAULT 'ISSUED',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_receipt_society_number (society_id, receipt_number),
  UNIQUE KEY uk_receipt_payment (payment_id),
  KEY idx_receipts_society_date (society_id, receipt_date, status),
  CONSTRAINT fk_receipts_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id) REFERENCES maintenance_payments(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Payments and Receipts', 'society.payments.view', 'payments', 'View maintenance payments and receipts', 'ACTIVE'),
  ('Collect Maintenance Payments', 'society.payments.collect', 'payments', 'Record and allocate maintenance payments', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','SECRETARY','TREASURER','ACCOUNTANT')
  AND p.permission_code IN ('society.payments.view','society.payments.collect')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code = 'CHAIRMAN' AND p.permission_code = 'society.payments.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
