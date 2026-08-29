import express from 'express';
import { deleteFloor, generateFloors, listFloors, updateFloor } from '../controllers/floor.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateFloorId, validateGenerateFloors, validateUpdateFloor } from '../validators/floor.validators.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.floors.view'), listFloors);
router.post('/generate', authorizePermissions('society.floors.create'), validateGenerateFloors, handleValidationErrors, generateFloors);
router.put('/:id', authorizePermissions('society.floors.update'), validateFloorId, validateUpdateFloor, handleValidationErrors, updateFloor);
router.delete('/:id', authorizePermissions('society.floors.delete'), validateFloorId, handleValidationErrors, deleteFloor);

export default router;
