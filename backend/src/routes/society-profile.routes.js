import express from 'express';
import { getSocietyProfile, updateSocietyProfile } from '../controllers/society-profile.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateSocietyProfile } from '../validators/society-profile.validators.js';

const router = express.Router();

router.use(authenticate, requireActiveSociety);
router.get('/profile', authorizePermissions('society.profile.view'), getSocietyProfile);
router.put('/profile', authorizePermissions('society.profile.update'), validateSocietyProfile, handleValidationErrors, updateSocietyProfile);

export default router;
