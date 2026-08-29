import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/api-response.js';

export const validateLogin = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login (mobile or email) is required')
    .isLength({ max: 150 })
    .withMessage('Login must not exceed 150 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 1000 })
    .withMessage('Password must not exceed 1000 characters'),
];

export const validateSelectSociety = [
  body('society_id')
    .isInt({ min: 1 })
    .withMessage('Society ID must be a positive integer'),
];

export const validateRefresh = [
  body('refresh_token')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ max: 2000 })
    .withMessage('Refresh token must not exceed 2000 characters'),
];

export const validateLogout = [
  body('refresh_token')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Refresh token must not exceed 2000 characters'),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return sendError(res, 400, 'Validation failed', errorMessages);
  }
  next();
};

export default {
  validateLogin,
  validateSelectSociety,
  validateRefresh,
  validateLogout,
  handleValidationErrors,
};
