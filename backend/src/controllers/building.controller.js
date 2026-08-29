import buildingService from '../services/building.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const requestMeta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });

export const listBuildings = asyncHandler(async (req, res) => sendSuccess(
  res, 200, 'Buildings fetched successfully', await buildingService.list(req.auth.activeSocietyId)
));

export const createBuilding = asyncHandler(async (req, res) => sendSuccess(
  res, 201, 'Building created successfully',
  await buildingService.create(req.auth.activeSocietyId, req.body, req.auth.userId, requestMeta(req))
));

export const updateBuilding = asyncHandler(async (req, res) => sendSuccess(
  res, 200, 'Building updated successfully',
  await buildingService.update(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, requestMeta(req))
));

export const deleteBuilding = asyncHandler(async (req, res) => {
  await buildingService.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, requestMeta(req));
  return sendSuccess(res, 200, 'Building deleted successfully');
});
