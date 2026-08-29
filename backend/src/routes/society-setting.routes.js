import express from 'express';
import { getSocietySettings, updateSocietySettings } from '../controllers/society-setting.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateSocietySettings } from '../validators/society-setting.validators.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.settings.view'), getSocietySettings);
router.put('/', authorizePermissions('society.settings.update'), validateSocietySettings, handleValidationErrors, updateSocietySettings);
export default router;
