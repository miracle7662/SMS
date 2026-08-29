import service from '../services/maintenance-preview.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
export const getMaintenancePreview = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Maintenance calculation preview generated successfully', await service.preview(req.auth.activeSocietyId, req.query.billing_date)));
