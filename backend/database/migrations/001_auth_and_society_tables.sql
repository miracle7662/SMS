-- Society Management ERP Authentication Tables Migration
-- UTF-8 Character Set with InnoDB Engine
-- All timestamps in UTC using DATETIME or TIMESTAMP

-- ============================================
-- SOCIETIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS societies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_code VARCHAR(50) NOT NULL UNIQUE,
  society_name VARCHAR(200) NOT NULL,
  registration_no VARCHAR(100) NULL,
  address TEXT NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(10) NULL,
  email VARCHAR(150) NULL,
  mobile VARCHAR(20) NULL,
  logo VARCHAR(500) NULL,
  established_date DATE NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  KEY idx_society_name (society_name),
  KEY idx_mobile (mobile),
  KEY idx_status (status),
  KEY idx_deleted_at (deleted_at)
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USERS TABLE
-- Platform-level identity, can belong to multiple societies
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE','BLOCKED') DEFAULT 'ACTIVE',
  failed_login_attempts INT UNSIGNED DEFAULT 0,
  locked_until DATETIME NULL,
  password_changed_at DATETIME NULL,
  last_login DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  KEY idx_mobile (mobile),
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_deleted_at (deleted_at)
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLES TABLE
-- Platform-level and Society-level roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(100) NOT NULL,
  role_code VARCHAR(50) NOT NULL UNIQUE,
  scope ENUM('PLATFORM','SOCIETY') NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_role_code (role_code),
  KEY idx_scope (scope),
  KEY idx_status (status)
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(150) NOT NULL,
  permission_code VARCHAR(100) NOT NULL UNIQUE,
  module_name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_permission_code (permission_code),
  KEY idx_module_name (module_name),
  KEY idx_status (status)
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE PERMISSIONS TABLE
-- Junction table for role-permission mapping
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  KEY idx_permission_id (permission_id),
  
  CONSTRAINT fk_role_permissions_role_id 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_role_permissions_permission_id 
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE RESTRICT ON UPDATE CASCADE
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER SOCIETIES TABLE
-- Maps users to societies (one-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_societies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  society_id BIGINT UNSIGNED NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  joined_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_society (user_id, society_id),
  KEY idx_society_id (society_id),
  KEY idx_status (status),
  
  CONSTRAINT fk_user_societies_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_societies_society_id 
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER ROLES TABLE
-- Maps users to roles (can vary per society)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  society_id BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_role_society (user_id, role_id, society_id),
  KEY idx_role_id (role_id),
  KEY idx_society_id (society_id),
  
  CONSTRAINT fk_user_roles_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_roles_role_id 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_user_roles_society_id 
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE ON UPDATE CASCADE
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REFRESH TOKENS TABLE
-- Secure token storage with rotation support
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  device_info VARCHAR(500) NULL,
  ip_address VARCHAR(45) NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_user_id (user_id),
  KEY idx_token_hash (token_hash),
  KEY idx_expires_at (expires_at),
  
  CONSTRAINT fk_refresh_tokens_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOGS TABLE
-- Track all authentication and sensitive actions
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  module_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  record_id BIGINT UNSIGNED NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_society_id (society_id),
  KEY idx_user_id (user_id),
  KEY idx_module_name (module_name),
  KEY idx_action (action),
  KEY idx_created_at (created_at),
  
  CONSTRAINT fk_audit_logs_society_id 
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_audit_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SCHEMA MIGRATIONS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
