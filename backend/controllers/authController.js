const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { setAuthCookies, clearAuthCookies, signAccessToken } = require('../utils/tokenService');
const { sendEmail, passwordResetTemplate } = require('../services/emailService');

/**
 * @route POST /api/v1/auth/register
 */
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(AppError.conflict('An account with this email already exists.', 'EMAIL_TAKEN'));
  }

  const user = await User.create({ name, email, password });

  setAuthCookies(res, user._id, false);

  return sendResponse(res, 201, 'Account created successfully.', { user: user.toSafeJSON() });
});

/**
 * @route POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(AppError.unauthorized('Incorrect email or password.', 'INVALID_CREDENTIALS'));
  }

  if (user.isSuspended) {
    return next(AppError.forbidden('Your account has been suspended. Contact support.'));
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, user._id, Boolean(rememberMe));

  return sendResponse(res, 200, 'Logged in successfully.', { user: user.toSafeJSON() });
});

/**
 * @route POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  clearAuthCookies(res);
  return sendResponse(res, 200, 'Logged out successfully.', null);
});

/**
 * @route GET /api/v1/auth/me
 */
const getMe = catchAsync(async (req, res) => {
  return sendResponse(res, 200, 'Current user fetched.', { user: req.user.toSafeJSON() });
});

/**
 * @route POST /api/v1/auth/refresh
 * Issues a new short-lived access token using the long-lived refresh token cookie.
 */
const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return next(AppError.unauthorized('No refresh token provided. Please log in again.'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(AppError.unauthorized('Invalid or expired refresh token. Please log in again.'));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(AppError.unauthorized('User no longer exists.'));
  }

  const accessToken = signAccessToken(user._id);
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return sendResponse(res, 200, 'Token refreshed.', { user: user.toSafeJSON() });
});

/**
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Always return the same generic response, whether or not the user exists,
  // to avoid leaking which emails are registered (user enumeration protection).
  const genericMessage = 'If an account exists for that email, a reset link has been sent.';

  if (!user) {
    return sendResponse(res, 200, genericMessage, null);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'ExpenseFlow AI — Password Reset Request',
      html: passwordResetTemplate(resetUrl, user.name),
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(AppError.internal('Failed to send reset email. Please try again later.'));
  }

  return sendResponse(res, 200, genericMessage, null);
});

/**
 * @route PATCH /api/v1/auth/reset-password/:token
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(AppError.badRequest('Token is invalid or has expired.', 'INVALID_RESET_TOKEN'));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  setAuthCookies(res, user._id, false);

  return sendResponse(res, 200, 'Password reset successfully.', { user: user.toSafeJSON() });
});

/**
 * @route PATCH /api/v1/auth/update-password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(AppError.unauthorized('Current password is incorrect.', 'INVALID_PASSWORD'));
  }

  user.password = req.body.newPassword;
  await user.save();

  setAuthCookies(res, user._id, false);

  return sendResponse(res, 200, 'Password updated successfully.', null);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  refresh,
  forgotPassword,
  resetPassword,
  updatePassword,
};
