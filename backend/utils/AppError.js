/**
 * Custom error class for operational errors (expected errors we throw deliberately,
 * e.g. "Group not found", "Invalid credentials"). Distinguishes from programmer errors.
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errorCode) {
    return new AppError(message, 400, errorCode);
  }

  static unauthorized(message = 'Not authorized to access this resource', errorCode) {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'You do not have permission to perform this action', errorCode) {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode) {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message = 'Resource already exists', errorCode) {
    return new AppError(message, 409, errorCode);
  }

  static unprocessable(message = 'Unable to process request', errorCode) {
    return new AppError(message, 422, errorCode);
  }

  static internal(message = 'Something went wrong on our end') {
    return new AppError(message, 500);
  }
}

module.exports = AppError;
