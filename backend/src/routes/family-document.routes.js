import express from 'express';
import { createFamily, downloadDocument, listDocuments, listFamily, listPrimaryMembers, removeDocument, removeFamily, uploadDocument, verifyDocument } from '../controllers/family-document.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateDocument, validateFamily, validateId, validateVerification } from '../validators/family-document.validators.js';

const router = express.Router(); router.use(authenticate, requireActiveSociety);
router.get('/member-options', authorizePermissions('society.members.view'), listPrimaryMembers);
router.get('/family', authorizePermissions('society.members.view'), listFamily);
router.post('/family', authorizePermissions('society.members.create'), validateFamily, handleValidationErrors, createFamily);
router.delete('/family/:id', authorizePermissions('society.members.delete'), validateId, handleValidationErrors, removeFamily);
router.get('/documents', authorizePermissions('society.member_documents.view'), listDocuments);
router.post('/documents', authorizePermissions('society.member_documents.create'), validateDocument, handleValidationErrors, uploadDocument);
router.get('/documents/:id/download', authorizePermissions('society.member_documents.view'), validateId, handleValidationErrors, downloadDocument);
router.patch('/documents/:id/status', authorizePermissions('society.member_documents.verify'), validateId, validateVerification, handleValidationErrors, verifyDocument);
router.delete('/documents/:id', authorizePermissions('society.member_documents.delete'), validateId, handleValidationErrors, removeDocument);
export default router;
