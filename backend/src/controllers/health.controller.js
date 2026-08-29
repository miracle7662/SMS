import { testDatabaseConnection } from '../config/database.js';
import { config } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const healthCheck = asyncHandler(async (req, res) => {
  try {
    // Test database connection
    await testDatabaseConnection();

    return sendSuccess(res, 200, 'Society ERP API is running', {
      environment: config.nodeEnv,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed - Database connection error:', error.message);
    return sendError(res, 503, 'Database connection failed', [
      'Unable to establish database connection. Please check your configuration.',
    ]);
  }
});

export default { healthCheck };
