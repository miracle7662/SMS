import service from '../services/onboarding.service.js';import{asyncHandler}from'../utils/async-handler.js';import{sendSuccess}from'../utils/api-response.js';const meta=req=>({ip:req.ip,userAgent:req.get('user-agent')});
export const onboardingDashboard=asyncHandler(async(req,res)=>sendSuccess(res,200,'Onboarding dashboard fetched successfully',await service.dashboard()));
export const onboardSociety=asyncHandler(async(req,res)=>sendSuccess(res,201,'Society and administrator created successfully',await service.create(req.body,req.auth.userId,meta(req))));
export const goLive=asyncHandler(async(req,res)=>sendSuccess(res,200,'Society is now live',await service.goLive(Number(req.params.id),req.auth.userId,meta(req))));
export const resendInvitation=asyncHandler(async(req,res)=>sendSuccess(res,200,'New invitation credentials generated',await service.resend(Number(req.params.id),req.body.channel,req.auth.userId,meta(req))));
