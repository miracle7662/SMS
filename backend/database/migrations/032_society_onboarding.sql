ALTER TABLE users
  ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash,
  ADD COLUMN invitation_status ENUM('NOT_REQUIRED','PENDING','SENT','ACCEPTED','EXPIRED') NOT NULL DEFAULT 'NOT_REQUIRED' AFTER must_change_password,
  ADD COLUMN invitation_sent_at DATETIME NULL AFTER invitation_status;

ALTER TABLE societies
  ADD COLUMN onboarding_status ENUM('ADMIN_PENDING','SETUP_IN_PROGRESS','READY','LIVE') NOT NULL DEFAULT 'ADMIN_PENDING' AFTER status,
  ADD COLUMN go_live_at DATETIME NULL AFTER onboarding_status;

CREATE TABLE society_onboarding_invitations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('NONE','EMAIL','SMS','WHATSAPP') NOT NULL DEFAULT 'NONE',
  recipient_masked VARCHAR(150) NULL,
  status ENUM('PENDING','SENT','FAILED','ACCEPTED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
  error_message VARCHAR(500) NULL,
  sent_at DATETIME NULL,
  accepted_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_onboarding_invitation_society (society_id,status,created_at),
  KEY idx_onboarding_invitation_user (user_id,status),
  CONSTRAINT fk_onboarding_invitation_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_onboarding_invitation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_onboarding_invitation_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE societies SET onboarding_status='LIVE',go_live_at=COALESCE(go_live_at,created_at);
UPDATE users SET must_change_password=0,invitation_status='NOT_REQUIRED';
