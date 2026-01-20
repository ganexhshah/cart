const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Two-Factor Authentication routes
router.post('/2fa/enable', securityController.enable2FA);
router.post('/2fa/verify', securityController.verify2FASetup);
router.post('/2fa/disable', securityController.disable2FA);
router.get('/2fa/status', securityController.get2FAStatus);

// Login History routes
router.get('/login-history', securityController.getLoginHistory);

module.exports = router;
