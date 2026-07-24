const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updatePasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

// Stricter rate limit specifically for auth endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again in 15 minutes.',
  },
});

router.post('/register', authLimiter, registerValidator, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', protect, authController.getMe);

router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validateRequest,
  authController.forgotPassword
);
router.patch(
  '/reset-password/:token',
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword
);
router.patch(
  '/update-password',
  protect,
  updatePasswordValidator,
  validateRequest,
  authController.updatePassword
);

module.exports = router;
