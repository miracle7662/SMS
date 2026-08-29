import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import repository from '../repositories/family-document.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const uploadDir = path.join(backendRoot, 'uploads', 'member-documents');
const allowedMimeTypes = new Map([['application/pdf', '.pdf'], ['image/jpeg', '.jpg'], ['image/png', '.png']]);

class FamilyDocumentService {
  listPrimaryMembers(societyId) { return repository.listPrimaryMembers(societyId); }
  listFamily(societyId) { return repository.listFamily(societyId); }

  async createFamily(societyId, payload, userId, requestMeta) {
    if (!await repository.getPrimaryMember(societyId, payload.primary_member_id, payload.flat_id)) {
      throw new ApiError(404, 'Selected primary member and flat assignment was not found in this society');
    }
    const normalized = { ...payload, name: payload.name.trim(), mobile: payload.mobile ? normalizeMobile(payload.mobile) : null, email: payload.email ? normalizeEmail(payload.email) : null, date_of_birth: payload.date_of_birth || null };
    const id = await repository.createFamily(societyId, normalized, userId);
    await auditRepository.log({ societyId, userId, moduleName: 'family_members', action: 'create', recordId: id, newData: normalized, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
    return { id };
  }

  async removeFamily(societyId, id, userId, requestMeta) {
    if (!await repository.deleteFamily(societyId, id, userId)) throw new ApiError(404, 'Family member not found in the selected society');
    await auditRepository.log({ societyId, userId, moduleName: 'family_members', action: 'delete', recordId: id, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
  }

  listDocuments(societyId) { return repository.listDocuments(societyId); }

  async uploadDocument(societyId, payload, userId, requestMeta) {
    if (!await repository.getPrimaryMember(societyId, payload.member_id, payload.flat_id)) throw new ApiError(404, 'Selected member and flat assignment was not found in this society');
    if (!allowedMimeTypes.has(payload.mime_type)) throw new ApiError(400, 'Only PDF, JPG and PNG documents are allowed');
    const match = payload.file_base64.match(/^data:([^;]+);base64,(.+)$/s);
    const encoded = match ? match[2] : payload.file_base64;
    const buffer = Buffer.from(encoded, 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new ApiError(400, 'Document must be between 1 byte and 5 MB');
    const validSignature = payload.mime_type === 'application/pdf' ? buffer.subarray(0, 5).toString() === '%PDF-'
      : payload.mime_type === 'image/jpeg' ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        : buffer[0] === 0x89 && buffer.subarray(1, 4).toString() === 'PNG';
    if (!validSignature) throw new ApiError(400, 'File content does not match the selected document format');
    const storedName = `${crypto.randomUUID()}${allowedMimeTypes.get(payload.mime_type)}`;
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, storedName), buffer, { flag: 'wx' });
    let id;
    try {
      id = await repository.createDocument(societyId, {
        member_id: payload.member_id, flat_id: payload.flat_id, document_type: payload.document_type,
        document_number: payload.document_number?.trim() || null, expiry_date: payload.expiry_date || null,
      }, { originalName: path.basename(payload.file_name), storedName, mimeType: payload.mime_type, size: buffer.length }, userId);
    } catch (error) { await fs.unlink(path.join(uploadDir, storedName)).catch(() => {}); throw error; }
    await auditRepository.log({ societyId, userId, moduleName: 'member_documents', action: 'upload', recordId: id, newData: { document_type: payload.document_type, file_size: buffer.length }, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
    return { id };
  }

  async getDownload(societyId, id) {
    const document = await repository.getDocument(societyId, id);
    if (!document) throw new ApiError(404, 'Document not found in the selected society');
    const filePath = path.join(uploadDir, path.basename(document.stored_file_name));
    try { await fs.access(filePath); } catch { throw new ApiError(404, 'Document file is missing from storage'); }
    return { document, filePath };
  }

  async verify(societyId, id, payload, userId, requestMeta) {
    if (!await repository.getDocument(societyId, id)) throw new ApiError(404, 'Document not found in the selected society');
    if (!await repository.verifyDocument(societyId, id, payload.status, payload.rejection_reason?.trim() || null, userId)) throw new ApiError(404, 'Document not found');
    await auditRepository.log({ societyId, userId, moduleName: 'member_documents', action: payload.status.toLowerCase(), recordId: id, newData: { status: payload.status, rejection_reason: payload.rejection_reason || null }, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
  }

  async removeDocument(societyId, id, userId, requestMeta) {
    const document = await repository.getDocument(societyId, id);
    if (!document) throw new ApiError(404, 'Document not found in the selected society');
    await repository.deleteDocument(societyId, id);
    await fs.unlink(path.join(uploadDir, path.basename(document.stored_file_name))).catch(() => {});
    await auditRepository.log({ societyId, userId, moduleName: 'member_documents', action: 'delete', recordId: id, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent });
  }
}

export default new FamilyDocumentService();
