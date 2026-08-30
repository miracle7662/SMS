INSERT INTO permissions(permission_name,permission_code,module_name,description,status)
VALUES('View Society Analytics','society.analytics.view','analytics','View role-scoped dashboard and consolidated reports','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT','SECURITY','RESIDENT')
AND p.permission_code='society.analytics.view'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
