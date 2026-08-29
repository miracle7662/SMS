import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Health check route
router.use('/', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

export default router;
