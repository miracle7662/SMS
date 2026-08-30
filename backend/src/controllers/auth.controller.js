import authService from '../services/auth.service.js';
import { verifyRefreshToken } from '../utils/token-utils.js';
import { sendSuccess } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import securityRepository from '../repositories/security.repository.js';

export const login = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Login successful',
  await authService.login(req.body.login, req.body.password, req.ip, req.get('user-agent'))));

export const selectSociety = asyncHandler(async (req, res) => sendSuccess(res, 200,
  'Society selected successfully', await authService.selectSociety(req.auth.userId,
    Number(req.body.society_id), req.ip, req.get('user-agent'))));

export const refresh = asyncHandler(async (req, res) => {
  let decoded;
  try { decoded = verifyRefreshToken(req.body.refresh_token); }
  catch {
    await securityRepository.log({ eventType: 'TOKEN_REJECTED', severity: 'MEDIUM', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { reason: 'invalid_or_expired_refresh_token' } });
    throw new ApiError(401, 'Refresh token is invalid or expired');
  }
  if (decoded.tokenType !== 'refresh' || !decoded.sub) {
    await securityRepository.log({ eventType: 'TOKEN_REJECTED', severity: 'HIGH', ipAddress: req.ip, userAgent: req.get('user-agent'), details: { reason: 'invalid_token_type' } });
    throw new ApiError(401, 'Invalid refresh token');
  }
  return sendSuccess(res, 200, 'Token refreshed successfully',
    await authService.refreshAccessToken(decoded.sub, req.body.refresh_token));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth.userId, req.body.refresh_token);
  return sendSuccess(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => sendSuccess(res, 200,
  'Authenticated user fetched successfully', await authService.getAuthenticatedUser(req.auth.userId)));

export const getSocieties = asyncHandler(async (req, res) => sendSuccess(res, 200,
  'Societies fetched successfully', req.auth.platformRoles.includes('SUPER_ADMIN')
    ? await authService.getAllActiveSocieties()
    : await authService.getUserSocieties(req.auth.userId)));

export const changePassword = asyncHandler(async (req,res)=>sendSuccess(res,200,'Password changed successfully',await authService.changePassword(req.auth.userId,req.body.current_password,req.body.new_password,req.ip,req.get('user-agent'))));
