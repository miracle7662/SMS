import { config } from '../config/env.js';
import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import societyAccessRepository from '../repositories/society-access.repository.js';
import tokenRepository from '../repositories/token.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import { hashPassword, comparePassword, hashToken } from '../utils/password-utils.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token-utils.js';
import { normalizeMobile, normalizeEmail } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';
import crypto from 'crypto';

export class AuthService {
  async login(loginValue, password, ipAddress, userAgent) {
    // Normalize login value
    const normalizedLogin = normalizeMobile(loginValue);
    const normalizedEmail = normalizeEmail(loginValue);

    // Find user by mobile or email
    let user = await userRepository.findByMobileOrEmail(normalizedLogin);
    if (!user) {
      user = await userRepository.findByMobileOrEmail(normalizedEmail);
    }

    if (!user) {
      throw new ApiError(401, 'Invalid login credentials');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new ApiError(429, 'Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const maxAttempts = config.auth.maxLoginAttempts;
      if (user.failed_login_attempts + 1 >= maxAttempts) {
        const lockUntil = new Date(Date.now() + config.auth.loginLockMinutes * 60 * 1000);
        await userRepository.updateFailedLoginAttemptsAndLock(user.id, lockUntil);
      } else {
        await userRepository.incrementFailedLoginAttempts(user.id);
      }

      throw new ApiError(401, 'Invalid login credentials');
    }

    // Reset failed attempts
    await userRepository.resetFailedLoginAttempts(user.id);

    // Get user roles and societies
    const platformRoles = await roleRepository.getPermissionsByRoleIds(
      (await societyAccessRepository.getUserRoles(user.id)).map(r => r.id)
    );

    const societies = await societyAccessRepository.getUserSocieties(user.id);

    // Determine if society selection is required
    const userPlatformRoles = await societyAccessRepository.getUserRoles(user.id);
    const isSuperAdmin = userPlatformRoles.some((role) => role.role_code === 'SUPER_ADMIN');
    const requiresSocietySelection = isSuperAdmin || societies.length > 1;
    let defaultSociety = null;

    if (societies.length === 1) {
      defaultSociety = societies[0];
    }

    // Generate tokens
    const tokenRoles = defaultSociety
      ? await societyAccessRepository.getUserRoles(user.id, defaultSociety.society_id)
      : userPlatformRoles;
    const accessTokenPayload = {
      sub: user.id,
      roles: tokenRoles.map(r => r.role_code),
      activeSocietyId: defaultSociety ? defaultSociety.society_id : null,
      tokenType: 'access',
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshTokenPayload = {
      sub: user.id,
      tokenType: 'refresh',
    };
    const refreshTokenRaw = generateRefreshToken(refreshTokenPayload);
    const refreshTokenHash = await hashToken(refreshTokenRaw);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await tokenRepository.storeRefreshToken(user.id, refreshTokenHash, expiresAt, null, ipAddress);

    // Audit log
    await auditRepository.log({
      userId: user.id,
      moduleName: 'authentication',
      action: 'login',
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profile_image,
      },
      platformRoles: userPlatformRoles.map(r => r.role_code),
      societies: societies.map(s => ({
        id: s.society_id,
        code: s.society_code,
        name: s.society_name,
        logo: s.logo,
      })),
      requiresSocietySelection,
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  async selectSociety(userId, societyId, ipAddress, userAgent) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user's platform roles
    const platformRoles = await societyAccessRepository.getUserRoles(userId);
    const isSuperAdmin = platformRoles.some(r => r.role_code === 'SUPER_ADMIN');

    // Check access
    if (!isSuperAdmin) {
      const hasAccess = await societyAccessRepository.hasAccessToSociety(userId, societyId);
      if (!hasAccess) {
        throw new ApiError(403, 'You do not have access to this society');
      }
    }

    // Get society
    const society = await societyAccessRepository.getSocietyById(societyId);
    if (!society) {
      throw new ApiError(404, 'Society not found');
    }

    // Get society-specific roles
    const societyRoles = await societyAccessRepository.getUserRoles(userId, societyId);

    // Generate new access token with society context
    const accessTokenPayload = {
      sub: userId,
      activeSocietyId: societyId,
      roles: societyRoles.map(r => r.role_code),
      tokenType: 'access',
    };

    const accessToken = generateAccessToken(accessTokenPayload);

    // Audit log
    await auditRepository.log({
      userId,
      societyId,
      moduleName: 'authentication',
      action: 'select_society',
      recordId: societyId,
      ipAddress,
      userAgent,
    });

    return {
      activeSociety: {
        id: society.id,
        code: society.society_code,
        name: society.society_name,
      },
      roles: societyRoles.map(r => r.role_code),
      accessToken,
    };
  }

  async refreshAccessToken(userId, oldRefreshTokenRaw) {
    // Hash the token to find it in database
    const oldRefreshTokenHash = await hashToken(oldRefreshTokenRaw);

    // Find token
    const storedToken = await tokenRepository.findValidRefreshToken(userId, oldRefreshTokenHash);
    if (!storedToken) {
      throw new ApiError(401, 'Refresh token is invalid or expired');
    }

    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Get user roles (platform context, no society)
    const platformRoles = await societyAccessRepository.getUserRoles(userId);

    // Revoke old token and generate new one
    await tokenRepository.revokeRefreshToken(userId, oldRefreshTokenHash);

    // Generate new tokens
    const newAccessTokenPayload = {
      sub: userId,
      roles: platformRoles.map(r => r.role_code),
      activeSocietyId: null,
      tokenType: 'access',
    };

    const newAccessToken = generateAccessToken(newAccessTokenPayload);
    const newRefreshTokenPayload = {
      sub: userId,
      tokenType: 'refresh',
    };
    const newRefreshTokenRaw = generateRefreshToken(newRefreshTokenPayload);
    const newRefreshTokenHash = await hashToken(newRefreshTokenRaw);

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await tokenRepository.storeRefreshToken(userId, newRefreshTokenHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenRaw,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  async logout(userId, refreshTokenRaw) {
    if (refreshTokenRaw) {
      const refreshTokenHash = await hashToken(refreshTokenRaw);
      await tokenRepository.revokeRefreshToken(userId, refreshTokenHash);
    }

    // Audit log
    await auditRepository.log({
      userId,
      moduleName: 'authentication',
      action: 'logout',
    });
  }

  async getAuthenticatedUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const platformRoles = await societyAccessRepository.getUserRoles(userId);
    const societies = await societyAccessRepository.getUserSocieties(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        profileImage: user.profile_image,
      },
      platformRoles: platformRoles.map(r => r.role_code),
      societies: societies.map(s => ({
        id: s.society_id,
        code: s.society_code,
        name: s.society_name,
        logo: s.logo,
        isDefault: s.is_default,
      })),
    };
  }

  async getUserSocieties(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return await societyAccessRepository.getUserSocieties(userId);
  }

  async getAllActiveSocieties() {
    return societyAccessRepository.getAllActiveSocieties();
  }
}

export default new AuthService();
