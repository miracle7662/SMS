import express from 'express';
import { createSocietyAdmin, listSocietyUsers, updateSocietyUserAccess } from '../controllers/society-user.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateAccessStatus, validateCreateSocietyAdmin, validateSocietyUserId } from '../validators/society-user.validators.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.users.view'), listSocietyUsers);
router.post('/society-admin', authorizePermissions('society.users.create'), validateCreateSocietyAdmin, handleValidationErrors, createSocietyAdmin);
router.patch('/:id/access', authorizePermissions('society.users.update'), validateSocietyUserId, validateAccessStatus, handleValidationErrors, updateSocietyUserAccess);

export default router;
