import { config } from '../config/env.js';
import { sendError } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If it's not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
  };

  // In production, don't expose stack traces
  if (config.nodeEnv !== 'production') {
    response.stack = error.stack;
  }

  return res.status(error.statusCode || 500).json(response);
};

export default errorMiddleware;
