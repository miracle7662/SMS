import { body, param } from 'express-validator';
export const validateBackupId=[param('id').isInt({min:1}).withMessage('Backup ID must be valid')];
export const validateRestore=[...validateBackupId,body('confirmation').equals('RESTORE BACKUP').withMessage('Type RESTORE BACKUP to confirm')];
