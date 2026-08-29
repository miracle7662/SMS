import societyProfileService from '../services/society-profile.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getSocietyProfile = asyncHandler(async (req, res) => sendSuccess(
  res, 200, 'Society profile fetched successfully',
  await societyProfileService.get(req.auth.activeSocietyId)
));

export const updateSocietyProfile = asyncHandler(async (req, res) => sendSuccess(
  res, 200, 'Society profile updated successfully',
  await societyProfileService.update(
    req.auth.activeSocietyId,
    req.body,
    req.auth.userId,
    req.ip,
    req.get('user-agent')
  )
));
