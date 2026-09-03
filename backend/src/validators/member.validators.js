import { body, param, query } from 'express-validator';

export const validateMemberFilter = [query('type').optional().isIn(['OWNER','CO_OWNER','TENANT']).withMessage('Invalid member type')];
export const validateMemberId = [param('id').isInt({ min: 1 }).withMessage('Member assignment ID must be a positive integer')];

export const validateCreateMember = [
  // ===== EXISTING VALIDATIONS =====
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

  // ===== PERSONAL DETAILS =====
  body('father_husband_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Father/Husband name must be less than 150 characters'),

  body('date_of_birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid date of birth format (use YYYY-MM-DD)'),

  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER'),

  body('alternate_mobile')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Alternate mobile number must be between 10-20 characters')
    .matches(/^[0-9]+$/)
    .withMessage('Alternate mobile number must contain only digits'),

  body('pan_number')
    .optional({ checkFalsy: true })
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format (e.g., ABCDE1234F)'),

  body('aadhaar_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be exactly 12 digits')
    .matches(/^[0-9]{12}$/)
    .withMessage('Aadhaar number must contain only digits'),

  body('occupation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must be less than 100 characters'),

  // ===== PROFILE PHOTO - Local Path Support =====
  body('profile_photo')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      // URL, Local Path, Uploads Path सर्व Allow करा
      const isValid = value.startsWith('http') || 
                      value.startsWith('/uploads/') ||
                      value.includes(':\\') || // Windows path like C:\
                      value.startsWith('/') ||
                      value.startsWith('./') || 
                      value.startsWith('../');
      if (!isValid) {
        throw new Error('Profile photo must be a valid URL or file path');
      }
      return true;
    })
    .isLength({ max: 500 })
    .withMessage('Profile photo path must be less than 500 characters'),

  // ===== ADDRESS DETAILS =====
  body('address_line')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line must be less than 255 characters'),

  body('area_locality')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Area/Locality must be less than 150 characters'),

  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),

  body('state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),

  body('country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),

  body('pin_code')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('PIN code must be between 5-10 characters')
    .matches(/^[0-9\-]+$/)
    .withMessage('PIN code should contain only numbers and hyphens')
];