import express from 'express';
import {
  login,
  selectSociety,
  refresh,
  logout,
  getMe,
  getSocieties,
} from '../controllers/auth.controller.js';
import {
  validateLogin,
  validateSelectSociety,
  validateRefresh,
  validateLogout,
  handleValidationErrors,
} from '../validators/auth.validators.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login with mobile or email
 * @access  Public
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', validateRefresh, handleValidationErrors, refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', validateLogout, handleValidationErrors, authenticate, logout);

/**
 * @route   POST /api/v1/auth/select-society
 * @desc    Select active society for session
 * @access  Private
 */
router.post('/select-society', validateSelectSociety, handleValidationErrors, authenticate, selectSociety);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get authenticated user details
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   GET /api/v1/auth/societies
 * @desc    Get user's societies
 * @access  Private
 */
router.get('/societies', authenticate, getSocieties);

export default router;
