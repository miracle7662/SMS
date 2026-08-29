import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import platformRoutes from './platform.routes.js';
import societyProfileRoutes from './society-profile.routes.js';
import buildingRoutes from './building.routes.js';
import floorRoutes from './floor.routes.js';
import flatRoutes from './flat.routes.js';
import societyUserRoutes from './society-user.routes.js';
import memberRoutes from './member.routes.js';

const router = express.Router();

// Health check route
router.use('/', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);
router.use('/platform', platformRoutes);
router.use('/society/buildings', buildingRoutes);
router.use('/society/floors', floorRoutes);
router.use('/society/flats', flatRoutes);
router.use('/society/users', societyUserRoutes);
router.use('/society/members', memberRoutes);
router.use('/society', societyProfileRoutes);

export default router;
