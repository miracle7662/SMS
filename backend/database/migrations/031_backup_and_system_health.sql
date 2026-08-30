CREATE TABLE database_backups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  backup_number VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NULL,
  file_size BIGINT UNSIGNED NULL,
  checksum_sha256 CHAR(64) NULL,
  backup_type ENUM('MANUAL','SCHEDULED','PRE_RESTORE') NOT NULL DEFAULT 'MANUAL',
  status ENUM('RUNNING','COMPLETED','FAILED','VERIFICATION_FAILED','RESTORED') NOT NULL DEFAULT 'RUNNING',
  error_message VARCHAR(1000) NULL,
  created_by BIGINT UNSIGNED NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  restored_by BIGINT UNSIGNED NULL,
  restored_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_database_backup_number (backup_number),
  KEY idx_database_backup_status (status, started_at),
  CONSTRAINT fk_database_backup_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_database_backup_restorer FOREIGN KEY (restored_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_health_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  database_status ENUM('HEALTHY','DEGRADED','DOWN') NOT NULL,
  database_latency_ms INT UNSIGNED NULL,
  process_memory_mb DECIMAL(10,2) NULL,
  disk_free_bytes BIGINT UNSIGNED NULL,
  disk_total_bytes BIGINT UNSIGNED NULL,
  uptime_seconds BIGINT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_system_health_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
