CREATE TABLE IF NOT EXISTS family_members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  flat_id BIGINT UNSIGNED NOT NULL,
  primary_member_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  relation_type ENUM('SPOUSE','SON','DAUGHTER','FATHER','MOTHER','BROTHER','SISTER','OTHER') NOT NULL,
  mobile VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  date_of_birth DATE NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_family_society_flat (society_id, flat_id, status, deleted_at),
  KEY idx_family_primary_member (society_id, primary_member_id),
  CONSTRAINT fk_family_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_family_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_family_primary_member FOREIGN KEY (primary_member_id) REFERENCES members(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS member_documents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  flat_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('AADHAAR','PAN','PHOTO','SALE_DEED','SHARE_CERTIFICATE','RENT_AGREEMENT','POLICE_NOC','OTHER') NOT NULL,
  document_number VARCHAR(100) NULL,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  status ENUM('PENDING','VERIFIED','REJECTED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  expiry_date DATE NULL,
  verified_by BIGINT UNSIGNED NULL,
  verified_at DATETIME NULL,
  rejection_reason VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_documents_society_member (society_id, member_id, deleted_at),
  KEY idx_documents_society_status (society_id, status, document_type),
  CONSTRAINT fk_documents_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_documents_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_documents_flat FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_documents_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Member Documents', 'society.member_documents.view', 'members', 'View and download member documents', 'ACTIVE'),
  ('Upload Member Documents', 'society.member_documents.create', 'members', 'Upload member documents', 'ACTIVE'),
  ('Verify Member Documents', 'society.member_documents.verify', 'members', 'Verify or reject member documents', 'ACTIVE'),
  ('Delete Member Documents', 'society.member_documents.delete', 'members', 'Delete member documents', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY')
  AND p.permission_code LIKE 'society.member_documents.%'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('TREASURER','ACCOUNTANT') AND p.permission_code = 'society.member_documents.view'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
