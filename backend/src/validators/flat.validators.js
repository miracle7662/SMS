import { body, param } from 'express-validator';

export const validateFlatId = [param('id').isInt({ min: 1 }).withMessage('Flat ID must be a positive integer')];
export const validateGenerateFlats = [
  body('building_id').isInt({ min: 1 }).withMessage('Building is required'),
  body('wing_id').isInt({ min: 1 }).withMessage('Wing is required'),
  body('floor_id').isInt({ min: 1 }).withMessage('Floor is required'),
  body('flat_prefix').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('start_number').isInt({ min: 0, max: 999999 }).withMessage('Start number must be valid'),
  body('number_of_flats').isInt({ min: 1, max: 100 }).withMessage('Number of flats must be between 1 and 100'),
  body('pad_length').isInt({ min: 0, max: 6 }).withMessage('Number padding must be between 0 and 6'),
  body('flat_type').trim().notEmpty().withMessage('Flat type is required').isLength({ max: 50 }),
  body('carpet_area_sqft').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100000 }),
  body('builtup_area_sqft').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100000 }),
];
export const validateUpdateFlat = [
  body('flat_no').trim().notEmpty().withMessage('Flat number is required').isLength({ max: 50 }),
  body('flat_type').trim().notEmpty().withMessage('Flat type is required').isLength({ max: 50 }),
  body('carpet_area_sqft').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100000 }),
  body('builtup_area_sqft').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100000 }),
  body('occupancy_status').isIn(['OWNER_OCCUPIED','RENTED','VACANT']).withMessage('Occupancy status is invalid'),
];
