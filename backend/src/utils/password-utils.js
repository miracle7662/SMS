import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, config.auth.bcryptSaltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const hashToken = async (token) => {
  return bcrypt.hash(token, 10);
};

export const compareToken = async (plainToken, hashedToken) => {
  return bcrypt.compare(plainToken, hashedToken);
};

export default {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
};
