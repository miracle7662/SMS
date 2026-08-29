CREATE TABLE IF NOT EXISTS flats (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  building_id BIGINT UNSIGNED NOT NULL,
  wing_id BIGINT UNSIGNED NOT NULL,
  floor_id BIGINT UNSIGNED NOT NULL,
  flat_no VARCHAR(50) NOT NULL,
  flat_type VARCHAR(50) NOT NULL,
  carpet_area_sqft DECIMAL(10,2) NULL,
  builtup_area_sqft DECIMAL(10,2) NULL,
  occupancy_status ENUM('OWNER_OCCUPIED','RENTED','VACANT') NOT NULL DEFAULT 'VACANT',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_flat_society_number (society_id, flat_no),
  KEY idx_flats_society_structure (society_id, building_id, wing_id, floor_id, status),
  CONSTRAINT fk_flats_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_flats_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_flats_wing FOREIGN KEY (wing_id) REFERENCES building_wings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_flats_floor FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Flats', 'society.flats.view', 'society', 'View flats', 'ACTIVE'),
  ('Create Flats', 'society.flats.create', 'society', 'Generate flats', 'ACTIVE'),
  ('Update Flats', 'society.flats.update', 'society', 'Update flats', 'ACTIVE'),
  ('Delete Flats', 'society.flats.delete', 'society', 'Deactivate flats', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN') AND p.permission_code LIKE 'society.flats.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT','SECURITY','RESIDENT')
  AND p.permission_code = 'society.flats.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
