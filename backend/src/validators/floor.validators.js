import { body, param } from 'express-validator';

export const validateFloorId = [param('id').isInt({ min: 1 }).withMessage('Floor ID must be a positive integer')];
export const validateGenerateFloors = [
  body('building_id').isInt({ min: 1 }).withMessage('Building is required'),
  body('wing_id').isInt({ min: 1 }).withMessage('Wing is required'),
  body('start_floor').isInt({ min: -10, max: 200 }).withMessage('Start floor must be between -10 and 200'),
  body('number_of_floors').isInt({ min: 1, max: 200 }).withMessage('Number of floors must be between 1 and 200'),
];
export const validateUpdateFloor = [
  body('floor_number').isInt({ min: -10, max: 200 }).withMessage('Floor number must be between -10 and 200'),
  body('floor_name').trim().notEmpty().withMessage('Floor name is required').isLength({ max: 100 }),
];
