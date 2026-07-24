const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Protects routes by verifying the JWT stored in the httpOnly cookie
 * (falls back to Authorization header for API clients/testing tools).
 * Attaches the authenticated user document to req.user.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(AppError.unauthorized('You are not logged in. Please log in to continue.'));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!currentUser) {
    return next(AppError.unauthorized('The user belonging to this token no longer exists.'));
  }

  if (currentUser.isSuspended) {
    return next(AppError.forbidden('Your account has been suspended. Contact support.'));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(AppError.unauthorized('Password was changed recently. Please log in again.'));
  }

  req.user = currentUser;
  next();
});

/**
 * Restricts a route to specific roles. Usage: restrictTo('admin')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(AppError.forbidden('You do not have permission to perform this action.'));
  }
  next();
};

/**
 * Optional auth: attaches req.user if a valid token exists, but does not
 * block the request if it doesn't. Useful for public endpoints with
 * personalized behavior (e.g. viewing a public invite link).
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
      req.user = currentUser;
    }
  } catch (err) {
    // Invalid token on an optional route — proceed unauthenticated.
  }

  next();
});

module.exports = { protect, restrictTo, optionalAuth };
