CREATE TABLE IF NOT EXISTS buildings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  building_code VARCHAR(50) NOT NULL,
  building_name VARCHAR(150) NOT NULL,
  floors_per_wing INT UNSIGNED NOT NULL DEFAULT 0,
  flats_per_floor INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_building_society_code (society_id, building_code),
  KEY idx_buildings_society_status (society_id, status),
  CONSTRAINT fk_buildings_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS building_wings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  building_id BIGINT UNSIGNED NOT NULL,
  wing_code VARCHAR(50) NOT NULL,
  wing_name VARCHAR(100) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_wing_building_code (building_id, wing_code),
  KEY idx_wings_society_building (society_id, building_id, status),
  CONSTRAINT fk_wings_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_wings_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Buildings', 'society.buildings.view', 'society', 'View buildings and wings', 'ACTIVE'),
  ('Create Buildings', 'society.buildings.create', 'society', 'Create buildings and wings', 'ACTIVE'),
  ('Update Buildings', 'society.buildings.update', 'society', 'Update buildings and wings', 'ACTIVE'),
  ('Delete Buildings', 'society.buildings.delete', 'society', 'Deactivate buildings and wings', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN') AND p.permission_code LIKE 'society.buildings.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT','SECURITY','RESIDENT')
  AND p.permission_code = 'society.buildings.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
