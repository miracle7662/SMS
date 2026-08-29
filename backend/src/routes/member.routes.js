import express from 'express';
import { createMember, listMembers, removeMember } from '../controllers/member.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizePermissions, requireActiveSociety } from '../middleware/authorize.middleware.js';
import { handleValidationErrors } from '../validators/auth.validators.js';
import { validateCreateMember, validateMemberFilter, validateMemberId } from '../validators/member.validators.js';

const router = express.Router();
router.use(authenticate, requireActiveSociety);
router.get('/', authorizePermissions('society.members.view'), validateMemberFilter, handleValidationErrors, listMembers);
router.post('/', authorizePermissions('society.members.create'), validateCreateMember, handleValidationErrors, createMember);
router.delete('/:id', authorizePermissions('society.members.delete'), validateMemberId, handleValidationErrors, removeMember);

export default router;
