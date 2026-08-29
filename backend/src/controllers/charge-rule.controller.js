import service from '../services/charge-rule.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
const meta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listChargeRules = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Charge rules fetched successfully', await service.list(req.auth.activeSocietyId)));
export const createChargeRule = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Charge rule created successfully', await service.create(req.auth.activeSocietyId, req.body, req.auth.userId, meta(req))));
export const updateChargeRule = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Charge rule updated successfully', await service.update(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, meta(req))));
export const deleteChargeRule = asyncHandler(async (req, res) => { await service.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, meta(req)); return sendSuccess(res, 200, 'Charge rule deleted successfully'); });
