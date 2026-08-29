import floorService from '../services/floor.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const requestMeta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });

export const listFloors = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Floors fetched successfully', await floorService.list(req.auth.activeSocietyId)));
export const generateFloors = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Floors generated successfully', await floorService.generate(req.auth.activeSocietyId, req.body, req.auth.userId, requestMeta(req))));
export const updateFloor = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Floor updated successfully', await floorService.update(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, requestMeta(req))));
export const deleteFloor = asyncHandler(async (req, res) => {
  await floorService.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, requestMeta(req));
  return sendSuccess(res, 200, 'Floor deleted successfully');
});
