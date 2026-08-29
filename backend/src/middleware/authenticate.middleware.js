import { verifyAccessToken } from '../utils/token-utils.js';
import userRepository from '../repositories/user.repository.js';
import societyAccessRepository from '../repositories/society-access.repository.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token is required');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(authHeader.slice(7).trim());
  } catch {
    throw new ApiError(401, 'Authentication token is invalid or expired');
  }

  if (decoded.tokenType !== 'access' || !decoded.sub) {
    throw new ApiError(401, 'Invalid access token');
  }

  const user = await userRepository.findById(decoded.sub);
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'User account is not active');
  }

  const platformRoles = await societyAccessRepository.getUserRoles(user.id);
  const activeSocietyId = decoded.activeSocietyId ? Number(decoded.activeSocietyId) : null;
  const societyRoles = activeSocietyId
    ? await societyAccessRepository.getUserRoles(user.id, activeSocietyId)
    : [];

  req.auth = {
    userId: user.id,
    activeSocietyId,
    platformRoles: platformRoles.map((role) => role.role_code),
    roles: societyRoles.map((role) => role.role_code),
  };

  // Compatibility for controllers that still read req.user.
  req.user = {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    isSuperAdmin: req.auth.platformRoles.includes('SUPER_ADMIN'),
    societyId: activeSocietyId,
  };

  next();
});
