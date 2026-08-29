import service from '../services/society-setting.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getSocietySettings = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Society settings fetched successfully', await service.get(req.auth.activeSocietyId)));
export const updateSocietySettings = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Society settings saved successfully', await service.update(req.auth.activeSocietyId, req.body, req.auth.userId, { ipAddress: req.ip, userAgent: req.get('user-agent') })));
