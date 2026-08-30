import { getPool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

class BackupRepository {
  async create(type, userId) {
    const number = `BKP-${Date.now()}`;
    const [result] = await getPool().execute(`INSERT INTO database_backups (backup_number,backup_type,created_by) VALUES (?,?,?)`, [number,type,userId]);
    return { id: result.insertId, backupNumber: number };
  }
  async complete(id, fileName, fileSize, checksum) {
    await getPool().execute(`UPDATE database_backups SET file_name=?,file_size=?,checksum_sha256=?,status='COMPLETED',completed_at=UTC_TIMESTAMP() WHERE id=?`, [fileName,fileSize,checksum,id]);
  }
  async fail(id, message) {
    await getPool().execute(`UPDATE database_backups SET status='FAILED',error_message=?,completed_at=UTC_TIMESTAMP() WHERE id=?`, [String(message).slice(0,1000),id]);
  }
  async list() {
    const [rows] = await getPool().execute(`SELECT b.*,u.name created_by_name,ru.name restored_by_name FROM database_backups b LEFT JOIN users u ON u.id=b.created_by LEFT JOIN users ru ON ru.id=b.restored_by ORDER BY b.started_at DESC LIMIT 100`);
    return rows;
  }
  async get(id) {
    const [rows] = await getPool().execute(`SELECT * FROM database_backups WHERE id=? LIMIT 1`, [id]);
    if (!rows[0]) throw new ApiError(404,'Backup not found');
    return rows[0];
  }
  async markVerificationFailed(id) { await getPool().execute(`UPDATE database_backups SET status='VERIFICATION_FAILED' WHERE id=?`,[id]); }
  async markRestored(id,userId) { await getPool().execute(`UPDATE database_backups SET status='RESTORED',restored_by=?,restored_at=UTC_TIMESTAMP() WHERE id=?`,[userId,id]); }
  async saveHealth(data) {
    await getPool().execute(`INSERT INTO system_health_snapshots (database_status,database_latency_ms,process_memory_mb,disk_free_bytes,disk_total_bytes,uptime_seconds,details) VALUES (?,?,?,?,?,?,?)`,[data.databaseStatus,data.databaseLatencyMs,data.processMemoryMb,data.diskFreeBytes,data.diskTotalBytes,data.uptimeSeconds,JSON.stringify(data.details||{})]);
  }
}
export default new BackupRepository();
