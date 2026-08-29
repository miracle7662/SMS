CREATE TABLE IF NOT EXISTS society_notices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('GENERAL','MAINTENANCE','MEETING','EMERGENCY','EVENT','PAYMENT','OTHER') NOT NULL DEFAULT 'GENERAL',
  priority ENUM('NORMAL','IMPORTANT','URGENT') NOT NULL DEFAULT 'NORMAL',
  audience_type ENUM('ALL','OWNERS','TENANTS','BUILDINGS','WINGS','FLATS') NOT NULL DEFAULT 'ALL',
  target_ids JSON NULL,
  publish_date DATE NOT NULL,
  expiry_date DATE NULL,
  status ENUM('DRAFT','PUBLISHED','UNPUBLISHED') NOT NULL DEFAULT 'DRAFT',
  published_at DATETIME NULL,
  published_by BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_notices_society_status_date (society_id,status,publish_date,expiry_date,deleted_at),
  KEY idx_notices_category (society_id,category,priority),
  CONSTRAINT fk_notices_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_notices_publisher FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name,permission_code,module_name,description,status) VALUES
('View Society Notices','society.notices.view','communication','View published notices for the selected society','ACTIVE'),
('Manage Society Notices','society.notices.manage','communication','Create, edit, publish and remove society notices','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY') AND p.permission_code IN ('society.notices.view','society.notices.manage')
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.role_code IN ('TREASURER','ACCOUNTANT','SECURITY','RESIDENT') AND p.permission_code='society.notices.view'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
