import express from 'express';
import { createSociety, listSocieties } from '../controllers/platform-society.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePlatformRoles } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateCreateSociety } from '../validators/platform-society.validators.js';

const router = express.Router();

router.use(authenticate, authorizePlatformRoles('SUPER_ADMIN'));
router.get('/societies', listSocieties);
router.post('/societies', validateCreateSociety, handleValidationErrors, createSociety);

export default router;
