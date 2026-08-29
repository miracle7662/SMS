import flatService from '../services/flat.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const requestMeta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listFlats = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Flats fetched successfully', await flatService.list(req.auth.activeSocietyId)));
export const getFlat = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Flat fetched successfully', await flatService.get(req.auth.activeSocietyId, Number(req.params.id))));
export const generateFlats = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Flats generated successfully', await flatService.generate(req.auth.activeSocietyId, req.body, req.auth.userId, requestMeta(req))));
export const updateFlat = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Flat updated successfully', await flatService.update(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, requestMeta(req))));
export const deleteFlat = asyncHandler(async (req, res) => {
  await flatService.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, requestMeta(req));
  return sendSuccess(res, 200, 'Flat deleted successfully');
});
