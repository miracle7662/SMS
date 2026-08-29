import tokenRepository from '../repositories/token.repository.js';
import { hashToken, compareToken } from '../utils/password-utils.js';
import { verifyAccessToken, verifyRefreshToken } from '../utils/token-utils.js';
import { ApiError } from '../utils/api-error.js';

export class TokenService {
  async verifyAccessTokenAndGetPayload(token) {
    try {
      const payload = verifyAccessToken(token);
      if (payload.tokenType !== 'access') {
        throw new ApiError(401, 'Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired access token');
    }
  }

  async verifyRefreshTokenAndGetPayload(token) {
    try {
      const payload = verifyRefreshToken(token);
      if (payload.tokenType !== 'refresh') {
        throw new ApiError(401, 'Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }
}

export default new TokenService();
