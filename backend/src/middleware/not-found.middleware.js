import { sendError } from '../utils/api-response.js';

export const notFoundMiddleware = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  return sendError(res, 404, message);
};

export default notFoundMiddleware;
