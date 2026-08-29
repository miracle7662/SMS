import { body, param } from 'express-validator';

export const validateCreateSocietyAdmin = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required').isLength({ min: 10, max: 20 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email address').isLength({ max: 150 }),
  body('password').isString().isLength({ min: 8, max: 72 }).withMessage('Password must contain 8 to 72 characters'),
];
export const validateSocietyUserId = [param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer')];
export const validateAccessStatus = [body('status').isIn(['ACTIVE','INACTIVE']).withMessage('Access status must be ACTIVE or INACTIVE')];
