CREATE TABLE IF NOT EXISTS maintenance_bill_adjustments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  bill_id BIGINT UNSIGNED NOT NULL,
  adjustment_type ENUM('LATE_FEE','INTEREST') NOT NULL,
  calculation_from DATE NOT NULL,
  calculation_to DATE NOT NULL,
  base_amount DECIMAL(14,2) NOT NULL,
  rate DECIMAL(10,4) NOT NULL DEFAULT 0,
  days_count INT UNSIGNED NOT NULL DEFAULT 0,
  amount DECIMAL(14,2) NOT NULL,
  settings_snapshot JSON NOT NULL,
  status ENUM('APPLIED','REVERSED') NOT NULL DEFAULT 'APPLIED',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_bill_adjustment_period (bill_id, adjustment_type, calculation_from, calculation_to),
  KEY idx_adjustment_society_date (society_id, calculation_to, status),
  CONSTRAINT fk_adjustment_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_adjustment_bill FOREIGN KEY (bill_id) REFERENCES maintenance_bills(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Outstanding Dues', 'society.dues.view', 'maintenance', 'View overdue bills and calculated late charges', 'ACTIVE'),
  ('Apply Late Fee and Interest', 'society.dues.apply_charges', 'maintenance', 'Post late fee and interest to overdue bills', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','SECRETARY','TREASURER','ACCOUNTANT')
  AND p.permission_code IN ('society.dues.view','society.dues.apply_charges')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code = 'CHAIRMAN' AND p.permission_code = 'society.dues.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
