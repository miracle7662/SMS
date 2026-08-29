import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/env.js';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, config.auth.bcryptSaltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const hashToken = async (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const compareToken = async (plainToken, hashedToken) => {
  const calculatedHash = await hashToken(plainToken);
  const actual = Buffer.from(calculatedHash, 'hex');
  const expected = Buffer.from(hashedToken, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

export default {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
};
