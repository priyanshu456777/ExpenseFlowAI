const jwt = require('jsonwebtoken');

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

/**
 * Signs access + refresh tokens and sets them as httpOnly cookies on the response.
 * "Remember Me" extends the cookie lifetime; otherwise it's a session cookie
 * bounded by the JWT's own expiry.
 */
const setAuthCookies = (res, userId, rememberMe = false) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  const cookieDays = rememberMe
    ? Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7)
    : 1; // session-like: 1 day if not "remember me"

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });

  return { accessToken, refreshToken };
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
};
