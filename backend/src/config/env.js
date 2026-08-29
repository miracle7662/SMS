import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'BCRYPT_SALT_ROUNDS',
  'MAX_LOGIN_ATTEMPTS',
  'LOGIN_LOCK_MINUTES',
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Validate that JWT secrets are different and sufficiently long
if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  console.error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  process.exit(1);
}

if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
  console.error('JWT secrets must be at least 32 characters long');
  process.exit(1);
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  auth: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    loginLockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES || '15', 10),
  },
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME,
    mobile: process.env.SUPER_ADMIN_MOBILE,
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
};

export default config;
