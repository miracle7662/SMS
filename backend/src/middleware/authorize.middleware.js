import roleRepository from '../repositories/role.repository.js';
import societyAccessRepository from '../repositories/society-access.repository.js';
import { sendError } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';

export const requireActiveSociety = asyncHandler(async (req, res, next) => {
  if (!req.auth.activeSocietyId) {
    throw new ApiError(400, 'Active society context is required for this operation');
  }

  // Verify user still has access to this society
  const hasAccess = await societyAccessRepository.hasAccessToSociety(
    req.auth.userId,
    req.auth.activeSocietyId
  );

  if (!hasAccess) {
    throw new ApiError(403, 'You do not have access to this society');
  }

  next();
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.auth.roles || [];

    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return sendError(res, 403, 'You do not have permission for this action');
    }

    next();
  };
};

export const authorizePermissions = (...permissionCodes) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.auth.userId;
    const userRoles = req.auth.roles || [];

    if (!userRoles.length) {
      throw new ApiError(403, 'You do not have any roles');
    }

    // Get role IDs from role codes
    const roleObjects = await Promise.all(
      userRoles.map(code => roleRepository.findByCode(code))
    );
    const roleIds = roleObjects.filter(r => r).map(r => r.id);

    if (!roleIds.length) {
      throw new ApiError(403, 'Unable to determine your roles');
    }

    // Get all permissions for user's roles
    const userPermissions = await roleRepository.getPermissionsByRoleIds(roleIds);
    const userPermissionCodes = userPermissions.map(p => p.permission_code);

    const hasPermission = permissionCodes.every(code => userPermissionCodes.includes(code));
    if (!hasPermission) {
      throw new ApiError(403, 'You do not have the required permissions');
    }

    next();
  });
};

export default {
  requireActiveSociety,
  authorizeRoles,
  authorizePermissions,
};
