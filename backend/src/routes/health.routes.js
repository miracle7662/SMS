import express from 'express';
import { healthCheck } from '../controllers/health.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint - verifies API and database connection
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;
