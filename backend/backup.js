import { closePool, createPool, testDatabaseConnection } from './src/config/database.js';
import backupService from './src/services/backup.service.js';

async function main() {
  try {
    createPool();
    await testDatabaseConnection();
    const backup = await backupService.create('SCHEDULED', null);
    console.log(`Backup completed: ${backup.file_name}`);
    process.exitCode = 0;
  } catch (error) {
    console.error(`Backup failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

main();
