CREATE TABLE IF NOT EXISTS accounting_accounts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  account_code VARCHAR(30) NOT NULL,
  account_name VARCHAR(150) NOT NULL,
  account_type ENUM('ASSET','LIABILITY','EQUITY','INCOME','EXPENSE') NOT NULL,
  account_group ENUM('CASH','BANK','RECEIVABLE','PAYABLE','FUND','INCOME','EXPENSE','OTHER') NOT NULL,
  opening_balance DECIMAL(16,2) NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_account_code(society_id,account_code),
  UNIQUE KEY uk_account_name(society_id,account_name),
  KEY idx_account_type(society_id,account_type,account_group,status),
  CONSTRAINT fk_account_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounting_vouchers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  voucher_number VARCHAR(50) NOT NULL,
  voucher_date DATE NOT NULL,
  voucher_type ENUM('RECEIPT','PAYMENT','CONTRA','JOURNAL') NOT NULL,
  reference_number VARCHAR(100) NULL,
  narration VARCHAR(500) NOT NULL,
  source_module ENUM('MANUAL','MAINTENANCE','EXPENSE','PAYROLL','OTHER') NOT NULL DEFAULT 'MANUAL',
  source_record_id BIGINT UNSIGNED NULL,
  status ENUM('POSTED','REVERSED') NOT NULL DEFAULT 'POSTED',
  reversal_of_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_accounting_voucher_number(society_id,voucher_number),
  UNIQUE KEY uk_accounting_reversal(reversal_of_id),
  KEY idx_accounting_voucher_date(society_id,voucher_date,voucher_type),
  CONSTRAINT fk_accounting_voucher_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_accounting_voucher_reversal FOREIGN KEY(reversal_of_id) REFERENCES accounting_vouchers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounting_voucher_lines (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  voucher_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,
  debit_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
  line_narration VARCHAR(300) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_accounting_line_account(society_id,account_id,voucher_id),
  CONSTRAINT chk_accounting_line_amount CHECK ((debit_amount>0 AND credit_amount=0) OR (credit_amount>0 AND debit_amount=0)),
  CONSTRAINT fk_accounting_line_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_accounting_line_voucher FOREIGN KEY(voucher_id) REFERENCES accounting_vouchers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_accounting_line_account FOREIGN KEY(account_id) REFERENCES accounting_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounting_sequences (
  society_id BIGINT UNSIGNED PRIMARY KEY,
  next_voucher_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_accounting_sequence_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO permissions(permission_name,permission_code,module_name,description,status) VALUES
('View Accounting','society.accounting.view','accounting','View accounts, books and trial balance','ACTIVE'),
('Manage Chart of Accounts','society.accounting.accounts','accounting','Create ledger accounts','ACTIVE'),
('Post Accounting Vouchers','society.accounting.post','accounting','Post receipt, payment, contra and journal vouchers','ACTIVE'),
('Reverse Accounting Vouchers','society.accounting.reverse','accounting','Reverse incorrectly posted vouchers','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER') AND p.permission_code LIKE 'society.accounting.%'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code='ACCOUNTANT' AND p.permission_code IN('society.accounting.view','society.accounting.accounts','society.accounting.post')
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
