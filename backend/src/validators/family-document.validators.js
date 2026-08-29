import { body, param } from 'express-validator';

export const validateId = [param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')];
export const validateFamily = [
  body('primary_member_id').isInt({ min: 1 }).withMessage('Primary member is required'), body('flat_id').isInt({ min: 1 }).withMessage('Flat is required'),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 150 }),
  body('relation_type').isIn(['SPOUSE','SON','DAUGHTER','FATHER','MOTHER','BROTHER','SISTER','OTHER']).withMessage('Relation is invalid'),
  body('mobile').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 20 }), body('email').optional({ checkFalsy: true }).isEmail().isLength({ max: 150 }),
  body('date_of_birth').optional({ checkFalsy: true }).isISO8601().withMessage('Date of birth is invalid'),
];
export const validateDocument = [
  body('member_id').isInt({ min: 1 }).withMessage('Member is required'), body('flat_id').isInt({ min: 1 }).withMessage('Flat is required'),
  body('document_type').isIn(['AADHAAR','PAN','PHOTO','SALE_DEED','SHARE_CERTIFICATE','RENT_AGREEMENT','POLICE_NOC','OTHER']).withMessage('Document type is invalid'),
  body('document_number').optional({ checkFalsy: true }).trim().isLength({ max: 100 }), body('expiry_date').optional({ checkFalsy: true }).isISO8601(),
  body('file_name').trim().notEmpty().isLength({ max: 255 }), body('mime_type').isIn(['application/pdf','image/jpeg','image/png']).withMessage('Only PDF, JPG and PNG are allowed'),
  body('file_base64').isString().notEmpty().withMessage('Document file is required').isLength({ max: 7500000 }).withMessage('Document is too large'),
];
export const validateVerification = [body('status').isIn(['VERIFIED','REJECTED']).withMessage('Status must be VERIFIED or REJECTED'), body('rejection_reason').optional({ checkFalsy: true }).trim().isLength({ max: 500 })];
