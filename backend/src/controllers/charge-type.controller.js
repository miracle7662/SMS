import service from '../services/charge-type.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
const meta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listChargeTypes = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Charge types fetched successfully', await service.list(req.auth.activeSocietyId)));
export const createChargeType = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Charge type created successfully', await service.create(req.auth.activeSocietyId, req.body, req.auth.userId, meta(req))));
export const updateChargeType = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Charge type updated successfully', await service.update(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, meta(req))));
export const deleteChargeType = asyncHandler(async (req, res) => { await service.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, meta(req)); return sendSuccess(res, 200, 'Charge type deleted successfully'); });
