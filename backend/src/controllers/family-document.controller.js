import service from '../services/family-document.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

const meta = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') });
export const listPrimaryMembers = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Primary members fetched successfully', await service.listPrimaryMembers(req.auth.activeSocietyId)));
export const listFamily = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Family members fetched successfully', await service.listFamily(req.auth.activeSocietyId)));
export const createFamily = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Family member added successfully', await service.createFamily(req.auth.activeSocietyId, req.body, req.auth.userId, meta(req))));
export const removeFamily = asyncHandler(async (req, res) => { await service.removeFamily(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, meta(req)); return sendSuccess(res, 200, 'Family member removed successfully'); });
export const listDocuments = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Member documents fetched successfully', await service.listDocuments(req.auth.activeSocietyId)));
export const uploadDocument = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Document uploaded successfully', await service.uploadDocument(req.auth.activeSocietyId, req.body, req.auth.userId, meta(req))));
export const downloadDocument = asyncHandler(async (req, res) => { const result = await service.getDownload(req.auth.activeSocietyId, Number(req.params.id)); res.type(result.document.mime_type); res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(result.document.original_file_name)}"`); return res.sendFile(result.filePath); });
export const verifyDocument = asyncHandler(async (req, res) => { await service.verify(req.auth.activeSocietyId, Number(req.params.id), req.body, req.auth.userId, meta(req)); return sendSuccess(res, 200, 'Document status updated successfully'); });
export const removeDocument = asyncHandler(async (req, res) => { await service.removeDocument(req.auth.activeSocietyId, Number(req.params.id), req.auth.userId, meta(req)); return sendSuccess(res, 200, 'Document deleted successfully'); });
