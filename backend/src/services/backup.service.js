import { createHash } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, readdir, stat, statfs, unlink } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../config/env.js';
import { getPool } from '../config/database.js';
import backupRepository from '../repositories/backup.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { ApiError } from '../utils/api-error.js';

const backupDirectory = () => path.resolve(process.cwd(), config.backup.directory);
const safeFile = (name) => path.join(backupDirectory(), path.basename(name));
const processError = (buffer) => buffer.join('').replace(/password[^\s]*/gi,'password=***').slice(-1000);

const runExport = (target) => new Promise((resolve,reject) => {
  const args=['--host',config.database.host,'--port',String(config.database.port),'--user',config.database.user,'--single-transaction','--routines','--triggers','--events','--default-character-set=utf8mb4',config.database.name];
  const child=spawn(config.backup.mysqldumpPath,args,{shell:false,env:{...process.env,MYSQL_PWD:config.database.password}});
  const output=createWriteStream(target,{flags:'wx'}); const errors=[];
  child.stdout.pipe(output); child.stderr.on('data',chunk=>errors.push(chunk.toString()));
  let exitCode=null; let outputFinished=false;
  const finish=()=>{if(exitCode===null||!outputFinished)return;exitCode===0?resolve():reject(new Error(processError(errors)||`mysqldump exited with code ${exitCode}`));};
  child.on('error',reject); output.on('error',reject); output.on('finish',()=>{outputFinished=true;finish();});
  child.on('close',code=>{exitCode=code;finish();});
});

const runImport = (source) => new Promise((resolve,reject) => {
  const args=['--host',config.database.host,'--port',String(config.database.port),'--user',config.database.user,'--default-character-set=utf8mb4',config.database.name];
  const child=spawn(config.backup.mysqlPath,args,{shell:false,env:{...process.env,MYSQL_PWD:config.database.password}}); const errors=[];
  createReadStream(source).pipe(child.stdin); child.stderr.on('data',chunk=>errors.push(chunk.toString())); child.on('error',reject);
  child.on('close',code=>code===0?resolve():reject(new Error(processError(errors)||`mysql exited with code ${code}`)));
});

const checksum = (file) => new Promise((resolve,reject) => { const hash=createHash('sha256'); const input=createReadStream(file); input.on('data',chunk=>hash.update(chunk)); input.on('end',()=>resolve(hash.digest('hex'))); input.on('error',reject); });

class BackupService {
  async create(type,userId,meta={}) {
    await mkdir(backupDirectory(),{recursive:true}); const job=await backupRepository.create(type,userId);
    const fileName=`society_erp_${new Date().toISOString().replace(/[:.]/g,'-')}_${job.backupNumber}.sql`; const file=safeFile(fileName);
    try { await runExport(file); const info=await stat(file); const digest=await checksum(file); await backupRepository.complete(job.id,fileName,info.size,digest);
      await auditRepository.log({userId,moduleName:'platform_backup',action:'create_backup',recordId:job.id,newData:{type,fileName,size:info.size},ipAddress:meta.ip,userAgent:meta.userAgent}); await this.cleanup(); return backupRepository.get(job.id);
    } catch(error){ await backupRepository.fail(job.id,error.message); try{await unlink(file);}catch{} throw new ApiError(500,'Backup failed. Verify MySQL tool paths and database permissions.'); }
  }
  list(){return backupRepository.list();}
  async resolveFile(id){const backup=await backupRepository.get(id);if(!backup.file_name||!['COMPLETED','RESTORED'].includes(backup.status))throw new ApiError(409,'Backup file is not available');const file=safeFile(backup.file_name);try{await stat(file);}catch{throw new ApiError(404,'Backup file is missing from storage');}return {backup,file};}
  async verify(id){const {backup}=await this.resolveFile(id);const digest=await checksum(safeFile(backup.file_name));const valid=digest===backup.checksum_sha256;if(!valid)await backupRepository.markVerificationFailed(id);return {valid,expectedChecksum:backup.checksum_sha256,actualChecksum:digest};}
  async restore(id,confirmation,userId,meta){if(confirmation!=='RESTORE BACKUP')throw new ApiError(400,'Type RESTORE BACKUP to confirm');const verification=await this.verify(id);if(!verification.valid)throw new ApiError(409,'Backup checksum verification failed');await this.create('PRE_RESTORE',userId,meta);const {file}=await this.resolveFile(id);try{await runImport(file);await backupRepository.markRestored(id,userId);await auditRepository.log({userId,moduleName:'platform_backup',action:'restore_backup',recordId:id,ipAddress:meta.ip,userAgent:meta.userAgent});return {restored:true};}catch{throw new ApiError(500,'Restore failed. The automatic pre-restore backup remains available.');}}
  async health(){const started=Date.now();let databaseStatus='HEALTHY';try{await getPool().query('SELECT 1');}catch{databaseStatus='DOWN';}const databaseLatencyMs=Date.now()-started;let disk={bfree:0n,blocks:0n,bsize:0n};try{await mkdir(backupDirectory(),{recursive:true});disk=await statfs(backupDirectory(),{bigint:true});}catch{}const memory=process.memoryUsage();const data={databaseStatus,databaseLatencyMs,processMemoryMb:Number((memory.rss/1048576).toFixed(2)),diskFreeBytes:Number(disk.bfree*disk.bsize),diskTotalBytes:Number(disk.blocks*disk.bsize),uptimeSeconds:Math.floor(process.uptime()),details:{node:process.version,environment:config.nodeEnv}};try{await backupRepository.saveHealth(data);}catch{}return {...data,backupDirectory:backupDirectory(),retentionDays:config.backup.retentionDays};}
  async cleanup(){const cutoff=Date.now()-config.backup.retentionDays*86400000;for(const entry of await readdir(backupDirectory(),{withFileTypes:true})){if(!entry.isFile()||!entry.name.endsWith('.sql'))continue;const file=safeFile(entry.name);const info=await stat(file);if(info.mtimeMs<cutoff)await unlink(file);}}
}
export default new BackupService();
