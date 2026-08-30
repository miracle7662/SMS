import service from '../services/security.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
const meta=req=>({ip:req.ip,userAgent:req.get('user-agent')});
export const securityDashboard=asyncHandler(async(req,res)=>sendSuccess(res,200,'Security dashboard fetched successfully',await service.dashboard(req.query)));
export const resolveSecurityEvent=asyncHandler(async(req,res)=>sendSuccess(res,200,'Security event updated successfully',await service.resolve(Number(req.params.id),req.body,req.auth.userId,meta(req))));
export const unlockSecurityUser=asyncHandler(async(req,res)=>sendSuccess(res,200,'User unlocked successfully',await service.unlock(Number(req.params.id),req.auth.userId,meta(req))));
export const revokeSecuritySessions=asyncHandler(async(req,res)=>sendSuccess(res,200,'User sessions revoked successfully',await service.revoke(Number(req.params.id),req.auth.userId,meta(req))));
