import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import societyRoutes from './society.routes.js';

const router = express.Router();

// Health check route
router.use('/', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Society routes (CRUD operations)
router.use('/societies', societyRoutes);

export default router;