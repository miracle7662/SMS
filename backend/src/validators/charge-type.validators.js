import { body, param } from 'express-validator';
export const validateChargeTypeId = [param('id').isInt({ min: 1 }).withMessage('Charge type ID must be a positive integer')];
export const validateChargeType = [
  body('charge_code').trim().notEmpty().withMessage('Charge code is required').isLength({ max: 50 }),
  body('charge_name').trim().notEmpty().withMessage('Charge name is required').isLength({ max: 150 }),
  body('category').isIn(['MAINTENANCE','FUND','UTILITY','PARKING','TAX','PENALTY','OTHER']).withMessage('Category is invalid'),
  body('calculation_basis').isIn(['FIXED','PER_CARPET_SQFT','PER_BUILTUP_SQFT','PERCENTAGE_OF_MAINTENANCE','FLAT_TYPE','MANUAL']).withMessage('Calculation basis is invalid'),
  body('default_rate').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 100000000 }).withMessage('Default rate is invalid'),
  body('billing_frequency').isIn(['INHERIT','MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY','ONE_TIME']).withMessage('Billing frequency is invalid'),
  body('is_taxable').isBoolean(), body('gst_rate').isFloat({ min: 0, max: 100 }).withMessage('GST rate is invalid'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('display_order').isInt({ min: 0, max: 9999 }).withMessage('Display order is invalid'),
  body('status').isIn(['ACTIVE','INACTIVE']).withMessage('Status is invalid'),
];
