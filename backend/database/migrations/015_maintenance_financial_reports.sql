INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES ('View Maintenance Financial Reports', 'society.reports.maintenance', 'reports', 'View collection, outstanding and defaulter reports', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN ('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT')
  AND p.permission_code = 'society.reports.maintenance'
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);
