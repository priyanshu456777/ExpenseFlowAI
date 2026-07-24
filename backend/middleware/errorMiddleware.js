const AppError = require('../utils/AppError');

/**
 * Converts known Mongoose/JWT errors into consistent AppError instances
 * so the global handler can respond uniformly.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid value for field "${err.path}": ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = field ? err.keyValue[field] : 'value';
  const message = field
    ? `An account with that ${field} (${value}) already exists.`
    : 'Duplicate field value entered.';
  return new AppError(message, 409, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 422, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Please upload a smaller file.', 400, 'FILE_TOO_LARGE');
  }
  return new AppError(err.message || 'File upload failed.', 400, 'UPLOAD_ERROR');
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errorCode: err.errorCode || null,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode || null,
    });
  }

  // Unknown/programmer error: never leak details in production.
  console.error('UNEXPECTED ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

/**
 * Global error-handling middleware. Must be registered last, after all routes.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorDev(error, res);
  } else {
    let error = { ...err, message: err.message, name: err.name, isOperational: err.isOperational };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};

/**
 * Catches requests to routes that don't exist.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404, 'ROUTE_NOT_FOUND'));
};

module.exports = { globalErrorHandler, notFoundHandler };
