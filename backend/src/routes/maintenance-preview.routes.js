import express from 'express';
import { query } from 'express-validator';
import { getMaintenancePreview } from '../controllers/maintenance-preview.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
const router = express.Router(); router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.maintenance_preview.view'), query('billing_date').isISO8601({ strict: true }).withMessage('Billing date must use YYYY-MM-DD format'), handleValidationErrors, getMaintenancePreview);
export default router;
