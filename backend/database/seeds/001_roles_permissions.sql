-- Seed Roles
INSERT INTO roles (role_name, role_code, scope, description, status)
VALUES
  ('Super Administrator', 'SUPER_ADMIN', 'PLATFORM', 'Platform-level super administrator with all permissions', 'ACTIVE'),
  ('Society Administrator', 'SOCIETY_ADMIN', 'SOCIETY', 'Society-level administrator', 'ACTIVE'),
  ('Chairman', 'CHAIRMAN', 'SOCIETY', 'Society chairman', 'ACTIVE'),
  ('Secretary', 'SECRETARY', 'SOCIETY', 'Society secretary', 'ACTIVE'),
  ('Treasurer', 'TREASURER', 'SOCIETY', 'Society treasurer', 'ACTIVE'),
  ('Accountant', 'ACCOUNTANT', 'SOCIETY', 'Society accountant', 'ACTIVE'),
  ('Security', 'SECURITY', 'SOCIETY', 'Society security personnel', 'ACTIVE'),
  ('Resident', 'RESIDENT', 'SOCIETY', 'Society resident', 'ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

-- Seed Permissions
-- Platform Permissions
INSERT INTO permissions (permission_name, permission_code, module_name, description, status)
VALUES
  ('View Societies', 'platform.societies.view', 'platform', 'View all societies', 'ACTIVE'),
  ('Create Society', 'platform.societies.create', 'platform', 'Create new society', 'ACTIVE'),
  ('Update Society', 'platform.societies.update', 'platform', 'Update society details', 'ACTIVE'),
  ('Suspend Society', 'platform.societies.suspend', 'platform', 'Suspend a society', 'ACTIVE'),
  ('View Users', 'platform.users.view', 'platform', 'View all platform users', 'ACTIVE'),
  ('Manage Users', 'platform.users.manage', 'platform', 'Manage platform users', 'ACTIVE'),
  
  -- Society Profile Permissions
  ('View Society Profile', 'society.profile.view', 'society', 'View society profile', 'ACTIVE'),
  ('Update Society Profile', 'society.profile.update', 'society', 'Update society profile', 'ACTIVE'),
  
  -- Society User Management Permissions
  ('View Society Users', 'society.users.view', 'society', 'View society users', 'ACTIVE'),
  ('Create Society User', 'society.users.create', 'society', 'Create new society user', 'ACTIVE'),
  ('Update Society User', 'society.users.update', 'society', 'Update society user', 'ACTIVE'),
  
  -- Society Role Permissions
  ('View Society Roles', 'society.roles.view', 'society', 'View society roles', 'ACTIVE'),
  ('Assign Society Roles', 'society.roles.assign', 'society', 'Assign roles to users', 'ACTIVE'),
  
  -- Society Dashboard
  ('View Dashboard', 'society.dashboard.view', 'society', 'View society dashboard', 'ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

-- Assign Permissions to Roles
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'SUPER_ADMIN'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- SOCIETY_ADMIN gets all society-scoped permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'SOCIETY_ADMIN'
AND p.permission_code IN (
  'society.profile.view',
  'society.profile.update',
  'society.users.view',
  'society.users.create',
  'society.users.update',
  'society.roles.view',
  'society.roles.assign',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- CHAIRMAN gets administrative but not assignment permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'CHAIRMAN'
AND p.permission_code IN (
  'society.profile.view',
  'society.users.view',
  'society.roles.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- SECRETARY gets view and profile permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'SECRETARY'
AND p.permission_code IN (
  'society.profile.view',
  'society.users.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- TREASURER gets view and dashboard permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'TREASURER'
AND p.permission_code IN (
  'society.profile.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- ACCOUNTANT gets view and dashboard permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'ACCOUNTANT'
AND p.permission_code IN (
  'society.profile.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- SECURITY gets view permissions only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'SECURITY'
AND p.permission_code IN (
  'society.profile.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

-- RESIDENT gets view permissions only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_code = 'RESIDENT'
AND p.permission_code IN (
  'society.profile.view',
  'society.dashboard.view'
)
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
