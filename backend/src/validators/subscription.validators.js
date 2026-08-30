import { body, param } from 'express-validator';

export const validatePlan=[body('plan_code').trim().matches(/^[A-Za-z0-9_-]+$/).isLength({max:50}),body('plan_name').trim().notEmpty().isLength({max:120}),body('billing_cycle').isIn(['MONTHLY','QUARTERLY','YEARLY','ONE_TIME']),body('price').isFloat({min:0}),body('trial_days').optional().isInt({min:0}),body(['max_buildings','max_flats','max_users']).optional({nullable:true,checkFalsy:true}).isInt({min:1})];
export const validateAssign=[body('society_id').isInt({min:1}),body('plan_id').isInt({min:1}),body('start_date').optional({checkFalsy:true}).isISO8601(),body('end_date').optional({checkFalsy:true}).isISO8601(),body('replace_existing').optional().isBoolean(),body('use_trial').optional().isBoolean()];
export const validateStatus=[param('id').isInt({min:1}),body('status').isIn(['TRIAL','ACTIVE','PAST_DUE','SUSPENDED','EXPIRED','CANCELLED'])];
export const validateInvoice=[body('subscription_id').isInt({min:1}),body('due_date').isISO8601(),body('subtotal').isFloat({gt:0}),body('tax_amount').optional().isFloat({min:0})];
export const validatePayment=[param('id').isInt({min:1}),body('amount').isFloat({gt:0}),body('payment_mode').isIn(['CASH','CHEQUE','NEFT','RTGS','UPI','CARD','ONLINE']),body('payment_date').optional({checkFalsy:true}).isISO8601()];
