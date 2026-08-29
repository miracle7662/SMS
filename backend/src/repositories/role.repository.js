import { getPool } from '../config/database.js';

export class RoleRepository {
  async findByCode(roleCode) {
    const pool = getPool();
    const query = `
      SELECT r.id, r.role_name, r.role_code, r.scope, r.description, r.status
      FROM roles r
      WHERE r.role_code = ?
      AND r.status = 'ACTIVE'
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [roleCode]);
    return rows[0] || null;
  }

  async findById(roleId) {
    const pool = getPool();
    const query = `
      SELECT r.id, r.role_name, r.role_code, r.scope, r.description, r.status
      FROM roles r
      WHERE r.id = ?
      AND r.status = 'ACTIVE'
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [roleId]);
    return rows[0] || null;
  }

  async findByIds(roleIds) {
    if (!roleIds.length) return [];
    const pool = getPool();
    const placeholders = roleIds.map(() => '?').join(',');
    const query = `
      SELECT r.id, r.role_name, r.role_code, r.scope, r.description, r.status
      FROM roles r
      WHERE r.id IN (${placeholders})
      AND r.status = 'ACTIVE'
    `;
    const [rows] = await pool.query(query, roleIds);
    return rows;
  }

  async getPermissionsByRoleId(roleId) {
    const pool = getPool();
    const query = `
      SELECT 
        p.id, p.permission_name, p.permission_code, p.module_name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      AND p.status = 'ACTIVE'
    `;
    const [rows] = await pool.query(query, [roleId]);
    return rows;
  }

  async getPermissionsByRoleIds(roleIds) {
    if (!roleIds.length) return [];
    const pool = getPool();
    const placeholders = roleIds.map(() => '?').join(',');
    const query = `
      SELECT DISTINCT
        p.id, p.permission_name, p.permission_code, p.module_name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id IN (${placeholders})
      AND p.status = 'ACTIVE'
    `;
    const [rows] = await pool.query(query, roleIds);
    return rows;
  }
}

export default new RoleRepository();
