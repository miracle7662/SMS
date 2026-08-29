CREATE TABLE IF NOT EXISTS floors (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  building_id BIGINT UNSIGNED NOT NULL,
  wing_id BIGINT UNSIGNED NOT NULL,
  floor_number INT NOT NULL,
  floor_name VARCHAR(100) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_floor_wing_number (wing_id, floor_number),
  KEY idx_floors_society_building_wing (society_id, building_id, wing_id, status),
  CONSTRAINT fk_floors_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_floors_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_floors_wing FOREIGN KEY (wing_id) REFERENCES building_wings(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Floors', 'society.floors.view', 'society', 'View floors', 'ACTIVE'),
  ('Create Floors', 'society.floors.create', 'society', 'Generate floors', 'ACTIVE'),
  ('Update Floors', 'society.floors.update', 'society', 'Update floors', 'ACTIVE'),
  ('Delete Floors', 'society.floors.delete', 'society', 'Deactivate floors', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN') AND p.permission_code LIKE 'society.floors.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT','SECURITY','RESIDENT')
  AND p.permission_code = 'society.floors.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
