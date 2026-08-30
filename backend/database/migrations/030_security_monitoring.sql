CREATE TABLE security_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  society_id BIGINT UNSIGNED NULL,
  event_type ENUM('LOGIN_FAILED','ACCOUNT_LOCKED','TOKEN_REJECTED','ACCESS_DENIED','SUSPICIOUS_ACTIVITY') NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW',
  identifier_masked VARCHAR(150) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  details JSON NULL,
  status ENUM('OPEN','RESOLVED','IGNORED') NOT NULL DEFAULT 'OPEN',
  resolved_by BIGINT UNSIGNED NULL,
  resolved_at DATETIME NULL,
  resolution_note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_security_event_status (status, severity, created_at),
  KEY idx_security_event_user (user_id, created_at),
  KEY idx_security_event_ip (ip_address, created_at),
  CONSTRAINT fk_security_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_security_event_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_security_event_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE audit_logs
  ADD KEY idx_audit_module_created (module_name, created_at),
  ADD KEY idx_audit_society_created (society_id, created_at);
