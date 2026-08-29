import memberService from '../services/member.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const requestMeta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listMembers = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Members fetched successfully', await memberService.list(req.auth.activeSocietyId, req.query.type)));
export const createMember = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Member assigned to flat successfully', await memberService.create(req.auth.activeSocietyId, req.body, req.auth.userId, requestMeta(req))));
export const removeMember = asyncHandler(async (req, res) => {
  await memberService.remove(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, requestMeta(req));
  return sendSuccess(res, 200, 'Member assignment removed successfully');
});
