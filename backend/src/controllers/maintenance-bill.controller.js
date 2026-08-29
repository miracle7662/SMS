import service from '../services/maintenance-bill.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
const meta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const generateBills = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Maintenance bills generated successfully', await service.generate(req.auth.activeSocietyId, req.body, req.auth.userId, meta(req))));
export const listBills = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Maintenance bills fetched successfully', await service.list(req.auth.activeSocietyId)));
export const getBill = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Maintenance bill fetched successfully', await service.get(req.auth.activeSocietyId, Number(req.params.id))));
