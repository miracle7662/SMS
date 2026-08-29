import { body, param, query } from 'express-validator';
export const validateReceiptId = [param('id').isInt({ min: 1 }).withMessage('Receipt ID must be a positive integer')];
export const validateCollectPayment = [
  body('payment_date').isISO8601({ strict: true }).withMessage('Payment date must use YYYY-MM-DD format'),
  body('payment_mode').isIn(['CASH','CHEQUE','NEFT','RTGS','UPI','CARD','ONLINE']).withMessage('Select a valid payment mode'),
  body('reference_number').optional({ nullable: true, checkFalsy: true }).isLength({ max: 100 }),
  body('bank_name').optional({ nullable: true, checkFalsy: true }).isLength({ max: 150 }),
  body('cheque_date').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true }),
  body('total_amount').isFloat({ gt: 0, max: 999999999.99 }).withMessage('Payment amount must be greater than zero'),
  body('payer_member_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('payer_name').optional({ nullable: true, checkFalsy: true }).isLength({ max: 150 }),
  body('payer_mobile').optional({ nullable: true, checkFalsy: true }).isLength({ max: 20 }),
  body('payer_email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  body('notes').optional({ nullable: true, checkFalsy: true }).isLength({ max: 1000 }),
  body('allocations').isArray({ min: 1, max: 100 }).withMessage('Select at least one bill'),
  body('allocations.*.bill_id').isInt({ min: 1 }).withMessage('Bill ID must be a positive integer'),
  body('allocations.*.amount').isFloat({ gt: 0, max: 999999999.99 }).withMessage('Allocated amount must be greater than zero'),
];
export const validateReversePayment = [
  param('id').isInt({ min: 1 }).withMessage('Payment ID must be a positive integer'),
  body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Enter a reversal reason between 5 and 500 characters'),
];
export const validateReconciliationQuery = [
  query('from').isISO8601({ strict: true }).withMessage('From date must use YYYY-MM-DD format'),
  query('to').isISO8601({ strict: true }).withMessage('To date must use YYYY-MM-DD format'),
  query('to').custom((value, { req }) => { if (value < req.query.from) throw new Error('To date must be on or after From date'); return true; }),
];
export const validateReconcilePayment = [
  param('id').isInt({ min: 1 }).withMessage('Payment ID must be a positive integer'),
  body('status').isIn(['MATCHED','UNMATCHED']).withMessage('Status must be MATCHED or UNMATCHED'),
  body('reference').optional({ nullable: true, checkFalsy: true }).isLength({ max: 150 }),
  body('note').optional({ nullable: true, checkFalsy: true }).isLength({ max: 500 }),
];
