import { body } from 'express-validator';

export const validateSocietyProfile = [
  body('society_name').trim().notEmpty().withMessage('Society name is required').isLength({ max: 200 }),
  body('registration_no').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('registration_type').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('state').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('pincode').optional({ checkFalsy: true }).trim().matches(/^\d{6}$/).withMessage('Pincode must contain 6 digits'),
  body('pan_number').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email address'),
  body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 20 }).withMessage('Enter a valid mobile number'),
  body('logo').optional({ checkFalsy: true }).trim().isURL().withMessage('Logo must be a valid URL').isLength({ max: 500 }),
  body('established_date').optional({ checkFalsy: true }).isISO8601().withMessage('Established date must be valid'),
];
