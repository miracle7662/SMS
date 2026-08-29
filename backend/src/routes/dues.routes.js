import express from 'express';import { body,query } from 'express-validator';import { applyDues,previewDues } from '../controllers/dues.controller.js';import { authenticate } from '../middleware/authenticate.middleware.js';import { authorizePermissions,requireActiveSociety } from '../middleware/authorize.middleware.js';import { handleValidationErrors } from '../validators/auth.validators.js';
const router=express.Router();router.use(authenticate,requireActiveSociety);
router.get('/',authorizePermissions('society.dues.view'),query('as_of').isISO8601({strict:true}).withMessage('As Of date must use YYYY-MM-DD format'),handleValidationErrors,previewDues);
router.post('/apply',authorizePermissions('society.dues.apply_charges'),body('as_of').isISO8601({strict:true}).withMessage('As Of date must use YYYY-MM-DD format'),handleValidationErrors,applyDues);
export default router;
