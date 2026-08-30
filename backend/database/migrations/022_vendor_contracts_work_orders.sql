CREATE TABLE IF NOT EXISTS vendor_contracts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  vendor_id BIGINT UNSIGNED NOT NULL,
  contract_number VARCHAR(50) NOT NULL,
  title VARCHAR(180) NOT NULL,
  contract_type ENUM('AMC','MONTHLY','QUARTERLY','YEARLY','ONE_TIME') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_amount DECIMAL(14,2) NOT NULL,
  payment_frequency ENUM('ONE_TIME','MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY') NOT NULL,
  scope_of_work TEXT NOT NULL,
  renewal_reminder_days INT UNSIGNED NOT NULL DEFAULT 30,
  status ENUM('DRAFT','ACTIVE','EXPIRED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vendor_contract_number (society_id, contract_number),
  KEY idx_vendor_contract_expiry (society_id, status, end_date),
  CONSTRAINT fk_vendor_contract_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_vendor_contract_vendor FOREIGN KEY (vendor_id) REFERENCES society_vendors(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendor_work_orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  vendor_id BIGINT UNSIGNED NOT NULL,
  contract_id BIGINT UNSIGNED NULL,
  work_order_number VARCHAR(50) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  requested_date DATE NOT NULL,
  expected_completion_date DATE NULL,
  actual_completion_date DATE NULL,
  estimated_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(14,2) NULL,
  status ENUM('SUBMITTED','APPROVED','REJECTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
  approval_note VARCHAR(500) NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  completion_note VARCHAR(1000) NULL,
  expense_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vendor_work_order_number (society_id, work_order_number),
  KEY idx_vendor_work_order_status (society_id, status, requested_date),
  CONSTRAINT fk_vendor_work_order_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_vendor_work_order_vendor FOREIGN KEY (vendor_id) REFERENCES society_vendors(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_vendor_work_order_contract FOREIGN KEY (contract_id) REFERENCES vendor_contracts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_vendor_work_order_expense FOREIGN KEY (expense_id) REFERENCES society_expenses(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendor_operation_sequences (
  society_id BIGINT UNSIGNED PRIMARY KEY,
  next_contract_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  next_work_order_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_vendor_operation_sequence_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO permissions(permission_name,permission_code,module_name,description,status) VALUES
('View Vendor Operations','society.vendor_operations.view','vendor_operations','View contracts and work orders','ACTIVE'),
('Manage Vendor Contracts','society.vendor_contracts.manage','vendor_operations','Create and manage vendor contracts','ACTIVE'),
('Manage Work Orders','society.work_orders.manage','vendor_operations','Create and update vendor work orders','ACTIVE'),
('Approve Work Orders','society.work_orders.approve','vendor_operations','Approve or reject submitted work orders','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER')
AND p.permission_code IN('society.vendor_operations.view','society.vendor_contracts.manage','society.work_orders.manage','society.work_orders.approve')
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code='ACCOUNTANT'
AND p.permission_code IN('society.vendor_operations.view','society.work_orders.manage')
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
