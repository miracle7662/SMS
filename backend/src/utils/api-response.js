export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export const sendSuccess = (res, statusCode = 200, message = 'Request successful', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode = 400, message = 'An error occurred', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default { ApiResponse, sendSuccess, sendError };
