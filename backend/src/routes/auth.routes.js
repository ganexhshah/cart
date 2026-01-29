const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// OTP-based authentication
router.post('/send-otp', authLimiter, authController.sendOTP);
router.post('/verify-otp', authLimiter, authController.verifyOTP);

// Legacy password-based authentication
router.post('/register', validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/waiter-login', authLimiter, authController.waiterLogin);

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/force-refresh', authenticate, authController.forceRefresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
