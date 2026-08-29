import { body, param } from 'express-validator';
export const validateBillId = [param('id').isInt({ min: 1 }).withMessage('Bill ID must be a positive integer')];
export const validateGenerateBills = [
  body('billing_date').isISO8601({ strict: true }).withMessage('Billing date must use YYYY-MM-DD format'),
  body('period_start').isISO8601({ strict: true }).withMessage('Period Start must use YYYY-MM-DD format'),
  body('period_end').isISO8601({ strict: true }).withMessage('Period End must use YYYY-MM-DD format'),
  body('flat_ids').optional().isArray({ min: 1, max: 1000 }).withMessage('Select between 1 and 1000 flats'),
  body('flat_ids.*').optional().isInt({ min: 1 }).withMessage('Every Flat ID must be a positive integer'),
];
