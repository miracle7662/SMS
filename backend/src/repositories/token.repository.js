import { getPool } from '../config/database.js';

export class TokenRepository {
  async storeRefreshToken(userId, tokenHash, expiresAt, deviceInfo = null, ipAddress = null) {
    const pool = getPool();
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [userId, tokenHash, deviceInfo, ipAddress, expiresAt]);
    return result.insertId;
  }

  async findValidRefreshToken(userId, tokenHash) {
    const pool = getPool();
    const query = `
      SELECT id, token_hash, expires_at, revoked_at
      FROM refresh_tokens
      WHERE user_id = ?
      AND token_hash = ?
      AND expires_at > NOW()
      AND revoked_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [userId, tokenHash]);
    return rows[0] || null;
  }

  async revokeRefreshToken(userId, tokenHash) {
    const pool = getPool();
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = ?
      AND token_hash = ?
    `;
    await pool.query(query, [userId, tokenHash]);
  }

  async revokeAllUserTokens(userId) {
    const pool = getPool();
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = ?
      AND revoked_at IS NULL
    `;
    await pool.query(query, [userId]);
  }

  async cleanupExpiredTokens() {
    const pool = getPool();
    const query = `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
    `;
    await pool.query(query);
  }
}

export default new TokenRepository();
