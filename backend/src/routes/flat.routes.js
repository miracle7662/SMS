import express from 'express';
import { deleteFlat, generateFlats, getFlat, listFlats, updateFlat } from '../controllers/flat.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateFlatId, validateGenerateFlats, validateUpdateFlat } from '../validators/flat.validators.js';
import { enforceSubscriptionLimit } from '../middleware/subscription.middleware.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.flats.view'), listFlats);
router.get('/:id', authorizePermissions('society.flats.view'), validateFlatId, handleValidationErrors, getFlat);
router.post('/generate', authorizePermissions('society.flats.create'), enforceSubscriptionLimit('flats'), validateGenerateFlats, handleValidationErrors, generateFlats);
router.put('/:id', authorizePermissions('society.flats.update'), validateFlatId, validateUpdateFlat, handleValidationErrors, updateFlat);
router.delete('/:id', authorizePermissions('society.flats.delete'), validateFlatId, handleValidationErrors, deleteFlat);

export default router;
