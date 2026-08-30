CREATE TABLE subscription_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_code VARCHAR(50) NOT NULL,
  plan_name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  billing_cycle ENUM('MONTHLY','QUARTERLY','YEARLY','ONE_TIME') NOT NULL DEFAULT 'MONTHLY',
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  trial_days INT UNSIGNED NOT NULL DEFAULT 0,
  max_buildings INT UNSIGNED NULL,
  max_flats INT UNSIGNED NULL,
  max_users INT UNSIGNED NULL,
  features JSON NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subscription_plan_code (plan_code),
  KEY idx_subscription_plan_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE society_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  subscription_number VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  trial_end_date DATE NULL,
  status ENUM('TRIAL','ACTIVE','PAST_DUE','SUSPENDED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  auto_renew TINYINT(1) NOT NULL DEFAULT 0,
  notes VARCHAR(1000) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subscription_number (subscription_number),
  KEY idx_society_subscription_current (society_id, status, start_date, end_date),
  CONSTRAINT fk_society_subscription_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_society_subscription_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE platform_invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance_amount DECIMAL(12,2) NOT NULL,
  status ENUM('DRAFT','ISSUED','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'ISSUED',
  notes VARCHAR(1000) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_platform_invoice_number (invoice_number),
  KEY idx_platform_invoice_society (society_id, status, due_date),
  CONSTRAINT fk_platform_invoice_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_platform_invoice_subscription FOREIGN KEY (subscription_id) REFERENCES society_subscriptions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE platform_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  society_id BIGINT UNSIGNED NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_mode ENUM('CASH','CHEQUE','NEFT','RTGS','UPI','CARD','ONLINE') NOT NULL,
  reference_number VARCHAR(100) NULL,
  notes VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_platform_payment_invoice (invoice_id),
  KEY idx_platform_payment_society (society_id, payment_date),
  CONSTRAINT fk_platform_payment_invoice FOREIGN KEY (invoice_id) REFERENCES platform_invoices(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_platform_payment_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO subscription_plans
  (plan_code, plan_name, description, billing_cycle, price, max_buildings, max_flats, max_users, features, status)
VALUES
  ('LEGACY_FREE', 'Legacy Free', 'Automatic unlimited plan for societies created before SaaS billing.', 'ONE_TIME', 0, NULL, NULL, NULL, JSON_OBJECT('all_modules', true), 'ACTIVE');

INSERT INTO society_subscriptions
  (society_id, plan_id, subscription_number, start_date, status, auto_renew, notes)
SELECT s.id, p.id, CONCAT('LEGACY-', LPAD(s.id, 8, '0')), CURRENT_DATE, 'ACTIVE', 0, 'Created automatically during SaaS billing rollout'
FROM societies s
JOIN subscription_plans p ON p.plan_code = 'LEGACY_FREE'
WHERE s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM society_subscriptions ss WHERE ss.society_id = s.id AND ss.status IN ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED'));
