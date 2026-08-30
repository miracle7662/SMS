import express from 'express';
import { createBuilding, deleteBuilding, listBuildings, updateBuilding } from '../controllers/building.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateBuilding, validateBuildingId } from '../validators/building.validators.js';
import { enforceSubscriptionLimit } from '../middleware/subscription.middleware.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.buildings.view'), listBuildings);
router.post('/', authorizePermissions('society.buildings.create'), enforceSubscriptionLimit('buildings'), validateBuilding, handleValidationErrors, createBuilding);
router.put('/:id', authorizePermissions('society.buildings.update'), validateBuildingId, validateBuilding, handleValidationErrors, updateBuilding);
router.delete('/:id', authorizePermissions('society.buildings.delete'), validateBuildingId, handleValidationErrors, deleteBuilding);

export default router;
