import service from '../services/maintenance-report.service.js';import { asyncHandler } from '../utils/async-handler.js';import { sendSuccess } from '../utils/api-response.js';
export const getMaintenanceReport=asyncHandler(async(req,res)=>sendSuccess(res,200,'Maintenance financial report fetched successfully',await service.get(req.auth.activeSocietyId,req.query.from,req.query.to)));
