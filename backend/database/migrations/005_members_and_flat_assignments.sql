CREATE TABLE IF NOT EXISTS members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  member_code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_members_society_code (society_id, member_code),
  UNIQUE KEY uk_members_society_mobile (society_id, mobile),
  KEY idx_members_society_status (society_id, status, deleted_at),
  CONSTRAINT fk_members_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flat_members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  flat_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  member_type ENUM('OWNER','CO_OWNER','TENANT') NOT NULL,
  ownership_percentage DECIMAL(5,2) NULL,
  occupancy_start DATE NULL,
  occupancy_end DATE NULL,
  agreement_status ENUM('NOT_REQUIRED','PENDING','VERIFIED','EXPIRED') NOT NULL DEFAULT 'NOT_REQUIRED',
  police_noc_status ENUM('NOT_REQUIRED','PENDING','VERIFIED') NOT NULL DEFAULT 'NOT_REQUIRED',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  UNIQUE KEY uk_flat_member_type (society_id, flat_id, member_id, member_type),
  KEY idx_flat_members_society_type (society_id, member_type, status),
  KEY idx_flat_members_flat (society_id, flat_id, status),
  CONSTRAINT fk_flat_members_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_flat_members_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_flat_members_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Members', 'society.members.view', 'members', 'View society members and flat assignments', 'ACTIVE'),
  ('Create Members', 'society.members.create', 'members', 'Create members and flat assignments', 'ACTIVE'),
  ('Update Members', 'society.members.update', 'members', 'Update members and flat assignments', 'ACTIVE'),
  ('Remove Members', 'society.members.delete', 'members', 'Deactivate flat member assignments', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY')
  AND p.permission_code LIKE 'society.members.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('TREASURER','ACCOUNTANT','SECURITY','RESIDENT')
  AND p.permission_code = 'society.members.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
