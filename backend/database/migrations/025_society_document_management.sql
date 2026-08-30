CREATE TABLE IF NOT EXISTS society_document_categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  category_name VARCHAR(120) NOT NULL,
  description VARCHAR(300) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_society_document_category(society_id,category_name),
  CONSTRAINT fk_society_document_category_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS society_documents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  document_number VARCHAR(100) NULL,
  description VARCHAR(1000) NULL,
  document_date DATE NULL,
  expiry_date DATE NULL,
  reminder_days INT UNSIGNED NOT NULL DEFAULT 30,
  visibility ENUM('ALL_MEMBERS','COMMITTEE_ONLY','ADMIN_ONLY') NOT NULL DEFAULT 'ALL_MEMBERS',
  status ENUM('ACTIVE','EXPIRED','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  current_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_society_document_expiry(society_id,status,expiry_date),
  KEY idx_society_document_category(society_id,category_id,status),
  CONSTRAINT fk_society_document_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_society_document_category FOREIGN KEY(category_id) REFERENCES society_document_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS society_document_versions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  document_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  change_note VARCHAR(500) NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_society_document_version(document_id,version_number),
  UNIQUE KEY uk_society_document_stored_file(stored_file_name),
  KEY idx_society_document_version(society_id,document_id,created_at),
  CONSTRAINT fk_society_document_version_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_society_document_version_document FOREIGN KEY(document_id) REFERENCES society_documents(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions(permission_name,permission_code,module_name,description,status) VALUES
('View Society Documents','society.documents.view','documents','View and download society documents','ACTIVE'),
('Manage Document Categories','society.documents.categories','documents','Create document categories','ACTIVE'),
('Upload Society Documents','society.documents.upload','documents','Upload documents and new versions','ACTIVE'),
('Archive Society Documents','society.documents.archive','documents','Archive active society documents','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY') AND p.permission_code LIKE 'society.documents.%'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('TREASURER','ACCOUNTANT','RESIDENT') AND p.permission_code='society.documents.view'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
