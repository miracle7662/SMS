import express from 'express';
import { createSociety, listSocieties } from '../controllers/platform-society.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePlatformRoles } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateCreateSociety } from '../validators/platform-society.validators.js';
import { assignSubscription, createInvoice, createPlan, dashboard, recordPayment, updateSubscriptionStatus } from '../controllers/subscription.controller.js';
import { validateAssign, validateInvoice, validatePayment, validatePlan, validateStatus } from '../validators/subscription.validators.js';

const router = express.Router();

router.use(authenticate, authorizePlatformRoles('SUPER_ADMIN'));
router.get('/societies', listSocieties);
router.post('/societies', validateCreateSociety, handleValidationErrors, createSociety);
router.get('/subscriptions', dashboard);
router.post('/subscription-plans', validatePlan, handleValidationErrors, createPlan);
router.post('/subscriptions', validateAssign, handleValidationErrors, assignSubscription);
router.patch('/subscriptions/:id/status', validateStatus, handleValidationErrors, updateSubscriptionStatus);
router.post('/invoices', validateInvoice, handleValidationErrors, createInvoice);
router.post('/invoices/:id/payments', validatePayment, handleValidationErrors, recordPayment);

export default router;
