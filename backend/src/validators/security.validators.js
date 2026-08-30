import { body, param, query } from 'express-validator';
export const validateSecurityDashboard=[query('days').optional().isInt({min:1,max:90}),query('limit').optional().isInt({min:1,max:250}),query('society_id').optional().isInt({min:1}),query('module_name').optional().trim().isLength({max:100}),query('severity').optional().isIn(['LOW','MEDIUM','HIGH','CRITICAL'])];
export const validateSecurityEvent=[param('id').isInt({min:1}),body('status').isIn(['RESOLVED','IGNORED']),body('resolution_note').optional({checkFalsy:true}).trim().isLength({max:500})];
export const validateSecurityUser=[param('id').isInt({min:1})];
