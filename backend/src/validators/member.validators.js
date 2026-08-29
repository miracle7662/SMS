import { body, param, query } from 'express-validator';

export const validateMemberFilter = [query('type').optional().isIn(['OWNER','CO_OWNER','TENANT']).withMessage('Invalid member type')];
export const validateMemberId = [param('id').isInt({ min: 1 }).withMessage('Member assignment ID must be a positive integer')];
export const validateCreateMember = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required').isLength({ min: 10, max: 20 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email address').isLength({ max: 150 }),
  body('flat_id').isInt({ min: 1 }).withMessage('Flat is required'),
  body('member_type').isIn(['OWNER','CO_OWNER','TENANT']).withMessage('Member type is invalid'),
  body('ownership_percentage').optional({ checkFalsy: true }).isFloat({ min: 0.01, max: 100 }).withMessage('Ownership percentage must be between 0.01 and 100'),
  body('occupancy_start').optional({ checkFalsy: true }).isISO8601().withMessage('Start date is invalid'),
  body('occupancy_end').optional({ checkFalsy: true }).isISO8601().withMessage('End date is invalid'),
  body('agreement_status').isIn(['NOT_REQUIRED','PENDING','VERIFIED','EXPIRED']).withMessage('Agreement status is invalid'),
  body('police_noc_status').isIn(['NOT_REQUIRED','PENDING','VERIFIED']).withMessage('Police NOC status is invalid'),
  body('is_primary').optional().isBoolean().withMessage('Primary member value is invalid'),
];
