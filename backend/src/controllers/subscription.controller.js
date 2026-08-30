import service from '../services/subscription.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const dashboard=asyncHandler(async(req,res)=>sendSuccess(res,200,'Subscription billing fetched successfully',await service.dashboard()));
export const createPlan=asyncHandler(async(req,res)=>sendSuccess(res,201,'Plan created successfully',await service.createPlan(req.body,req.auth.userId)));
export const assignSubscription=asyncHandler(async(req,res)=>sendSuccess(res,201,'Subscription assigned successfully',await service.assign(req.body,req.auth.userId)));
export const updateSubscriptionStatus=asyncHandler(async(req,res)=>sendSuccess(res,200,'Subscription status updated successfully',await service.status(req.params.id,req.body,req.auth.userId)));
export const createInvoice=asyncHandler(async(req,res)=>sendSuccess(res,201,'Invoice created successfully',await service.invoice(req.body,req.auth.userId)));
export const recordPayment=asyncHandler(async(req,res)=>sendSuccess(res,201,'Payment recorded successfully',await service.payment(req.params.id,req.body,req.auth.userId)));
