import { body, param } from 'express-validator';
export const validateChargeRuleId = [param('id').isInt({ min: 1 }).withMessage('Charge rule ID must be a positive integer')];
export const validateChargeRule = [
  body('charge_type_id').isInt({ min: 1 }).withMessage('Charge type is required'),
  body('rule_name').trim().notEmpty().withMessage('Rule name is required').isLength({ max: 150 }),
  body('applicability_scope').isIn(['ALL_FLATS','FLAT_TYPE','OCCUPANCY_STATUS','SPECIFIC_FLAT']).withMessage('Applicability scope is invalid'),
  body('flat_type').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('occupancy_status').optional({ checkFalsy: true }).isIn(['OWNER_OCCUPIED','RENTED','VACANT']),
  body('flat_id').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('rate').isFloat({ min: 0, max: 100000000 }).withMessage('Rate is invalid'),
  body('minimum_amount').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 100000000 }),
  body('maximum_amount').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 100000000 }),
  body('effective_from').isISO8601().withMessage('Effective From date is required'),
  body('effective_to').optional({ checkFalsy: true }).isISO8601().withMessage('Effective To date is invalid'),
  body('proration_enabled').isBoolean(), body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('status').isIn(['ACTIVE','INACTIVE']).withMessage('Status is invalid'),
];
