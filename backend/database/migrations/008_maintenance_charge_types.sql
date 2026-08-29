CREATE TABLE IF NOT EXISTS maintenance_charge_types (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  charge_code VARCHAR(50) NOT NULL,
  charge_name VARCHAR(150) NOT NULL,
  category ENUM('MAINTENANCE','FUND','UTILITY','PARKING','TAX','PENALTY','OTHER') NOT NULL DEFAULT 'MAINTENANCE',
  calculation_basis ENUM('FIXED','PER_CARPET_SQFT','PER_BUILTUP_SQFT','PERCENTAGE_OF_MAINTENANCE','FLAT_TYPE','MANUAL') NOT NULL,
  default_rate DECIMAL(12,4) NULL,
  billing_frequency ENUM('INHERIT','MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY','ONE_TIME') NOT NULL DEFAULT 'INHERIT',
  is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
  gst_rate DECIMAL(6,3) NOT NULL DEFAULT 0,
  description VARCHAR(500) NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_charge_type_society_code (society_id, charge_code),
  KEY idx_charge_type_society_status (society_id, status, deleted_at),
  KEY idx_charge_type_category (society_id, category),
  CONSTRAINT fk_charge_type_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Charge Types', 'society.charge_types.view', 'maintenance', 'View maintenance charge types', 'ACTIVE'),
  ('Create Charge Types', 'society.charge_types.create', 'maintenance', 'Create maintenance charge types', 'ACTIVE'),
  ('Update Charge Types', 'society.charge_types.update', 'maintenance', 'Update maintenance charge types', 'ACTIVE'),
  ('Delete Charge Types', 'society.charge_types.delete', 'maintenance', 'Deactivate maintenance charge types', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','SECRETARY','TREASURER')
  AND p.permission_code LIKE 'society.charge_types.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('CHAIRMAN','ACCOUNTANT')
  AND p.permission_code IN ('society.charge_types.view','society.charge_types.update')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code = 'RESIDENT' AND p.permission_code = 'society.charge_types.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
