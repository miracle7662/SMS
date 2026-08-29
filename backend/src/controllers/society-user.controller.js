import societyUserService from '../services/society-user.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const requestMeta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listSocietyUsers = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Society users fetched successfully', await societyUserService.list(req.auth.activeSocietyId)));
export const createSocietyAdmin = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Society Admin assigned successfully', await societyUserService.createSocietyAdmin(req.auth.activeSocietyId, req.body, req.auth.userId, requestMeta(req))));
export const updateSocietyUserAccess = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Society user access updated successfully', await societyUserService.setAccessStatus(req.auth.activeSocietyId, Number(req.params.id), req.body.status, req.auth.userId, requestMeta(req))));
