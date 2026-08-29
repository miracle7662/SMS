ALTER TABLE maintenance_payments
  ADD COLUMN reversal_reason VARCHAR(500) NULL AFTER status,
  ADD COLUMN reversed_at DATETIME NULL AFTER reversal_reason,
  ADD COLUMN reversed_by BIGINT UNSIGNED NULL AFTER reversed_at,
  ADD COLUMN reconciliation_status ENUM('UNMATCHED','MATCHED','EXCLUDED') NOT NULL DEFAULT 'UNMATCHED' AFTER reversed_by,
  ADD COLUMN reconciliation_reference VARCHAR(150) NULL AFTER reconciliation_status,
  ADD COLUMN reconciliation_note VARCHAR(500) NULL AFTER reconciliation_reference,
  ADD COLUMN reconciled_at DATETIME NULL AFTER reconciliation_note,
  ADD COLUMN reconciled_by BIGINT UNSIGNED NULL AFTER reconciled_at,
  ADD KEY idx_payment_reconciliation (society_id, reconciliation_status, payment_date);

ALTER TABLE maintenance_receipts
  ADD COLUMN cancellation_reason VARCHAR(500) NULL AFTER status,
  ADD COLUMN cancelled_at DATETIME NULL AFTER cancellation_reason,
  ADD COLUMN cancelled_by BIGINT UNSIGNED NULL AFTER cancelled_at;

INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('Reverse Maintenance Payments', 'society.payments.reverse', 'payments', 'Reverse a payment and cancel its receipt', 'ACTIVE'),
  ('Reconcile Maintenance Payments', 'society.payments.reconcile', 'payments', 'Match recorded payments with bank entries', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','TREASURER','ACCOUNTANT')
  AND p.permission_code IN ('society.payments.reverse','society.payments.reconcile')
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
