CREATE TABLE IF NOT EXISTS maintenance_charge_rules (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  charge_type_id BIGINT UNSIGNED NOT NULL,
  rule_name VARCHAR(150) NOT NULL,
  applicability_scope ENUM('ALL_FLATS','FLAT_TYPE','OCCUPANCY_STATUS','SPECIFIC_FLAT') NOT NULL DEFAULT 'ALL_FLATS',
  flat_type VARCHAR(50) NULL,
  occupancy_status ENUM('OWNER_OCCUPIED','RENTED','VACANT') NULL,
  flat_id BIGINT UNSIGNED NULL,
  rate DECIMAL(12,4) NOT NULL,
  minimum_amount DECIMAL(12,2) NULL,
  maximum_amount DECIMAL(12,2) NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  priority SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  proration_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  description VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_charge_rules_lookup (society_id, charge_type_id, status, effective_from, effective_to),
  KEY idx_charge_rules_scope (society_id, applicability_scope, flat_type, occupancy_status, flat_id),
  CONSTRAINT fk_charge_rules_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_charge_rules_charge_type FOREIGN KEY (charge_type_id) REFERENCES maintenance_charge_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_charge_rules_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Charge Rules', 'society.charge_rules.view', 'maintenance', 'View maintenance charge rules', 'ACTIVE'),
  ('Create Charge Rules', 'society.charge_rules.create', 'maintenance', 'Create maintenance charge rules', 'ACTIVE'),
  ('Update Charge Rules', 'society.charge_rules.update', 'maintenance', 'Update maintenance charge rules', 'ACTIVE'),
  ('Delete Charge Rules', 'society.charge_rules.delete', 'maintenance', 'Deactivate maintenance charge rules', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','SECRETARY','TREASURER')
  AND p.permission_code LIKE 'society.charge_rules.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('CHAIRMAN','ACCOUNTANT')
  AND p.permission_code IN ('society.charge_rules.view','society.charge_rules.create','society.charge_rules.update')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code = 'RESIDENT' AND p.permission_code = 'society.charge_rules.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
