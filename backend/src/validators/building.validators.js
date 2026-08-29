import { body, param } from 'express-validator';

export const validateBuildingId = [param('id').isInt({ min: 1 }).withMessage('Building ID must be a positive integer')];

export const validateBuilding = [
  body('building_code').trim().notEmpty().withMessage('Building code is required').isLength({ max: 50 }).matches(/^[A-Za-z0-9 _-]+$/),
  body('building_name').trim().notEmpty().withMessage('Building name is required').isLength({ max: 150 }),
  body('floors_per_wing').isInt({ min: 1, max: 200 }).withMessage('Floors per wing must be between 1 and 200'),
  body('flats_per_floor').isInt({ min: 1, max: 100 }).withMessage('Flats per floor must be between 1 and 100'),
  body('wings').isArray({ min: 1, max: 20 }).withMessage('Add between 1 and 20 wings'),
  body('wings.*.wing_code').trim().notEmpty().withMessage('Wing code is required').isLength({ max: 50 }).matches(/^[A-Za-z0-9 _-]+$/),
  body('wings.*.wing_name').trim().notEmpty().withMessage('Wing name is required').isLength({ max: 100 }),
];
