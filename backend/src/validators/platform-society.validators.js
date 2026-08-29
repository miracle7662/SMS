import { body } from 'express-validator';

export const validateCreateSociety = [
  body('society_code')
    .trim()
    .notEmpty().withMessage('Society code is required')
    .isLength({ max: 50 }).withMessage('Society code must not exceed 50 characters')
    .matches(/^[A-Za-z0-9_-]+$/).withMessage('Society code may contain letters, numbers, hyphen and underscore only'),
  body('society_name')
    .trim()
    .notEmpty().withMessage('Society name is required')
    .isLength({ max: 200 }).withMessage('Society name must not exceed 200 characters'),
  body('registration_no').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('registration_type').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('state').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('pincode').optional({ checkFalsy: true }).trim().matches(/^\d{6}$/).withMessage('Pincode must contain 6 digits'),
  body('pan_number').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email address'),
  body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 20 }).withMessage('Enter a valid mobile number'),
  body('established_date').optional({ checkFalsy: true }).isISO8601().withMessage('Established date must be valid'),
];
