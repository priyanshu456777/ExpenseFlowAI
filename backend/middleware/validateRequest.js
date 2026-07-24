const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator chains. Collects all validation errors and
 * throws a single, consistently-formatted AppError with statusCode 422.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(AppError.unprocessable(messages.join('. '), 'VALIDATION_ERROR'));
  }
  next();
};

module.exports = validateRequest;
