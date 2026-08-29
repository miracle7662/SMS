import platformSocietyService from '../services/platform-society.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const listSocieties = asyncHandler(async (req, res) => sendSuccess(
  res,
  200,
  'Societies fetched successfully',
  await platformSocietyService.list()
));

export const createSociety = asyncHandler(async (req, res) => sendSuccess(
  res,
  201,
  'Society created successfully',
  await platformSocietyService.create(req.body, req.auth.userId, req.ip, req.get('user-agent'))
));
